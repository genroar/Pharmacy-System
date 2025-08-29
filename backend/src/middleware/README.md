# Middleware

The `middleware/` folder contains all custom middleware functions for the Pharmacy System. These middleware functions handle authentication, authorization, validation, error handling, rate limiting, and logging.

## Architecture

The middleware layer provides:

- **Security**: Authentication, authorization, and input sanitization
- **Validation**: Request data validation using Joi schemas
- **Rate Limiting**: API abuse prevention and fair usage enforcement
- **Logging**: Comprehensive request/response logging and monitoring
- **Error Handling**: Centralized error handling and response formatting
- **Performance**: Request timing and performance monitoring

## Folder Structure

```
middleware/
├── index.ts              # Main entry point - exports all middleware
├── auth.ts               # Authentication and authorization middleware
├── errorHandler.ts       # Error handling middleware
├── validation.ts         # Request validation middleware
├── rateLimit.ts          # Rate limiting middleware
├── loggerMiddleware.ts   # Logging and monitoring middleware
└── README.md             # This documentation file
```

## Middleware Categories

### 1. Authentication & Authorization (`auth.ts`)

**Core authentication and role-based access control:**

```typescript
import { authenticate, requireAdmin, requireManager } from '@/middleware';

// Protect route with authentication
router.get('/users', authenticate, userController.getUsers);

// Require specific role
router.post('/users', requireAdmin, userController.createUser);

// Require manager or higher
router.put('/users/:id', requireManager, userController.updateUser);
```

**Available Functions:**
- `authenticate` - Verify JWT token and attach user to request
- `authorize` - Check if user has required permissions
- `requireAdmin` - Require admin role
- `requireManager` - Require manager or admin role
- `requireStaff` - Require staff, manager, or admin role

### 2. Error Handling (`errorHandler.ts`)

**Centralized error handling and response formatting:**

```typescript
import { errorHandler, notFoundHandler } from '@/middleware';

// Apply to app
app.use(notFoundHandler); // 404 handler
app.use(errorHandler);     // Global error handler
```

**Features:**
- Standardized error response format
- Automatic error logging
- 404 route handling
- Development vs production error details

### 3. Validation (`validation.ts`)

**Request data validation using Joi schemas:**

```typescript
import { validateRequest, validateBody } from '@/middleware';
import { userValidation } from '@/validations';

// Validate entire request
router.post('/users', 
  validateRequest(userValidation.createUser), 
  userController.createUser
);

// Validate only body
router.put('/users/:id', 
  validateBody(userValidation.updateUser), 
  userController.updateUser
);
```

**Available Functions:**
- `validateRequest` - Validate body, query, and params
- `validateBody` - Validate request body only
- `validateQuery` - Validate query parameters only
- `validateParams` - Validate URL parameters only
- `sanitizeRequest` - Sanitize input to prevent XSS

### 4. Rate Limiting (`rateLimit.ts`)

**API abuse prevention and fair usage enforcement:**

```typescript
import { 
  authRateLimiter, 
  apiRateLimiter, 
  writeRateLimiter 
} from '@/middleware';

// Apply to specific routes
router.post('/auth/login', authRateLimiter, authController.login);
router.post('/users', writeRateLimiter, userController.createUser);

// Apply globally
app.use(apiRateLimiter);
```

**Available Rate Limiters:**
- `authRateLimiter` - 5 requests per 15 minutes for auth
- `apiRateLimiter` - 100 requests per 15 minutes for general API
- `writeRateLimiter` - 20 requests per 15 minutes for write operations
- `reportRateLimiter` - 10 requests per hour for reports
- `searchRateLimiter` - 50 requests per 15 minutes for search
- `dynamicRateLimiter` - Role-based rate limiting
- `burstRateLimiter` - 200 requests per minute for traffic spikes

### 5. Logging (`loggerMiddleware.ts`)

**Comprehensive request/response logging and monitoring:**

```typescript
import { 
  requestLogger, 
  performanceMonitor, 
  combinedLogging 
} from '@/middleware';

// Apply individual middleware
app.use(requestLogger);
app.use(performanceMonitor);

// Apply combined logging stack
app.use(combinedLogging);
```

**Available Functions:**
- `requestLogger` - Log all incoming requests
- `performanceMonitor` - Track request performance and slow requests
- `errorLogger` - Log all errors with context
- `securityLogger` - Detect and log suspicious activities
- `auditLogger` - Log important business operations
- `usageAnalytics` - Track API usage patterns
- `correlationId` - Add correlation ID for distributed tracing

## Middleware Stacks

### Default Middleware Stack

```typescript
import { defaultMiddleware } from '@/middleware';

// Apply to app
app.use(defaultMiddleware);
```

**Includes:**
- Request correlation
- Request logging
- Performance monitoring
- Security logging
- Audit logging
- Usage analytics
- Input sanitization
- Rate limiting

### Development Middleware Stack

```typescript
import { developmentMiddleware } from '@/middleware';

// Apply in development
if (process.env.NODE_ENV === 'development') {
  app.use(developmentMiddleware);
}
```

**Additional Features:**
- Enhanced console logging
- Request/response body logging
- Development-specific error details

### Production Middleware Stack

```typescript
import { productionMiddleware } from '@/middleware';

// Apply in production
if (process.env.NODE_ENV === 'production') {
  app.use(productionMiddleware);
}
```

**Optimized for:**
- Performance
- Security
- Minimal logging overhead
- Production error handling

## Usage Examples

### Basic Route Protection

```typescript
import { authenticate, requireManager } from '@/middleware';

router.get('/users', authenticate, userController.getUsers);
router.post('/users', requireManager, userController.createUser);
router.put('/users/:id', requireManager, userController.updateUser);
router.delete('/users/:id', requireManager, userController.deleteUser);
```

