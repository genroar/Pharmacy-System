import { config } from './config';
import crypto from 'crypto';

export interface SecurityConfig {
  jwt: JWTConfig;
  encryption: EncryptionConfig;
  session: SessionConfig;
  cors: CORSConfig;
  rateLimit: RateLimitConfig;
  helmet: HelmetConfig;
  bcrypt: BcryptConfig;
}

export interface JWTConfig {
  secret: string;
  expiresIn: string;
  refreshExpiresIn: string;
  issuer: string;
  audience: string;
  algorithm: string;
  refreshTokenRotation: boolean;
  blacklistEnabled: boolean;
}

export interface EncryptionConfig {
  algorithm: string;
  key: string;
  iv: string;
  saltRounds: number;
}

export interface SessionConfig {
  secret: string;
  name: string;
  resave: boolean;
  saveUninitialized: boolean;
  cookie: {
    secure: boolean;
    httpOnly: boolean;
    maxAge: number;
    sameSite: 'strict' | 'lax' | 'none';
  };
  store: 'memory' | 'redis' | 'mongo';
}

export interface CORSConfig {
  origin: string | string[] | boolean;
  methods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  credentials: boolean;
  maxAge: number;
  preflightContinue: boolean;
  optionsSuccessStatus: number;
}

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  standardHeaders: boolean;
  legacyHeaders: boolean;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
  keyGenerator: (req: any) => string;
}

export interface HelmetConfig {
  contentSecurityPolicy: boolean;
  crossOriginEmbedderPolicy: boolean;
  crossOriginOpenerPolicy: boolean;
  crossOriginResourcePolicy: boolean;
  dnsPrefetchControl: boolean;
  frameguard: boolean;
  hidePoweredBy: boolean;
  hsts: boolean;
  ieNoOpen: boolean;
  noSniff: boolean;
  permittedCrossDomainPolicies: boolean;
  referrerPolicy: boolean;
  xssFilter: boolean;
}

export interface BcryptConfig {
  saltRounds: number;
  hashRounds: number;
}

// JWT Configuration
export const jwtConfig: JWTConfig = {
  secret: config.jwt.secret,
  expiresIn: config.jwt.expiresIn,
  refreshExpiresIn: config.jwt.refreshExpiresIn,
  issuer: 'pharmacy-system',
  audience: 'pharmacy-system-users',
  algorithm: 'HS256',
  refreshTokenRotation: true,
  blacklistEnabled: true
};

// Encryption Configuration
export const encryptionConfig: EncryptionConfig = {
  algorithm: 'aes-256-gcm',
  key: process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'),
  iv: process.env.ENCRYPTION_IV || crypto.randomBytes(16).toString('hex'),
  saltRounds: 12
};

// Session Configuration
export const sessionConfig: SessionConfig = {
  secret: process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex'),
  name: 'pharmacy-session',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.env === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict'
  },
  store: 'redis'
};

// CORS Configuration
export const corsConfig: CORSConfig = {
  origin: config.cors.origins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
    'X-Client-Version'
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Current-Page',
    'X-Per-Page'
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Rate Limiting Configuration
export const rateLimitConfig: RateLimitConfig = {
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  keyGenerator: (req: any) => {
    // Use IP address as key, or user ID if authenticated
    return req.user?.userId || req.ip || req.connection.remoteAddress;
  }
};

// Helmet Security Configuration
export const helmetConfig: HelmetConfig = {
  contentSecurityPolicy: true,
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: true,
  dnsPrefetchControl: true,
  frameguard: true,
  hidePoweredBy: true,
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  permittedCrossDomainPolicies: true,
  referrerPolicy: true,
  xssFilter: true
};

// Bcrypt Configuration
export const bcryptConfig: BcryptConfig = {
  saltRounds: 12,
  hashRounds: 10
};

// Security Headers
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};

// Password Policy
export const passwordPolicy = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true,
  preventUserInfo: true,
  maxAge: 90 * 24 * 60 * 60 * 1000 // 90 days
};

// API Key Configuration
export const apiKeyConfig = {
  enabled: true,
  headerName: 'X-API-Key',
  requiredFor: ['POST', 'PUT', 'DELETE', 'PATCH'],
  keyLength: 32,
  expirationDays: 365
};

// Encryption utilities
export const encrypt = (text: string): string => {
  const cipher = crypto.createCipher(encryptionConfig.algorithm, encryptionConfig.key);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

export const decrypt = (encryptedText: string): string => {
  const decipher = crypto.createDecipher(encryptionConfig.algorithm, encryptionConfig.key);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

// Hash utilities
export const hashString = (text: string): string => {
  return crypto.createHash('sha256').update(text).digest('hex');
};

export const generateRandomString = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

// Main security configuration
export const securityConfig: SecurityConfig = {
  jwt: jwtConfig,
  encryption: encryptionConfig,
  session: sessionConfig,
  cors: corsConfig,
  rateLimit: rateLimitConfig,
  helmet: helmetConfig,
  bcrypt: bcryptConfig
};
