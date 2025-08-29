import { config } from './config';
import winston from 'winston';
import path from 'path';

export interface LoggerConfig {
  level: string;
  format: winston.Logform.Format;
  transports: winston.transport[];
  defaultMeta: Record<string, any>;
  exitOnError: boolean;
}

export interface LogTransport {
  type: 'console' | 'file' | 'http' | 'stream';
  level: string;
  format?: winston.Logform.Format;
  options?: any;
}

// Log levels configuration
export const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
};

// Log colors for console output
export const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  verbose: 'cyan',
  debug: 'blue',
  silly: 'white'
};

// Log formats
export const createLogFormat = (): winston.Logform.Format => {
  return winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({
      stack: true
    }),
    winston.format.json(),
    winston.format.prettyPrint()
  );
};

export const createConsoleFormat = (): winston.Logform.Format => {
  return winston.format.combine(
    winston.format.colorize({
      all: true,
      colors: logColors
    }),
    winston.format.timestamp({
      format: 'HH:mm:ss'
    }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      let metaStr = '';
      if (Object.keys(meta).length > 0) {
        metaStr = ` ${JSON.stringify(meta)}`;
      }
      return `${timestamp} [${level}]: ${message}${metaStr}`;
    })
  );
};

// Console transport configuration
export const consoleTransport: LogTransport = {
  type: 'console',
  level: config.logging.level,
  format: createConsoleFormat()
};

// File transport configuration
export const fileTransports: LogTransport[] = [
  {
    type: 'file',
    level: 'info',
    options: {
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }
  },
  {
    type: 'file',
    level: 'error',
    options: {
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }
  },
  {
    type: 'file',
    level: 'warn',
    options: {
      filename: path.join(process.cwd(), 'logs', 'warn.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 3,
      tailable: true
    }
  }
];

// HTTP transport for external logging services
export const httpTransport: LogTransport = {
  type: 'http',
  level: 'error',
  options: {
    host: 'localhost',
    port: 8080,
    path: '/logs',
    ssl: false
  }
};

// Stream transport for custom logging
export const streamTransport: LogTransport = {
  type: 'stream',
  level: 'info',
  options: {
    stream: {
      write: (message: string) => {
        // Custom stream implementation
        process.stdout.write(message);
      }
    }
  }
};

// Create Winston transports
export const createTransports = (): winston.transport[] => {
  const transports: winston.transport[] = [];

  // Console transport
  transports.push(
    new winston.transports.Console({
      level: consoleTransport.level,
      format: consoleTransport.format
    })
  );

  // File transports
  fileTransports.forEach(transport => {
    if (transport.type === 'file' && transport.options) {
      transports.push(
        new winston.transports.File({
          level: transport.level,
          filename: transport.options.filename,
          maxsize: transport.options.maxsize,
          maxFiles: transport.options.maxFiles,
          tailable: transport.options.tailable
        })
      );
    }
  });

  // HTTP transport (only in production)
  if (config.env === 'production' && httpTransport.options) {
    transports.push(
      new winston.transports.Http({
        level: httpTransport.level,
        host: httpTransport.options.host,
        port: httpTransport.options.port,
        path: httpTransport.options.path,
        ssl: httpTransport.options.ssl
      })
    );
  }

  return transports;
};

// Main logger configuration
export const loggerConfig: LoggerConfig = {
  level: config.logging.level,
  format: createLogFormat(),
  transports: createTransports(),
  defaultMeta: {
    service: 'pharmacy-system',
    version: '1.0.0',
    environment: config.env
  },
  exitOnError: false
};

// Log rotation configuration
export const logRotationConfig = {
  enabled: true,
  maxSize: '10m',
  maxFiles: '14d', // Keep logs for 14 days
  compress: true,
  interval: '1d'
};

// Log filtering configuration
export const logFilterConfig = {
  excludePaths: ['/health', '/metrics'],
  excludeMethods: ['OPTIONS'],
  excludeStatusCodes: [404],
  includeHeaders: ['user-agent', 'x-forwarded-for']
};

// Performance logging configuration
export const performanceLogConfig = {
  enabled: config.env === 'development',
  threshold: 1000, // Log requests taking longer than 1 second
  includeQuery: true,
  includeBody: false
};
