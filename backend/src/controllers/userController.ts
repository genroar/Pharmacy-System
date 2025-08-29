import { Response, NextFunction } from 'express';
import { prisma } from '@/database';
import { logger } from '@/utils/logger';
import { 
  CreateUserRequest, 
  UpdateUserRequest, 
  GetUserRequest,
  SearchRequest,
  AuthenticatedRequest,
  ControllerResponse,
  PaginatedControllerResponse
} from './types';
import { 
  IUserCreate, 
  IUserUpdate, 
  UserRole, 
  validateEmail, 
  validatePhone 
} from '@/models';
import { buildSearchQuery, buildPaginationQuery, createSearchResult } from '@/models';

// Create new user (Admin only)
export const createUser = async (
  req: CreateUserRequest,
  res: Response<ControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { firstName, lastName, email, password, phone, role, street, city, state, zipCode, country } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !phone) {
      res.status(400).json({
        success: false,
        message: 'First name, last name, email, password, and phone are required',
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

    // Validate phone format
    if (!validatePhone(phone)) {
      res.status(400).json({
        success: false,
        message: 'Invalid phone format',
        error: 'INVALID_PHONE_FORMAT',
        statusCode: 400
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

    // Create user data
    const userData: IUserCreate = {
      firstName,
      lastName,
      email,
      password, // Password will be hashed in the service layer
      phone,
      role: (role as UserRole) || UserRole.STAFF,
      street,
      city,
      state,
      zipCode,
      country
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
        street: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        isActive: true,
        createdAt: true
      }
    });

    logger.info(`User created successfully: ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user,
      statusCode: 201
    });

  } catch (error) {
    logger.error('Create user error:', error);
    next(error);
  }
};

// Get user by ID
export const getUserById = async (
  req: GetUserRequest,
  res: Response<ControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
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
        isActive: true,
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
      message: 'User retrieved successfully',
      data: user,
      statusCode: 200
    });

  } catch (error) {
    logger.error('Get user by ID error:', error);
    next(error);
  }
};

// Get all users with pagination and search
export const getUsers = async (
  req: SearchRequest,
  res: Response<PaginatedControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = '1', limit = '20', sortBy = 'createdAt', sortOrder = 'desc', query } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Build search query
    const searchQuery: any = {};
    if (query) {
      searchQuery.OR = [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } }
      ];
    }

    // Build pagination query
    const paginationQuery = buildPaginationQuery({
      page: pageNum,
      limit: limitNum,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    // Get total count
    const total = await prisma.user.count({ where: searchQuery });

    // Get users
    const users = await prisma.user.findMany({
      where: searchQuery,
      skip: paginationQuery.skip,
      take: paginationQuery.take,
      orderBy: paginationQuery.orderBy,
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
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Create search result
    const searchResult = createSearchResult(users, total, pageNum, limitNum);

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: searchResult,
      statusCode: 200
    });

  } catch (error) {
    logger.error('Get users error:', error);
    next(error);
  }
};

// Update user
export const updateUser = async (
  req: UpdateUserRequest,
  res: Response<ControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: IUserUpdate = req.body;

    // Validate email if provided
    if (updateData.email && !validateEmail(updateData.email)) {
      res.status(400).json({
        success: false,
        message: 'Invalid email format',
        error: 'INVALID_EMAIL_FORMAT',
        statusCode: 400
      });
      return;
    }

    // Validate phone if provided
    if (updateData.phone && !validatePhone(updateData.phone)) {
      res.status(400).json({
        success: false,
        message: 'Invalid phone format',
        error: 'INVALID_PHONE_FORMAT',
        statusCode: 400
      });
      return;
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND',
        statusCode: 404
      });
      return;
    }

    // Check if email is already taken by another user
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: updateData.email }
      });

      if (emailExists) {
        res.status(409).json({
          success: false,
          message: 'Email is already taken by another user',
          error: 'EMAIL_ALREADY_TAKEN',
          statusCode: 409
        });
        return;
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
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
        isActive: true,
        updatedAt: true
      }
    });

    logger.info(`User updated successfully: ${updatedUser.email}`);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
      statusCode: 200
    });

  } catch (error) {
    logger.error('Update user error:', error);
    next(error);
  }
};

// Delete user (soft delete)
export const deleteUser = async (
  req: GetUserRequest,
  res: Response<ControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND',
        statusCode: 404
      });
      return;
    }

    // Soft delete user
    await prisma.user.update({
      where: { id },
      data: { isActive: false }
    });

    logger.info(`User deleted successfully: ${existingUser.email}`);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      statusCode: 200
    });

  } catch (error) {
    logger.error('Delete user error:', error);
    next(error);
  }
};

// Activate/Deactivate user
export const toggleUserStatus = async (
  req: GetUserRequest,
  res: Response<ControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND',
        statusCode: 404
      });
      return;
    }

    // Toggle status
    const newStatus = !existingUser.isActive;
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: newStatus },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isActive: true,
        updatedAt: true
      }
    });

    const action = newStatus ? 'activated' : 'deactivated';
    logger.info(`User ${action}: ${updatedUser.email}`);

    res.status(200).json({
      success: true,
      message: `User ${action} successfully`,
      data: updatedUser,
      statusCode: 200
    });

  } catch (error) {
    logger.error('Toggle user status error:', error);
    next(error);
  }
};

// Get user statistics
export const getUserStats = async (
  req: AuthenticatedRequest,
  res: Response<ControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    // Get total users count
    const totalUsers = await prisma.user.count();

    // Get active users count
    const activeUsers = await prisma.user.count({
      where: { isActive: true }
    });

    // Get users by role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true }
    });

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRegistrations = await prisma.user.count({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      }
    });

    // Get users by verification status
    const verifiedUsers = await prisma.user.count({
      where: { emailVerified: true }
    });

    const unverifiedUsers = await prisma.user.count({
      where: { emailVerified: false }
    });

    const stats = {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item.role] = item._count.role;
        return acc;
      }, {} as Record<string, number>),
      recentRegistrations,
      verifiedUsers,
      unverifiedUsers,
      verificationRate: totalUsers > 0 ? (verifiedUsers / totalUsers) * 100 : 0
    };

    res.status(200).json({
      success: true,
      message: 'User statistics retrieved successfully',
      data: stats,
      statusCode: 200
    });

  } catch (error) {
    logger.error('Get user stats error:', error);
    next(error);
  }
};

// Search users by role
export const getUsersByRole = async (
  req: SearchRequest,
  res: Response<PaginatedControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { role, page = '1', limit = '20' } = req.query;

    if (!role) {
      res.status(400).json({
        success: false,
        message: 'Role parameter is required',
        error: 'MISSING_ROLE_PARAMETER',
        statusCode: 400
      });
      return;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Validate role
    const validRoles = Object.values(UserRole);
    if (!validRoles.includes(role as UserRole)) {
      res.status(400).json({
        success: false,
        message: 'Invalid role specified',
        error: 'INVALID_ROLE',
        statusCode: 400
      });
      return;
    }

    // Get total count
    const total = await prisma.user.count({
      where: { role: role as UserRole }
    });

    // Get users by role
    const users = await prisma.user.findMany({
      where: { role: role as UserRole },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        profileImage: true,
        isActive: true,
        lastLogin: true,
        createdAt: true
      }
    });

    // Create search result
    const searchResult = createSearchResult(users, total, pageNum, limitNum);

    res.status(200).json({
      success: true,
      message: `Users with role '${role}' retrieved successfully`,
      data: searchResult,
      statusCode: 200
    });

  } catch (error) {
    logger.error('Get users by role error:', error);
    next(error);
  }
};

// Export all functions
export {
  createUser,
  getUserById,
  getUsers,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getUserStats,
  getUsersByRole
};
