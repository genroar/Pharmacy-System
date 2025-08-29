import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '@/database';
import { logger } from '@/utils/logger';
import { config } from '@/config';
import {
  AuthServiceInterface,
  IUserCreate,
  IUserUpdate,
  ServiceResponse,
  UserRole
} from './types';
import {
  IUser,
  validateEmail,
  validatePassword,
  validatePhone
} from '@/models';

export class AuthService implements AuthServiceInterface {
  private readonly saltRounds = 12;
  private readonly jwtSecret = config.jwt.secret;
  private readonly jwtExpiresIn = config.jwt.expiresIn;
  private readonly refreshTokenExpiresIn = config.jwt.refreshExpiresIn;

  /**
   * Register a new user
   */
  async registerUser(userData: IUserCreate): Promise<{ user: IUser; token: string }> {
    try {
      // Validate input data
      const validationResult = this.validateUserData(userData);
      if (!validationResult.success) {
        throw new Error(validationResult.error);
      }

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: userData.email.toLowerCase() },
            { phone: userData.phone }
          ]
        }
      });

      if (existingUser) {
        throw new Error('User with this email or phone already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, this.saltRounds);

      // Create user
      const user = await prisma.user.create({
        data: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email.toLowerCase(),
          password: hashedPassword,
          phone: userData.phone,
          role: userData.role || UserRole.CUSTOMER,
          street: userData.street,
          city: userData.city,
          state: userData.state,
          zipCode: userData.zipCode,
          country: userData.country,
          emailVerified: false,
          phoneVerified: false,
          notifications: true,
          language: 'en',
          timezone: 'UTC',
          isActive: true
        }
      });

      // Generate JWT token
      const token = this.generateToken(user.id, user.email, user.role);

      // Log successful registration
      logger.info(`User registered successfully: ${user.email}`);

      return { user, token };
    } catch (error) {
      logger.error('User registration error:', error);
      throw error;
    }
  }

  /**
   * Authenticate user login
   */
  async authenticateUser(email: string, password: string): Promise<{ user: IUser; token: string }> {
    try {
      // Find user by email
      const user = await prisma.user.findFirst({
        where: {
          email: email.toLowerCase(),
          isActive: true
        }
      });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });

      // Generate JWT token
      const token = this.generateToken(user.id, user.email, user.role);

      // Log successful login
      logger.info(`User logged in successfully: ${user.email}`);

      return { user, token };
    } catch (error) {
      logger.error('User authentication error:', error);
      throw error;
    }
  }

  /**
   * Validate JWT token
   */
  async validateToken(token: string): Promise<{ userId: string; email: string; role: string }> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      
      // Check if user still exists and is active
      const user = await prisma.user.findFirst({
        where: {
          id: decoded.userId,
          isActive: true
        },
        select: { id: true, email: true, role: true }
      });

      if (!user) {
        throw new Error('User not found or inactive');
      }

      return {
        userId: user.id,
        email: user.email,
        role: user.role
      };
    } catch (error) {
      logger.error('Token validation error:', error);
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Refresh JWT token
   */
  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    try {
      // Validate refresh token
      const decoded = jwt.verify(refreshToken, this.jwtSecret) as any;
      
      // Check if user exists and is active
      const user = await prisma.user.findFirst({
        where: {
          id: decoded.userId,
          isActive: true
        }
      });

      if (!user) {
        throw new Error('User not found or inactive');
      }

      // Generate new tokens
      const newToken = this.generateToken(user.id, user.email, user.role);
      const newRefreshToken = this.generateRefreshToken(user.id);

      return {
        token: newToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Validate new password
      if (!validatePassword(newPassword)) {
        throw new Error('New password does not meet requirements');
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, this.saltRounds);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword }
      });

      logger.info(`Password changed successfully for user: ${user.email}`);
      return true;
    } catch (error) {
      logger.error('Password change error:', error);
      throw error;
    }
  }

  /**
   * Generate password reset token
   */
  async generatePasswordResetToken(email: string): Promise<string> {
    try {
      // Find user by email
      const user = await prisma.user.findFirst({
        where: {
          email: email.toLowerCase(),
          isActive: true
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Store reset token in database
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: resetToken,
          resetPasswordExpires: resetTokenExpiry
        }
      });

      logger.info(`Password reset token generated for user: ${user.email}`);
      return resetToken;
    } catch (error) {
      logger.error('Password reset token generation error:', error);
      throw error;
    }
  }

  /**
   * Reset password using token
   */
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      // Find user by reset token
      const user = await prisma.user.findFirst({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: {
            gt: new Date()
          }
        }
      });

      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      // Validate new password
      if (!validatePassword(newPassword)) {
        throw new Error('New password does not meet requirements');
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, this.saltRounds);

      // Update password and clear reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedNewPassword,
          resetPasswordToken: null,
          resetPasswordExpires: null
        }
      });

      logger.info(`Password reset successfully for user: ${user.email}`);
      return true;
    } catch (error) {
      logger.error('Password reset error:', error);
      throw error;
    }
  }

  /**
   * Verify user email
   */
  async verifyEmail(token: string): Promise<boolean> {
    try {
      // Find user by verification token
      const user = await prisma.user.findFirst({
        where: {
          emailVerificationToken: token,
          emailVerificationExpires: {
            gt: new Date()
          }
        }
      });

      if (!user) {
        throw new Error('Invalid or expired verification token');
      }

      // Mark email as verified
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpires: null
        }
      });

      logger.info(`Email verified successfully for user: ${user.email}`);
      return true;
    } catch (error) {
      logger.error('Email verification error:', error);
      throw error;
    }
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(email: string): Promise<boolean> {
    try {
      // Find user by email
      const user = await prisma.user.findFirst({
        where: {
          email: email.toLowerCase(),
          isActive: true
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (user.emailVerified) {
        throw new Error('Email already verified');
      }

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Store verification token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationToken: verificationToken,
          emailVerificationExpires: verificationExpiry
        }
      });

      // TODO: Send verification email using email service
      // For now, just log the token
      logger.info(`Verification email sent to: ${user.email}, token: ${verificationToken}`);

      return true;
    } catch (error) {
      logger.error('Verification email error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: IUserUpdate): Promise<IUser> {
    try {
      // Validate updates
      if (updates.email && !validateEmail(updates.email)) {
        throw new Error('Invalid email format');
      }

      if (updates.phone && !validatePhone(updates.phone)) {
        throw new Error('Invalid phone format');
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updates
      });

      logger.info(`Profile updated successfully for user: ${updatedUser.email}`);
      return updatedUser;
    } catch (error) {
      logger.error('Profile update error:', error);
      throw error;
    }
  }

  /**
   * Deactivate user account
   */
  async deactivateUser(userId: string): Promise<boolean> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: false }
      });

      logger.info(`User account deactivated: ${userId}`);
      return true;
    } catch (error) {
      logger.error('User deactivation error:', error);
      throw error;
    }
  }

  /**
   * Reactivate user account
   */
  async reactivateUser(userId: string): Promise<boolean> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: true }
      });

      logger.info(`User account reactivated: ${userId}`);
      return true;
    } catch (error) {
      logger.error('User reactivation error:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<IUser | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      return user;
    } catch (error) {
      logger.error('Get user error:', error);
      throw error;
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<IUser | null> {
    try {
      const user = await prisma.user.findFirst({
        where: { email: email.toLowerCase() }
      });

      return user;
    } catch (error) {
      logger.error('Get user by email error:', error);
      throw error;
    }
  }

  // Private helper methods

  private validateUserData(userData: IUserCreate): { success: boolean; error?: string } {
    if (!userData.firstName || !userData.lastName || !userData.email || !userData.password || !userData.phone) {
      return { success: false, error: 'All required fields must be provided' };
    }

    if (!validateEmail(userData.email)) {
      return { success: false, error: 'Invalid email format' };
    }

    if (!validatePassword(userData.password)) {
      return { success: false, error: 'Password does not meet requirements' };
    }

    if (!validatePhone(userData.phone)) {
      return { success: false, error: 'Invalid phone format' };
    }

    return { success: true };
  }

  private generateToken(userId: string, email: string, role: string): string {
    return jwt.sign(
      { userId, email, role },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn }
    );
  }

  private generateRefreshToken(userId: string): string {
    return jwt.sign(
      { userId, type: 'refresh' },
      this.jwtSecret,
      { expiresIn: this.refreshTokenExpiresIn }
    );
  }
}

// Create and export service instance
export const authService = new AuthService();

// Export individual methods for convenience
export const {
  registerUser,
  authenticateUser,
  validateToken,
  refreshToken,
  changePassword,
  generatePasswordResetToken,
  resetPassword,
  verifyEmail,
  sendVerificationEmail,
  updateUserProfile,
  deactivateUser,
  reactivateUser,
  getUserById,
  getUserByEmail
} = authService;
