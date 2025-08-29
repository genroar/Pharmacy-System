import { Response, NextFunction } from 'express';
import { prisma } from '@/database';
import { logger } from '@/utils/logger';
import { 
  CreateOrderRequest, 
  UpdateOrderRequest, 
  GetOrderRequest,
  GetOrdersRequest,
  ControllerResponse,
  PaginatedControllerResponse
} from './types';
import { 
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

// Create new order
export const createOrder = async (
  req: CreateOrderRequest,
  res: Response<ControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { customerId, items, paymentMethod, shippingAddress, shippingCity, shippingState, shippingZipCode, shippingCountry, notes } = req.body;

    // Validate required fields
    if (!customerId || !items || !paymentMethod || !shippingAddress || !shippingCity || !shippingState || !shippingZipCode || !shippingCountry) {
      res.status(400).json({
        success: false,
        message: 'All required fields must be provided',
        error: 'MISSING_REQUIRED_FIELDS',
        statusCode: 400
      });
      return;
    }

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Order must contain at least one item',
        error: 'EMPTY_ORDER',
        statusCode: 400
      });
      return;
    }

    // Check if customer exists
    const customer = await prisma.user.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      res.status(404).json({
        success: false,
        message: 'Customer not found',
        error: 'CUSTOMER_NOT_FOUND',
        statusCode: 404
      });
      return;
    }

    // Validate items and check inventory
    const validatedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const { medicineId, quantity, unitPrice } = item;

      // Check if medicine exists
      const medicine = await prisma.medicine.findUnique({
        where: { id: medicineId },
        include: {
          inventoryItems: true
        }
      });

      if (!medicine) {
        res.status(404).json({
          success: false,
          message: `Medicine with ID ${medicineId} not found`,
          error: 'MEDICINE_NOT_FOUND',
          statusCode: 404
        });
        return;
      }

      // Check inventory availability
      const totalInventory = medicine.inventoryItems.reduce((sum, inv) => sum + inv.quantity, 0);
      if (totalInventory < quantity) {
        res.status(400).json({
          success: false,
          message: `Insufficient inventory for ${medicine.name}. Available: ${totalInventory}, Requested: ${quantity}`,
          error: 'INSUFFICIENT_INVENTORY',
          statusCode: 400
        });
        return;
      }

      // Check if prescription is required
      if (medicine.prescriptionRequired) {
        // In a real application, you would check if there's a valid prescription
        // For now, we'll just log a warning
        logger.warn(`Prescription required medicine ordered: ${medicine.name}`);
      }

      validatedItems.push({
        medicineId,
        quantity,
        unitPrice,
        totalPrice: quantity * unitPrice
      });

      subtotal += quantity * unitPrice;
    }

    // Calculate order totals
    const taxRate = 8.5; // Default tax rate, could be configurable
    const taxAmount = calculateTaxAmount(subtotal, taxRate);
    const discountAmount = 0; // No discount for now
    const finalAmount = calculateFinalAmount(subtotal, taxAmount, discountAmount);

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order with transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId,
          totalAmount: subtotal,
          taxAmount,
          discountAmount,
          finalAmount,
          status: OrderStatus.PENDING,
          paymentMethod: paymentMethod as PaymentMethod,
          paymentStatus: PaymentStatus.PENDING,
          shippingAddress,
          shippingCity,
          shippingState,
          shippingZipCode,
          shippingCountry,
          notes
        }
      });

      // Create order items
      const orderItems = await Promise.all(
        validatedItems.map(item =>
          tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              medicineId: item.medicineId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice
            }
          })
        )
      );

      // Update inventory
      for (const item of validatedItems) {
        await tx.inventoryItem.updateMany({
          where: {
            medicineId: item.medicineId,
            quantity: { gte: item.quantity }
          },
          data: {
            quantity: {
              decrement: item.quantity
            }
          }
        });
      }

      return { order: newOrder, items: orderItems };
    });

    logger.info(`Order created successfully: ${orderNumber}`);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order: order.order,
        items: order.items
      },
      statusCode: 201
    });

  } catch (error) {
    logger.error('Create order error:', error);
    next(error);
  }
};

