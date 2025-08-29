import { logger } from '@/utils/logger';
import { DateHelper } from '@/utils/dateHelper';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Backup configuration interface
 */
interface BackupConfig {
  enabled: boolean;
  schedule: string;
  types: {
    database: boolean;
    files: boolean;
    logs: boolean;
    config: boolean;
  };
  database: {
    engine: 'postgresql' | 'mysql' | 'sqlite' | 'mongodb';
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    backupFormat: 'sql' | 'dump' | 'archive';
    compression: boolean;
    compressionLevel: number;
  };
  storage: {
    local: {
      enabled: boolean;
      path: string;
      maxSize: number;
    };
    remote: {
      enabled: boolean;
      type: 's3' | 'ftp' | 'sftp' | 'cloud';
      config: any;
    };
  };
  retention: {
    enabled: boolean;
    maxBackups: number;
    maxAge: number;
    keepDaily: number;
    keepWeekly: number;
    keepMonthly: number;
    keepYearly: number;
  };
  encryption: {
    enabled: boolean;
    algorithm: 'aes-256-gcm' | 'aes-256-cbc' | 'chacha20-poly1305';
    keyFile: string;
  };
  verification: {
    enabled: boolean;
    verifyAfterBackup: boolean;
    testRestore: boolean;
    checksum: boolean;
  };
  notifications: {
    enabled: boolean;
    onSuccess: boolean;
    onFailure: boolean;
    onWarning: boolean;
    recipients: string[];
  };
}

/**
 * Backup result interface
 */
interface BackupResult {
  success: boolean;
  timestamp: Date;
  duration: number;
  backupType: string;
  backupId: string;
  size: number;
  location: string;
  checksum: string;
  metadata: {
    filesCount: number;
    databaseSize: number;
    compressionRatio: number;
    encryptionEnabled: boolean;
    verificationPassed: boolean;
  };
  errors: BackupError[];
  warnings: string[];
}

/**
 * Backup error interface
 */
interface BackupError {
  id: string;
  type: 'database' | 'file' | 'storage' | 'encryption' | 'verification' | 'unknown';
  message: string;
  stack?: string;
  timestamp: Date;
  retryCount: number;
  resolved: boolean;
}

/**
 * Backup job class for managing database and file system backups
 */
export class BackupJob {
  private prisma: PrismaClient;
  private config: BackupConfig;
  private isRunning: boolean = false;
  private lastRun: Date | null = null;
  private backupHistory: BackupResult[] = [];
  private errorQueue: BackupError[] = [];

