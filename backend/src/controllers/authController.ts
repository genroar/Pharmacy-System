import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/database';
import { logger } from '@/utils/logger';
import { 
  LoginRequest, 
  RegisterRequest, 
  ChangePasswordRequest, 
  ForgotPasswordRequest, 
  ResetPasswordRequest,
  AuthenticatedRequest,
  ControllerResponse
} from './types';
import { 
  IUserCreate, 
  UserRole, 
  validateEmail, 
  validatePassword 
} from '@/models';
import { config } from '@/config';

// JWT token generation
const generateToken = (userId: string, email: string, role: string): string => {
  return jwt.sign(
    { userId, email, role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

// Refresh token generation
const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { userId, type: 'refresh' },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );
};

// User registration
export const register = async (
  req: RegisterRequest,
  res: Response<ControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { firstName, lastName, email, password, confirmPassword, phone, role } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !password || !confirmPassword || !phone) {
      res.status(400).json({
        success: false,
        message: 'All required fields must be provided',
        error: 'MISSING_REQUIRED_FIELDS',
        statusCode: 400
      });
      return;
    }

    // Validate email format
    if (!validateEmail(email)) {
      res.status(400).json({
        success: false,
        message: 'Invalid email format',
        error: 'INVALID_EMAIL_FORMAT',
        statusCode: 400
      });
      return;
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: 'Passwords do not match',
        error: 'PASSWORD_MISMATCH',
        statusCode: 400
      });
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      res.status(400).json({
        success: false,
        message: 'Password does not meet requirements',
        error: 'WEAK_PASSWORD',
        statusCode: 400,
        data: passwordValidation.errors
      });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'User with this email already exists',
        error: 'USER_ALREADY_EXISTS',
        statusCode: 409
      });
      return;
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const userData: IUserCreate = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      role: (role as UserRole) || UserRole.CUSTOMER
    };

    const user = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });

    // Generate tokens
    const token = generateToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token (you might want to store this in Redis or database)
    // await storeRefreshToken(user.id, refreshToken);

    logger.info(`User registered successfully: ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token,
        refreshToken
      },
      statusCode: 201
    });

  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
};

// User login
export const login = async (
  req: LoginRequest,
  res: Response<ControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, rememberMe } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required',
        error: 'MISSING_CREDENTIALS',
        statusCode: 400
      });
      return;
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        error: 'INVALID_CREDENTIALS',
        statusCode: 401
      });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'Account is deactivated',
        error: 'ACCOUNT_DEACTIVATED',
        statusCode: 403
      });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        error: 'INVALID_CREDENTIALS',
        statusCode: 401
      });
      return;
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Generate tokens
    const tokenExpiry = rememberMe ? '7d' : '24h';
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: tokenExpiry }
    );
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token
    // await storeRefreshToken(user.id, refreshToken);

    logger.info(`User logged in successfully: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role
        },
        token,
        refreshToken,
        expiresIn: tokenExpiry
      },
      statusCode: 200
    });

  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

// Refresh token
export const refreshToken = async (
  req: AuthenticatedRequest,
  res: Response<ControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: 'Refresh token is required',
        error: 'MISSING_REFRESH_TOKEN',
        statusCode: 400
      });
      return;
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as any;
    
    if (decoded.type !== 'refresh') {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
        error: 'INVALID_REFRESH_TOKEN',
        statusCode: 401
      });
      return;
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'User not found or inactive',
        error: 'USER_NOT_FOUND',
        statusCode: 401
      });
      return;
    }

    // Generate new tokens
    const newToken = generateToken(user.id, user.email, user.role);
    const newRefreshToken = generateRefreshToken(user.id);

    // Update refresh token
    // await updateRefreshToken(user.id, newRefreshToken);

    logger.info(`Token refreshed for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      },
      statusCode: 200
    });

  } catch (error) {
    logger.error('Token refresh error:', error);
    next(error);
  }
};

// Change password
export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response<ControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
        error: 'UNAUTHORIZED',
        statusCode: 401
      });
      return;
    }

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      res.status(400).json({
        success: false,
        message: 'All password fields are required',
        error: 'MISSING_PASSWORD_FIELDS',
        statusCode: 400
      });
      return;
    }

    // Check password confirmation
    if (newPassword !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: 'New passwords do not match',
        error: 'PASSWORD_MISMATCH',
        statusCode: 400
      });
      return;
    }

    // Validate new password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      res.status(400).json({
        success: false,
        message: 'New password does not meet requirements',
        error: 'WEAK_PASSWORD',
        statusCode: 400,
        data: passwordValidation.errors
      });
      return;
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND',
        statusCode: 404
      });
      return;
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
        error: 'INCORRECT_CURRENT_PASSWORD',
        statusCode: 401
      });
      return;
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    logger.info(`Password changed for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      statusCode: 200
    });

  } catch (error) {
    logger.error('Change password error:', error);
    next(error);
  }
};

