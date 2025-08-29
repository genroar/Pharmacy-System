import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';
import { config } from '@/config/config';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  
  // Log error
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    statusCode,
  });
  
  // Don't leak error details in production
  const errorResponse = {
    success: false,
    message: config.env === 'production' && statusCode === 500 
      ? 'Internal Server Error' 
      : message,
    ...(config.env === 'development' && { stack: error.stack }),
    timestamp: new Date().toISOString(),
    path: req.path,
  };
  
  res.status(statusCode).json(errorResponse);
};

export const createError = (message: string, statusCode: number = 500): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
