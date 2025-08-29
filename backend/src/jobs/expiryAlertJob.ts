import { logger } from '@/utils/logger';
import { DateHelper } from '@/utils/dateHelper';
import { PrismaClient } from '@prisma/client';

/**
 * Expiry alert configuration interface
 */
interface ExpiryAlertConfig {
  enabled: boolean;
  schedule: string; // Cron expression
  thresholds: {
    critical: number; // Days before expiry for critical alerts
    warning: number; // Days before expiry for warning alerts
    reminder: number; // Days before expiry for reminder alerts
  };
  notifications: {
    email: {
      enabled: boolean;
      recipients: string[];
      template: 'simple' | 'detailed' | 'custom';
    };
    sms: {
      enabled: boolean;
      recipients: string[];
      provider: 'twilio' | 'aws-sns' | 'other';
    };
    push: {
      enabled: boolean;
      users: string[];
      channels: string[];
    };
    slack: {
      enabled: boolean;
      webhook: string;
      channel: string;
    };
  };
  alerts: {
    includeExpired: boolean;
    includeLowStock: boolean;
    includeDiscontinued: boolean;
    groupBy: 'category' | 'supplier' | 'location' | 'none';
    maxItemsPerAlert: number;
  };
  actions: {
    autoReorder: boolean;
    autoDiscontinue: boolean;
    createTasks: boolean;
    updateInventory: boolean;
  };
  reporting: {
    generateReports: boolean;
    reportFormat: 'pdf' | 'csv' | 'json' | 'html';
    includeCharts: boolean;
    sendToManagers: boolean;
  };
}

/**
 * Expiry alert result interface
 */
interface ExpiryAlertResult {
  success: boolean;
  timestamp: Date;
  duration: number;
  alerts: {
    critical: ExpiryAlert[];
    warning: ExpiryAlert[];
    reminder: ExpiryAlert[];
    expired: ExpiryAlert[];
  };
  notifications: {
    sent: number;
    failed: number;
    details: NotificationDetail[];
  };
  actions: {
    reorders: number;
    discontinuations: number;
    tasks: number;
    inventoryUpdates: number;
  };
  errors?: string[];
  warnings?: string[];
}

/**
 * Expiry alert interface
 */
interface ExpiryAlert {
  id: string;
  medicineId: string;
  medicineName: string;
  genericName?: string;
  batchNumber?: string;
  expiryDate: Date;
  daysUntilExpiry: number;
  currentStock: number;
  reorderLevel: number;
  supplier: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  category: string;
  location: string;
  priority: 'critical' | 'warning' | 'reminder' | 'expired';
  actions: string[];
  estimatedLoss?: number;
}

/**
 * Notification detail interface
 */
interface NotificationDetail {
  type: 'email' | 'sms' | 'push' | 'slack';
  recipient: string;
  success: boolean;
  timestamp: Date;
  error?: string;
}

/**
 * Expiry alert job class for monitoring medicine expiration dates
 */
export class ExpiryAlertJob {
  private prisma: PrismaClient;
  private config: ExpiryAlertConfig;
  private isRunning: boolean = false;
  private lastRun: Date | null = null;
  private alertHistory: ExpiryAlertResult[] = [];

