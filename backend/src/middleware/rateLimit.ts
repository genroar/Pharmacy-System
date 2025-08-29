import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { logger } from '@/utils/logger';

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Create a rate limiter with custom configuration
 * @param options - Rate limiting options
 * @returns Express rate limiting middleware
 */
export const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  message?: string;
  statusCode?: number;
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: options.message || 'Too many requests from this IP, please try again later.',
    statusCode: options.statusCode || 429,
    keyGenerator: options.keyGenerator || ((req: Request) => {
      // Use IP address as default key
      return req.ip || req.connection.remoteAddress || 'unknown';
    }),
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    skipFailedRequests: options.skipFailedRequests || false,
    handler: (req: Request, res: Response) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        path: req.path,
        method: req.method,
        userAgent: req.get('User-Agent')
      });

      res.status(options.statusCode || 429).json({
        success: false,
        error: options.message || 'Too many requests from this IP, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(options.windowMs / 1000),
        timestamp: new Date().toISOString()
      });
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

/**
 * Strict rate limiter for authentication endpoints
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  message: 'Too many authentication attempts, please try again later.',
  statusCode: 429
});

/**
 * Standard rate limiter for general API endpoints
 */
export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many API requests, please try again later.',
  statusCode: 429
});

/**
 * Strict rate limiter for write operations
 */
export const writeRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per 15 minutes
  message: 'Too many write operations, please try again later.',
  statusCode: 429
});

/**
 * Rate limiter for report generation (CPU intensive)
 */
export const reportRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour
  message: 'Too many report generation requests, please try again later.',
  statusCode: 429
});

/**
 * Rate limiter for search operations
 */
export const searchRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per 15 minutes
  message: 'Too many search requests, please try again later.',
  statusCode: 429
});

/**
 * Dynamic rate limiter based on user role
 */
export const dynamicRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get user role from request (set by auth middleware)
    const userRole = (req as any).user?.role || 'anonymous';
    
    let maxRequests: number;
    let windowMs: number;

    // Set limits based on user role
    switch (userRole) {
      case 'admin':
        maxRequests = 1000;
        windowMs = 15 * 60 * 1000; // 15 minutes
        break;
      case 'manager':
        maxRequests = 500;
        windowMs = 15 * 60 * 1000; // 15 minutes
        break;
      case 'staff':
        maxRequests = 200;
        windowMs = 15 * 60 * 1000; // 15 minutes
        break;
      case 'customer':
        maxRequests = 100;
        windowMs = 15 * 60 * 1000; // 15 minutes
        break;
      default:
        maxRequests = 50;
        windowMs = 15 * 60 * 1000; // 15 minutes
    }

    // Create dynamic rate limiter
    const limiter = createRateLimiter({
      windowMs,
      max: maxRequests,
      keyGenerator: (req: Request) => {
        // Use user ID if authenticated, otherwise IP
        return (req as any).user?.id || req.ip || 'anonymous';
      }
    });

    // Apply the limiter
    limiter(req, res, next);
  } catch (error) {
    logger.error('Dynamic rate limiter error:', error);
    // Fallback to standard rate limiting
    apiRateLimiter(req, res, next);
  }
};

/**
 * Burst rate limiter for handling traffic spikes
 */
export const burstRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 200, // 200 requests per minute
  message: 'Burst rate limit exceeded, please slow down your requests.',
  statusCode: 429
});

/**
 * IP-based rate limiter with whitelist support
 */
export const ipRateLimiter = (whitelist: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    
    // Skip rate limiting for whitelisted IPs
    if (whitelist.includes(clientIP)) {
      return next();
    }

    // Apply standard rate limiting
    apiRateLimiter(req, res, next);
  };
};

/**
 * User-based rate limiter for authenticated users
 */
export const userRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per 15 minutes
  keyGenerator: (req: Request) => {
    // Use user ID for authenticated requests
    return (req as any).user?.id || req.ip || 'anonymous';
  },
  message: 'User rate limit exceeded, please try again later.',
  statusCode: 429
});

/**
 * Endpoint-specific rate limiter
 */
export const endpointRateLimiter = (endpoint: string, max: number, windowMs: number = 15 * 60 * 1000) => {
  return createRateLimiter({
    windowMs,
    max,
    keyGenerator: (req: Request) => {
      return `${req.ip}-${endpoint}`;
    },
    message: `Rate limit exceeded for ${endpoint}, please try again later.`,
    statusCode: 429
  });
};

/**
 * Rate limit information middleware
 */
export const rateLimitInfo = (req: Request, res: Response, next: NextFunction) => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const key = `${clientIP}-${req.path}`;
  
  const limitInfo = rateLimitStore.get(key);
  
  if (limitInfo) {
    res.set({
      'X-RateLimit-Limit': '100',
      'X-RateLimit-Remaining': Math.max(0, 100 - limitInfo.count).toString(),
      'X-RateLimit-Reset': new Date(limitInfo.resetTime).toISOString()
    });
  }
  
  next();
};
