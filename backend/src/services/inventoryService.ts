import { prisma } from '@/database';
import { logger } from '@/utils/logger';
import {
  InventoryServiceInterface,
  IMedicineCreate,
  IMedicineUpdate,
  InventoryAdjustment,
  InventoryStats,
  ServiceResponse
} from './types';
import {
  IMedicine,
  IInventoryItem,
  ISearchFilters,
  IPaginationOptions,
  ISearchResult,
  buildSearchQuery,
  buildPaginationQuery,
  createSearchResult,
  calculateMedicinePrice,
  calculateProfitMargin
} from '@/models';

export class InventoryService implements InventoryServiceInterface {
  /**
   * Add new medicine to inventory
   */
  async addMedicine(medicineData: IMedicineCreate): Promise<IMedicine> {
    try {
      // Validate medicine data
      const validationResult = this.validateMedicineData(medicineData);
      if (!validationResult.success) {
        throw new Error(validationResult.error);
      }

      // Check if SKU already exists
      const existingMedicine = await prisma.medicine.findFirst({
        where: { sku: medicineData.sku }
      });

      if (existingMedicine) {
        throw new Error('Medicine with this SKU already exists');
      }

      // Check if category exists
      const category = await prisma.category.findUnique({
        where: { id: medicineData.categoryId }
      });

      if (!category) {
        throw new Error('Category not found');
      }

      // Check if supplier exists
      const supplier = await prisma.supplier.findUnique({
        where: { id: medicineData.supplierId }
      });

      if (!supplier) {
        throw new Error('Supplier not found');
      }

      // Create medicine
      const medicine = await prisma.medicine.create({
        data: {
          name: medicineData.name,
          genericName: medicineData.genericName,
          brandName: medicineData.brandName,
          description: medicineData.description,
          activeIngredients: medicineData.activeIngredients,
          dosageForm: medicineData.dosageForm,
          strength: medicineData.strength,
          unit: medicineData.unit,
          manufacturer: medicineData.manufacturer,
          prescriptionRequired: medicineData.prescriptionRequired || false,
          controlledSubstance: medicineData.controlledSubstance || false,
          schedule: medicineData.schedule,
          sideEffects: medicineData.sideEffects || [],
          contraindications: medicineData.contraindications || [],
          interactions: medicineData.interactions || [],
          storageConditions: medicineData.storageConditions,
          expiryDate: new Date(medicineData.expiryDate),
          batchNumber: medicineData.batchNumber,
          sku: medicineData.sku,
          barcode: medicineData.barcode,
          requiresRefrigeration: medicineData.requiresRefrigeration || false,
          price: medicineData.price,
          cost: medicineData.cost,
          taxRate: medicineData.taxRate || 0,
          discountPercentage: medicineData.discountPercentage || 0,
          imageUrl: medicineData.imageUrl,
          tags: medicineData.tags || [],
          categoryId: medicineData.categoryId,
          supplierId: medicineData.supplierId,
          isActive: true
        },
        include: {
          category: true,
          supplier: true
        }
      });

      // Create initial inventory item
      await prisma.inventoryItem.create({
        data: {
          medicineId: medicine.id,
          quantity: 0,
          reorderPoint: 10,
          maxStock: 1000,
          location: 'Main Storage',
          status: 'IN_STOCK',
          lastUpdated: new Date()
        }
      });

      logger.info(`Medicine added successfully: ${medicine.name} (SKU: ${medicine.sku})`);
      return medicine;
    } catch (error) {
      logger.error('Add medicine error:', error);
      throw error;
    }
  }

  /**
   * Update medicine information
   */
  async updateMedicine(id: string, updates: IMedicineUpdate): Promise<IMedicine> {
    try {
      // Check if medicine exists
      const existingMedicine = await prisma.medicine.findUnique({
        where: { id }
      });

      if (!existingMedicine) {
        throw new Error('Medicine not found');
      }

      // Validate updates
      if (updates.sku) {
        const skuExists = await prisma.medicine.findFirst({
          where: {
            sku: updates.sku,
            id: { not: id }
          }
        });

        if (skuExists) {
          throw new Error('SKU already exists');
        }
      }

      // Update medicine
      const updatedMedicine = await prisma.medicine.update({
        where: { id },
        data: updates,
        include: {
          category: true,
          supplier: true
        }
      });

      logger.info(`Medicine updated successfully: ${updatedMedicine.name}`);
      return updatedMedicine;
    } catch (error) {
      logger.error('Update medicine error:', error);
      throw error;
    }
  }

