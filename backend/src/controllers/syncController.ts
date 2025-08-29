import { Response, NextFunction } from 'express';
import { prisma } from '@/database';
import { logger } from '@/utils/logger';
import { 
  SyncRequest, 
  SyncStatusRequest,
  ControllerResponse
} from './types';

// Sync data between local and remote databases
export const syncData = async (
  req: SyncRequest,
  res: Response<ControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { entityType, action, data, lastSyncTime } = req.body;

    if (!entityType || !action) {
      res.status(400).json({
        success: false,
        message: 'Entity type and action are required',
        error: 'MISSING_REQUIRED_FIELDS',
        statusCode: 400
      });
      return;
    }

    let syncResult: any = {};

    switch (action) {
      case 'push':
        syncResult = await pushData(entityType, data, lastSyncTime);
        break;
      case 'pull':
        syncResult = await pullData(entityType, lastSyncTime);
        break;
      case 'sync':
        syncResult = await performFullSync(entityType, lastSyncTime);
        break;
      default:
        res.status(400).json({
          success: false,
          message: 'Invalid sync action',
          error: 'INVALID_SYNC_ACTION',
          statusCode: 400
        });
        return;
    }

    logger.info(`Data sync completed: ${action} for ${entityType}`);

    res.status(200).json({
      success: true,
      message: `Data sync completed successfully`,
      data: syncResult,
      statusCode: 200
    });

  } catch (error) {
    logger.error('Data sync error:', error);
    next(error);
  }
};

// Push local data to remote database
async function pushData(entityType: string, data: any[], lastSyncTime?: string) {
  const syncStartTime = new Date();
  let successCount = 0;
  let errorCount = 0;
  const errors: any[] = [];

  try {
    switch (entityType) {
      case 'users':
        for (const userData of data) {
          try {
            await prisma.user.upsert({
              where: { id: userData.id },
              update: userData,
              create: userData
            });
            successCount++;
          } catch (error) {
            errorCount++;
            errors.push({ id: userData.id, error: error.message });
          }
        }
        break;

      case 'medicines':
        for (const medicineData of data) {
          try {
            await prisma.medicine.upsert({
              where: { id: medicineData.id },
              update: medicineData,
              create: medicineData
            });
            successCount++;
          } catch (error) {
            errorCount++;
            errors.push({ id: medicineData.id, error: error.message });
          }
        }
        break;

      case 'orders':
        for (const orderData of data) {
          try {
            await prisma.order.upsert({
              where: { id: orderData.id },
              update: orderData,
              create: orderData
            });
            successCount++;
          } catch (error) {
            errorCount++;
            errors.push({ id: orderData.id, error: error.message });
          }
        }
        break;

      case 'suppliers':
        for (const supplierData of data) {
          try {
            await prisma.supplier.upsert({
              where: { id: supplierData.id },
              update: supplierData,
              create: supplierData
            });
            successCount++;
          } catch (error) {
            errorCount++;
            errors.push({ id: supplierData.id, error: error.message });
          }
        }
        break;

      case 'inventory':
        for (const inventoryData of data) {
          try {
            await prisma.inventoryItem.upsert({
              where: { id: inventoryData.id },
              update: inventoryData,
              create: inventoryData
            });
            successCount++;
          } catch (error) {
            errorCount++;
            errors.push({ id: inventoryData.id, error: error.message });
          }
        }
        break;

      default:
        throw new Error(`Unsupported entity type: ${entityType}`);
    }

    // Update sync timestamp
    await updateSyncTimestamp(entityType, syncStartTime);

    return {
      action: 'push',
      entityType,
      totalRecords: data.length,
      successCount,
      errorCount,
      errors,
      syncStartTime: syncStartTime.toISOString(),
      syncEndTime: new Date().toISOString()
    };

  } catch (error) {
    logger.error(`Push data error for ${entityType}:`, error);
    throw error;
  }
}

// Pull data from remote database
async function pullData(entityType: string, lastSyncTime?: string) {
  const syncStartTime = new Date();
  let recordCount = 0;

  try {
    let data: any[] = [];

    switch (entityType) {
      case 'users':
        data = await prisma.user.findMany({
          where: lastSyncTime ? {
            updatedAt: { gt: new Date(lastSyncTime) }
          } : {},
          orderBy: { updatedAt: 'asc' }
        });
        break;

      case 'medicines':
        data = await prisma.medicine.findMany({
          where: lastSyncTime ? {
            updatedAt: { gt: new Date(lastSyncTime) }
          } : {},
          orderBy: { updatedAt: 'asc' }
        });
        break;

      case 'orders':
        data = await prisma.order.findMany({
          where: lastSyncTime ? {
            updatedAt: { gt: new Date(lastSyncTime) }
          } : {},
          orderBy: { updatedAt: 'asc' }
        });
        break;

      case 'suppliers':
        data = await prisma.supplier.findMany({
          where: lastSyncTime ? {
            updatedAt: { gt: new Date(lastSyncTime) }
          } : {},
          orderBy: { updatedAt: 'asc' }
        });
        break;

      case 'inventory':
        data = await prisma.inventoryItem.findMany({
          where: lastSyncTime ? {
            updatedAt: { gt: new Date(lastSyncTime) }
          } : {},
          orderBy: { updatedAt: 'asc' }
        });
        break;

      default:
        throw new Error(`Unsupported entity type: ${entityType}`);
    }

    recordCount = data.length;

    // Update sync timestamp
    await updateSyncTimestamp(entityType, syncStartTime);

    return {
      action: 'pull',
      entityType,
      recordCount,
      data,
      syncStartTime: syncStartTime.toISOString(),
      syncEndTime: new Date().toISOString()
    };

  } catch (error) {
    logger.error(`Pull data error for ${entityType}:`, error);
    throw error;
  }
}

