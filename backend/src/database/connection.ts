import { PrismaClient } from '@prisma/client';
import { config } from '@/config/config';
import { logger } from '@/utils/logger';

// Global Prisma client instance
declare global {
  var __prisma: PrismaClient | undefined;
}

// Prisma client with connection pooling and logging
export const prisma = globalThis.__prisma || new PrismaClient({
  log: config.env === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  errorFormat: 'pretty',
  datasources: {
    db: {
      url: config.database.url,
    },
  },
});

// Prevent multiple instances in development
if (config.env === 'development') {
  globalThis.__prisma = prisma;
}

// Database connection status
let isConnected = false;

export const connectDatabase = async (): Promise<void> => {
  if (isConnected) {
    logger.info('Database already connected');
    return;
  }

  try {
    // Test the connection
    await prisma.$connect();
    
    isConnected = true;
    logger.info('✅ Database connected successfully');
    
    // Handle connection events
    prisma.$on('query', (e: any) => {
      if (config.env === 'development') {
        logger.debug(`Query: ${e.query}`);
        logger.debug(`Duration: ${e.duration}ms`);
      }
    });

    prisma.$on('error', (e: any) => {
      logger.error('Database error:', e);
      isConnected = false;
    });

    prisma.$on('disconnect', () => {
      logger.warn('Database disconnected');
      isConnected = false;
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await disconnectDatabase();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await disconnectDatabase();
      process.exit(0);
    });

  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  if (!isConnected) {
    return;
  }
  
  try {
    await prisma.$disconnect();
    isConnected = false;
    logger.info('Database disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting from database:', error);
    throw error;
  }
};

export const getDatabaseStatus = (): boolean => {
  return isConnected;
};

// Database health check
export const checkDatabaseHealth = async (): Promise<{ status: string; responseTime: number }> => {
  const startTime = Date.now();
  
  try {
    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1`;
    
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

// Transaction wrapper
export const withTransaction = async <T>(
  fn: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>) => Promise<T>
): Promise<T> => {
  return await prisma.$transaction(fn);
};

// Export the Prisma client for use in other modules
export default prisma;
