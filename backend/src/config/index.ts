// Main configuration
export { config, type Config } from './config';

// Database configuration
export {
  mongoConfig,
  sqliteConfig,
  remoteDBConfig,
  getDatabaseStatus,
  checkDatabaseHealth,
  getDefaultDBConfig,
  backupConfig,
  migrationConfig,
  type DatabaseConfig,
  type SQLiteConfig,
  type RemoteDBConfig
} from './db';

// Logger configuration
export {
  loggerConfig,
  createTransports,
  createLogFormat,
  createConsoleFormat,
  logLevels,
  logColors,
  fileTransports,
  consoleTransport,
  httpTransport,
  streamTransport,
  logRotationConfig,
  logFilterConfig,
  performanceLogConfig,
  type LoggerConfig,
  type LogTransport
} from './logger';

// Security configuration
export {
  securityConfig,
  jwtConfig,
  encryptionConfig,
  sessionConfig,
  corsConfig,
  rateLimitConfig,
  helmetConfig,
  bcryptConfig,
  securityHeaders,
  passwordPolicy,
  apiKeyConfig,
  encrypt,
  decrypt,
  hashString,
  generateRandomString,
  type SecurityConfig,
  type JWTConfig,
  type EncryptionConfig,
  type SessionConfig,
  type CORSConfig,
  type RateLimitConfig,
  type HelmetConfig,
  type BcryptConfig
} from './security';

// Configuration validation
export const validateConfig = (): boolean => {
  try {
    // Validate required environment variables
    const requiredEnvVars = [
      'NODE_ENV',
      'PORT',
      'JWT_SECRET',
      'DATABASE_URL'
    ];

    const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingVars.length > 0) {
      console.error('Missing required environment variables:', missingVars);
      return false;
    }

    // Validate port number
    const port = parseInt(process.env.PORT || '3000', 10);
    if (isNaN(port) || port < 1 || port > 65535) {
      console.error('Invalid PORT configuration');
      return false;
    }

    // Validate JWT secret
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      console.error('JWT_SECRET must be at least 32 characters long');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Configuration validation failed:', error);
    return false;
  }
};

// Configuration summary
export const getConfigSummary = () => {
  return {
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    database: {
      type: 'mongodb',
      url: process.env.DATABASE_URL ? 'configured' : 'not configured'
    },
    security: {
      jwt: process.env.JWT_SECRET ? 'configured' : 'not configured',
      cors: process.env.CORS_ORIGINS ? 'configured' : 'not configured'
    },
    logging: {
      level: process.env.LOG_LEVEL || 'info',
      file: process.env.LOG_FILE ? 'configured' : 'not configured'
    }
  };
};

// Export default configuration
export default {
  config: require('./config').config,
  db: require('./db'),
  logger: require('./logger'),
  security: require('./security'),
  validateConfig,
  getConfigSummary
};
