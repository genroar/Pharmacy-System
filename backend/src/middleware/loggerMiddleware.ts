import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';
import { performance } from 'perf_hooks';

/**
 * Request logging middleware
 * Logs all incoming requests with detailed information
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = performance.now();
  const requestId = generateRequestId();
  
  // Add request ID to request object
  (req as any).requestId = requestId;
  
  // Log request details
  logger.info('Incoming request', {
    requestId,
    method: req.method,
    url: req.originalUrl,
    path: req.path,
    query: req.query,
    body: sanitizeRequestBody(req.body),
    headers: sanitizeHeaders(req.headers),
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Log response details
    logger.info('Request completed', {
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration.toFixed(2)}ms`,
      contentLength: res.get('Content-Length') || 0,
      timestamp: new Date().toISOString()
    });

    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Performance monitoring middleware
 * Tracks slow requests and performance metrics
 */
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const startTime = performance.now();
  const requestId = (req as any).requestId || generateRequestId();
  
  // Set performance headers
  res.set('X-Request-ID', requestId);
  
  // Override res.end to calculate performance
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Log slow requests
    if (duration > 1000) { // 1 second threshold
      logger.warn('Slow request detected', {
        requestId,
        method: req.method,
        url: req.originalUrl,
        duration: `${duration.toFixed(2)}ms`,
        threshold: '1000ms'
      });
    }
    
    // Set performance headers
    res.set('X-Response-Time', `${duration.toFixed(2)}ms`);
    
    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Error logging middleware
 * Logs all errors with detailed context
 */
export const errorLogger = (err: any, req: Request, res: Response, next: NextFunction) => {
  const requestId = (req as any).requestId || generateRequestId();
  
  logger.error('Request error', {
    requestId,
    method: req.method,
    url: req.originalUrl,
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code
    },
    user: (req as any).user?.id || 'anonymous',
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  next(err);
};

/**
 * Security logging middleware
 * Logs security-related events
 */
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const requestId = (req as any).requestId || generateRequestId();
  
  // Log suspicious activities
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /union\s+select/i,
    /drop\s+table/i,
    /delete\s+from/i
  ];

  const requestData = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params,
    headers: req.headers
  });

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestData)) {
      logger.warn('Suspicious request detected', {
        requestId,
        method: req.method,
        url: req.originalUrl,
        pattern: pattern.source,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });
      break;
    }
  }

  next();
};

/**
 * Audit logging middleware
 * Logs important business operations
 */
export const auditLogger = (req: Request, res: Response, next: NextFunction) => {
  const requestId = (req as any).requestId || generateRequestId();
  
  // Log important operations
  const importantOperations = ['POST', 'PUT', 'DELETE', 'PATCH'];
  const importantPaths = ['/users', '/medicines', '/orders', '/inventory', '/suppliers'];
  
  if (importantOperations.includes(req.method) && 
      importantPaths.some(path => req.path.includes(path))) {
    
    logger.info('Business operation logged', {
      requestId,
      method: req.method,
      url: req.originalUrl,
      operation: getOperationType(req.method, req.path),
      user: (req as any).user?.id || 'anonymous',
      userRole: (req as any).user?.role || 'anonymous',
      data: sanitizeRequestBody(req.body),
      timestamp: new Date().toISOString()
    });
  }

  next();
};

/**
 * API usage analytics middleware
 * Tracks API usage patterns
 */
export const usageAnalytics = (req: Request, res: Response, next: NextFunction) => {
  const requestId = (req as any).requestId || generateRequestId();
  
  // Track endpoint usage
  const endpoint = req.path;
  const method = req.method;
  
  // Log usage metrics (in production, send to analytics service)
  logger.info('API usage tracked', {
    requestId,
    endpoint,
    method,
    user: (req as any).user?.id || 'anonymous',
    userRole: (req as any).user?.role || 'anonymous',
    timestamp: new Date().toISOString()
  });

  next();
};

/**
 * Request correlation middleware
 * Adds correlation ID for distributed tracing
 */
export const correlationId = (req: Request, res: Response, next: NextFunction) => {
  const correlationId = req.get('X-Correlation-ID') || generateRequestId();
  
  // Add correlation ID to request and response
  (req as any).correlationId = correlationId;
  res.set('X-Correlation-ID', correlationId);
  
  next();
};

/**
 * Health check logging middleware
 * Logs health check requests separately
 */
export const healthCheckLogger = (req: Request, res: Response, next: NextFunction) => {
  if (req.path === '/health') {
    logger.info('Health check request', {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection.remoteAddress,
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Sanitize request body for logging (remove sensitive data)
 */
function sanitizeRequestBody(body: any): any {
  if (!body) return body;
  
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
  const sanitized = { ...body };
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

/**
 * Sanitize headers for logging (remove sensitive data)
 */
function sanitizeHeaders(headers: any): any {
  if (!headers) return headers;
  
  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
  const sanitized = { ...headers };
  
  for (const header of sensitiveHeaders) {
    if (sanitized[header]) {
      sanitized[header] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

/**
 * Get operation type for audit logging
 */
function getOperationType(method: string, path: string): string {
  if (method === 'POST') return 'CREATE';
  if (method === 'PUT') return 'UPDATE';
  if (method === 'DELETE') return 'DELETE';
  if (method === 'PATCH') return 'PARTIAL_UPDATE';
  return 'READ';
}

/**
 * Combined logging middleware
 * Applies all logging middlewares in the correct order
 */
export const combinedLogging = [
  correlationId,
  requestLogger,
  performanceMonitor,
  securityLogger,
  auditLogger,
  usageAnalytics,
  healthCheckLogger
];

/**
 * Development logging middleware
 * Enhanced logging for development environment
 */
export const developmentLogger = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    
    if (Object.keys(req.body).length > 0) {
      console.log('Request Body:', JSON.stringify(req.body, null, 2));
    }
    
    if (Object.keys(req.query).length > 0) {
      console.log('Query Params:', JSON.stringify(req.query, null, 2));
    }
  }
  
  next();
};