  constructor(prisma: PrismaClient, config?: Partial<ExpiryAlertConfig>) {
    this.prisma = prisma;
    this.config = this.getDefaultConfig();
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * Get default expiry alert configuration
   */
  private getDefaultConfig(): ExpiryAlertConfig {
    return {
      enabled: true,
      schedule: '0 9 * * *', // Daily at 9 AM
      thresholds: {
        critical: 7, // 7 days before expiry
        warning: 30, // 30 days before expiry
        reminder: 60 // 60 days before expiry
      },
      notifications: {
        email: {
          enabled: true,
          recipients: ['pharmacy@example.com', 'manager@example.com'],
          template: 'detailed'
        },
        sms: {
          enabled: false,
          recipients: [],
          provider: 'twilio'
        },
        push: {
          enabled: false,
          users: [],
          channels: []
        },
        slack: {
          enabled: false,
          webhook: '',
          channel: '#pharmacy-alerts'
        }
      },
      alerts: {
        includeExpired: true,
        includeLowStock: true,
        includeDiscontinued: false,
        groupBy: 'category',
        maxItemsPerAlert: 100
      },
      actions: {
        autoReorder: false,
        autoDiscontinue: false,
        createTasks: true,
        updateInventory: true
      },
      reporting: {
        generateReports: true,
        reportFormat: 'pdf',
        includeCharts: true,
        sendToManagers: true
      }
    };
  }

  /**
   * Start the expiry alert job scheduler
   */
  async start(): Promise<void> {
    if (!this.config.enabled) {
      logger.info('Expiry alert job is disabled');
      return;
    }

    try {
      logger.info('Starting expiry alert job scheduler');
      
      // Perform initial check if no alerts exist
      if (this.alertHistory.length === 0) {
        await this.performExpiryCheck();
      }

      // Schedule regular checks
      this.scheduleExpiryChecks();

      logger.info('Expiry alert job scheduler started successfully');
    } catch (error) {
      logger.error('Failed to start expiry alert job scheduler:', error);
      throw error;
    }
  }

  /**
   * Stop the expiry alert job scheduler
   */
  async stop(): Promise<void> {
    try {
      logger.info('Stopping expiry alert job scheduler');
      this.isRunning = false;
      logger.info('Expiry alert job scheduler stopped successfully');
    } catch (error) {
      logger.error('Failed to stop expiry alert job scheduler:', error);
      throw error;
    }
  }

  /**
   * Schedule regular expiry checks using cron-like timing
   */
  private scheduleExpiryChecks(): void {
    // Parse cron expression and schedule next check
    const nextCheck = this.getNextCheckTime();
    
    setTimeout(async () => {
      if (this.isRunning) {
        await this.performExpiryCheck();
        this.scheduleExpiryChecks(); // Schedule next check
      }
    }, nextCheck.getTime() - Date.now());

    logger.info(`Next expiry check scheduled for: ${nextCheck.toISOString()}`);
  }

  /**
   * Calculate next check time based on cron schedule
   */
  private getNextCheckTime(): Date {
    const now = new Date();
    const [minute, hour, day, month, weekday] = this.config.schedule.split(' ');
    
    let nextCheck = new Date(now);
    
    // Simple cron parsing (for production, use a proper cron library)
    if (minute !== '*') {
      nextCheck.setMinutes(parseInt(minute), 0, 0);
    }
    if (hour !== '*') {
      nextCheck.setHours(parseInt(hour), 0, 0, 0);
    }
    
    // If the calculated time is in the past, move to next day
    if (nextCheck <= now) {
      nextCheck.setDate(nextCheck.getDate() + 1);
    }
    
    return nextCheck;
  }

  /**
   * Perform expiry check and generate alerts
   */
  async performExpiryCheck(): Promise<ExpiryAlertResult> {
    if (this.isRunning) {
      throw new Error('Expiry alert job is already running');
    }

    this.isRunning = true;
    const startTime = Date.now();
    const timestamp = new Date();

    logger.info('Starting expiry check');

    try {
      const result: ExpiryAlertResult = {
        success: false,
        timestamp,
        duration: 0,
        alerts: {
          critical: [],
          warning: [],
          reminder: [],
          expired: []
        },
        notifications: {
          sent: 0,
          failed: 0,
          details: []
        },
        actions: {
          reorders: 0,
          discontinuations: 0,
          tasks: 0,
          inventoryUpdates: 0
        },
        errors: [],
        warnings: []
      };

      // Get expiring medicines
      const expiringMedicines = await this.getExpiringMedicines();
      
      // Categorize alerts by priority
      for (const medicine of expiringMedicines) {
        const alert = this.createExpiryAlert(medicine);
        
        if (alert.daysUntilExpiry < 0) {
          result.alerts.expired.push(alert);
        } else if (alert.daysUntilExpiry <= this.config.thresholds.critical) {
          result.alerts.critical.push(alert);
        } else if (alert.daysUntilExpiry <= this.config.thresholds.warning) {
          result.alerts.warning.push(alert);
        } else if (alert.daysUntilExpiry <= this.config.thresholds.reminder) {
          result.alerts.reminder.push(alert);
        }
      }

      // Perform automated actions
      if (this.config.actions.autoReorder) {
        result.actions.reorders = await this.performAutoReorder(result.alerts.critical);
      }

      if (this.config.actions.autoDiscontinue) {
        result.actions.discontinuations = await this.performAutoDiscontinue(result.alerts.expired);
      }

      if (this.config.actions.createTasks) {
        result.actions.tasks = await this.createTasks(result.alerts);
      }

      if (this.config.actions.updateInventory) {
        result.actions.inventoryUpdates = await this.updateInventory(result.alerts);
      }

      // Send notifications
      await this.sendNotifications(result);

      // Generate reports
      if (this.config.reporting.generateReports) {
        await this.generateReports(result);
      }

      // Update result
      result.success = true;
      result.duration = Date.now() - startTime;

      // Update alert history
      this.alertHistory.push(result);
      this.lastRun = timestamp;

      logger.info('Expiry check completed successfully', {
        duration: result.duration,
        critical: result.alerts.critical.length,
        warning: result.alerts.warning.length,
        reminder: result.alerts.reminder.length,
        expired: result.alerts.expired.length
      });

      return result;
    } catch (error) {
      const result: ExpiryAlertResult = {
        success: false,
        timestamp,
        duration: Date.now() - startTime,
        alerts: {
          critical: [],
          warning: [],
          reminder: [],
          expired: []
        },
        notifications: {
          sent: 0,
          failed: 0,
          details: []
        },
        actions: {
          reorders: 0,
          discontinuations: 0,
          tasks: 0,
          inventoryUpdates: 0
        },
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: []
      };

      logger.error('Expiry check failed:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Get expiring medicines from database
   */
  private async getExpiringMedicines(): Promise<any[]> {
    try {
      const today = new Date();
      const criticalDate = DateHelper.addDays(today, this.config.thresholds.critical);
      const reminderDate = DateHelper.addDays(today, this.config.thresholds.reminder);

      const medicines = await this.prisma.medicine.findMany({
        where: {
          expiryDate: {
            lte: reminderDate,
            gte: today
          },
          isActive: true
        },
        include: {
          supplier: true,
          inventory: {
            where: {
              quantity: {
                gt: 0
              }
            }
          }
        },
        orderBy: {
          expiryDate: 'asc'
        }
      });

      // Also get expired medicines if enabled
      if (this.config.alerts.includeExpired) {
        const expiredMedicines = await this.prisma.medicine.findMany({
          where: {
            expiryDate: {
              lt: today
            },
            isActive: true
          },
          include: {
            supplier: true,
            inventory: {
              where: {
                quantity: {
                  gt: 0
                }
              }
            }
          }
        });

        medicines.push(...expiredMedicines);
      }

      return medicines;
    } catch (error) {
      logger.error('Failed to get expiring medicines:', error);
      throw error;
    }
  }

  /**
   * Create expiry alert from medicine data
   */
  private createExpiryAlert(medicine: any): ExpiryAlert {
    const today = new Date();
    const daysUntilExpiry = DateHelper.getDaysUntilExpiry(medicine.expiryDate);
    const currentStock = medicine.inventory.reduce((sum: number, inv: any) => sum + inv.quantity, 0);
    
    // Determine priority
    let priority: 'critical' | 'warning' | 'reminder' | 'expired';
    if (daysUntilExpiry < 0) {
      priority = 'expired';
    } else if (daysUntilExpiry <= this.config.thresholds.critical) {
      priority = 'critical';
    } else if (daysUntilExpiry <= this.config.thresholds.warning) {
      priority = 'warning';
    } else {
      priority = 'reminder';
    }

    // Calculate estimated loss for expired medicines
    let estimatedLoss = 0;
    if (daysUntilExpiry < 0 && currentStock > 0) {
      estimatedLoss = currentStock * (medicine.pricing?.costPrice || 0);
    }

    // Determine actions based on priority
    const actions: string[] = [];
    if (priority === 'critical') {
      actions.push('Immediate reorder required', 'Notify supplier', 'Check alternative sources');
    } else if (priority === 'warning') {
      actions.push('Plan reorder', 'Monitor stock levels', 'Check supplier availability');
    } else if (priority === 'reminder') {
      actions.push('Review stock levels', 'Plan future orders', 'Check supplier lead times');
    } else if (priority === 'expired') {
      actions.push('Remove from inventory', 'Document disposal', 'Investigate cause');
    }

    return {
      id: medicine.id,
      medicineId: medicine.id,
      medicineName: medicine.name,
      genericName: medicine.genericName,
      batchNumber: medicine.batchNumber,
      expiryDate: medicine.expiryDate,
      daysUntilExpiry,
      currentStock,
      reorderLevel: medicine.reorderLevel || 10,
      supplier: {
        id: medicine.supplier.id,
        name: medicine.supplier.name,
        email: medicine.supplier.email,
        phone: medicine.supplier.phone
      },
      category: medicine.category,
      location: medicine.inventory[0]?.location || 'Unknown',
      priority,
      actions,
      estimatedLoss
    };
  }

  /**
   * Perform automatic reordering for critical items
   */
  private async performAutoReorder(criticalAlerts: ExpiryAlert[]): Promise<number> {
    let reorderCount = 0;

    try {
      for (const alert of criticalAlerts) {
        if (alert.currentStock <= alert.reorderLevel) {
          try {
            // Create reorder record
            await this.prisma.purchaseOrder.create({
              data: {
                supplierId: alert.supplier.id,
                medicineId: alert.medicineId,
                quantity: alert.reorderLevel * 2, // Order double the reorder level
                unitPrice: 0, // Will be updated by supplier
                status: 'pending',
                priority: 'high',
                expectedDeliveryDate: DateHelper.addDays(new Date(), 7),
                notes: `Auto-reorder due to expiry in ${alert.daysUntilExpiry} days`
              }
            });

            reorderCount++;
            logger.info(`Auto-reorder created for ${alert.medicineName}`);
          } catch (error) {
            logger.warn(`Failed to create auto-reorder for ${alert.medicineName}:`, error);
          }
        }
      }

      logger.info(`Auto-reorder completed for ${reorderCount} items`);
    } catch (error) {
      logger.error('Auto-reorder process failed:', error);
    }

    return reorderCount;
  }

  /**
   * Perform automatic discontinuation for expired items
   */
  private async performAutoDiscontinue(expiredAlerts: ExpiryAlert[]): Promise<number> {
    let discontinuationCount = 0;

    try {
      for (const alert of expiredAlerts) {
        try {
          // Update medicine status
          await this.prisma.medicine.update({
            where: { id: alert.medicineId },
            data: {
              isActive: false,
              discontinuedDate: new Date(),
              discontinuedReason: 'Auto-discontinued due to expiration'
            }
          });

          // Update inventory quantities to 0
          await this.prisma.inventory.updateMany({
            where: { medicineId: alert.medicineId },
            data: { quantity: 0 }
          });

          discontinuationCount++;
          logger.info(`Auto-discontinued ${alert.medicineName}`);
        } catch (error) {
          logger.warn(`Failed to auto-discontinue ${alert.medicineName}:`, error);
        }
      }

      logger.info(`Auto-discontinuation completed for ${discontinuationCount} items`);
    } catch (error) {
      logger.error('Auto-discontinuation process failed:', error);
    }

    return discontinuationCount;
  }

  /**
   * Create tasks for alerts
   */
  private async createTasks(alerts: ExpiryAlertResult['alerts']): Promise<number> {
    let taskCount = 0;

    try {
      const allAlerts = [
        ...alerts.critical.map(a => ({ ...a, priority: 'high' })),
        ...alerts.warning.map(a => ({ ...a, priority: 'medium' })),
        ...alerts.reminder.map(a => ({ ...a, priority: 'low' })),
        ...alerts.expired.map(a => ({ ...a, priority: 'high' }))
      ];

      for (const alert of allAlerts) {
        try {
          // Create task record
          await this.prisma.task.create({
            data: {
              title: `Expiry Alert: ${alert.medicineName}`,
              description: `${alert.medicineName} expires in ${alert.daysUntilExpiry} days. Current stock: ${alert.currentStock}`,
              priority: alert.priority as 'high' | 'medium' | 'low',
              status: 'pending',
              assignedTo: 'pharmacy-staff',
              dueDate: DateHelper.addDays(new Date(), Math.max(1, alert.daysUntilExpiry)),
              category: 'inventory',
              tags: ['expiry', 'medicine', alert.category],
              metadata: {
                medicineId: alert.medicineId,
                expiryDate: alert.expiryDate,
                currentStock: alert.currentStock,
                supplier: alert.supplier.name
              }
            }
          });

          taskCount++;
        } catch (error) {
          logger.warn(`Failed to create task for ${alert.medicineName}:`, error);
        }
      }

      logger.info(`Tasks created for ${taskCount} alerts`);
    } catch (error) {
      logger.error('Task creation process failed:', error);
    }

    return taskCount;
  }

  /**
   * Update inventory based on alerts
   */
  private async updateInventory(alerts: ExpiryAlertResult['alerts']): Promise<number> {
    let updateCount = 0;

    try {
      const allAlerts = [
        ...alerts.critical,
        ...alerts.warning,
        ...alerts.reminder,
        ...alerts.expired
      ];

      for (const alert of allAlerts) {
        try {
          // Update inventory status
          await this.prisma.inventory.updateMany({
            where: { medicineId: alert.medicineId },
            data: {
              status: alert.priority === 'expired' ? 'expired' : 'active',
              lastUpdated: new Date(),
              notes: `Expiry alert: ${alert.daysUntilExpiry} days until expiry`
            }
          });

          updateCount++;
        } catch (error) {
          logger.warn(`Failed to update inventory for ${alert.medicineName}:`, error);
        }
      }

      logger.info(`Inventory updated for ${updateCount} items`);
    } catch (error) {
      logger.error('Inventory update process failed:', error);
    }

    return updateCount;
  }

  /**
   * Send notifications for alerts
   */
  private async sendNotifications(result: ExpiryAlertResult): Promise<void> {
    try {
      // Send email notifications
      if (this.config.notifications.email.enabled) {
        await this.sendEmailNotifications(result);
      }

      // Send SMS notifications
      if (this.config.notifications.sms.enabled) {
        await this.sendSMSNotifications(result);
      }

      // Send push notifications
      if (this.config.notifications.push.enabled) {
        await this.sendPushNotifications(result);
      }

      // Send Slack notifications
      if (this.config.notifications.slack.enabled) {
        await this.sendSlackNotifications(result);
      }

      logger.info('Notifications sent successfully', {
        sent: result.notifications.sent,
        failed: result.notifications.failed
      });
    } catch (error) {
      logger.error('Failed to send notifications:', error);
    }
  }

  /**
   * Send email notifications
   */
  private async sendEmailNotifications(result: ExpiryAlertResult): Promise<void> {
    try {
      logger.info('Email notifications not yet implemented');
      // Implementation would depend on email service
    } catch (error) {
      logger.error('Email notification process failed:', error);
    }
  }

  /**
   * Send SMS notifications
   */
  private async sendSMSNotifications(result: ExpiryAlertResult): Promise<void> {
    // Implementation would depend on SMS provider
    logger.info('SMS notifications not yet implemented');
  }

  /**
   * Send push notifications
   */
  private async sendPushNotifications(result: ExpiryAlertResult): Promise<void> {
    // Implementation would depend on push notification service
    logger.info('Push notifications not yet implemented');
  }

  /**
   * Send Slack notifications
   */
  private async sendSlackNotifications(result: ExpiryAlertResult): Promise<void> {
    // Implementation would depend on Slack webhook
    logger.info('Slack notifications not yet implemented');
  }

  /**
   * Generate reports
   */
  private async generateReports(result: ExpiryAlertResult): Promise<void> {
    try {
      logger.info('Generating expiry alert reports');
      
      // Implementation would depend on reporting library
      // For now, just log the action
      logger.info('Report generation initiated', {
        format: this.config.reporting.reportFormat,
        includeCharts: this.config.reporting.includeCharts,
        sendToManagers: this.config.reporting.sendToManagers
      });
    } catch (error) {
      logger.error('Failed to generate reports:', error);
    }
  }

  /**
   * Get expiry alert status
   */
  getStatus(): {
    isRunning: boolean;
    lastRun: Date | null;
    alertCount: number;
    nextCheck: Date;
    config: ExpiryAlertConfig;
  } {
    return {
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      alertCount: this.alertHistory.length,
      nextCheck: this.getNextCheckTime(),
      config: this.config
    };
  }

  /**
   * Get alert history
   */
  getAlertHistory(): ExpiryAlertResult[] {
    return [...this.alertHistory];
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ExpiryAlertConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('Expiry alert configuration updated');
  }

  /**
   * Perform manual expiry check
   */
  async performManualCheck(): Promise<ExpiryAlertResult> {
    logger.info('Manual expiry check requested');
    return this.performExpiryCheck();
  }

  /**
   * Get medicines expiring within specified days
   */
  async getMedicinesExpiringIn(days: number): Promise<ExpiryAlert[]> {
    try {
      const targetDate = DateHelper.addDays(new Date(), days);
      
      const medicines = await this.prisma.medicine.findMany({
        where: {
          expiryDate: {
            lte: targetDate,
            gte: new Date()
          },
          isActive: true
        },
        include: {
          supplier: true,
          inventory: {
            where: {
              quantity: {
                gt: 0
              }
            }
          }
        }
      });

      return medicines.map(medicine => this.createExpiryAlert(medicine));
    } catch (error) {
      logger.error('Failed to get medicines expiring in specified days:', error);
      throw error;
    }
  }

  /**
   * Get expired medicines
   */
  async getExpiredMedicines(): Promise<ExpiryAlert[]> {
    try {
      const medicines = await this.prisma.medicine.findMany({
        where: {
          expiryDate: {
            lt: new Date()
          },
          isActive: true
        },
        include: {
          supplier: true,
          inventory: {
            where: {
              quantity: {
                gt: 0
              }
            }
          }
        }
      });

      return medicines.map(medicine => this.createExpiryAlert(medicine));
    } catch (error) {
      logger.error('Failed to get expired medicines:', error);
      throw error;
    }
  }
}

export default ExpiryAlertJob;