  /**
   * Remove medicine (soft delete)
   */
  async removeMedicine(id: string): Promise<boolean> {
    try {
      // Check if medicine exists
      const medicine = await prisma.medicine.findUnique({
        where: { id },
        include: {
          inventoryItems: true,
          orderItems: true
        }
      });

      if (!medicine) {
        throw new Error('Medicine not found');
      }

      // Check if medicine has active inventory
      const hasActiveInventory = medicine.inventoryItems.some(item => item.quantity > 0);
      if (hasActiveInventory) {
        throw new Error('Cannot remove medicine with active inventory');
      }

      // Check if medicine has active orders
      const hasActiveOrders = medicine.orderItems.some(item => 
        item.order.status !== 'CANCELLED' && item.order.status !== 'COMPLETED'
      );
      if (hasActiveOrders) {
        throw new Error('Cannot remove medicine with active orders');
      }

      // Soft delete medicine
      await prisma.medicine.update({
        where: { id },
        data: { isActive: false }
      });

      logger.info(`Medicine removed successfully: ${medicine.name}`);
      return true;
    } catch (error) {
      logger.error('Remove medicine error:', error);
      throw error;
    }
  }

  /**
   * Get medicine by ID
   */
  async getMedicine(id: string): Promise<IMedicine | null> {
    try {
      const medicine = await prisma.medicine.findUnique({
        where: { id },
        include: {
          category: true,
          supplier: true,
          inventoryItems: true
        }
      });

      return medicine;
    } catch (error) {
      logger.error('Get medicine error:', error);
      throw error;
    }
  }

  /**
   * Search medicines with filters and pagination
   */
  async searchMedicines(filters: ISearchFilters, pagination: IPaginationOptions): Promise<ISearchResult<IMedicine>> {
    try {
      // Build search query
      const searchQuery = buildSearchQuery(filters);
      const paginationQuery = buildPaginationQuery(pagination);

      // Get total count
      const total = await prisma.medicine.count({
        where: {
          ...searchQuery,
          isActive: true
        }
      });

      // Get medicines
      const medicines = await prisma.medicine.findMany({
        where: {
          ...searchQuery,
          isActive: true
        },
        include: {
          category: true,
          supplier: true,
          inventoryItems: true
        },
        ...paginationQuery,
        orderBy: {
          [pagination.sortBy || 'createdAt']: pagination.sortOrder || 'desc'
        }
      });

      // Create search result
      const result = createSearchResult(medicines, total, pagination.page, pagination.limit);

      return result;
    } catch (error) {
      logger.error('Search medicines error:', error);
      throw error;
    }
  }

  /**
   * Update stock quantity
   */
  async updateStock(medicineId: string, quantity: number, operation: 'add' | 'subtract'): Promise<IInventoryItem> {
    try {
      // Check if medicine exists
      const medicine = await prisma.medicine.findUnique({
        where: { id: medicineId }
      });

      if (!medicine) {
        throw new Error('Medicine not found');
      }

      // Get or create inventory item
      let inventoryItem = await prisma.inventoryItem.findFirst({
        where: { medicineId }
      });

      if (!inventoryItem) {
        inventoryItem = await prisma.inventoryItem.create({
          data: {
            medicineId,
            quantity: 0,
            reorderPoint: 10,
            maxStock: 1000,
            location: 'Main Storage',
            status: 'IN_STOCK',
            lastUpdated: new Date()
          }
        });
      }

      // Calculate new quantity
      let newQuantity: number;
      if (operation === 'add') {
        newQuantity = inventoryItem.quantity + quantity;
      } else {
        newQuantity = Math.max(0, inventoryItem.quantity - quantity);
      }

      // Update inventory
      const updatedInventory = await prisma.inventoryItem.update({
        where: { id: inventoryItem.id },
        data: {
          quantity: newQuantity,
          status: this.determineInventoryStatus(newQuantity, inventoryItem.reorderPoint),
          lastUpdated: new Date()
        }
      });

      // Log stock update
      logger.info(`Stock updated for ${medicine.name}: ${operation} ${quantity}, new total: ${newQuantity}`);

      return updatedInventory;
    } catch (error) {
      logger.error('Update stock error:', error);
      throw error;
    }
  }