// Get order by ID
export const getOrderById = async (
  req: GetOrderRequest,
  res: Response<ControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        items: {
          include: {
            medicine: {
              select: {
                id: true,
                name: true,
                genericName: true,
                brandName: true,
                price: true,
                imageUrl: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
        error: 'ORDER_NOT_FOUND',
        statusCode: 404
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Order retrieved successfully',
      data: order,
      statusCode: 200
    });

  } catch (error) {
    logger.error('Get order by ID error:', error);
    next(error);
  }
};

// Get all orders with pagination and search
export const getOrders = async (
  req: GetOrdersRequest,
  res: Response<PaginatedControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { 
      page = '1', 
      limit = '20', 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      status,
      paymentStatus,
      customerId,
      startDate,
      endDate
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Build search query
    const searchQuery: any = {};
    
    if (status) {
      searchQuery.status = status as OrderStatus;
    }

    if (paymentStatus) {
      searchQuery.paymentStatus = paymentStatus as PaymentStatus;
    }

    if (customerId) {
      searchQuery.customerId = customerId;
    }

    if (startDate || endDate) {
      searchQuery.createdAt = {};
      if (startDate) searchQuery.createdAt.gte = new Date(startDate);
      if (endDate) searchQuery.createdAt.lte = new Date(endDate);
    }

    // Build pagination query
    const paginationQuery = buildPaginationQuery({
      page: pageNum,
      limit: limitNum,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    // Get total count
    const total = await prisma.order.count({ where: searchQuery });

    // Get orders
    const orders = await prisma.order.findMany({
      where: searchQuery,
      skip: paginationQuery.skip,
      take: paginationQuery.take,
      orderBy: paginationQuery.orderBy,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        items: {
          select: {
            quantity: true,
            totalPrice: true
          }
        }
      }
    });

    // Create search result
    const searchResult = createSearchResult(orders, total, pageNum, limitNum);

    res.status(200).json({
      success: true,
      message: 'Orders retrieved successfully',
      data: searchResult,
      statusCode: 200
    });

  } catch (error) {
    logger.error('Get orders error:', error);
    next(error);
  }
};

// Update order status
export const updateOrderStatus = async (
  req: UpdateOrderRequest,
  res: Response<ControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, notes } = req.body;

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id }
    });

    if (!existingOrder) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
        error: 'ORDER_NOT_FOUND',
        statusCode: 404
      });
      return;
    }

    // Validate status transition
    if (status && !Object.values(OrderStatus).includes(status as OrderStatus)) {
      res.status(400).json({
        success: false,
        message: 'Invalid order status',
        error: 'INVALID_STATUS',
        statusCode: 400
      });
      return;
    }

    if (paymentStatus && !Object.values(PaymentStatus).includes(paymentStatus as PaymentStatus)) {
      res.status(400).json({
        success: false,
        message: 'Invalid payment status',
        error: 'INVALID_PAYMENT_STATUS',
        statusCode: 400
      });
      return;
    }

    // Prepare update data
    const updateData: any = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (notes) updateData.notes = notes;

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    logger.info(`Order ${id} status updated to: ${status || existingOrder.status}`);

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder,
      statusCode: 200
    });

  } catch (error) {
    logger.error('Update order status error:', error);
    next(error);
  }
};

// Cancel order
export const cancelOrder = async (
  req: GetOrderRequest,
  res: Response<ControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id }
    });

    if (!existingOrder) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
        error: 'ORDER_NOT_FOUND',
        statusCode: 404
      });
      return;
    }

    // Check if order can be cancelled
    if (!canCancelOrder(existingOrder.status)) {
      res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled in its current status',
        error: 'ORDER_CANNOT_BE_CANCELLED',
        statusCode: 400
      });
      return;
    }

    // Cancel order with transaction
    const cancelledOrder = await prisma.$transaction(async (tx) => {
      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id },
        data: { 
          status: OrderStatus.CANCELLED,
          paymentStatus: PaymentStatus.REFUNDED
        }
      });

      // Restore inventory
      const orderItems = await tx.orderItem.findMany({
        where: { orderId: id }
      });

      for (const item of orderItems) {
        await tx.inventoryItem.updateMany({
          where: {
            medicineId: item.medicineId
          },
          data: {
            quantity: {
              increment: item.quantity
            }
          }
        });
      }

      return updatedOrder;
    });

    logger.info(`Order ${id} cancelled successfully`);

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: cancelledOrder,
      statusCode: 200
    });

  } catch (error) {
    logger.error('Cancel order error:', error);
    next(error);
  }
};

