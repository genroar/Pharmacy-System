import { prisma } from '@/database';
import { logger } from '@/utils/logger';
import {
  ISupplierRepository,
  RepositoryOptions,
  PaginatedRepositoryResult,
  SearchRepositoryResult
} from './types';
import {
  ISupplier,
  IMedicine,
  ISearchFilters,
  IPaginationOptions,
  buildSearchQuery,
  buildPaginationQuery,
  createSearchResult
} from '@/models';

export class SupplierRepository implements ISupplierRepository {
  async create(data: Partial<ISupplier>): Promise<ISupplier> {
    try {
      const supplier = await prisma.supplier.create({
        data: data as any
      });
      logger.info(`Supplier created: ${supplier.id}`);
      return supplier as ISupplier;
    } catch (error) {
      logger.error('Error creating supplier:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<ISupplier | null> {
    try {
      const supplier = await prisma.supplier.findUnique({
        where: { id }
      });
      return supplier as ISupplier | null;
    } catch (error) {
      logger.error(`Error finding supplier by ID ${id}:`, error);
      throw error;
    }
  }

  async findOne(filter: Partial<ISupplier>): Promise<ISupplier | null> {
    try {
      const supplier = await prisma.supplier.findFirst({
        where: filter as any
      });
      return supplier as ISupplier | null;
    } catch (error) {
      logger.error('Error finding supplier:', error);
      throw error;
    }
  }

  async findMany(filter?: Partial<ISupplier>, options?: RepositoryOptions): Promise<ISupplier[]> {
    try {
      const suppliers = await prisma.supplier.findMany({
        where: filter as any,
        ...buildPaginationQuery(options?.pagination),
        orderBy: options?.orderBy ? { [options.orderBy.field]: options.orderBy.direction } : undefined,
        select: options?.select ? options.select.reduce((acc, field) => ({ ...acc, [field]: true }), {}) : undefined
      });
      return suppliers as ISupplier[];
    } catch (error) {
      logger.error('Error finding suppliers:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<ISupplier>): Promise<ISupplier> {
    try {
      const supplier = await prisma.supplier.update({
        where: { id },
        data: data as any
      });
      logger.info(`Supplier updated: ${id}`);
      return supplier as ISupplier;
    } catch (error) {
      logger.error(`Error updating supplier ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.supplier.delete({
        where: { id }
      });
      logger.info(`Supplier deleted: ${id}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting supplier ${id}:`, error);
      throw error;
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const count = await prisma.supplier.count({
        where: { id }
      });
      return count > 0;
    } catch (error) {
      logger.error(`Error checking supplier existence ${id}:`, error);
      throw error;
    }
  }

  async count(filter?: Partial<ISupplier>): Promise<number> {
    try {
      return await prisma.supplier.count({
        where: filter as any
      });
    } catch (error) {
      logger.error('Error counting suppliers:', error);
      throw error;
    }
  }

  async findByName(name: string): Promise<ISupplier[]> {
    try {
      const suppliers = await prisma.supplier.findMany({
        where: {
          name: {
            contains: name,
            mode: 'insensitive'
          }
        }
      });
      return suppliers as ISupplier[];
    } catch (error) {
      logger.error(`Error finding suppliers by name ${name}:`, error);
      throw error;
    }
  }

  async findByCategory(category: string): Promise<ISupplier[]> {
    try {
      const suppliers = await prisma.supplier.findMany({
        where: { category }
      });
      return suppliers as ISupplier[];
    } catch (error) {
      logger.error(`Error finding suppliers by category ${category}:`, error);
      throw error;
    }
  }

  async findByLocation(location: string): Promise<ISupplier[]> {
    try {
      const suppliers = await prisma.supplier.findMany({
        where: {
          OR: [
            { city: { contains: location, mode: 'insensitive' } },
            { state: { contains: location, mode: 'insensitive' } },
            { country: { contains: location, mode: 'insensitive' } }
          ]
        }
      });
      return suppliers as ISupplier[];
    } catch (error) {
      logger.error(`Error finding suppliers by location ${location}:`, error);
      throw error;
    }
  }

  async findActiveSuppliers(): Promise<ISupplier[]> {
    try {
      const suppliers = await prisma.supplier.findMany({
        where: { status: 'active' }
      });
      return suppliers as ISupplier[];
    } catch (error) {
      logger.error('Error finding active suppliers:', error);
      throw error;
    }
  }

  async findInactiveSuppliers(): Promise<ISupplier[]> {
    try {
      const suppliers = await prisma.supplier.findMany({
        where: { status: 'inactive' }
      });
      return suppliers as ISupplier[];
    } catch (error) {
      logger.error('Error finding inactive suppliers:', error);
      throw error;
    }
  }

  async updateContactInfo(supplierId: string, contactInfo: any): Promise<boolean> {
    try {
      await prisma.supplier.update({
        where: { id: supplierId },
        data: {
          email: contactInfo.email,
          phone: contactInfo.phone,
          address: contactInfo.address,
          city: contactInfo.city,
          state: contactInfo.state,
          country: contactInfo.country,
          postalCode: contactInfo.postalCode
        }
      });
      logger.info(`Contact info updated for supplier: ${supplierId}`);
      return true;
    } catch (error) {
      logger.error(`Error updating contact info for supplier ${supplierId}:`, error);
      throw error;
    }
  }

  async updateRating(supplierId: string, rating: number): Promise<boolean> {
    try {
      await prisma.supplier.update({
        where: { id: supplierId },
        data: { rating }
      });
      logger.info(`Rating updated for supplier: ${supplierId} -> ${rating}`);
      return true;
    } catch (error) {
      logger.error(`Error updating rating for supplier ${supplierId}:`, error);
      throw error;
    }
  }

  async getSupplierWithMedicines(supplierId: string): Promise<ISupplier & { medicines: IMedicine[] }> {
    try {
      const supplier = await prisma.supplier.findUnique({
        where: { id: supplierId },
        include: {
          medicines: true
        }
      });
      return supplier as ISupplier & { medicines: IMedicine[] };
    } catch (error) {
      logger.error(`Error getting supplier with medicines ${supplierId}:`, error);
      throw error;
    }
  }

  async searchSuppliers(query: string, filters?: ISearchFilters, options?: RepositoryOptions): Promise<SearchRepositoryResult<ISupplier>> {
    try {
      const searchQuery = buildSearchQuery(query, filters);
      const { page = 1, limit = 10 } = options?.pagination || {};
      const skip = (page - 1) * limit;

      const [suppliers, total] = await Promise.all([
        prisma.supplier.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { category: { contains: query, mode: 'insensitive' } },
              { city: { contains: query, mode: 'insensitive' } },
              { state: { contains: query, mode: 'insensitive' } },
              { country: { contains: query, mode: 'insensitive' } }
            ],
            ...searchQuery
          },
          skip,
          take: limit,
          orderBy: options?.orderBy ? { [options.orderBy.field]: options.orderBy.direction } : { name: 'asc' }
        }),
        prisma.supplier.count({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { category: { contains: query, mode: 'insensitive' } },
              { city: { contains: query, mode: 'insensitive' } },
              { state: { contains: query, mode: 'insensitive' } },
              { country: { contains: query, mode: 'insensitive' } }
            ],
            ...searchQuery
          }
        })
      ]);

      const searchResult = createSearchResult(suppliers as ISupplier[], total, page, limit, query, filters);

      return {
        success: true,
        data: suppliers as ISupplier[],
        search: {
          query,
          filters: filters || {},
          results: suppliers as ISupplier[],
          total,
          suggestions: this.generateSuggestions(query, suppliers as ISupplier[])
        }
      };
    } catch (error) {
      logger.error('Error searching suppliers:', error);
      return {
        success: false,
        error: 'Failed to search suppliers'
      };
    }
  }

  async getSuppliersByCategory(category: string, options?: RepositoryOptions): Promise<PaginatedRepositoryResult<ISupplier>> {
    try {
      const { page = 1, limit = 10 } = options?.pagination || {};
      const skip = (page - 1) * limit;

      const [suppliers, total] = await Promise.all([
        prisma.supplier.findMany({
          where: { category },
          skip,
          take: limit,
          orderBy: options?.orderBy ? { [options.orderBy.field]: options.orderBy.direction } : { name: 'asc' }
        }),
        prisma.supplier.count({ where: { category } })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: suppliers as ISupplier[],
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      logger.error(`Error getting suppliers by category ${category}:`, error);
      return {
        success: false,
        error: 'Failed to get suppliers by category'
      };
    }
  }

  private generateSuggestions(query: string, suppliers: ISupplier[]): string[] {
    const suggestions: string[] = [];
    const queryLower = query.toLowerCase();

    suppliers.forEach(supplier => {
      if (supplier.name && supplier.name.toLowerCase().includes(queryLower)) {
        suggestions.push(supplier.name);
      }
      if (supplier.category && supplier.category.toLowerCase().includes(queryLower)) {
        suggestions.push(supplier.category);
      }
      if (supplier.city && supplier.city.toLowerCase().includes(queryLower)) {
        suggestions.push(supplier.city);
      }
      if (supplier.state && supplier.state.toLowerCase().includes(queryLower)) {
        suggestions.push(supplier.state);
      }
    });

    return [...new Set(suggestions)].slice(0, 5);
  }
}

export const supplierRepository = new SupplierRepository();
export const {
  create,
  findById,
  findOne,
  findMany,
  update,
  delete: deleteSupplier,
  exists,
  count,
  findByName,
  findByCategory,
  findByLocation,
  findActiveSuppliers,
  findInactiveSuppliers,
  updateContactInfo,
  updateRating,
  getSupplierWithMedicines,
  searchSuppliers,
  getSuppliersByCategory
} = supplierRepository;
