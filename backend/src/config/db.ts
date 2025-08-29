import { config } from './config';
import { logger } from '@/utils/logger';

export interface DatabaseConfig {
  type: 'mongodb' | 'sqlite' | 'postgresql' | 'mysql';
  host: string;
  port: number;
  name: string;
  username: string;
  password: string;
  url?: string;
  options: {
    maxPoolSize: number;
    serverSelectionTimeoutMS: number;
    socketTimeoutMS: number;
    bufferCommands: boolean;
    bufferMaxEntries: number;
  };
}

export interface SQLiteConfig {
  database: string;
  storage: string;
  logging: boolean;
}

export interface RemoteDBConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  dialect: 'postgres' | 'mysql' | 'mariadb' | 'sqlite';
  pool: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
  logging: boolean;
}

// MongoDB Configuration
export const mongoConfig: DatabaseConfig = {
  type: 'mongodb',
  host: config.database.host,
  port: config.database.port,
  name: config.database.name,
  username: config.database.username,
  password: config.database.password,
  url: config.database.url,
  options: {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferCommands: false,
    bufferMaxEntries: 0,
  }
};

// SQLite Configuration
export const sqliteConfig: SQLiteConfig = {
  database: 'pharmacy_system.db',
  storage: './database/pharmacy_system.db',
  logging: config.env === 'development'
};

// Remote Database Configuration (PostgreSQL/MySQL)
export const remoteDBConfig: RemoteDBConfig = {
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  username: config.database.username,
  password: config.database.password,
  dialect: 'postgres', // Can be changed to 'mysql' or 'mariadb'
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  logging: config.env === 'development'
};

// Database connection status
export const getDatabaseStatus = (): { connected: boolean; type: string; name: string } => {
  return {
    connected: true, // This will be updated by the connection manager
    type: mongoConfig.type,
    name: mongoConfig.name
  };
};

// Database health check
export const checkDatabaseHealth = async (): Promise<{ status: string; responseTime: number }> => {
  const startTime = Date.now();
  
  try {
    // Implement actual health check logic here
    // For now, return a mock response
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'healthy',
      responseTime
    };
  } catch (error) {
    logger.error('Database health check failed:', error);
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'unhealthy',
      responseTime
    };
  }
};

// Export default configuration based on environment
export const getDefaultDBConfig = (): DatabaseConfig => {
  return mongoConfig;
};

// Database backup configuration
export const backupConfig = {
  enabled: config.env === 'production',
  schedule: '0 2 * * *', // Daily at 2 AM
  retention: 30, // Keep backups for 30 days
  path: './backups',
  compression: true
};

// Database migration configuration
export const migrationConfig = {
  enabled: true,
  autoRun: config.env === 'production',
  path: './migrations',
  tableName: 'migrations'
};