  /**
   * Check for low stock items
   */
  async checkLowStock(threshold: number): Promise<IInventoryItem[]> {
    try {
      const lowStockItems = await prisma.inventoryItem.findMany({
        where: {
          quantity: {
            lte: threshold
          },
          status: {
            in: ['LOW_STOCK', 'OUT_OF_STOCK']
          }
        },
        include: {
          medicine: {
            include: {
              category: true,
              supplier: true
            }
          }
        }
      });

      return lowStockItems;
    } catch (error) {
      logger.error('Check low stock error:', error);
      throw error;
    }
  }

  /**
   * Get medicines expiring soon
   */
  async getExpiringMedicines(days: number): Promise<IInventoryItem[]> {
    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + days);

      const expiringItems = await prisma.inventoryItem.findMany({
        where: {
          medicine: {
            expiryDate: {
              lte: expiryDate
            },
            isActive: true
          },
          quantity: {
            gt: 0
          }
        },
        include: {
          medicine: {
            include: {
              category: true,
              supplier: true
            }
          }
        }
      });

      return expiringItems;
    } catch (error) {
      logger.error('Get expiring medicines error:', error);
      throw error;
    }
  }

  /**
   * Get inventory statistics
   */
  async getInventoryStats(): Promise<InventoryStats> {
    try {
      // Get total items and value
      const totalItems = await prisma.inventoryItem.aggregate({
        _sum: {
          quantity: true
        }
      });

      const medicines = await prisma.medicine.findMany({
        where: { isActive: true },
        include: {
          inventoryItems: true
        }
      });

      let totalValue = 0;
      let lowStockItems = 0;
      let outOfStockItems = 0;
      let expiringItems = 0;

      medicines.forEach(medicine => {
        const inventory = medicine.inventoryItems[0];
        if (inventory) {
          const itemValue = medicine.price * inventory.quantity;
          totalValue += itemValue;

          if (inventory.quantity <= inventory.reorderPoint && inventory.quantity > 0) {
            lowStockItems++;
          } else if (inventory.quantity === 0) {
            outOfStockItems++;
          }

          if (medicine.expiryDate <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) {
            expiringItems++;
          }
        }
      });

      // Get category breakdown
      const categoryStats = await prisma.category.findMany({
        include: {
          medicines: {
            where: { isActive: true },
            include: {
              inventoryItems: true
            }
          }
        }
      });

      const categories = categoryStats.map(category => {
        const count = category.medicines.length;
        const value = category.medicines.reduce((sum, medicine) => {
          const inventory = medicine.inventoryItems[0];
          return sum + (inventory ? medicine.price * inventory.quantity : 0);
        }, 0);

        return {
          name: category.name,
          count,
          value
        };
      });

      return {
        totalItems: totalItems._sum.quantity || 0,
        totalValue,
        lowStockItems,
        outOfStockItems,
        expiringItems,
        categories
      };
    } catch (error) {
      logger.error('Get inventory stats error:', error);
      throw error;
    }
  }

  /**
   * Adjust inventory with reason
   */
  async adjustInventory(medicineId: string, adjustment: InventoryAdjustment): Promise<IInventoryItem> {
    try {
      // Check if medicine exists
      const medicine = await prisma.medicine.findUnique({
        where: { id: medicineId }
      });

      if (!medicine) {
        throw new Error('Medicine not found');
      }

      // Get inventory item
      let inventoryItem = await prisma.inventoryItem.findFirst({
        where: { medicineId }
      });

      if (!inventoryItem) {
        inventoryItem = await prisma.inventoryItem.create({
          data: {
            medicineId,
            quantity: 0,
            reorderPoint: 10,
            maxStock: 1000,
            location: 'Main Storage',
            status: 'IN_STOCK',
            lastUpdated: new Date()
          }
        });
      }

      // Calculate new quantity
      const newQuantity = Math.max(0, inventoryItem.quantity + adjustment.quantity);

      // Update inventory
      const updatedInventory = await prisma.inventoryItem.update({
        where: { id: inventoryItem.id },
        data: {
          quantity: newQuantity,
          status: this.determineInventoryStatus(newQuantity, inventoryItem.reorderPoint),
          lastUpdated: new Date()
        }
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          entityType: 'INVENTORY',
          entityId: inventoryItem.id,
          action: 'ADJUSTMENT',
          userId: 'system', // TODO: Get from context
          oldValue: inventoryItem.quantity.toString(),
          newValue: newQuantity.toString(),
          details: JSON.stringify({
            reason: adjustment.reason,
            reference: adjustment.reference,
            notes: adjustment.notes
          }),
          timestamp: new Date()
        }
      });

      logger.info(`Inventory adjusted for ${medicine.name}: ${adjustment.quantity}, reason: ${adjustment.reason}`);
      return updatedInventory;
    } catch (error) {
      logger.error('Adjust inventory error:', error);
      throw error;
    }
  }

  /**
   * Transfer inventory between locations
   */
  async transferInventory(fromId: string, toId: string, quantity: number): Promise<boolean> {
    try {
      // Check if source inventory exists and has enough stock
      const sourceInventory = await prisma.inventoryItem.findUnique({
        where: { id: fromId },
        include: { medicine: true }
      });

      if (!sourceInventory) {
        throw new Error('Source inventory not found');
      }

      if (sourceInventory.quantity < quantity) {
        throw new Error('Insufficient stock for transfer');
      }

      // Check if destination inventory exists
      const destInventory = await prisma.inventoryItem.findUnique({
        where: { id: toId },
        include: { medicine: true }
      });

      if (!destInventory) {
        throw new Error('Destination inventory not found');
      }

      // Check if medicines are the same
      if (sourceInventory.medicineId !== destInventory.medicineId) {
        throw new Error('Cannot transfer between different medicines');
      }

      // Perform transfer using transaction
      await prisma.$transaction(async (tx) => {
        // Reduce source inventory
        await tx.inventoryItem.update({
          where: { id: fromId },
          data: {
            quantity: sourceInventory.quantity - quantity,
            status: this.determineInventoryStatus(
              sourceInventory.quantity - quantity,
              sourceInventory.reorderPoint
            ),
            lastUpdated: new Date()
          }
        });

        // Increase destination inventory
        await tx.inventoryItem.update({
          where: { id: toId },
          data: {
            quantity: destInventory.quantity + quantity,
            status: this.determineInventoryStatus(
              destInventory.quantity + quantity,
              destInventory.reorderPoint
            ),
            lastUpdated: new Date()
          }
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            entityType: 'INVENTORY',
            entityId: sourceInventory.id,
            action: 'TRANSFER',
            userId: 'system', // TODO: Get from context
            oldValue: sourceInventory.quantity.toString(),
            newValue: (sourceInventory.quantity - quantity).toString(),
            details: JSON.stringify({
              transferType: 'OUT',
              destination: destInventory.location,
              quantity
            }),
            timestamp: new Date()
          }
        });

        await tx.auditLog.create({
          data: {
            entityType: 'INVENTORY',
            entityId: destInventory.id,
            action: 'TRANSFER',
            userId: 'system', // TODO: Get from context
            oldValue: destInventory.quantity.toString(),
            newValue: (destInventory.quantity + quantity).toString(),
            details: JSON.stringify({
              transferType: 'IN',
              source: sourceInventory.location,
              quantity
            }),
            timestamp: new Date()
          }
        });
      });

      logger.info(`Inventory transferred: ${quantity} units from ${sourceInventory.location} to ${destInventory.location}`);
      return true;
    } catch (error) {
      logger.error('Transfer inventory error:', error);
      throw error;
    }
  }

  // Private helper methods

  private validateMedicineData(medicineData: IMedicineCreate): { success: boolean; error?: string } {
    if (!medicineData.name || !medicineData.sku || !medicineData.price || !medicineData.cost) {
      return { success: false, error: 'Required fields missing' };
    }

    if (medicineData.price <= 0 || medicineData.cost <= 0) {
      return { success: false, error: 'Price and cost must be positive' };
    }

    if (medicineData.price < medicineData.cost) {
      return { success: false, error: 'Price cannot be less than cost' };
    }

    if (medicineData.expiryDate && new Date(medicineData.expiryDate) <= new Date()) {
      return { success: false, error: 'Expiry date must be in the future' };
    }

    return { success: true };
  }

  private determineInventoryStatus(quantity: number, reorderPoint: number): string {
    if (quantity === 0) {
      return 'OUT_OF_STOCK';
    } else if (quantity <= reorderPoint) {
      return 'LOW_STOCK';
    } else {
      return 'IN_STOCK';
    }
  }
}

// Create and export service instance
export const inventoryService = new InventoryService();

// Export individual methods for convenience
export const {
  addMedicine,
  updateMedicine,
  removeMedicine,
  getMedicine,
  searchMedicines,
  updateStock,
  checkLowStock,
  getExpiringMedicines,
  getInventoryStats,
  adjustInventory,
  transferInventory
} = inventoryService;