### Validation with Middleware

```typescript
import { validateRequest, sanitizeRequest } from '@/middleware';
import { userValidation } from '@/validations';

router.post('/users', 
  sanitizeRequest,
  validateRequest(userValidation.createUser),
  userController.createUser
);
```

### Rate Limiting

```typescript
import { 
  authRateLimiter, 
  writeRateLimiter, 
  searchRateLimiter 
} from '@/middleware';

// Authentication endpoints
router.post('/auth/login', authRateLimiter, authController.login);
router.post('/auth/register', authRateLimiter, authController.register);

// Write operations
router.post('/users', writeRateLimiter, userController.createUser);
router.put('/users/:id', writeRateLimiter, userController.updateUser);

// Search operations
router.get('/users/search', searchRateLimiter, userController.searchUsers);
```

### Custom Rate Limiting

```typescript
import { createRateLimiter } from '@/middleware';

const customLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // 10 requests per 5 minutes
  message: 'Custom rate limit exceeded'
});

router.get('/sensitive-data', customLimiter, controller.getData);
```

### Logging Configuration

```typescript
import { 
  requestLogger, 
  performanceMonitor, 
  securityLogger 
} from '@/middleware';

// Apply logging middleware
app.use(requestLogger);
app.use(performanceMonitor);
app.use(securityLogger);

// Or use combined logging
import { combinedLogging } from '@/middleware';
app.use(combinedLogging);
```

## Configuration

### Environment Variables

```bash
# Rate limiting
RATE_LIMIT_WINDOW_MS=900000        # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100        # Max requests per window
RATE_LIMIT_SKIP_SUCCESSFUL=false   # Count successful requests

# Logging
LOG_LEVEL=info                      # Winston log level
LOG_ENABLE_REQUEST_LOGGING=true    # Enable request logging
LOG_ENABLE_PERFORMANCE=true        # Enable performance monitoring

# Security
SECURITY_ENABLE_SANITIZATION=true  # Enable input sanitization
SECURITY_LOG_SUSPICIOUS=true       # Log suspicious activities
```

### Custom Configuration

```typescript
import { createRateLimiter } from '@/middleware';

const customLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 50, // 50 requests per minute
  message: 'Too many requests',
  statusCode: 429,
  keyGenerator: (req) => req.ip,
  skipSuccessfulRequests: false
});
```

## Performance Considerations

### Middleware Order

**Optimal middleware order for performance:**

1. **Early termination middleware** (rate limiting, basic auth)
2. **Security middleware** (sanitization, validation)
3. **Business logic middleware** (authentication, authorization)
4. **Logging middleware** (request logging, performance monitoring)
5. **Route handlers**

### Caching

**Consider caching for frequently accessed data:**

```typescript
import { cacheMiddleware } from '@/middleware';

// Cache user permissions
router.get('/users/:id', 
  cacheMiddleware('user-permissions', 300), // 5 minutes
  userController.getUserById
);
```

### Async Middleware

**Handle async operations properly:**

```typescript
const asyncMiddleware = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.get('/users', asyncMiddleware(async (req, res, next) => {
  // Async operations
}));
```

## Security Features

### Input Sanitization

- **XSS Prevention**: Remove script tags and event handlers
- **SQL Injection Prevention**: Sanitize database inputs
- **Header Sanitization**: Remove sensitive headers from logs

### Rate Limiting

- **IP-based limiting**: Prevent abuse from single sources
- **User-based limiting**: Fair usage for authenticated users
- **Endpoint-specific limits**: Different limits for different operations

### Security Logging

- **Suspicious activity detection**: Log potential attacks
- **Audit trails**: Track all business operations
- **Security events**: Monitor security-related activities

## Monitoring and Analytics

### Request Metrics

- **Response times**: Track API performance
- **Error rates**: Monitor system health
- **Usage patterns**: Understand API usage

### Performance Alerts

- **Slow request detection**: Alert on slow responses
- **Rate limit alerts**: Monitor abuse attempts
- **Error rate alerts**: Track system stability

### Business Intelligence

- **User behavior**: Track user interactions
- **Popular endpoints**: Identify most used features
- **Peak usage times**: Plan for capacity

## Testing

### Middleware Testing

```typescript
import request from 'supertest';
import { app } from '../app';

describe('Rate Limiting Middleware', () => {
  it('should limit requests per IP', async () => {
    // Make multiple requests
    for (let i = 0; i < 6; i++) {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password' });
      
      if (i < 5) {
        expect(response.status).not.toBe(429);
      } else {
        expect(response.status).toBe(429);
      }
    }
  });
});
```

### Mock Middleware

```typescript
// Mock authentication middleware for testing
const mockAuth = (req: Request, res: Response, next: NextFunction) => {
  (req as any).user = {
    id: 'test-user-id',
    role: 'admin',
    email: 'test@example.com'
  };
  next();
};

// Use in tests
app.use(mockAuth);
```

## Best Practices

1. **Order matters**: Apply middleware in the correct order
2. **Performance**: Minimize middleware overhead
3. **Security**: Always validate and sanitize input
4. **Logging**: Log security events and errors
5. **Rate limiting**: Protect against abuse
6. **Error handling**: Provide meaningful error messages
7. **Monitoring**: Track performance and usage
8. **Testing**: Test all middleware functions
9. **Documentation**: Document custom middleware
10. **Configuration**: Make middleware configurable

## Future Enhancements

- **Redis integration**: Distributed rate limiting and caching
- **Machine learning**: Anomaly detection for security
- **Real-time monitoring**: Live performance dashboards
- **Advanced analytics**: Deep insights into API usage
- **Automated scaling**: Dynamic rate limiting based on load
- **Integration**: Connect with external monitoring services
