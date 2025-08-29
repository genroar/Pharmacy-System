// Authentication and Authorization Middleware
export { authenticate, authorize, requireAdmin, requireManager, requireStaff } from './auth';

// Error Handling Middleware
export { errorHandler, notFoundHandler } from './errorHandler';

// Validation Middleware
export { 
  validateRequest, 
  validateBody, 
  validateQuery, 
  validateParams, 
  sanitizeRequest 
} from './validation';

// Rate Limiting Middleware
export {
  createRateLimiter,
  authRateLimiter,
  apiRateLimiter,
  writeRateLimiter,
  reportRateLimiter,
  searchRateLimiter,
  dynamicRateLimiter,
  burstRateLimiter,
  ipRateLimiter,
  userRateLimiter,
  endpointRateLimiter,
  rateLimitInfo
} from './rateLimit';

// Logging Middleware
export {
  requestLogger,
  performanceMonitor,
  errorLogger,
  securityLogger,
  auditLogger,
  usageAnalytics,
  correlationId,
  healthCheckLogger,
  combinedLogging,
  developmentLogger
} from './loggerMiddleware';

// Combined middleware arrays for easy application
export const securityMiddleware = [
  sanitizeRequest,
  securityLogger
];

export const loggingMiddleware = [
  correlationId,
  requestLogger,
  performanceMonitor,
  auditLogger,
  usageAnalytics
];

export const validationMiddleware = [
  sanitizeRequest
];

export const rateLimitMiddleware = [
  apiRateLimiter
];

// Default middleware stack
export const defaultMiddleware = [
  ...loggingMiddleware,
  ...securityMiddleware,
  ...rateLimitMiddleware
];

// Development middleware stack
export const developmentMiddleware = [
  ...defaultMiddleware,
  developmentLogger
];

// Production middleware stack
export const productionMiddleware = [
  ...defaultMiddleware
];
