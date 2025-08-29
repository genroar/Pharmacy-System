import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env['NODE_ENV'] || 'development',
  port: parseInt(process.env['PORT'] || '3000', 10),
  
  // Database
  database: {
    url: process.env['DATABASE_URL'] || 'mongodb://localhost:27017/pharmacy_system',
    host: process.env['DB_HOST'] || 'localhost',
    port: parseInt(process.env['DB_PORT'] || '27017', 10),
    name: process.env['DB_NAME'] || 'pharmacy_system',
    username: process.env['DB_USERNAME'] || '',
    password: process.env['DB_PASSWORD'] || '',
  },
  
  // JWT
  jwt: {
    secret: process.env['JWT_SECRET'] || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env['JWT_EXPIRES_IN'] || '24h',
    refreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] || '7d',
  },
  
  // Redis
  redis: {
    url: process.env['REDIS_URL'] || 'redis://localhost:6379',
    host: process.env['REDIS_HOST'] || 'localhost',
    port: parseInt(process.env['REDIS_PORT'] || '6379', 10),
    password: process.env['REDIS_PASSWORD'] || '',
  },
  
  // Email
  email: {
    host: process.env['EMAIL_HOST'] || 'smtp.gmail.com',
    port: parseInt(process.env['EMAIL_PORT'] || '587', 10),
    secure: process.env['EMAIL_SECURE'] === 'true',
    user: process.env['EMAIL_USER'] || '',
    password: process.env['EMAIL_PASSWORD'] || '',
  },
  
  // CORS
  cors: {
    origins: process.env['CORS_ORIGINS']?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  },
  
  // File upload
  upload: {
    maxSize: parseInt(process.env['MAX_FILE_SIZE'] || '5242880', 10), // 5MB
    allowedTypes: process.env['ALLOWED_FILE_TYPES']?.split(',') || ['image/jpeg', 'image/png', 'image/gif'],
    uploadPath: process.env['UPLOAD_PATH'] || './uploads',
  },
  
  // Logging
  logging: {
    level: process.env['LOG_LEVEL'] || 'info',
    file: process.env['LOG_FILE'] || './logs/app.log',
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000', 10), // 15 minutes
    max: parseInt(process.env['RATE_LIMIT_MAX'] || '100', 10), // limit each IP to 100 requests per windowMs
  },
  
  // App settings
  app: {
    name: 'Pharmacy System',
    version: '1.0.0',
    description: 'Backend API for Pharmacy Management System',
    author: 'Your Name',
    license: 'MIT'
  }
} as const;

export type Config = typeof config;
