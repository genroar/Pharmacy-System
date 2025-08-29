import { prisma } from '@/database';
import { logger } from '@/utils/logger';
import {
  IUserRepository,
  RepositoryOptions,
  PaginatedRepositoryResult,
  SearchRepositoryResult,
  RepositoryResult
} from './types';
import {
  IUser,
  ISearchFilters,
  IPaginationOptions,
  ISearchResult,
  buildSearchQuery,
  buildPaginationQuery,
  createSearchResult
} from '@/models';

export class UserRepository implements IUserRepository {
  async create(data: Partial<IUser>): Promise<IUser> {
    try {
      const user = await prisma.user.create({
        data: data as any
      });
      logger.info(`User created: ${user.id}`);
      return user as IUser;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<IUser | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id }
      });
      return user as IUser | null;
    } catch (error) {
      logger.error(`Error finding user by ID ${id}:`, error);
      throw error;
    }
  }

  async findOne(filter: Partial<IUser>): Promise<IUser | null> {
    try {
      const user = await prisma.user.findFirst({
        where: filter as any
      });
      return user as IUser | null;
    } catch (error) {
      logger.error('Error finding user:', error);
      throw error;
    }
  }

  async findMany(filter?: Partial<IUser>, options?: RepositoryOptions): Promise<IUser[]> {
    try {
      const users = await prisma.user.findMany({
        where: filter as any,
        ...buildPaginationQuery(options?.pagination),
        orderBy: options?.orderBy ? { [options.orderBy.field]: options.orderBy.direction } : undefined,
        select: options?.select ? options.select.reduce((acc, field) => ({ ...acc, [field]: true }), {}) : undefined
      });
      return users as IUser[];
    } catch (error) {
      logger.error('Error finding users:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<IUser>): Promise<IUser> {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: data as any
      });
      logger.info(`User updated: ${id}`);
      return user as IUser;
    } catch (error) {
      logger.error(`Error updating user ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.user.delete({
        where: { id }
      });
      logger.info(`User deleted: ${id}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const count = await prisma.user.count({
        where: { id }
      });
      return count > 0;
    } catch (error) {
      logger.error(`Error checking user existence ${id}:`, error);
      throw error;
    }
  }

  async count(filter?: Partial<IUser>): Promise<number> {
    try {
      return await prisma.user.count({
        where: filter as any
      });
    } catch (error) {
      logger.error('Error counting users:', error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<IUser | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });
      return user as IUser | null;
    } catch (error) {
      logger.error(`Error finding user by email ${email}:`, error);
      throw error;
    }
  }

  async findByPhone(phone: string): Promise<IUser | null> {
    try {
      const user = await prisma.user.findFirst({
        where: { phone }
      });
      return user as IUser | null;
    } catch (error) {
      logger.error(`Error finding user by phone ${phone}:`, error);
      throw error;
    }
  }

  async findByRole(role: string): Promise<IUser[]> {
    try {
      const users = await prisma.user.findMany({
        where: { role }
      });
      return users as IUser[];
    } catch (error) {
      logger.error(`Error finding users by role ${role}:`, error);
      throw error;
    }
  }

  async findByStatus(status: string): Promise<IUser[]> {
    try {
      const users = await prisma.user.findMany({
        where: { status }
      });
      return users as IUser[];
    } catch (error) {
      logger.error(`Error finding users by status ${status}:`, error);
      throw error;
    }
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<boolean> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
      });
      logger.info(`Password updated for user: ${userId}`);
      return true;
    } catch (error) {
      logger.error(`Error updating password for user ${userId}:`, error);
      throw error;
    }
  }

  async updateLastLogin(userId: string): Promise<boolean> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { lastLogin: new Date() }
      });
      return true;
    } catch (error) {
      logger.error(`Error updating last login for user ${userId}:`, error);
      throw error;
    }
  }

  async deactivateUser(userId: string): Promise<boolean> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { status: 'inactive' }
      });
      logger.info(`User deactivated: ${userId}`);
      return true;
    } catch (error) {
      logger.error(`Error deactivating user ${userId}:`, error);
      throw error;
    }
  }

  async reactivateUser(userId: string): Promise<boolean> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { status: 'active' }
      });
      logger.info(`User reactivated: ${userId}`);
      return true;
    } catch (error) {
      logger.error(`Error reactivating user ${userId}:`, error);
      throw error;
    }
  }

  async getUsersByRole(role: string, options?: RepositoryOptions): Promise<PaginatedRepositoryResult<IUser>> {
    try {
      const { page = 1, limit = 10 } = options?.pagination || {};
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: { role },
          skip,
          take: limit,
          orderBy: options?.orderBy ? { [options.orderBy.field]: options.orderBy.direction } : { createdAt: 'desc' }
        }),
        prisma.user.count({ where: { role } })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: users as IUser[],
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      logger.error(`Error getting users by role ${role}:`, error);
      return {
        success: false,
        error: 'Failed to get users by role'
      };
    }
  }

  async searchUsers(query: string, filters?: ISearchFilters, options?: RepositoryOptions): Promise<SearchRepositoryResult<IUser>> {
    try {
      const searchQuery = buildSearchQuery(query, filters);
      const { page = 1, limit = 10 } = options?.pagination || {};
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
              { phone: { contains: query, mode: 'insensitive' } }
            ],
            ...searchQuery
          },
          skip,
          take: limit,
          orderBy: options?.orderBy ? { [options.orderBy.field]: options.orderBy.direction } : { createdAt: 'desc' }
        }),
        prisma.user.count({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
              { phone: { contains: query, mode: 'insensitive' } }
            ],
            ...searchQuery
          }
        })
      ]);

      const searchResult = createSearchResult(users as IUser[], total, page, limit, query, filters);

      return {
        success: true,
        data: users as IUser[],
        search: {
          query,
          filters: filters || {},
          results: users as IUser[],
          total,
          suggestions: this.generateSuggestions(query, users as IUser[])
        }
      };
    } catch (error) {
      logger.error('Error searching users:', error);
      return {
        success: false,
        error: 'Failed to search users'
      };
    }
  }

  private generateSuggestions(query: string, users: IUser[]): string[] {
    const suggestions: string[] = [];
    const queryLower = query.toLowerCase();

    users.forEach(user => {
      if (user.name && user.name.toLowerCase().includes(queryLower)) {
        suggestions.push(user.name);
      }
      if (user.email && user.email.toLowerCase().includes(queryLower)) {
        suggestions.push(user.email);
      }
    });

    return [...new Set(suggestions)].slice(0, 5);
  }
}

export const userRepository = new UserRepository();
export const {
  create,
  findById,
  findOne,
  findMany,
  update,
  delete: deleteUser,
  exists,
  count,
  findByEmail,
  findByPhone,
  findByRole,
  findByStatus,
  updatePassword,
  updateLastLogin,
  deactivateUser,
  reactivateUser,
  getUsersByRole,
  searchUsers
} = userRepository;
