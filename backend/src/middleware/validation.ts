import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { logger } from '@/utils/logger';

/**
 * Validation middleware using Joi schemas
 * @param schema - Joi validation schema
 * @returns Express middleware function
 */
export const validateRequest = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body, query, and params
      const { error, value } = schema.validate(
        {
          body: req.body,
          query: req.query,
          params: req.params
        },
        {
          abortEarly: false,
          stripUnknown: true,
          allowUnknown: false
        }
      );

      if (error) {
        const validationErrors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }));

        logger.warn('Validation failed', {
          path: req.path,
          method: req.method,
          errors: validationErrors,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });

        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationErrors,
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString()
        });
      }

      // Replace request data with validated data
      req.body = value.body || req.body;
      req.query = value.query || req.query;
      req.params = value.params || req.params;

      next();
    } catch (err) {
      logger.error('Validation middleware error:', err);
      return res.status(500).json({
        success: false,
        error: 'Internal validation error',
        code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  };
};

/**
 * Validate request body only
 * @param schema - Joi validation schema for body
 * @returns Express middleware function
 */
export const validateBody = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
        allowUnknown: false
      });

      if (error) {
        const validationErrors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }));

        logger.warn('Body validation failed', {
          path: req.path,
          method: req.method,
          errors: validationErrors
        });

        return res.status(400).json({
          success: false,
          error: 'Request body validation failed',
          details: validationErrors,
          code: 'BODY_VALIDATION_ERROR',
          timestamp: new Date().toISOString()
        });
      }

      req.body = value;
      next();
    } catch (err) {
      logger.error('Body validation middleware error:', err);
      return res.status(500).json({
        success: false,
        error: 'Internal validation error',
        code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  };
};

/**
 * Validate request query parameters only
 * @param schema - Joi validation schema for query
 * @returns Express middleware function
 */
export const validateQuery = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = schema.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
        allowUnknown: false
      });

      if (error) {
        const validationErrors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }));

        logger.warn('Query validation failed', {
          path: req.path,
          method: req.method,
          errors: validationErrors
        });

        return res.status(400).json({
          success: false,
          error: 'Query parameters validation failed',
          details: validationErrors,
          code: 'QUERY_VALIDATION_ERROR',
          timestamp: new Date().toISOString()
        });
      }

      req.query = value;
      next();
    } catch (err) {
      logger.error('Query validation middleware error:', err);
      return res.status(500).json({
        success: false,
        error: 'Internal validation error',
        code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  };
};

/**
 * Validate request parameters only
 * @param schema - Joi validation schema for params
 * @returns Express middleware function
 */
export const validateParams = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = schema.validate(req.params, {
        abortEarly: false,
        stripUnknown: true,
        allowUnknown: false
      });

      if (error) {
        const validationErrors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }));

        logger.warn('Params validation failed', {
          path: req.path,
          method: req.method,
          errors: validationErrors
        });

        return res.status(400).json({
          success: false,
          error: 'URL parameters validation failed',
          details: validationErrors,
          code: 'PARAMS_VALIDATION_ERROR',
          timestamp: new Date().toISOString()
        });
      }

      req.params = value;
      next();
    } catch (err) {
      logger.error('Params validation middleware error:', err);
      return res.status(500).json({
        success: false,
        error: 'Internal validation error',
        code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  };
};

/**
 * Sanitize request data to prevent XSS and injection attacks
 * @returns Express middleware function
 */
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Sanitize body
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }

    // Sanitize params
    if (req.params) {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (err) {
    logger.error('Sanitization middleware error:', err);
    next();
  }
};

/**
 * Recursively sanitize object values
 * @param obj - Object to sanitize
 * @returns Sanitized object
 */
function sanitizeObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return typeof obj === 'string' ? sanitizeString(obj) : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeObject(value);
  }

  return sanitized;
}

/**
 * Sanitize string to prevent XSS attacks
 * @param str - String to sanitize
 * @returns Sanitized string
 */
function sanitizeString(str: string): string {
  if (typeof str !== 'string') return str;

  return str
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}
