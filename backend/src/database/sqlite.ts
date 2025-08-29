import { PrismaClient } from '@prisma/client';
import { config } from '@/config/config';
import { logger } from '@/utils/logger';
import path from 'path';
import fs from 'fs';

// SQLite specific configuration
export interface SQLiteConfig {
  database: string;
  storage: string;
  logging: boolean;
  backupEnabled: boolean;
  backupPath: string;
}

export const sqliteConfig: SQLiteConfig = {
  database: 'pharmacy_system.db',
  storage: './database/pharmacy_system.db',
  logging: config.env === 'development',
  backupEnabled: true,
  backupPath: './database/backups'
};

// Create SQLite Prisma client
export const createSQLiteClient = (): PrismaClient => {
  // Ensure database directory exists
  const dbDir = path.dirname(sqliteConfig.storage);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Create backup directory if enabled
  if (sqliteConfig.backupEnabled && !fs.existsSync(sqliteConfig.backupPath)) {
    fs.mkdirSync(sqliteConfig.backupPath, { recursive: true });
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: `file:${sqliteConfig.storage}`,
      },
    },
    log: sqliteConfig.logging ? ['query', 'info', 'warn', 'error'] : ['error'],
    errorFormat: 'pretty',
  });
};

// SQLite specific utilities
export const backupSQLiteDatabase = async (): Promise<string> => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `pharmacy_system_${timestamp}.db`;
    const backupPath = path.join(sqliteConfig.backupPath, backupFileName);
    
    // Copy the database file
    fs.copyFileSync(sqliteConfig.storage, backupPath);
    
    logger.info(`SQLite database backed up to: ${backupPath}`);
    return backupPath;
  } catch (error) {
    logger.error('Failed to backup SQLite database:', error);
    throw error;
  }
};

export const restoreSQLiteDatabase = async (backupPath: string): Promise<void> => {
  try {
    // Stop the current Prisma client
    // This would need to be handled at the application level
    
    // Copy the backup to the main database location
    fs.copyFileSync(backupPath, sqliteConfig.storage);
    
    logger.info(`SQLite database restored from: ${backupPath}`);
  } catch (error) {
    logger.error('Failed to restore SQLite database:', error);
    throw error;
  }
};

export const getSQLiteDatabaseSize = (): number => {
  try {
    if (fs.existsSync(sqliteConfig.storage)) {
      const stats = fs.statSync(sqliteConfig.storage);
      return stats.size;
    }
    return 0;
  } catch (error) {
    logger.error('Failed to get SQLite database size:', error);
    return 0;
  }
};

export const cleanupOldBackups = async (maxBackups: number = 10): Promise<void> => {
  try {
    if (!fs.existsSync(sqliteConfig.backupPath)) {
      return;
    }

    const backupFiles = fs.readdirSync(sqliteConfig.backupPath)
      .filter(file => file.endsWith('.db'))
      .map(file => ({
        name: file,
        path: path.join(sqliteConfig.backupPath, file),
        stats: fs.statSync(path.join(sqliteConfig.backupPath, file))
      }))
      .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());

    // Remove old backups beyond the limit
    if (backupFiles.length > maxBackups) {
      const filesToRemove = backupFiles.slice(maxBackups);
      
      for (const file of filesToRemove) {
        fs.unlinkSync(file.path);
        logger.info(`Removed old backup: ${file.name}`);
      }
    }
  } catch (error) {
    logger.error('Failed to cleanup old backups:', error);
  }
};

export const optimizeSQLiteDatabase = async (client: PrismaClient): Promise<void> => {
  try {
    // Run SQLite optimization commands
    await client.$executeRaw`VACUUM`;
    await client.$executeRaw`ANALYZE`;
    await client.$executeRaw`REINDEX`;
    
    logger.info('SQLite database optimized successfully');
  } catch (error) {
    logger.error('Failed to optimize SQLite database:', error);
    throw error;
  }
};

// Export default SQLite client
export const sqliteClient = createSQLiteClient();
export default sqliteClient;
