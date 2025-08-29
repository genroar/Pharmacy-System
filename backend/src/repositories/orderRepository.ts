import { prisma } from '@/database';
import { logger } from '@/utils/logger';
import {
  IOrderRepository,
  RepositoryOptions,
  PaginatedRepositoryResult,
  SearchRepositoryResult
} from './types';
import {
  IOrder,
  IOrderItem,
  ISearchFilters,
  IPaginationOptions,
  buildSearchQuery,
  buildPaginationQuery,
  createSearchResult
} from '@/models';

export class OrderRepository implements IOrderRepository {
  async create(data: Partial<IOrder>): Promise<IOrder> {
    try {
      const order = await prisma.order.create({
        data: data as any
      });
      logger.info(`Order created: ${order.id}`);
      return order as IOrder;
    } catch (error) {
      logger.error('Error creating order:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<IOrder | null> {
    try {
      const order = await prisma.order.findUnique({
        where: { id }
      });
      return order as IOrder | null;
    } catch (error) {
      logger.error(`Error finding order by ID ${id}:`, error);
      throw error;
    }
  }

  async findOne(filter: Partial<IOrder>): Promise<IOrder | null> {
    try {
      const order = await prisma.order.findFirst({
        where: filter as any
      });
      return order as IOrder | null;
    } catch (error) {
      logger.error('Error finding order:', error);
      throw error;
    }
  }

  async findMany(filter?: Partial<IOrder>, options?: RepositoryOptions): Promise<IOrder[]> {
    try {
      const orders = await prisma.order.findMany({
        where: filter as any,
        ...buildPaginationQuery(options?.pagination),
        orderBy: options?.orderBy ? { [options.orderBy.field]: options.orderBy.direction } : undefined,
        select: options?.select ? options.select.reduce((acc, field) => ({ ...acc, [field]: true }), {}) : undefined
      });
      return orders as IOrder[];
    } catch (error) {
      logger.error('Error finding orders:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<IOrder>): Promise<IOrder> {
    try {
      const order = await prisma.order.update({
        where: { id },
        data: data as any
      });
      logger.info(`Order updated: ${id}`);
      return order as IOrder;
    } catch (error) {
      logger.error(`Error updating order ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.order.delete({
        where: { id }
      });
      logger.info(`Order deleted: ${id}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting order ${id}:`, error);
      throw error;
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const count = await prisma.order.count({
        where: { id }
      });
      return count > 0;
    } catch (error) {
      logger.error(`Error checking order existence ${id}:`, error);
      throw error;
    }
  }

  async count(filter?: Partial<IOrder>): Promise<number> {
    try {
      return await prisma.order.count({
        where: filter as any
      });
    } catch (error) {
      logger.error('Error counting orders:', error);
      throw error;
    }
  }

  async findByCustomer(customerId: string): Promise<IOrder[]> {
    try {
      const orders = await prisma.order.findMany({
        where: { customerId }
      });
      return orders as IOrder[];
    } catch (error) {
      logger.error(`Error finding orders by customer ${customerId}:`, error);
      throw error;
    }
  }

  async findByStatus(status: string): Promise<IOrder[]> {
    try {
      const orders = await prisma.order.findMany({
        where: { status }
      });
      return orders as IOrder[];
    } catch (error) {
      logger.error(`Error finding orders by status ${status}:`, error);
      throw error;
    }
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<IOrder[]> {
    try {
      const orders = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      });
      return orders as IOrder[];
    } catch (error) {
      logger.error(`Error finding orders by date range ${startDate} to ${endDate}:`, error);
      throw error;
    }
  }

  async findByPaymentStatus(paymentStatus: string): Promise<IOrder[]> {
    try {
      const orders = await prisma.order.findMany({
        where: { paymentStatus }
      });
      return orders as IOrder[];
    } catch (error) {
      logger.error(`Error finding orders by payment status ${paymentStatus}:`, error);
      throw error;
    }
  }

  async findPendingOrders(): Promise<IOrder[]> {
    try {
      const orders = await prisma.order.findMany({
        where: { status: 'pending' }
      });
      return orders as IOrder[];
    } catch (error) {
      logger.error('Error finding pending orders:', error);
      throw error;
    }
  }

  async findCompletedOrders(): Promise<IOrder[]> {
    try {
      const orders = await prisma.order.findMany({
        where: { status: 'completed' }
      });
      return orders as IOrder[];
    } catch (error) {
      logger.error('Error finding completed orders:', error);
      throw error;
    }
  }

  async findCancelledOrders(): Promise<IOrder[]> {
    try {
      const orders = await prisma.order.findMany({
        where: { status: 'cancelled' }
      });
      return orders as IOrder[];
    } catch (error) {
      logger.error('Error finding cancelled orders:', error);
      throw error;
    }
  }

  async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    try {
      await prisma.order.update({
        where: { id: orderId },
        data: { status }
      });
      logger.info(`Order status updated: ${orderId} -> ${status}`);
      return true;
    } catch (error) {
      logger.error(`Error updating order status ${orderId}:`, error);
      throw error;
    }
  }

  async updatePaymentStatus(orderId: string, paymentStatus: string): Promise<boolean> {
    try {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus }
      });
      logger.info(`Payment status updated: ${orderId} -> ${paymentStatus}`);
      return true;
    } catch (error) {
      logger.error(`Error updating payment status ${orderId}:`, error);
      throw error;
    }
  }

  async getOrderWithItems(orderId: string): Promise<IOrder & { items: IOrderItem[] }> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: true
        }
      });
      return order as IOrder & { items: IOrderItem[] };
    } catch (error) {
      logger.error(`Error getting order with items ${orderId}:`, error);
      throw error;
    }
  }

  async getOrdersByCustomer(customerId: string, options?: RepositoryOptions): Promise<PaginatedRepositoryResult<IOrder>> {
    try {
      const { page = 1, limit = 10 } = options?.pagination || {};
      const skip = (page - 1) * limit;

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where: { customerId },
          skip,
          take: limit,
          orderBy: options?.orderBy ? { [options.orderBy.field]: options.orderBy.direction } : { createdAt: 'desc' }
        }),
        prisma.order.count({ where: { customerId } })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: orders as IOrder[],
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      logger.error(`Error getting orders by customer ${customerId}:`, error);
      return {
        success: false,
        error: 'Failed to get orders by customer'
      };
    }
  }

  async getOrdersByDateRange(startDate: Date, endDate: Date, options?: RepositoryOptions): Promise<PaginatedRepositoryResult<IOrder>> {
    try {
      const { page = 1, limit = 10 } = options?.pagination || {};
      const skip = (page - 1) * limit;

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          },
          skip,
          take: limit,
          orderBy: options?.orderBy ? { [options.orderBy.field]: options.orderBy.direction } : { createdAt: 'desc' }
        }),
        prisma.order.count({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          }
        })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: orders as IOrder[],
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      logger.error(`Error getting orders by date range ${startDate} to ${endDate}:`, error);
      return {
        success: false,
        error: 'Failed to get orders by date range'
      };
    }
  }

  async searchOrders(query: string, filters?: ISearchFilters, options?: RepositoryOptions): Promise<SearchRepositoryResult<IOrder>> {
    try {
      const searchQuery = buildSearchQuery(query, filters);
      const { page = 1, limit = 10 } = options?.pagination || {};
      const skip = (page - 1) * limit;

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where: {
            OR: [
              { orderNumber: { contains: query, mode: 'insensitive' } },
              { customerName: { contains: query, mode: 'insensitive' } },
              { status: { contains: query, mode: 'insensitive' } }
            ],
            ...searchQuery
          },
          skip,
          take: limit,
          orderBy: options?.orderBy ? { [options.orderBy.field]: options.orderBy.direction } : { createdAt: 'desc' }
        }),
        prisma.order.count({
          where: {
            OR: [
              { orderNumber: { contains: query, mode: 'insensitive' } },
              { customerName: { contains: query, mode: 'insensitive' } },
              { status: { contains: query, mode: 'insensitive' } }
            ],
            ...searchQuery
          }
        })
      ]);

      const searchResult = createSearchResult(orders as IOrder[], total, page, limit, query, filters);

      return {
        success: true,
        data: orders as IOrder[],
        search: {
          query,
          filters: filters || {},
          results: orders as IOrder[],
          total,
          suggestions: this.generateSuggestions(query, orders as IOrder[])
        }
      };
    } catch (error) {
      logger.error('Error searching orders:', error);
      return {
        success: false,
        error: 'Failed to search orders'
      };
    }
  }

  private generateSuggestions(query: string, orders: IOrder[]): string[] {
    const suggestions: string[] = [];
    const queryLower = query.toLowerCase();

    orders.forEach(order => {
      if (order.orderNumber && order.orderNumber.toLowerCase().includes(queryLower)) {
        suggestions.push(order.orderNumber);
      }
      if (order.customerName && order.customerName.toLowerCase().includes(queryLower)) {
        suggestions.push(order.customerName);
      }
      if (order.status && order.status.toLowerCase().includes(queryLower)) {
        suggestions.push(order.status);
      }
    });

    return [...new Set(suggestions)].slice(0, 5);
  }
}

export const orderRepository = new OrderRepository();
export const {
  create,
  findById,
  findOne,
  findMany,
  update,
  delete: deleteOrder,
  exists,
  count,
  findByCustomer,
  findByStatus,
  findByDateRange,
  findByPaymentStatus,
  findPendingOrders,
  findCompletedOrders,
  findCancelledOrders,
  updateOrderStatus,
  updatePaymentStatus,
  getOrderWithItems,
  getOrdersByCustomer,
  getOrdersByDateRange,
  searchOrders
} = orderRepository;