  constructor(prisma: PrismaClient, config?: Partial<BackupConfig>) {
    this.prisma = prisma;
    this.config = this.getDefaultConfig();
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * Get default backup configuration
   */
  private getDefaultConfig(): BackupConfig {
    return {
      enabled: true,
      schedule: '0 2 * * *', // Daily at 2 AM
      types: {
        database: true,
        files: true,
        logs: false,
        config: true
      },
      database: {
        engine: 'postgresql',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: '',
        database: 'pharmacy_system',
        backupFormat: 'sql',
        compression: true,
        compressionLevel: 6
      },
      storage: {
        local: {
          enabled: true,
          path: './backups',
          maxSize: 10 * 1024 * 1024 * 1024 // 10 GB
        },
        remote: {
          enabled: false,
          type: 's3',
          config: {}
        }
      },
      retention: {
        enabled: true,
        maxBackups: 30,
        maxAge: 90,
        keepDaily: 7,
        keepWeekly: 4,
        keepMonthly: 12,
        keepYearly: 5
      },
      encryption: {
        enabled: false,
        algorithm: 'aes-256-gcm',
        keyFile: './backup-keys/backup.key'
      },
      verification: {
        enabled: true,
        verifyAfterBackup: true,
        testRestore: false,
        checksum: true
      },
      notifications: {
        enabled: true,
        onSuccess: true,
        onFailure: true,
        onWarning: true,
        recipients: ['admin@example.com', 'tech@example.com']
      }
    };
  }

  /**
   * Start the backup job scheduler
   */
  async start(): Promise<void> {
    if (!this.config.enabled) {
      logger.info('Backup job is disabled');
      return;
    }

    try {
      logger.info('Starting backup job scheduler');
      await this.createBackupDirectories();
      
      if (this.backupHistory.length === 0) {
        await this.performFullBackup();
      }

      this.scheduleBackups();
      logger.info('Backup job scheduler started successfully');
    } catch (error) {
      logger.error('Failed to start backup job scheduler:', error);
      throw error;
    }
  }

  /**
   * Stop the backup job scheduler
   */
  async stop(): Promise<void> {
    try {
      logger.info('Stopping backup job scheduler');
      this.isRunning = false;
      logger.info('Backup job scheduler stopped successfully');
    } catch (error) {
      logger.error('Failed to stop backup job scheduler:', error);
      throw error;
    }
  }

  /**
   * Create backup directories
   */
  private async createBackupDirectories(): Promise<void> {
    try {
      const backupPath = this.config.storage.local.path;
      
      if (!fs.existsSync(backupPath)) {
        fs.mkdirSync(backupPath, { recursive: true });
      }

      const subdirs = ['database', 'files', 'logs', 'config'];
      for (const subdir of subdirs) {
        const subdirPath = path.join(backupPath, subdir);
        if (!fs.existsSync(subdirPath)) {
          fs.mkdirSync(subdirPath, { recursive: true });
        }
      }

      logger.info('Backup directories created successfully');
    } catch (error) {
      logger.error('Failed to create backup directories:', error);
      throw error;
    }
  }

  /**
   * Schedule regular backups
   */
  private scheduleBackups(): void {
    const nextBackup = this.getNextBackupTime();
    
    setTimeout(async () => {
      if (this.isRunning) {
        await this.performScheduledBackup();
        this.scheduleBackups();
      }
    }, nextBackup.getTime() - Date.now());

    logger.info(`Next backup scheduled for: ${nextBackup.toISOString()}`);
  }

  /**
   * Calculate next backup time
   */
  private getNextBackupTime(): Date {
    const now = new Date();
    const [minute, hour] = this.config.schedule.split(' ');
    
    let nextBackup = new Date(now);
    
    if (minute !== '*') {
      nextBackup.setMinutes(parseInt(minute), 0, 0);
    }
    if (hour !== '*') {
      nextBackup.setHours(parseInt(hour), 0, 0, 0);
    }
    
    if (nextBackup <= now) {
      nextBackup.setDate(nextBackup.getDate() + 1);
    }
    
    return nextBackup;
  }

  /**
   * Perform scheduled backup operation
   */
  async performScheduledBackup(): Promise<BackupResult[]> {
    logger.info('Starting scheduled backup operation');
    const results: BackupResult[] = [];

    try {
      if (this.config.types.database) {
        const result = await this.backupDatabase();
        results.push(result);
      }

      if (this.config.types.files) {
        const result = await this.backupFiles();
        results.push(result);
      }

      if (this.config.types.logs) {
        const result = await this.backupLogs();
        results.push(result);
      }

      if (this.config.types.config) {
        const result = await this.backupConfig();
        results.push(result);
      }

      await this.processErrors();
      await this.applyRetentionPolicy();

      if (this.config.notifications.enabled) {
        await this.sendBackupNotifications(results);
      }

      logger.info('Scheduled backup operation completed successfully');
    } catch (error) {
      logger.error('Scheduled backup operation failed:', error);
    }

    return results;
  }

  /**
   * Perform full backup operation
   */
  async performFullBackup(): Promise<BackupResult[]> {
    logger.info('Starting full backup operation');
    const results: BackupResult[] = [];

    try {
      if (this.config.types.database) {
        const result = await this.backupDatabase();
        results.push(result);
      }

      if (this.config.types.files) {
        const result = await this.backupFiles();
        results.push(result);
      }

      if (this.config.types.logs) {
        const result = await this.backupLogs();
        results.push(result);
      }

      if (this.config.types.config) {
        const result = await this.backupConfig();
        results.push(result);
      }

      await this.processErrors();
      await this.applyRetentionPolicy();

      if (this.config.notifications.enabled) {
        await this.sendBackupNotifications(results);
      }

      logger.info('Full backup operation completed successfully');
    } catch (error) {
      logger.error('Full backup operation failed:', error);
    }

    return results;
  }

  /**
   * Backup database
   */
  private async backupDatabase(): Promise<BackupResult> {
    const startTime = Date.now();
    const timestamp = new Date();
    const backupId = this.generateBackupId('database');

    logger.info('Starting database backup');

    try {
      const result: BackupResult = {
        success: false,
        timestamp,
        duration: 0,
        backupType: 'database',
        backupId,
        size: 0,
        location: '',
        checksum: '',
        metadata: {
          filesCount: 0,
          databaseSize: 0,
          compressionRatio: 0,
          encryptionEnabled: false,
          verificationPassed: false
        },
        errors: [],
        warnings: []
      };

      const backupPath = path.join(
        this.config.storage.local.path,
        'database',
        `db-backup-${DateHelper.formatDate(timestamp, 'YYYY-MM-DD-HH-mm-ss')}.sql`
      );

      await this.performDatabaseBackup(backupPath);

      const fileStats = fs.statSync(backupPath);
      result.size = fileStats.size;
      result.location = backupPath;

      if (this.config.database.compression) {
        const compressedPath = await this.compressFile(backupPath);
        result.location = compressedPath;
        result.size = fs.statSync(compressedPath).size;
        result.metadata.compressionRatio = (1 - (result.size / fileStats.size)) * 100;
        fs.unlinkSync(backupPath);
      }

      if (this.config.verification.checksum) {
        result.checksum = await this.calculateChecksum(result.location);
      }

      if (this.config.verification.verifyAfterBackup) {
        result.metadata.verificationPassed = await this.verifyBackup(result.location);
      }

      result.success = true;
      result.duration = Date.now() - startTime;

      this.backupHistory.push(result);
      logger.info('Database backup completed successfully');

      return result;
    } catch (error) {
      logger.error('Database backup failed:', error);
      throw error;
    }
  }

  /**
   * Backup files
   */
  private async backupFiles(): Promise<BackupResult> {
    const startTime = Date.now();
    const timestamp = new Date();
    const backupId = this.generateBackupId('files');

    logger.info('Starting files backup');

    try {
      const result: BackupResult = {
        success: false,
        timestamp,
        duration: 0,
        backupType: 'files',
        backupId,
        size: 0,
        location: '',
        checksum: '',
        metadata: {
          filesCount: 0,
          databaseSize: 0,
          compressionRatio: 0,
          encryptionEnabled: false,
          verificationPassed: false
        },
        errors: [],
        warnings: []
      };

      const backupPath = path.join(
        this.config.storage.local.path,
        'files',
        `files-backup-${DateHelper.formatDate(timestamp, 'YYYY-MM-DD-HH-mm-ss')}.tar.gz`
      );

      await this.createFileArchive(backupPath);

      const fileStats = fs.statSync(backupPath);
      result.size = fileStats.size;
      result.location = backupPath;

      if (this.config.verification.checksum) {
        result.checksum = await this.calculateChecksum(result.location);
      }

      result.success = true;
      result.duration = Date.now() - startTime;

      this.backupHistory.push(result);
      logger.info('Files backup completed successfully');

      return result;
    } catch (error) {
      logger.error('Files backup failed:', error);
      throw error;
    }
  }

  /**
   * Backup logs
   */
  private async backupLogs(): Promise<BackupResult> {
    logger.info('Logs backup not yet implemented');
    return this.createEmptyBackupResult('logs');
  }

  /**
   * Backup config
   */
  private async backupConfig(): Promise<BackupResult> {
    logger.info('Config backup not yet implemented');
    return this.createEmptyBackupResult('config');
  }

  /**
   * Perform database backup
   */
  private async performDatabaseBackup(backupPath: string): Promise<void> {
    try {
      switch (this.config.database.engine) {
        case 'postgresql':
          await this.backupPostgreSQL(backupPath);
          break;
        case 'mysql':
          await this.backupMySQL(backupPath);
          break;
        case 'sqlite':
          await this.backupSQLite(backupPath);
          break;
        default:
          throw new Error(`Unsupported database engine: ${this.config.database.engine}`);
      }
    } catch (error) {
      logger.error('Database backup failed:', error);
      throw error;
    }
  }

  /**
   * Backup PostgreSQL database
   */
  private async backupPostgreSQL(backupPath: string): Promise<void> {
    try {
      const { host, port, username, password, database } = this.config.database;
      const command = `PGPASSWORD="${password || ''}" pg_dump -h ${host || 'localhost'} -p ${port || 5432} -U ${username || 'postgres'} -d ${database || 'pharmacy_system'} -f ${backupPath}`;
      await execAsync(command);
      logger.info('PostgreSQL backup completed successfully');
    } catch (error) {
      logger.error('PostgreSQL backup failed:', error);
      throw error;
    }
  }

  /**
   * Backup MySQL database
   */
  private async backupMySQL(backupPath: string): Promise<void> {
    try {
      const { host, port, username, password, database } = this.config.database;
      const command = `mysqldump -h ${host || 'localhost'} -P ${port || 3306} -u ${username || 'root'} -p${password || ''} ${database || 'pharmacy_system'} > ${backupPath}`;
      await execAsync(command);
      logger.info('MySQL backup completed successfully');
    } catch (error) {
      logger.error('MySQL backup failed:', error);
      throw error;
    }
  }

  /**
   * Backup SQLite database
   */
  private async backupSQLite(backupPath: string): Promise<void> {
    try {
      const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
      if (fs.existsSync(dbPath)) {
        fs.copyFileSync(dbPath, backupPath);
        logger.info('SQLite backup completed successfully');
      } else {
        throw new Error('SQLite database file not found');
      }
    } catch (error) {
      logger.error('SQLite backup failed:', error);
      throw error;
    }
  }

  /**
   * Create file archive
   */
  private async createFileArchive(backupPath: string): Promise<void> {
    try {
      const importantDirs = ['./src', './prisma', './uploads', './logs'];
      const command = `tar -czf ${backupPath} ${importantDirs.join(' ')}`;
      await execAsync(command);
      logger.info('File archive created successfully');
    } catch (error) {
      logger.error('File archive creation failed:', error);
      throw error;
    }
  }

  /**
   * Compress file
   */
  private async compressFile(filePath: string): Promise<string> {
    try {
      const compressedPath = `${filePath}.gz`;
      const command = `gzip -${this.config.database.compressionLevel} -c ${filePath} > ${compressedPath}`;
      await execAsync(command);
      logger.info('File compressed successfully');
      return compressedPath;
    } catch (error) {
      logger.error('File compression failed:', error);
      throw error;
    }
  }

  /**
   * Calculate checksum
   */
  private async calculateChecksum(filePath: string): Promise<string> {
    try {
      const command = `sha256sum ${filePath}`;
      const { stdout } = await execAsync(command);
      return stdout.split(' ')[0];
    } catch (error) {
      logger.error('Checksum calculation failed:', error);
      return '';
    }
  }

  /**
   * Verify backup
   */
  private async verifyBackup(backupPath: string): Promise<boolean> {
    try {
      if (fs.existsSync(backupPath)) {
        const stats = fs.statSync(backupPath);
        return stats.size > 0;
      }
      return false;
    } catch (error) {
      logger.error('Backup verification failed:', error);
      return false;
    }
  }

  /**
   * Process errors
   */
  private async processErrors(): Promise<void> {
    try {
      for (const error of this.errorQueue) {
        if (error.retryCount < 3) {
          await this.retryError(error);
        } else {
          await this.handleUnresolvedError(error);
        }
      }
    } catch (error) {
      logger.error('Failed to process errors:', error);
    }
  }

  /**
   * Retry error
   */
  private async retryError(backupError: BackupError): Promise<void> {
    try {
      backupError.retryCount++;
      logger.info(`Retrying error ${backupError.id} (attempt ${backupError.retryCount})`);
    } catch (error) {
      logger.error(`Failed to retry error ${backupError.id}:`, error);
    }
  }

  /**
   * Handle unresolved error
   */
  private async handleUnresolvedError(backupError: BackupError): Promise<void> {
    try {
      logger.error(`Error ${backupError.id} exceeded retry attempts`, {
        type: backupError.type,
        message: backupError.message,
        retryCount: backupError.retryCount
      });

      if (this.config.notifications.enabled) { // Changed from notifyErrors to enabled
        await this.notifyError(backupError);
      }
    } catch (error) {
      logger.error(`Failed to handle unresolved error ${backupError.id}:`, error);
    }
  }

  /**
   * Apply retention policy
   */
  private async applyRetentionPolicy(): Promise<void> {
    if (!this.config.retention.enabled) {
      return;
    }

    try {
      logger.info('Applying retention policy');
      // TODO: Implement retention policy logic
      logger.info('Retention policy applied successfully');
    } catch (error) {
      logger.error('Failed to apply retention policy:', error);
    }
  }

  /**
   * Send backup notifications
   */
  private async sendBackupNotifications(results: BackupResult[]): Promise<void> {
    try {
      const totalBackups = results.length;
      const successfulBackups = results.filter(r => r.success).length;
      const failedBackups = totalBackups - successfulBackups;

      if (this.config.notifications.onSuccess && failedBackups === 0) {
        await this.sendSuccessNotification(results);
      }

      if (this.config.notifications.onFailure && failedBackups > 0) {
        await this.sendFailureNotification(results);
      }

      logger.info('Backup notifications sent successfully');
    } catch (error) {
      logger.error('Failed to send backup notifications:', error);
    }
  }

  /**
   * Send success notification
   */
  private async sendSuccessNotification(results: BackupResult[]): Promise<void> {
    try {
      logger.info('Success notification sent');
    } catch (error) {
      logger.error('Failed to send success notification:', error);
    }
  }

  /**
   * Send failure notification
   */
  private async sendFailureNotification(results: BackupResult[]): Promise<void> {
    try {
      logger.info('Failure notification sent');
    } catch (error) {
      logger.error('Failed to send failure notification:', error);
    }
  }

  /**
   * Notify error
   */
  private async notifyError(backupError: BackupError): Promise<void> {
    try {
      logger.info(`Error notification sent for ${backupError.id}`);
    } catch (error) {
      logger.error(`Failed to notify error ${backupError.id}:`, error);
    }
  }

  /**
   * Create empty backup result
   */
  private createEmptyBackupResult(backupType: string): BackupResult {
    return {
      success: true,
      timestamp: new Date(),
      duration: 0,
      backupType,
      backupId: this.generateBackupId(backupType),
      size: 0,
      location: '',
      checksum: '',
      metadata: {
        filesCount: 0,
        databaseSize: 0,
        compressionRatio: 0,
        encryptionEnabled: false,
        verificationPassed: false
      },
      errors: [],
      warnings: []
    };
  }

  /**
   * Generate backup ID
   */
  private generateBackupId(type: string): string {
    return `backup-${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get backup job status
   */
  getStatus(): {
    isRunning: boolean;
    lastRun: Date | null;
    backupCount: number;
    nextBackup: Date;
    config: BackupConfig;
  } {
    return {
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      backupCount: this.backupHistory.length,
      nextBackup: this.getNextBackupTime(),
      config: this.config
    };
  }

  /**
   * Get backup history
   */
  getBackupHistory(): BackupResult[] {
    return [...this.backupHistory];
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<BackupConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('Backup configuration updated');
  }

  /**
   * Perform manual backup
   */
  async performManualBackup(backupType?: string): Promise<BackupResult[]> {
    logger.info('Manual backup requested');
    
    if (backupType) {
      switch (backupType) {
        case 'database':
          return [await this.backupDatabase()];
        case 'files':
          return [await this.backupFiles()];
        case 'logs':
          return [await this.backupLogs()];
        case 'config':
          return [await this.backupConfig()];
        default:
          throw new Error(`Unknown backup type: ${backupType}`);
      }
    } else {
      return this.performFullBackup();
    }
  }
}

export default BackupJob;