// Forgot password
export const forgotPassword = async (
  req: ForgotPasswordRequest,
  res: Response<ControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required',
        error: 'MISSING_EMAIL',
        statusCode: 400
      });
      return;
    }

    // Validate email format
    if (!validateEmail(email)) {
      res.status(400).json({
        success: false,
        message: 'Invalid email format',
        error: 'INVALID_EMAIL_FORMAT',
        statusCode: 400
      });
      return;
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent',
        statusCode: 200
      });
      return;
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user.id, type: 'reset' },
      config.jwt.secret,
      { expiresIn: '1h' }
    );

    // Store reset token (you might want to store this in Redis or database)
    // await storeResetToken(user.id, resetToken);

    // Send reset email (implement your email service here)
    // await sendPasswordResetEmail(user.email, resetToken);

    logger.info(`Password reset requested for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent',
      statusCode: 200
    });

  } catch (error) {
    logger.error('Forgot password error:', error);
    next(error);
  }
};

// Reset password
export const resetPassword = async (
  req: ResetPasswordRequest,
  res: Response<ControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      res.status(400).json({
        success: false,
        message: 'Token, new password, and confirmation are required',
        error: 'MISSING_REQUIRED_FIELDS',
        statusCode: 400
      });
      return;
    }

    // Check password confirmation
    if (newPassword !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: 'Passwords do not match',
        error: 'PASSWORD_MISMATCH',
        statusCode: 400
      });
      return;
    }

    // Validate new password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      res.status(400).json({
        success: false,
        message: 'New password does not meet requirements',
        error: 'WEAK_PASSWORD',
        statusCode: 400,
        data: passwordValidation.errors
      });
      return;
    }

    // Verify reset token
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    
    if (decoded.type !== 'reset') {
      res.status(401).json({
        success: false,
        message: 'Invalid reset token',
        error: 'INVALID_RESET_TOKEN',
        statusCode: 401
      });
      return;
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND',
        statusCode: 404
      });
      return;
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword }
    });

    // Invalidate reset token
    // await invalidateResetToken(user.id);

    logger.info(`Password reset for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
      statusCode: 200
    });

  } catch (error) {
    logger.error('Reset password error:', error);
    next(error);
  }
};

// Logout
export const logout = async (
  req: AuthenticatedRequest,
  res: Response<ControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (userId) {
      // Invalidate refresh token
      // await invalidateRefreshToken(userId);
      
      logger.info(`User logged out: ${req.user?.email}`);
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      statusCode: 200
    });

  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
};

// Get current user profile
export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response<ControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
        error: 'UNAUTHORIZED',
        statusCode: 401
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        profileImage: true,
        street: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        notifications: true,
        language: true,
        timezone: true,
        emailVerified: true,
        phoneVerified: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND',
        statusCode: 404
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: user,
      statusCode: 200
    });

  } catch (error) {
    logger.error('Get profile error:', error);
    next(error);
  }
};

// Export all functions
export {
  register,
  login,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
  logout,
  getProfile
};
