# Configuration Module

This directory contains all configuration files for the Pharmacy System backend.

## 📁 Structure

```
config/
├── index.ts          # Main configuration exports
├── config.ts         # Core environment configuration
├── db.ts            # Database configuration (MongoDB, SQLite, Remote DB)
├── logger.ts         # Logging configuration (Winston)
├── security.ts       # Security configuration (JWT, Encryption, CORS)
└── README.md         # This file
```

## 🚀 Usage

### Basic Import
```typescript
import { config } from '@/config';
// or
import { config } from '@/config/config';
```

### Specific Configurations
```typescript
import { 
  mongoConfig, 
  jwtConfig, 
  loggerConfig 
} from '@/config';

import { 
  securityConfig, 
  corsConfig, 
  rateLimitConfig 
} from '@/config/security';
```

## ⚙️ Configuration Files

### 1. `config.ts` - Core Configuration
Main environment configuration file that loads all environment variables.

**Features:**
- Environment detection
- Database connection settings
- JWT configuration
- Redis settings
- Email configuration
- CORS origins
- File upload limits
- Logging settings
- Rate limiting

**Example:**
```typescript
import { config } from '@/config/config';

console.log(config.env);           // 'development' | 'production'
console.log(config.port);          // 3000
console.log(config.database.url);  // MongoDB connection string
```

### 2. `db.ts` - Database Configuration
Database-specific configurations for MongoDB, SQLite, and remote databases.

**Features:**
- MongoDB configuration with connection pooling
- SQLite configuration for local development
- Remote database support (PostgreSQL/MySQL)
- Database health checks
- Backup and migration settings

**Example:**
```typescript
import { mongoConfig, sqliteConfig } from '@/config/db';

// Use MongoDB config
const dbConfig = mongoConfig;

// Check database health
const health = await checkDatabaseHealth();
```

### 3. `logger.ts` - Logging Configuration
Comprehensive logging configuration using Winston.

**Features:**
- Multiple log levels (error, warn, info, debug, etc.)
- Console and file transports
- HTTP transport for external logging services
- Log rotation and compression
- Performance logging
- Custom log formats

**Example:**
```typescript
import { loggerConfig, createTransports } from '@/config/logger';

// Create custom logger
const logger = winston.createLogger(loggerConfig);

// Add custom transports
const transports = createTransports();
```

### 4. `security.ts` - Security Configuration
Security-related configurations including JWT, encryption, and CORS.

**Features:**
- JWT token configuration
- Encryption algorithms and keys
- Session management
- CORS policies
- Rate limiting
- Security headers
- Password policies
- API key management

**Example:**
```typescript
import { 
  securityConfig, 
  jwtConfig, 
  corsConfig 
} from '@/config/security';

// Use JWT config
const token = jwt.sign(payload, jwtConfig.secret, {
  expiresIn: jwtConfig.expiresIn
});

// Apply CORS
app.use(cors(corsConfig));
```

### 5. `index.ts` - Configuration Exports
Central export file that provides access to all configurations.

**Features:**
- Single import point for all configs
- Configuration validation
- Configuration summary
- Type exports

**Example:**
```typescript
import { 
  config, 
  validateConfig, 
  getConfigSummary 
} from '@/config';

// Validate configuration
if (!validateConfig()) {
  process.exit(1);
}

// Get configuration summary
const summary = getConfigSummary();
```

## 🔧 Environment Variables

### Required Variables
```bash
NODE_ENV=development
PORT=3000
JWT_SECRET=your-super-secret-jwt-key
DATABASE_URL=mongodb://localhost:27017/pharmacy_system
```

### Optional Variables
```bash
# Database
DB_HOST=localhost
DB_PORT=27017
DB_NAME=pharmacy_system
DB_USERNAME=
DB_PASSWORD=

# JWT
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

## 🛡️ Security Features

### JWT Configuration
- Configurable expiration times
- Refresh token rotation
- Token blacklisting support
- Multiple algorithms support

### Encryption
- AES-256-GCM encryption
- Configurable salt rounds
- Secure key generation
- Hash utilities

### CORS & Security Headers
- Configurable origins
- Security headers (HSTS, XSS Protection, etc.)
- Rate limiting
- Request filtering

## 📊 Database Support

### MongoDB (Primary)
- Connection pooling
- Health monitoring
- Backup configuration
- Migration support

### SQLite (Development)
- Local file storage
- Lightweight for development
- No external dependencies

### Remote Databases
- PostgreSQL support
- MySQL support
- Connection pooling
- SSL support

## 🔍 Validation & Health Checks

### Configuration Validation
```typescript
import { validateConfig } from '@/config';

if (!validateConfig()) {
  console.error('Invalid configuration');
  process.exit(1);
}
```

### Database Health Check
```typescript
import { checkDatabaseHealth } from '@/config/db';

const health = await checkDatabaseHealth();
if (health.status === 'unhealthy') {
  // Handle unhealthy database
}
```

## 🚀 Best Practices

1. **Environment Variables**: Always use environment variables for sensitive data
2. **Validation**: Validate configuration on startup
3. **Defaults**: Provide sensible defaults for all configurations
4. **Type Safety**: Use TypeScript interfaces for all configurations
5. **Security**: Never commit secrets to version control
6. **Documentation**: Document all configuration options

## 🔄 Updates & Maintenance

When adding new configuration options:

1. Add to the appropriate config file
2. Update the TypeScript interfaces
3. Add to the index.ts exports
4. Update this README
5. Add validation if required
6. Update environment variable documentation

## 📝 Examples

### Complete Configuration Usage
```typescript
import { 
  config, 
  mongoConfig, 
  securityConfig,
  validateConfig 
} from '@/config';

// Validate configuration
if (!validateConfig()) {
  throw new Error('Invalid configuration');
}

// Use configurations
const app = express();
app.use(cors(securityConfig.cors));
app.use(helmet(securityConfig.helmet));

// Database connection
mongoose.connect(mongoConfig.url, mongoConfig.options);
```

### Custom Logger Setup
```typescript
import { 
  loggerConfig, 
  createTransports,
  logLevels 
} from '@/config/logger';

const customLogger = winston.createLogger({
  ...loggerConfig,
  levels: logLevels,
  transports: createTransports()
});
```

---

**Note**: Always refer to the individual configuration files for detailed options and advanced usage patterns.
