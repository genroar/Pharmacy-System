# Jobs Module

This module provides background job functionality for the Pharmacy System, including data synchronization and backup operations.

## Overview

The jobs module consists of two main job types:

1. **SyncJob** - Handles data synchronization between different systems and databases
2. **BackupJob** - Manages database and file system backups with scheduling and retention policies

## Features

### SyncJob Features
- **Scheduled Synchronization**: Automatically syncs data based on cron-like schedules
- **Multiple Data Types**: Supports inventory, sales, users, suppliers, medicines, orders, and reports
- **Conflict Resolution**: Handles data conflicts with configurable resolution strategies
- **Error Handling**: Retry mechanisms and error notifications
- **Data Validation**: Schema and business rule validation
- **Performance Optimization**: Batch processing and parallel execution

### BackupJob Features
- **Database Backups**: Supports PostgreSQL, MySQL, and SQLite
- **File System Backups**: Archives important directories and files
- **Compression**: Built-in file compression to save storage space
- **Encryption**: Optional encryption for sensitive backups
- **Retention Policies**: Automatic cleanup of old backups
- **Verification**: Checksum validation and backup integrity testing
- **Multiple Storage Options**: Local and remote storage support

## Usage

### Basic Setup

```typescript
import { SyncJob, BackupJob } from '@/jobs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize jobs
const syncJob = new SyncJob(prisma);
const backupJob = new BackupJob(prisma);

// Start job schedulers
await syncJob.start();
await backupJob.start();
```

### SyncJob Configuration

```typescript
const syncConfig = {
  enabled: true,
  schedule: '0 */6 * * *', // Every 6 hours
  syncTypes: {
    inventory: true,
    sales: true,
    users: false,
    suppliers: true,
    medicines: true,
    orders: true,
    reports: false
  },
  conflictResolution: {
    strategy: 'latest_wins',
    autoResolve: true,
    notifyConflicts: true
  }
};

const syncJob = new SyncJob(prisma, syncConfig);
```

### BackupJob Configuration

```typescript
const backupConfig = {
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
    password: 'password',
    database: 'pharmacy_system',
    compression: true,
    compressionLevel: 6
  },
  retention: {
    enabled: true,
    maxBackups: 30,
    maxAge: 90
  }
};

const backupJob = new BackupJob(prisma, backupConfig);
```

### Manual Operations

```typescript
// Perform manual sync
const syncResults = await syncJob.performManualSync('inventory');

// Perform manual backup
const backupResults = await backupJob.performManualBackup('database');

// Get job status
const syncStatus = syncJob.getStatus();
const backupStatus = backupJob.getStatus();
```

## Configuration Options

### SyncJob Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | true | Enable/disable the sync job |
| `schedule` | string | '0 */6 * * *' | Cron expression for scheduling |
| `syncTypes.*` | boolean | varies | Enable/disable specific sync types |
| `conflictResolution.strategy` | string | 'latest_wins' | Conflict resolution strategy |
| `dataValidation.enabled` | boolean | true | Enable data validation |
| `errorHandling.retryAttempts` | number | 3 | Number of retry attempts |

### BackupJob Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | true | Enable/disable the backup job |
| `schedule` | string | '0 2 * * *' | Cron expression for scheduling |
| `types.*` | boolean | varies | Enable/disable specific backup types |
| `database.engine` | string | 'postgresql' | Database engine type |
| `database.compression` | boolean | true | Enable file compression |
| `retention.enabled` | boolean | true | Enable retention policies |
| `encryption.enabled` | boolean | false | Enable backup encryption |

## Error Handling

Both job types include comprehensive error handling:

- **Retry Mechanisms**: Automatic retry with configurable attempts and delays
- **Error Logging**: Detailed error logging with stack traces
- **Notifications**: Email/notification system for critical errors
- **Graceful Degradation**: Continue operation despite individual failures

## Monitoring and Status

Each job provides status information:

```typescript
// Get comprehensive status
const status = job.getStatus();

// Get operation history
const history = job.getBackupHistory(); // or getSyncHistory()

// Get error queue
const errors = job.getErrorQueue();
```

## Best Practices

1. **Configuration Management**: Use environment variables for sensitive configuration
2. **Monitoring**: Regularly check job status and error queues
3. **Testing**: Test backup restoration procedures regularly
4. **Security**: Use encryption for sensitive data backups
5. **Performance**: Monitor job execution times and resource usage
6. **Documentation**: Document custom sync rules and backup procedures

## Dependencies

- **Prisma Client**: Database operations
- **Node.js fs**: File system operations
- **Node.js child_process**: External command execution
- **Canvas**: Barcode generation (for sync operations)

## Future Enhancements

- **Web Dashboard**: Web-based job monitoring and control
- **Advanced Scheduling**: More sophisticated cron expressions and dependencies
- **Cloud Integration**: Direct cloud storage integration
- **Real-time Notifications**: WebSocket-based real-time status updates
- **Job Dependencies**: Complex job workflows and dependencies
- **Performance Metrics**: Detailed performance analytics and optimization
