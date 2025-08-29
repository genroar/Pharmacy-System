// Main database connection
export { 
  prisma, 
  connectDatabase, 
  disconnectDatabase, 
  getDatabaseStatus, 
  checkDatabaseHealth,
  withTransaction 
} from './connection';

// SQLite database handler
export {
  sqliteClient,
  createSQLiteClient,
  backupSQLiteDatabase,
  restoreSQLiteDatabase,
  getSQLiteDatabaseSize,
  cleanupOldBackups,
  optimizeSQLiteDatabase,
  sqliteConfig
} from './sqlite';

// Remote database handler
export {
  remoteDBClient,
  createRemoteDBClient,
  checkRemoteDBConnection,
  getRemoteDBStats,
  optimizeRemoteDB,
  backupRemoteDB,
  monitorRemoteDBPerformance,
  remoteDBConfig
} from './remote';

// Database seeders
export { seedDatabase } from './seeders';

// Database utilities
export const getDatabaseType = (): string => {
  const url = process.env.DATABASE_URL || '';
  
  if (url.includes('postgresql://') || url.includes('postgres://')) {
    return 'postgresql';
  } else if (url.includes('mysql://')) {
    return 'mysql';
  } else if (url.includes('file:') || url.includes('.db')) {
    return 'sqlite';
  }
  
  return 'unknown';
};

export const isSQLite = (): boolean => getDatabaseType() === 'sqlite';
export const isPostgreSQL = (): boolean => getDatabaseType() === 'postgresql';
export const isMySQL = (): boolean => getDatabaseType() === 'mysql';

// Database health check with type detection
export const performDatabaseHealthCheck = async () => {
  const dbType = getDatabaseType();
  const health = await checkDatabaseHealth();
  
  return {
    type: dbType,
    status: health.status,
    responseTime: health.responseTime,
    timestamp: new Date().toISOString()
  };
};

// Database backup utilities
export const backupDatabase = async (backupPath: string): Promise<string> => {
  if (isSQLite()) {
    return await backupSQLiteDatabase();
  } else {
    // For remote databases, we would implement backup logic here
    throw new Error('Backup not implemented for remote databases yet');
  }
};

// Database optimization utilities
export const optimizeDatabase = async (): Promise<void> => {
  if (isSQLite()) {
    await optimizeSQLiteDatabase(prisma);
  } else if (isPostgreSQL() || isMySQL()) {
    await optimizeRemoteDB(prisma);
  } else {
    throw new Error('Database optimization not supported for this database type');
  }
};

// Export default database client
export default prisma;
