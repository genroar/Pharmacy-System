import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { config } from '@/config/config';
import { logger } from '@/utils/logger';
import { errorHandler } from '@/middleware/errorHandler';
import { notFoundHandler } from '@/middleware/notFoundHandler';
import { connectDatabase } from '@/database/connection';
import { setupRoutes } from '@/routes';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.cors.origins,
  credentials: true
}));
app.use(morgan('combined', { stream: { write: (message: string) => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env
  });
});

// Setup routes
setupRoutes(app);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();
    
    // Start listening
    server.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port} in ${config.env} mode`);
      logger.info(`📊 Health check available at http://localhost:${config.port}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Start the server
startServer();

export default app;