// Perform full synchronization
async function performFullSync(entityType: string, lastSyncTime?: string) {
  const syncStartTime = new Date();

  try {
    // First pull latest data
    const pullResult = await pullData(entityType, lastSyncTime);

    // Then push any local changes
    const pushResult = await pushData(entityType, [], lastSyncTime);

    return {
      action: 'sync',
      entityType,
      pull: pullResult,
      push: pushResult,
      syncStartTime: syncStartTime.toISOString(),
      syncEndTime: new Date().toISOString()
    };

  } catch (error) {
    logger.error(`Full sync error for ${entityType}:`, error);
    throw error;
  }
}

// Update sync timestamp for entity type
async function updateSyncTimestamp(entityType: string, syncTime: Date) {
  try {
    // You might want to store this in a separate sync_logs table
    // For now, we'll just log it
    logger.info(`Sync timestamp updated for ${entityType}: ${syncTime.toISOString()}`);
  } catch (error) {
    logger.error(`Error updating sync timestamp for ${entityType}:`, error);
  }
}

// Get sync status
export const getSyncStatus = async (
  req: SyncStatusRequest,
  res: Response<ControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { entityType, status } = req.query;

    // Build query
    const query: any = {};
    if (entityType) {
      query.entityType = entityType;
    }
    if (status) {
      query.status = status;
    }

    // Get sync status from database
    // This would typically come from a sync_logs table
    // For now, we'll return mock data
    const syncStatus = {
      lastSync: new Date().toISOString(),
      entityTypes: ['users', 'medicines', 'orders', 'suppliers', 'inventory'],
      overallStatus: 'healthy',
      pendingSyncs: 0,
      failedSyncs: 0,
      lastError: null
    };

    res.status(200).json({
      success: true,
      message: 'Sync status retrieved successfully',
      data: syncStatus,
      statusCode: 200
    });

  } catch (error) {
    logger.error('Get sync status error:', error);
    next(error);
  }
};

// Force sync for specific entity
export const forceSync = async (
  req: SyncRequest,
  res: Response<ControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { entityType } = req.body;

    if (!entityType) {
      res.status(400).json({
        success: false,
        message: 'Entity type is required',
        error: 'MISSING_ENTITY_TYPE',
        statusCode: 400
      });
      return;
    }

    // Perform forced sync
    const syncResult = await performFullSync(entityType);

    logger.info(`Forced sync completed for ${entityType}`);

    res.status(200).json({
      success: true,
      message: `Forced sync completed for ${entityType}`,
      data: syncResult,
      statusCode: 200
    });

  } catch (error) {
    logger.error('Force sync error:', error);
    next(error);
  }
};

// Get sync conflicts
export const getSyncConflicts = async (
  req: SyncStatusRequest,
  res: Response<ControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { entityType } = req.query;

    // This would typically check for data conflicts between local and remote
    // For now, we'll return mock data
    const conflicts = {
      entityType: entityType || 'all',
      totalConflicts: 0,
      conflicts: [],
      lastChecked: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      message: 'Sync conflicts retrieved successfully',
      data: conflicts,
      statusCode: 200
    });

  } catch (error) {
    logger.error('Get sync conflicts error:', error);
    next(error);
  }
};

// Resolve sync conflicts
export const resolveSyncConflicts = async (
  req: SyncRequest,
  res: Response<ControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { entityType, conflictId, resolution } = req.body;

    if (!entityType || !conflictId || !resolution) {
      res.status(400).json({
        success: false,
        message: 'Entity type, conflict ID, and resolution are required',
        error: 'MISSING_REQUIRED_FIELDS',
        statusCode: 400
      });
      return;
    }

    // This would typically resolve conflicts based on the resolution strategy
    // For now, we'll just log the resolution
    logger.info(`Conflict ${conflictId} resolved for ${entityType} with strategy: ${resolution}`);

    res.status(200).json({
      success: true,
      message: 'Sync conflict resolved successfully',
      data: {
        conflictId,
        entityType,
        resolution,
        resolvedAt: new Date().toISOString()
      },
      statusCode: 200
    });

  } catch (error) {
    logger.error('Resolve sync conflicts error:', error);
    next(error);
  }
};

// Get sync statistics
export const getSyncStats = async (
  req: SyncStatusRequest,
  res: Response<ControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    // This would typically come from a sync_logs table
    // For now, we'll return mock data
    const syncStats = {
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      averageSyncTime: 0,
      lastSyncTime: null,
      nextScheduledSync: null,
      entityTypeStats: {
        users: { lastSync: null, status: 'pending' },
        medicines: { lastSync: null, status: 'pending' },
        orders: { lastSync: null, status: 'pending' },
        suppliers: { lastSync: null, status: 'pending' },
        inventory: { lastSync: null, status: 'pending' }
      }
    };

    res.status(200).json({
      success: true,
      message: 'Sync statistics retrieved successfully',
      data: syncStats,
      statusCode: 200
    });

  } catch (error) {
    logger.error('Get sync stats error:', error);
    next(error);
  }
};

// Export all functions
export {
  syncData,
  getSyncStatus,
  forceSync,
  getSyncConflicts,
  resolveSyncConflicts,
  getSyncStats
};
