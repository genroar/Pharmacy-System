import { prisma } from '@/database';
import { logger } from '@/utils/logger';
import {
  IMedicineRepository,
  RepositoryOptions,
  PaginatedRepositoryResult,
  SearchRepositoryResult
} from './types';
import {
  IMedicine,
  IInventoryItem,
  ISearchFilters,
  IPaginationOptions,
  buildSearchQuery,
  buildPaginationQuery,
  createSearchResult
} from '@/models';

export class MedicineRepository implements IMedicineRepository {
  async create(data: Partial<IMedicine>): Promise<IMedicine> {
    try {
      const medicine = await prisma.medicine.create({
        data: data as any
      });
      logger.info(`Medicine created: ${medicine.id}`);
      return medicine as IMedicine;
    } catch (error) {
      logger.error('Error creating medicine:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<IMedicine | null> {
    try {
      const medicine = await prisma.medicine.findUnique({
        where: { id }
      });
      return medicine as IMedicine | null;
    } catch (error) {
      logger.error(`Error finding medicine by ID ${id}:`, error);
      throw error;
    }
  }

  async findOne(filter: Partial<IMedicine>): Promise<IMedicine | null> {
    try {
      const medicine = await prisma.medicine.findFirst({
        where: filter as any
      });
      return medicine as IMedicine | null;
    } catch (error) {
      logger.error('Error finding medicine:', error);
      throw error;
    }
  }

  async findMany(filter?: Partial<IMedicine>, options?: RepositoryOptions): Promise<IMedicine[]> {
    try {
      const medicines = await prisma.medicine.findMany({
        where: filter as any,
        ...buildPaginationQuery(options?.pagination),
        orderBy: options?.orderBy ? { [options.orderBy.field]: options.orderBy.direction } : undefined,
        select: options?.select ? options.select.reduce((acc, field) => ({ ...acc, [field]: true }), {}) : undefined
      });
      return medicines as IMedicine[];
    } catch (error) {
      logger.error('Error finding medicines:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<IMedicine>): Promise<IMedicine> {
    try {
      const medicine = await prisma.medicine.update({
        where: { id },
        data: data as any
      });
      logger.info(`Medicine updated: ${id}`);
      return medicine as IMedicine;
    } catch (error) {
      logger.error(`Error updating medicine ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.medicine.delete({
        where: { id }
      });
      logger.info(`Medicine deleted: ${id}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting medicine ${id}:`, error);
      throw error;
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const count = await prisma.medicine.count({
        where: { id }
      });
      return count > 0;
    } catch (error) {
      logger.error(`Error checking medicine existence ${id}:`, error);
      throw error;
    }
  }

  async count(filter?: Partial<IMedicine>): Promise<number> {
    try {
      return await prisma.medicine.count({
        where: filter as any
      });
    } catch (error) {
      logger.error('Error counting medicines:', error);
      throw error;
    }
  }

  async findByName(name: string): Promise<IMedicine[]> {
    try {
      const medicines = await prisma.medicine.findMany({
        where: {
          name: {
            contains: name,
            mode: 'insensitive'
          }
        }
      });
      return medicines as IMedicine[];
    } catch (error) {
      logger.error(`Error finding medicines by name ${name}:`, error);
      throw error;
    }
  }

  async findByCategory(category: string): Promise<IMedicine[]> {
    try {
      const medicines = await prisma.medicine.findMany({
        where: { category }
      });
      return medicines as IMedicine[];
    } catch (error) {
      logger.error(`Error finding medicines by category ${category}:`, error);
      throw error;
    }
  }

  async findByManufacturer(manufacturer: string): Promise<IMedicine[]> {
    try {
      const medicines = await prisma.medicine.findMany({
        where: { manufacturer }
      });
      return medicines as IMedicine[];
    } catch (error) {
      logger.error(`Error finding medicines by manufacturer ${manufacturer}:`, error);
      throw error;
    }
  }

  async findByDosageForm(dosageForm: string): Promise<IMedicine[]> {
    try {
      const medicines = await prisma.medicine.findMany({
        where: { dosageForm }
      });
      return medicines as IMedicine[];
    } catch (error) {
      logger.error(`Error finding medicines by dosage form ${dosageForm}:`, error);
      throw error;
    }
  }

  async findBySchedule(schedule: string): Promise<IMedicine[]> {
    try {
      const medicines = await prisma.medicine.findMany({
        where: { schedule }
      });
      return medicines as IMedicine[];
    } catch (error) {
      logger.error(`Error finding medicines by schedule ${schedule}:`, error);
      throw error;
    }
  }

  async findExpiringMedicines(days: number): Promise<IMedicine[]> {
    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + days);

      const medicines = await prisma.medicine.findMany({
        where: {
          expiryDate: {
            lte: expiryDate
          }
        }
      });
      return medicines as IMedicine[];
    } catch (error) {
      logger.error(`Error finding expiring medicines in ${days} days:`, error);
      throw error;
    }
  }

  async findLowStockMedicines(threshold: number): Promise<IMedicine[]> {
    try {
      const medicines = await prisma.medicine.findMany({
        where: {
          inventory: {
            quantity: {
              lte: threshold
            }
          }
        },
        include: {
          inventory: true
        }
      });
      return medicines as IMedicine[];
    } catch (error) {
      logger.error(`Error finding low stock medicines with threshold ${threshold}:`, error);
      throw error;
    }
  }

  async updateStock(medicineId: string, quantity: number): Promise<boolean> {
    try {
      await prisma.inventoryItem.update({
        where: { medicineId },
        data: { quantity }
      });
      logger.info(`Stock updated for medicine ${medicineId}: ${quantity}`);
      return true;
    } catch (error) {
      logger.error(`Error updating stock for medicine ${medicineId}:`, error);
      throw error;
    }
  }

  async getMedicineWithInventory(medicineId: string): Promise<IMedicine & { inventory: IInventoryItem }> {
    try {
      const medicine = await prisma.medicine.findUnique({
        where: { id: medicineId },
        include: {
          inventory: true
        }
      });
      return medicine as IMedicine & { inventory: IInventoryItem };
    } catch (error) {
      logger.error(`Error getting medicine with inventory ${medicineId}:`, error);
      throw error;
    }
  }

  async searchMedicines(query: string, filters?: ISearchFilters, options?: RepositoryOptions): Promise<SearchRepositoryResult<IMedicine>> {
    try {
      const searchQuery = buildSearchQuery(query, filters);
      const { page = 1, limit = 10 } = options?.pagination || {};
      const skip = (page - 1) * limit;

      const [medicines, total] = await Promise.all([
        prisma.medicine.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { genericName: { contains: query, mode: 'insensitive' } },
              { manufacturer: { contains: query, mode: 'insensitive' } },
              { category: { contains: query, mode: 'insensitive' } }
            ],
            ...searchQuery
          },
          skip,
          take: limit,
          orderBy: options?.orderBy ? { [options.orderBy.field]: options.orderBy.direction } : { name: 'asc' }
        }),
        prisma.medicine.count({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { genericName: { contains: query, mode: 'insensitive' } },
              { manufacturer: { contains: query, mode: 'insensitive' } },
              { category: { contains: query, mode: 'insensitive' } }
            ],
            ...searchQuery
          }
        })
      ]);

      const searchResult = createSearchResult(medicines as IMedicine[], total, page, limit, query, filters);

      return {
        success: true,
        data: medicines as IMedicine[],
        search: {
          query,
          filters: filters || {},
          results: medicines as IMedicine[],
          total,
          suggestions: this.generateSuggestions(query, medicines as IMedicine[])
        }
      };
    } catch (error) {
      logger.error('Error searching medicines:', error);
      return {
        success: false,
        error: 'Failed to search medicines'
      };
    }
  }

  async getMedicinesByCategory(category: string, options?: RepositoryOptions): Promise<PaginatedRepositoryResult<IMedicine>> {
    try {
      const { page = 1, limit = 10 } = options?.pagination || {};
      const skip = (page - 1) * limit;

      const [medicines, total] = await Promise.all([
        prisma.medicine.findMany({
          where: { category },
          skip,
          take: limit,
          orderBy: options?.orderBy ? { [options.orderBy.field]: options.orderBy.direction } : { name: 'asc' }
        }),
        prisma.medicine.count({ where: { category } })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: medicines as IMedicine[],
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      logger.error(`Error getting medicines by category ${category}:`, error);
      return {
        success: false,
        error: 'Failed to get medicines by category'
      };
    }
  }

  private generateSuggestions(query: string, medicines: IMedicine[]): string[] {
    const suggestions: string[] = [];
    const queryLower = query.toLowerCase();

    medicines.forEach(medicine => {
      if (medicine.name && medicine.name.toLowerCase().includes(queryLower)) {
        suggestions.push(medicine.name);
      }
      if (medicine.genericName && medicine.genericName.toLowerCase().includes(queryLower)) {
        suggestions.push(medicine.genericName);
      }
      if (medicine.manufacturer && medicine.manufacturer.toLowerCase().includes(queryLower)) {
        suggestions.push(medicine.manufacturer);
      }
    });

    return [...new Set(suggestions)].slice(0, 5);
  }
}

export const medicineRepository = new MedicineRepository();
export const {
  create,
  findById,
  findOne,
  findMany,
  update,
  delete: deleteMedicine,
  exists,
  count,
  findByName,
  findByCategory,
  findByManufacturer,
  findByDosageForm,
  findBySchedule,
  findExpiringMedicines,
  findLowStockMedicines,
  updateStock,
  getMedicineWithInventory,
  searchMedicines,
  getMedicinesByCategory
} = medicineRepository;
