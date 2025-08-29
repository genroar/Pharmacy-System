import { prisma } from '@/database';
import { logger } from '@/utils/logger';
import {
  SalesServiceInterface,
  IOrderCreate,
  IOrderUpdate,
  OrderFilters,
  PaymentData,
  PaymentResult,
  RefundData,
  RefundResult,
  SalesPeriod,
  SalesStats,
  DiscountResult,
  ServiceResponse
} from './types';
import {
  IOrder,
  IOrderItem,
  IMedicine,
  IUser,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  calculateOrderTotal,
  calculateTaxAmount,
  calculateDiscountAmount,
  calculateFinalAmount,
  canCancelOrder,
  canRefundOrder,
  buildPaginationQuery,
  createSearchResult
} from '@/models';

export class SalesService implements SalesServiceInterface {
  /**
   * Create new order
   */
  async createOrder(orderData: IOrderCreate): Promise<IOrder> {
    try {
      // Validate order data
      const validationResult = this.validateOrderData(orderData);
      if (!validationResult.success) {
        throw new Error(validationResult.error);
      }

      // Check if customer exists
      const customer = await prisma.user.findUnique({
        where: { id: orderData.customerId }
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      // Validate and check inventory for each item
      const orderItems = [];
      let totalAmount = 0;
      let totalTax = 0;
      let totalDiscount = 0;

      for (const item of orderData.items) {
        // Get medicine details
        const medicine = await prisma.medicine.findUnique({
          where: { id: item.medicineId },
          include: { inventoryItems: true }
        });

        if (!medicine) {
          throw new Error(`Medicine not found: ${item.medicineId}`);
        }

        if (!medicine.isActive) {
          throw new Error(`Medicine is not available: ${medicine.name}`);
        }

        // Check inventory
        const inventory = medicine.inventoryItems[0];
        if (!inventory || inventory.quantity < item.quantity) {
          throw new Error(`Insufficient stock for ${medicine.name}`);
        }

        // Calculate item totals
        const itemTax = calculateTaxAmount(item.unitPrice, medicine.taxRate || 0);
        const itemDiscount = calculateDiscountAmount(item.unitPrice, medicine.discountPercentage || 0);
        const itemTotal = calculateFinalAmount(item.unitPrice, itemTax, itemDiscount);

        totalAmount += itemTotal * item.quantity;
        totalTax += itemTax * item.quantity;
        totalDiscount += itemDiscount * item.quantity;

        orderItems.push({
          medicineId: item.medicineId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxAmount: itemTax,
          discountAmount: itemDiscount,
          totalAmount: itemTotal * item.quantity
        });
      }

      // Create order using transaction
      const order = await prisma.$transaction(async (tx) => {
        // Create order
        const newOrder = await tx.order.create({
          data: {
            customerId: orderData.customerId,
            status: OrderStatus.PENDING,
            paymentStatus: PaymentStatus.PENDING,
            paymentMethod: orderData.paymentMethod,
            shippingAddress: orderData.shippingAddress,
            shippingCity: orderData.shippingCity,
            shippingState: orderData.shippingState,
            shippingZipCode: orderData.shippingZipCode,
            shippingCountry: orderData.shippingCountry,
            notes: orderData.notes,
            subtotal: totalAmount,
            taxAmount: totalTax,
            discountAmount: totalDiscount,
            totalAmount: totalAmount + totalTax - totalDiscount,
            isActive: true
          }
        });

        // Create order items
        for (const item of orderItems) {
          await tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              medicineId: item.medicineId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              taxAmount: item.taxAmount,
              discountAmount: item.discountAmount,
              totalAmount: item.totalAmount
            }
          });
        }

        // Update inventory
        for (const item of orderData.items) {
          await tx.inventoryItem.updateMany({
            where: { medicineId: item.medicineId },
            data: {
              quantity: {
                decrement: item.quantity
              },
              lastUpdated: new Date()
            }
          });
        }

        return newOrder;
      });

      // Get complete order with items
      const completeOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: {
          customer: true,
          orderItems: {
            include: {
              medicine: {
                include: {
                  category: true,
                  supplier: true
                }
              }
            }
          }
        }
      });

      logger.info(`Order created successfully: ${order.id} for customer ${customer.email}`);
      return completeOrder!;
    } catch (error) {
      logger.error('Create order error:', error);
      throw error;
    }
  }

  /**
   * Update order
   */
  async updateOrder(id: string, updates: IOrderUpdate): Promise<IOrder> {
    try {
      // Check if order exists
      const existingOrder = await prisma.order.findUnique({
        where: { id }
      });

      if (!existingOrder) {
        throw new Error('Order not found');
      }

      // Validate status transitions
      if (updates.status && !this.isValidStatusTransition(existingOrder.status, updates.status)) {
        throw new Error(`Invalid status transition from ${existingOrder.status} to ${updates.status}`);
      }

      // Update order
      const updatedOrder = await prisma.order.update({
        where: { id },
        data: updates,
        include: {
          customer: true,
          orderItems: {
            include: {
              medicine: {
                include: {
                  category: true,
                  supplier: true
                }
              }
            }
          }
        }
      });

      logger.info(`Order updated successfully: ${id}`);
      return updatedOrder;
    } catch (error) {
      logger.error('Update order error:', error);
      throw error;
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(id: string, reason: string): Promise<boolean> {
    try {
      // Check if order exists
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          orderItems: true
        }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // Check if order can be cancelled
      if (!canCancelOrder(order.status)) {
        throw new Error(`Order cannot be cancelled in status: ${order.status}`);
      }

      // Cancel order and restore inventory using transaction
      await prisma.$transaction(async (tx) => {
        // Update order status
        await tx.order.update({
          where: { id },
          data: {
            status: OrderStatus.CANCELLED,
            notes: order.notes ? `${order.notes}\nCancelled: ${reason}` : `Cancelled: ${reason}`
          }
        });

        // Restore inventory
        for (const item of order.orderItems) {
          await tx.inventoryItem.updateMany({
            where: { medicineId: item.medicineId },
            data: {
              quantity: {
                increment: item.quantity
              },
              lastUpdated: new Date()
            }
          });
        }

        // Create audit log
        await tx.auditLog.create({
          data: {
            entityType: 'ORDER',
            entityId: id,
            action: 'CANCELLED',
            userId: 'system', // TODO: Get from context
            oldValue: order.status,
            newValue: OrderStatus.CANCELLED,
            details: JSON.stringify({ reason }),
            timestamp: new Date()
          }
        });
      });

      logger.info(`Order cancelled successfully: ${id}, reason: ${reason}`);
      return true;
    } catch (error) {
      logger.error('Cancel order error:', error);
      throw error;
    }
  }

  /**
   * Get order by ID
   */
  async getOrder(id: string): Promise<IOrder | null> {
    try {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          customer: true,
          orderItems: {
            include: {
              medicine: {
                include: {
                  category: true,
                  supplier: true
                }
              }
            }
          }
        }
      });

      return order;
    } catch (error) {
      logger.error('Get order error:', error);
      throw error;
    }
  }

  /**
   * Get orders with filters and pagination
   */
  async getOrders(filters: OrderFilters, pagination: IPaginationOptions): Promise<ISearchResult<IOrder>> {
    try {
      // Build where clause
      const whereClause: any = { isActive: true };

      if (filters.status) {
        whereClause.status = filters.status;
      }

      if (filters.paymentStatus) {
        whereClause.paymentStatus = filters.paymentStatus;
      }

      if (filters.customerId) {
        whereClause.customerId = filters.customerId;
      }

      if (filters.startDate || filters.endDate) {
        whereClause.createdAt = {};
        if (filters.startDate) {
          whereClause.createdAt.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          whereClause.createdAt.lte = new Date(filters.endDate);
        }
      }

      if (filters.minAmount || filters.maxAmount) {
        whereClause.totalAmount = {};
        if (filters.minAmount) {
          whereClause.totalAmount.gte = filters.minAmount;
        }
        if (filters.maxAmount) {
          whereClause.totalAmount.lte = filters.maxAmount;
        }
      }

      // Get total count
      const total = await prisma.order.count({ where: whereClause });

      // Build pagination query
      const paginationQuery = buildPaginationQuery(pagination);

      // Get orders
      const orders = await prisma.order.findMany({
        where: whereClause,
        include: {
          customer: true,
          orderItems: {
            include: {
              medicine: {
                include: {
                  category: true,
                  supplier: true
                }
              }
            }
          }
        },
        ...paginationQuery,
        orderBy: {
          [pagination.sortBy || 'createdAt']: pagination.sortOrder || 'desc'
        }
      });

      // Create search result
      const result = createSearchResult(orders, total, pagination.page, pagination.limit);

      return result;
    } catch (error) {
      logger.error('Get orders error:', error);
      throw error;
    }
  }

  /**
   * Process payment for order
   */
  async processPayment(orderId: string, paymentData: PaymentData): Promise<PaymentResult> {
    try {
      // Check if order exists
      const order = await prisma.order.findUnique({
        where: { id: orderId }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // Check if payment is already processed
      if (order.paymentStatus === PaymentStatus.PAID) {
        throw new Error('Payment already processed');
      }

      // Validate payment amount
      if (paymentData.amount !== order.totalAmount) {
        throw new Error('Payment amount does not match order total');
      }

      // Process payment (simplified - in real app, integrate with payment gateway)
      const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Update order payment status
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: PaymentStatus.PAID,
          paidAt: new Date()
        }
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          entityType: 'ORDER',
          entityId: orderId,
          action: 'PAYMENT_PROCESSED',
          userId: 'system', // TODO: Get from context
          oldValue: order.paymentStatus,
          newValue: PaymentStatus.PAID,
          details: JSON.stringify({
            transactionId,
            method: paymentData.method,
            amount: paymentData.amount,
            reference: paymentData.reference,
            notes: paymentData.notes
          }),
          timestamp: new Date()
        }
      });

      logger.info(`Payment processed successfully for order: ${orderId}, transaction: ${transactionId}`);

      return {
        success: true,
        transactionId,
        message: 'Payment processed successfully'
      };
    } catch (error) {
      logger.error('Process payment error:', error);
      return {
        success: false,
        message: 'Payment processing failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Refund order
   */
  async refundOrder(orderId: string, refundData: RefundData): Promise<RefundResult> {
    try {
      // Check if order exists
      const order = await prisma.order.findUnique({
        where: { id: orderId }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // Check if order can be refunded
      if (!canRefundOrder(order.status, order.paymentStatus)) {
        throw new Error('Order cannot be refunded');
      }

      // Validate refund amount
      if (refundData.amount > order.totalAmount) {
        throw new Error('Refund amount cannot exceed order total');
      }

      // Process refund (simplified - in real app, integrate with payment gateway)
      const refundId = `REF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Update order status
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.REFUNDED,
          notes: order.notes ? `${order.notes}\nRefunded: ${refundData.reason}` : `Refunded: ${refundData.reason}`
        }
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          entityType: 'ORDER',
          entityId: orderId,
          action: 'REFUNDED',
          userId: 'system', // TODO: Get from context
          oldValue: order.status,
          newValue: OrderStatus.REFUNDED,
          details: JSON.stringify({
            refundId,
            amount: refundData.amount,
            reason: refundData.reason,
            notes: refundData.notes
          }),
          timestamp: new Date()
        }
      });

      logger.info(`Order refunded successfully: ${orderId}, refund: ${refundId}`);

      return {
        success: true,
        refundId,
        message: 'Order refunded successfully'
      };
    } catch (error) {
      logger.error('Refund order error:', error);
      return {
        success: false,
        message: 'Refund processing failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get sales statistics
   */
  async getSalesStats(period: SalesPeriod): Promise<SalesStats> {
    try {
      // Build date range query
      const whereClause = {
        createdAt: {
          gte: period.startDate,
          lte: period.endDate
        },
        status: {
          not: OrderStatus.CANCELLED
        },
        isActive: true
      };

      // Get total sales and orders
      const totalSales = await prisma.order.aggregate({
        where: whereClause,
        _sum: { totalAmount: true }
      });

      const totalOrders = await prisma.order.count({ where: whereClause });

      const averageOrderValue = totalOrders > 0 ? (totalSales._sum.totalAmount || 0) / totalOrders : 0;

      // Get top products
      const topProducts = await prisma.orderItem.groupBy({
        by: ['medicineId'],
        where: {
          order: whereClause
        },
        _sum: {
          quantity: true,
          totalAmount: true
        },
        orderBy: {
          _sum: {
            totalAmount: 'desc'
          }
        },
        take: 10
      });

      const topProductsWithNames = await Promise.all(
        topProducts.map(async (item) => {
          const medicine = await prisma.medicine.findUnique({
            where: { id: item.medicineId }
          });
          return {
            name: medicine?.name || 'Unknown',
            quantity: item._sum.quantity || 0,
            revenue: item._sum.totalAmount || 0
          };
        })
      );

      // Get top customers
      const topCustomers = await prisma.order.groupBy({
        by: ['customerId'],
        where: whereClause,
        _sum: { totalAmount: true },
        _count: { id: true },
        orderBy: {
          _sum: {
            totalAmount: 'desc'
          }
        },
        take: 10
      });

      const topCustomersWithNames = await Promise.all(
        topCustomers.map(async (item) => {
          const customer = await prisma.user.findUnique({
            where: { id: item.customerId }
          });
          return {
            name: customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown',
            orders: item._count.id,
            totalSpent: item._sum.totalAmount || 0
          };
        })
      );

      // Get daily trends
      const dailyTrends = await prisma.order.groupBy({
        by: ['createdAt'],
        where: whereClause,
        _sum: { totalAmount: true },
        _count: { id: true }
      });

      const dailyTrendsFormatted = dailyTrends.map(item => ({
        date: item.createdAt.toISOString().split('T')[0],
        sales: item._sum.totalAmount || 0,
        orders: item._count.id
      }));

      return {
        totalSales: totalSales._sum.totalAmount || 0,
        totalOrders,
        averageOrderValue,
        topProducts: topProductsWithNames,
        topCustomers: topCustomersWithNames,
        dailyTrends: dailyTrendsFormatted
      };
    } catch (error) {
      logger.error('Get sales stats error:', error);
      throw error;
    }
  }

  /**
   * Generate invoice for order
   */
  async generateInvoice(orderId: string): Promise<string> {
    try {
      // Get order with details
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          customer: true,
          orderItems: {
            include: {
              medicine: true
            }
          }
        }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // Generate invoice (simplified - in real app, use a proper PDF library)
      const invoiceNumber = `INV_${order.id}_${Date.now()}`;
      const invoiceContent = `
        INVOICE
        Invoice Number: ${invoiceNumber}
        Date: ${order.createdAt.toDateString()}
        
        Customer: ${order.customer.firstName} ${order.customer.lastName}
        Email: ${order.customer.email}
        
        Items:
        ${order.orderItems.map(item => 
          `${item.medicine.name} - Qty: ${item.quantity} - Price: $${item.unitPrice} - Total: $${item.totalAmount}`
        ).join('\n')}
        
        Subtotal: $${order.subtotal}
        Tax: $${order.taxAmount}
        Discount: $${order.discountAmount}
        Total: $${order.totalAmount}
      `;

      logger.info(`Invoice generated for order: ${orderId}`);
      return invoiceContent;
    } catch (error) {
      logger.error('Generate invoice error:', error);
      throw error;
    }
  }

  /**
   * Apply discount to order
   */
  async applyDiscount(orderId: string, discountCode: string): Promise<DiscountResult> {
    try {
      // Check if order exists
      const order = await prisma.order.findUnique({
        where: { id: orderId }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // Check if order can have discount applied
      if (order.status !== OrderStatus.PENDING) {
        throw new Error('Discount can only be applied to pending orders');
      }

      // TODO: Implement discount code validation logic
      // For now, apply a simple 10% discount
      const discountAmount = order.totalAmount * 0.1;
      const newTotal = order.totalAmount - discountAmount;

      // Update order
      await prisma.order.update({
        where: { id: orderId },
        data: {
          discountAmount: order.discountAmount + discountAmount,
          totalAmount: newTotal
        }
      });

      logger.info(`Discount applied to order: ${orderId}, amount: $${discountAmount}`);

      return {
        success: true,
        discountAmount,
        message: 'Discount applied successfully'
      };
    } catch (error) {
      logger.error('Apply discount error:', error);
      return {
        success: false,
        discountAmount: 0,
        message: 'Failed to apply discount',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Private helper methods

  private validateOrderData(orderData: IOrderCreate): { success: boolean; error?: string } {
    if (!orderData.customerId || !orderData.items || orderData.items.length === 0) {
      return { success: false, error: 'Customer ID and items are required' };
    }

    if (!orderData.paymentMethod) {
      return { success: false, error: 'Payment method is required' };
    }

    if (!orderData.shippingAddress || !orderData.shippingCity || !orderData.shippingState || !orderData.shippingZipCode || !orderData.shippingCountry) {
      return { success: false, error: 'Complete shipping address is required' };
    }

    return { success: true };
  }

  private isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
    const validTransitions: Record<string, string[]> = {
      [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.RETURNED],
      [OrderStatus.DELIVERED]: [OrderStatus.RETURNED],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.RETURNED]: [],
      [OrderStatus.REFUNDED]: []
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }
}

// Create and export service instance
export const salesService = new SalesService();

// Export individual methods for convenience
export const {
  createOrder,
  updateOrder,
  cancelOrder,
  getOrder,
  getOrders,
  processPayment,
  refundOrder,
  getSalesStats,
  generateInvoice,
  applyDiscount
} = salesService;