// Get sales statistics
export const getSalesStats = async (
  req: GetOrdersRequest,
  res: Response<ControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    // Build date range
    const dateQuery: any = {};
    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) dateQuery.createdAt.gte = new Date(startDate);
      if (endDate) dateQuery.createdAt.lte = new Date(endDate);
    }

    // Get total orders
    const totalOrders = await prisma.order.count({ where: dateQuery });

    // Get completed orders
    const completedOrders = await prisma.order.count({
      where: {
        ...dateQuery,
        status: OrderStatus.DELIVERED
      }
    });

    // Get total revenue
    const revenueResult = await prisma.order.aggregate({
      where: {
        ...dateQuery,
        status: OrderStatus.DELIVERED,
        paymentStatus: PaymentStatus.COMPLETED
      },
      _sum: {
        finalAmount: true
      }
    });

    const totalRevenue = revenueResult._sum.finalAmount || 0;

    // Get orders by status
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      where: dateQuery,
      _count: { status: true }
    });

    // Get top selling medicines
    const topSellingMedicines = await prisma.orderItem.groupBy({
      by: ['medicineId'],
      where: {
        order: {
          ...dateQuery,
          status: OrderStatus.DELIVERED
        }
      },
      _sum: {
        quantity: true,
        totalPrice: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 10
    });

    // Get top customers
    const topCustomers = await prisma.order.groupBy({
      by: ['customerId'],
      where: {
        ...dateQuery,
        status: OrderStatus.DELIVERED
      },
      _sum: {
        finalAmount: true
      },
      orderBy: {
        _sum: {
          finalAmount: 'desc'
        }
      },
      take: 10
    });

    const stats = {
      totalOrders,
      completedOrders,
      cancelledOrders: totalOrders - completedOrders,
      totalRevenue,
      averageOrderValue: completedOrders > 0 ? totalRevenue / completedOrders : 0,
      completionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
      ordersByStatus: ordersByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {} as Record<string, number>),
      topSellingMedicines,
      topCustomers
    };

    res.status(200).json({
      success: true,
      message: 'Sales statistics retrieved successfully',
      data: stats,
      statusCode: 200
    });

  } catch (error) {
    logger.error('Get sales stats error:', error);
    next(error);
  }
};

// Get customer orders
export const getCustomerOrders = async (
  req: GetOrdersRequest,
  res: Response<PaginatedControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { customerId, page = '1', limit = '20' } = req.query;

    if (!customerId) {
      res.status(400).json({
        success: false,
        message: 'Customer ID is required',
        error: 'MISSING_CUSTOMER_ID',
        statusCode: 400
      });
      return;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Check if customer exists
    const customer = await prisma.user.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      res.status(404).json({
        success: false,
        message: 'Customer not found',
        error: 'CUSTOMER_NOT_FOUND',
        statusCode: 404
      });
      return;
    }

    // Get total count
    const total = await prisma.order.count({
      where: { customerId }
    });

    // Get customer orders
    const orders = await prisma.order.findMany({
      where: { customerId },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            medicine: {
              select: {
                id: true,
                name: true,
                genericName: true,
                brandName: true,
                imageUrl: true
              }
            }
          }
        }
      }
    });

    // Create search result
    const searchResult = createSearchResult(orders, total, pageNum, limitNum);

    res.status(200).json({
      success: true,
      message: 'Customer orders retrieved successfully',
      data: searchResult,
      statusCode: 200
    });

  } catch (error) {
    logger.error('Get customer orders error:', error);
    next(error);
  }
};

// Export all functions
export {
  createOrder,
  getOrderById,
  getOrders,
  updateOrderStatus,
  cancelOrder,
  getSalesStats,
  getCustomerOrders
};
