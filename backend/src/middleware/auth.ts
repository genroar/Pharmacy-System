import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@/config/config';
import { createError } from './errorHandler';
import { User } from '@/models/User';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('Access token required', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    
    if (!decoded.userId || !decoded.role) {
      throw createError('Invalid token format', 401);
    }

    // Check if user still exists and is active
    const user = await User.findById(decoded.userId).select('_id role isActive');
    
    if (!user) {
      throw createError('User not found', 401);
    }

    if (!user.isActive) {
      throw createError('User account is deactivated', 401);
    }

    // Add user info to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(createError('Invalid or expired token', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(createError('Token expired', 401));
    } else {
      next(error);
    }
  }
};

// Role-based authorization middleware
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(createError('Authentication required', 401));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(createError('Insufficient permissions', 403));
      return;
    }

    next();
  };
};

// Specific role authorization helpers
export const requireAdmin = authorize('admin');
export const requirePharmacist = authorize('admin', 'pharmacist');
export const requireStaff = authorize('admin', 'pharmacist', 'staff');
export const requireCustomer = authorize('admin', 'pharmacist', 'staff', 'customer');

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    
    if (decoded.userId && decoded.role) {
      // Check if user still exists and is active
      const user = await User.findById(decoded.userId).select('_id role isActive');
      
      if (user && user.isActive) {
        req.user = {
          userId: decoded.userId,
          role: decoded.role
        };
      }
    }

    next();
  } catch (error) {
    // If token is invalid, just continue without authentication
    next();
  }
};
