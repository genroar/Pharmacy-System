import { prisma } from '@/database';
import { logger } from '@/utils/logger';
import {
  IInventoryRepository,
  RepositoryOptions,
  PaginatedRepositoryResult,
  SearchRepositoryResult
} from './types';
import {
  IInventoryItem,
  IMedicine,
  ISearchFilters,
  IPaginationOptions,
  buildSearchQuery,
  buildPaginationQuery,
  createSearchResult
} from '@/models';

export class InventoryRepository implements IInventoryRepository {
  async create(data: Partial<IInventoryItem>): Promise<IInventoryItem> {
    try {
      const inventoryItem = await prisma.inventoryItem.create({
        data: data as any
      });
      logger.info(`Inventory item created: ${inventoryItem.id}`);
      return inventoryItem as IInventoryItem;
    } catch (error) {
      logger.error('Error creating inventory item:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<IInventoryItem | null> {
    try {
      const inventoryItem = await prisma.inventoryItem.findUnique({
        where: { id }
      });
      return inventoryItem as IInventoryItem | null;
    } catch (error) {
      logger.error(`Error finding inventory item by ID ${id}:`, error);
      throw error;
    }
  }

  async findOne(filter: Partial<IInventoryItem>): Promise<IInventoryItem | null> {
    try {
      const inventoryItem = await prisma.inventoryItem.findFirst({
        where: filter as any
      });
      return inventoryItem as IInventoryItem | null;
    } catch (error) {
      logger.error('Error finding inventory item:', error);
      throw error;
    }
  }

  async findMany(filter?: Partial<IInventoryItem>, options?: RepositoryOptions): Promise<IInventoryItem[]> {
    try {
      const inventoryItems = await prisma.inventoryItem.findMany({
        where: filter as any,
        ...buildPaginationQuery(options?.pagination),
        orderBy: options?.orderBy ? { [options.orderBy.field]: options.orderBy.direction } : undefined,
        select: options?.select ? options.select.reduce((acc, field) => ({ ...acc, [field]: true }), {}) : undefined
      });
      return inventoryItems as IInventoryItem[];
    } catch (error) {
      logger.error('Error finding inventory items:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<IInventoryItem>): Promise<IInventoryItem> {
    try {
      const inventoryItem = await prisma.inventoryItem.update({
        where: { id },
        data: data as any
      });
      logger.info(`Inventory item updated: ${id}`);
      return inventoryItem as IInventoryItem;
    } catch (error) {
      logger.error(`Error updating inventory item ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.inventoryItem.delete({
        where: { id }
      });
      logger.info(`Inventory item deleted: ${id}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting inventory item ${id}:`, error);
      throw error;
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const count = await prisma.inventoryItem.count({
        where: { id }
      });
      return count > 0;
    } catch (error) {
      logger.error(`Error checking inventory item existence ${id}:`, error);
      throw error;
    }
  }

  async count(filter?: Partial<IInventoryItem>): Promise<number> {
    try {
      return await prisma.inventoryItem.count({
        where: filter as any
      });
    } catch (error) {
      logger.error('Error counting inventory items:', error);
      throw error;
    }
  }

  async findByMedicine(medicineId: string): Promise<IInventoryItem | null> {
    try {
      const inventoryItem = await prisma.inventoryItem.findFirst({
        where: { medicineId }
      });
      return inventoryItem as IInventoryItem | null;
    } catch (error) {
      logger.error(`Error finding inventory item by medicine ${medicineId}:`, error);
      throw error;
    }
  }

  async findByLocation(location: string): Promise<IInventoryItem[]> {
    try {
      const inventoryItems = await prisma.inventoryItem.findMany({
        where: { location }
      });
      return inventoryItems as IInventoryItem[];
    } catch (error) {
      logger.error(`Error finding inventory items by location ${location}:`, error);
      throw error;
    }
  }

  async findByStatus(status: string): Promise<IInventoryItem[]> {
    try {
      const inventoryItems = await prisma.inventoryItem.findMany({
        where: { status }
      });
      return inventoryItems as IInventoryItem[];
    } catch (error) {
      logger.error(`Error finding inventory items by status ${status}:`, error);
      throw error;
    }
  }

  async findLowStockItems(threshold: number): Promise<IInventoryItem[]> {
    try {
      const inventoryItems = await prisma.inventoryItem.findMany({
        where: {
          quantity: {
            lte: threshold
          }
        }
      });
      return inventoryItems as IInventoryItem[];
    } catch (error) {
      logger.error(`Error finding low stock items with threshold ${threshold}:`, error);
      throw error;
    }
  }

  async findExpiringItems(days: number): Promise<IInventoryItem[]> {
    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + days);

      const inventoryItems = await prisma.inventoryItem.findMany({
        where: {
          expiryDate: {
            lte: expiryDate
          }
        }
      });
      return inventoryItems as IInventoryItem[];
    } catch (error) {
      logger.error(`Error finding expiring items in ${days} days:`, error);
      throw error;
    }
  }

  async findOutOfStockItems(): Promise<IInventoryItem[]> {
    try {
      const inventoryItems = await prisma.inventoryItem.findMany({
        where: {
          quantity: {
            lte: 0
          }
        }
      });
      return inventoryItems as IInventoryItem[];
    } catch (error) {
      logger.error('Error finding out of stock items:', error);
      throw error;
    }
  }

  async updateQuantity(itemId: string, quantity: number): Promise<boolean> {
    try {
      await prisma.inventoryItem.update({
        where: { id: itemId },
        data: { quantity }
      });
      logger.info(`Quantity updated for inventory item ${itemId}: ${quantity}`);
      return true;
    } catch (error) {
      logger.error(`Error updating quantity for inventory item ${itemId}:`, error);
      throw error;
    }
  }

  async updateLocation(itemId: string, location: string): Promise<boolean> {
    try {
      await prisma.inventoryItem.update({
        where: { id: itemId },
        data: { location }
      });
      logger.info(`Location updated for inventory item ${itemId}: ${location}`);
      return true;
    } catch (error) {
      logger.error(`Error updating location for inventory item ${itemId}:`, error);
      throw error;
    }
  }

  async updateStatus(itemId: string, status: string): Promise<boolean> {
    try {
      await prisma.inventoryItem.update({
        where: { id: itemId },
        data: { status }
      });
      logger.info(`Status updated for inventory item ${itemId}: ${status}`);
      return true;
    } catch (error) {
      logger.error(`Error updating status for inventory item ${itemId}:`, error);
      throw error;
    }
  }

  async getInventoryWithMedicine(itemId: string): Promise<IInventoryItem & { medicine: IMedicine }> {
    try {
      const inventoryItem = await prisma.inventoryItem.findUnique({
        where: { id: itemId },
        include: {
          medicine: true
        }
      });
      return inventoryItem as IInventoryItem & { medicine: IMedicine };
    } catch (error) {
      logger.error(`Error getting inventory item with medicine ${itemId}:`, error);
      throw error;
    }
  }

  async getInventoryStats(): Promise<{
    totalItems: number;
    lowStockItems: number;
    outOfStockItems: number;
    expiringItems: number;
    totalValue: number;
  }> {
    try {
      const [
        totalItems,
        lowStockItems,
        outOfStockItems,
        expiringItems,
        totalValue
      ] = await Promise.all([
        prisma.inventoryItem.count(),
        prisma.inventoryItem.count({
          where: {
            quantity: {
              lte: 10 // Low stock threshold
            }
          }
        }),
        prisma.inventoryItem.count({
          where: {
            quantity: {
              lte: 0
            }
          }
        }),
        prisma.inventoryItem.count({
          where: {
            expiryDate: {
              lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
            }
          }
        }),
        prisma.inventoryItem.aggregate({
          _sum: {
            value: true
          }
        })
      ]);

      return {
        totalItems,
        lowStockItems,
        outOfStockItems,
        expiringItems,
        totalValue: totalValue._sum.value || 0
      };
    } catch (error) {
      logger.error('Error getting inventory stats:', error);
      throw error;
    }
  }

  async searchInventory(query: string, filters?: ISearchFilters, options?: RepositoryOptions): Promise<SearchRepositoryResult<IInventoryItem>> {
    try {
      const searchQuery = buildSearchQuery(query, filters);
      const { page = 1, limit = 10 } = options?.pagination || {};
      const skip = (page - 1) * limit;

      const [inventoryItems, total] = await Promise.all([
        prisma.inventoryItem.findMany({
          where: {
            OR: [
              { location: { contains: query, mode: 'insensitive' } },
              { status: { contains: query, mode: 'insensitive' } },
              { medicine: { name: { contains: query, mode: 'insensitive' } } }
            ],
            ...searchQuery
          },
          include: {
            medicine: true
          },
          skip,
          take: limit,
          orderBy: options?.orderBy ? { [options.orderBy.field]: options.orderBy.direction } : { createdAt: 'desc' }
        }),
        prisma.inventoryItem.count({
          where: {
            OR: [
              { location: { contains: query, mode: 'insensitive' } },
              { status: { contains: query, mode: 'insensitive' } },
              { medicine: { name: { contains: query, mode: 'insensitive' } } }
            ],
            ...searchQuery
          }
        })
      ]);

      const searchResult = createSearchResult(inventoryItems as IInventoryItem[], total, page, limit, query, filters);

      return {
        success: true,
        data: inventoryItems as IInventoryItem[],
        search: {
          query,
          filters: filters || {},
          results: inventoryItems as IInventoryItem[],
          total,
          suggestions: this.generateSuggestions(query, inventoryItems as IInventoryItem[])
        }
      };
    } catch (error) {
      logger.error('Error searching inventory:', error);
      return {
        success: false,
        error: 'Failed to search inventory'
      };
    }
  }

  async getInventoryByLocation(location: string, options?: RepositoryOptions): Promise<PaginatedRepositoryResult<IInventoryItem>> {
    try {
      const { page = 1, limit = 10 } = options?.pagination || {};
      const skip = (page - 1) * limit;

      const [inventoryItems, total] = await Promise.all([
        prisma.inventoryItem.findMany({
          where: { location },
          include: {
            medicine: true
          },
          skip,
          take: limit,
          orderBy: options?.orderBy ? { [options.orderBy.field]: options.orderBy.direction } : { createdAt: 'desc' }
        }),
        prisma.inventoryItem.count({ where: { location } })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: inventoryItems as IInventoryItem[],
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      logger.error(`Error getting inventory by location ${location}:`, error);
      return {
        success: false,
        error: 'Failed to get inventory by location'
      };
    }
  }

  private generateSuggestions(query: string, inventoryItems: IInventoryItem[]): string[] {
    const suggestions: string[] = [];
    const queryLower = query.toLowerCase();

    inventoryItems.forEach(item => {
      if (item.location && item.location.toLowerCase().includes(queryLower)) {
        suggestions.push(item.location);
      }
      if (item.status && item.status.toLowerCase().includes(queryLower)) {
        suggestions.push(item.status);
      }
      if (item.medicine && item.medicine.name && item.medicine.name.toLowerCase().includes(queryLower)) {
        suggestions.push(item.medicine.name);
      }
    });

    return [...new Set(suggestions)].slice(0, 5);
  }
}

export const inventoryRepository = new InventoryRepository();
export const {
  create,
  findById,
  findOne,
  findMany,
  update,
  delete: deleteInventoryItem,
  exists,
  count,
  findByMedicine,
  findByLocation,
  findByStatus,
  findLowStockItems,
  findExpiringItems,
  findOutOfStockItems,
  updateQuantity,
  updateLocation,
  updateStatus,
  getInventoryWithMedicine,
  getInventoryStats,
  searchInventory,
  getInventoryByLocation
} = inventoryRepository;
