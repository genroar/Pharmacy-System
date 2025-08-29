import { PrismaClient } from '@prisma/client';
import { config } from '@/config/config';
import { logger } from '@/utils/logger';

// Remote database configuration
export interface RemoteDBConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  dialect: 'postgresql' | 'mysql';
  ssl: boolean;
  pool: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
  logging: boolean;
  connectionTimeout: number;
  queryTimeout: number;
}

export const remoteDBConfig: RemoteDBConfig = {
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  username: config.database.username,
  password: config.database.password,
  dialect: 'postgresql', // Can be changed to 'mysql'
  ssl: config.env === 'production',
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  logging: config.env === 'development',
  connectionTimeout: 30000,
  queryTimeout: 60000
};

// Create remote database Prisma client
export const createRemoteDBClient = (): PrismaClient => {
  const connectionString = buildConnectionString();
  
  return new PrismaClient({
    datasources: {
      db: {
        url: connectionString,
      },
    },
    log: remoteDBConfig.logging ? ['query', 'info', 'warn', 'error'] : ['error'],
    errorFormat: 'pretty',
  });
};

// Build connection string based on dialect
const buildConnectionString = (): string => {
  const { host, port, database, username, password, dialect, ssl } = remoteDBConfig;
  
  if (dialect === 'postgresql') {
    let url = `postgresql://${username}:${password}@${host}:${port}/${database}`;
    
    if (ssl) {
      url += '?sslmode=require';
    }
    
    return url;
  } else if (dialect === 'mysql') {
    let url = `mysql://${username}:${password}@${host}:${port}/${database}`;
    
    if (ssl) {
      url += '?ssl=true';
    }
    
    return url;
  }
  
  throw new Error(`Unsupported database dialect: ${dialect}`);
};

// Remote database utilities
export const checkRemoteDBConnection = async (client: PrismaClient): Promise<boolean> => {
  try {
    await client.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Remote database connection check failed:', error);
    return false;
  }
};

export const getRemoteDBStats = async (client: PrismaClient): Promise<any> => {
  try {
    if (remoteDBConfig.dialect === 'postgresql') {
      // PostgreSQL specific stats
      const stats = await client.$queryRaw`
        SELECT 
          schemaname,
          tablename,
          n_tup_ins as inserts,
          n_tup_upd as updates,
          n_tup_del as deletes,
          n_live_tup as live_tuples,
          n_dead_tup as dead_tuples
        FROM pg_stat_user_tables
        ORDER BY n_live_tup DESC
      `;
      return stats;
    } else if (remoteDBConfig.dialect === 'mysql') {
      // MySQL specific stats
      const stats = await client.$queryRaw`
        SELECT 
          table_schema as database_name,
          table_name,
          table_rows,
          data_length,
          index_length
        FROM information_schema.tables
        WHERE table_schema = ${remoteDBConfig.database}
        ORDER BY table_rows DESC
      `;
      return stats;
    }
    
    return null;
  } catch (error) {
    logger.error('Failed to get remote database stats:', error);
    return null;
  }
};

export const optimizeRemoteDB = async (client: PrismaClient): Promise<void> => {
  try {
    if (remoteDBConfig.dialect === 'postgresql') {
      // PostgreSQL optimization
      await client.$executeRaw`VACUUM ANALYZE`;
      await client.$executeRaw`REINDEX DATABASE ${remoteDBConfig.database}`;
    } else if (remoteDBConfig.dialect === 'mysql') {
      // MySQL optimization
      await client.$executeRaw`OPTIMIZE TABLE *`;
      await client.$executeRaw`ANALYZE TABLE *`;
    }
    
    logger.info('Remote database optimized successfully');
  } catch (error) {
    logger.error('Failed to optimize remote database:', error);
    throw error;
  }
};

export const backupRemoteDB = async (client: PrismaClient, backupPath: string): Promise<string> => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    let backupFileName: string;
    let backupCommand: string;
    
    if (remoteDBConfig.dialect === 'postgresql') {
      backupFileName = `pharmacy_system_${timestamp}.sql`;
      backupCommand = `pg_dump -h ${remoteDBConfig.host} -p ${remoteDBConfig.port} -U ${remoteDBConfig.username} -d ${remoteDBConfig.database} > ${backupPath}/${backupFileName}`;
    } else if (remoteDBConfig.dialect === 'mysql') {
      backupFileName = `pharmacy_system_${timestamp}.sql`;
      backupCommand = `mysqldump -h ${remoteDBConfig.host} -P ${remoteDBConfig.port} -u ${remoteDBConfig.username} -p${remoteDBConfig.password} ${remoteDBConfig.database} > ${backupPath}/${backupFileName}`;
    } else {
      throw new Error(`Unsupported database dialect for backup: ${remoteDBConfig.dialect}`);
    }
    
    // Note: This would need to be executed in a separate process
    // For now, we'll just log the command
    logger.info(`Backup command: ${backupCommand}`);
    logger.info(`Backup would be saved to: ${backupPath}/${backupFileName}`);
    
    return `${backupPath}/${backupFileName}`;
  } catch (error) {
    logger.error('Failed to create backup command:', error);
    throw error;
  }
};

export const monitorRemoteDBPerformance = async (client: PrismaClient): Promise<any> => {
  try {
    if (remoteDBConfig.dialect === 'postgresql') {
      // PostgreSQL performance monitoring
      const performance = await client.$queryRaw`
        SELECT 
          query,
          calls,
          total_time,
          mean_time,
          rows
        FROM pg_stat_statements
        ORDER BY total_time DESC
        LIMIT 10
      `;
      return performance;
    } else if (remoteDBConfig.dialect === 'mysql') {
      // MySQL performance monitoring
      const performance = await client.$queryRaw`
        SELECT 
          sql_text,
          count_star,
          sum_timer_wait,
          avg_timer_wait
        FROM performance_schema.events_statements_summary_by_digest
        ORDER BY sum_timer_wait DESC
        LIMIT 10
      `;
      return performance;
    }
    
    return null;
  } catch (error) {
    logger.error('Failed to monitor remote database performance:', error);
    return null;
  }
};

// Export default remote database client
export const remoteDBClient = createRemoteDBClient();
export default remoteDBClient;
