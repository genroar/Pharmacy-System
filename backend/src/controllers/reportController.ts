import { Response, NextFunction } from 'express';
import { prisma } from '@/database';
import { logger } from '@/utils/logger';
import { 
  GenerateReportRequest, 
  GetDashboardStatsRequest,
  ControllerResponse
} from './types';

// Generate business reports
export const generateReport = async (
  req: GenerateReportRequest,
  res: Response<ControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { reportType, dateRange, filters, format } = req.body;

    if (!reportType || !dateRange || !dateRange.startDate || !dateRange.endDate) {
      res.status(400).json({
        success: false,
        message: 'Report type and date range are required',
        error: 'MISSING_REQUIRED_FIELDS',
        statusCode: 400
      });
      return;
    }

    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);

    if (startDate > endDate) {
      res.status(400).json({
        success: false,
        message: 'Start date must be before end date',
        error: 'INVALID_DATE_RANGE',
        statusCode: 400
      });
      return;
    }

    let reportData: any = {};

    switch (reportType) {
      case 'sales':
        reportData = await generateSalesReport(startDate, endDate, filters);
        break;
      case 'inventory':
        reportData = await generateInventoryReport(startDate, endDate, filters);
        break;
      case 'revenue':
        reportData = await generateRevenueReport(startDate, endDate, filters);
        break;
      case 'customer':
        reportData = await generateCustomerReport(startDate, endDate, filters);
        break;
      case 'supplier':
        reportData = await generateSupplierReport(startDate, endDate, filters);
        break;
      default:
        res.status(400).json({
          success: false,
          message: 'Invalid report type',
          error: 'INVALID_REPORT_TYPE',
          statusCode: 400
        });
        return;
    }

    // Add report metadata
    const report = {
      type: reportType,
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
      generatedAt: new Date().toISOString(),
      filters: filters || {},
      data: reportData
    };

    logger.info(`Report generated: ${reportType} from ${startDate.toDateString()} to ${endDate.toDateString()}`);

    res.status(200).json({
      success: true,
      message: `${reportType} report generated successfully`,
      data: report,
      statusCode: 200
    });

  } catch (error) {
    logger.error('Generate report error:', error);
    next(error);
  }
};

// Generate sales report
async function generateSalesReport(startDate: Date, endDate: Date, filters?: any) {
  const dateQuery = {
    createdAt: {
      gte: startDate,
      lte: endDate
    }
  };

  // Get total orders
  const totalOrders = await prisma.order.count({ where: dateQuery });

  // Get completed orders
  const completedOrders = await prisma.order.count({
    where: {
      ...dateQuery,
      status: 'DELIVERED'
    }
  });

  // Get total revenue
  const revenueResult = await prisma.order.aggregate({
    where: {
      ...dateQuery,
      status: 'DELIVERED',
      paymentStatus: 'COMPLETED'
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
        status: 'DELIVERED'
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
      status: 'DELIVERED'
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

  // Get daily sales trend
  const dailySales = await prisma.order.groupBy({
    by: ['createdAt'],
    where: {
      ...dateQuery,
      status: 'DELIVERED',
      paymentStatus: 'COMPLETED'
    },
    _sum: {
      finalAmount: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  return {
    summary: {
      totalOrders,
      completedOrders,
      cancelledOrders: totalOrders - completedOrders,
      totalRevenue,
      averageOrderValue: completedOrders > 0 ? totalRevenue / completedOrders : 0,
      completionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0
    },
    ordersByStatus: ordersByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<string, number>),
    topSellingMedicines,
    topCustomers,
    dailySales: dailySales.map(item => ({
      date: item.createdAt.toISOString().split('T')[0],
      revenue: item._sum.finalAmount || 0
    }))
  };
}

// Generate inventory report
async function generateInventoryReport(startDate: Date, endDate: Date, filters?: any) {
  // Get current inventory levels
  const inventoryItems = await prisma.inventoryItem.findMany({
    include: {
      medicine: {
        select: {
          id: true,
          name: true,
          genericName: true,
          category: {
            select: { name: true }
          },
          supplier: {
            select: { name: true }
          }
        }
      }
    }
  });

  // Get low stock items
  const lowStockItems = inventoryItems.filter(item => 
    item.quantity <= item.minQuantity
  );

  // Get out of stock items
  const outOfStockItems = inventoryItems.filter(item => 
    item.quantity === 0
  );

  // Get expiring items (next 30 days)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const expiringItems = await prisma.medicine.findMany({
    where: {
      expiryDate: {
        lte: thirtyDaysFromNow,
        gte: new Date()
      },
      isActive: true
    },
    include: {
      inventoryItems: true,
      category: {
        select: { name: true }
      }
    }
  });

  // Get inventory by category
  const inventoryByCategory = await prisma.medicine.groupBy({
    by: ['categoryId'],
    include: {
      category: {
        select: { name: true }
      }
    },
    _sum: {
      price: true
    }
  });

  return {
    summary: {
      totalItems: inventoryItems.length,
      totalQuantity: inventoryItems.reduce((sum, item) => sum + item.quantity, 0),
      lowStockItems: lowStockItems.length,
      outOfStockItems: outOfStockItems.length,
      expiringItems: expiringItems.length
    },
    lowStockItems: lowStockItems.map(item => ({
      medicine: item.medicine.name,
      currentQuantity: item.quantity,
      minQuantity: item.minQuantity,
      category: item.medicine.category?.name,
      supplier: item.medicine.supplier?.name
    })),
    outOfStockItems: outOfStockItems.map(item => ({
      medicine: item.medicine.name,
      category: item.medicine.category?.name,
      supplier: item.medicine.supplier?.name
    })),
    expiringItems: expiringItems.map(item => ({
      medicine: item.name,
      expiryDate: item.expiryDate,
      currentQuantity: item.inventoryItems.reduce((sum, inv) => sum + inv.quantity, 0),
      category: item.category?.name
    })),
    inventoryByCategory: inventoryByCategory.map(item => ({
      category: item.category?.name,
      totalValue: item._sum.price || 0
    }))
  };
}

// Generate revenue report
async function generateRevenueReport(startDate: Date, endDate: Date, filters?: any) {
  const dateQuery = {
    createdAt: {
      gte: startDate,
      lte: endDate
    }
  };

  // Get total revenue
  const totalRevenue = await prisma.order.aggregate({
    where: {
      ...dateQuery,
      status: 'DELIVERED',
      paymentStatus: 'COMPLETED'
    },
    _sum: {
      finalAmount: true
    }
  });

  // Get revenue by payment method
  const revenueByPaymentMethod = await prisma.order.groupBy({
    by: ['paymentMethod'],
    where: {
      ...dateQuery,
      status: 'DELIVERED',
      paymentStatus: 'COMPLETED'
    },
    _sum: {
      finalAmount: true
    }
  });

  // Get revenue by category
  const revenueByCategory = await prisma.orderItem.groupBy({
    by: ['medicine'],
    where: {
      order: {
        ...dateQuery,
        status: 'DELIVERED',
        paymentStatus: 'COMPLETED'
      }
    },
    include: {
      medicine: {
        select: {
          category: {
            select: { name: true }
          }
        }
      }
    },
    _sum: {
      totalPrice: true
    }
  });

  // Get monthly revenue trend
  const monthlyRevenue = await prisma.order.groupBy({
    by: ['createdAt'],
    where: {
      ...dateQuery,
      status: 'DELIVERED',
      paymentStatus: 'COMPLETED'
    },
    _sum: {
      finalAmount: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  return {
    summary: {
      totalRevenue: totalRevenue._sum.finalAmount || 0,
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    },
    revenueByPaymentMethod: revenueByPaymentMethod.map(item => ({
      method: item.paymentMethod,
      amount: item._sum.finalAmount || 0
    })),
    revenueByCategory: revenueByCategory.reduce((acc, item) => {
      const categoryName = item.medicine.category?.name || 'Unknown';
      acc[categoryName] = (acc[categoryName] || 0) + (item._sum.totalPrice || 0);
      return acc;
    }, {} as Record<string, number>),
    monthlyTrend: monthlyRevenue.map(item => ({
      month: item.createdAt.toISOString().slice(0, 7),
      revenue: item._sum.finalAmount || 0
    }))
  };
}

// Generate customer report
async function generateCustomerReport(startDate: Date, endDate: Date, filters?: any) {
  const dateQuery = {
    createdAt: {
      gte: startDate,
      lte: endDate
    }
  };

  // Get new customers
  const newCustomers = await prisma.user.count({
    where: {
      ...dateQuery,
      role: 'CUSTOMER'
    }
  });

  // Get total customers
  const totalCustomers = await prisma.user.count({
    where: { role: 'CUSTOMER' }
  });

  // Get active customers (made orders in period)
  const activeCustomers = await prisma.order.groupBy({
    by: ['customerId'],
    where: dateQuery,
    _count: { customerId: true }
  });

  // Get top customers by order value
  const topCustomers = await prisma.order.groupBy({
    by: ['customerId'],
    where: {
      ...dateQuery,
      status: 'DELIVERED',
      paymentStatus: 'COMPLETED'
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

  // Get customer retention rate
  const repeatCustomers = await prisma.order.groupBy({
    by: ['customerId'],
    where: dateQuery,
    _count: { customerId: true }
  });

  const customersWithMultipleOrders = repeatCustomers.filter(c => c._count.customerId > 1).length;

  return {
    summary: {
      totalCustomers,
      newCustomers,
      activeCustomers: activeCustomers.length,
      repeatCustomers: customersWithMultipleOrders,
      retentionRate: activeCustomers.length > 0 ? (customersWithMultipleOrders / activeCustomers.length) * 100 : 0
    },
    topCustomers: topCustomers.map(customer => ({
      customerId: customer.customerId,
      totalSpent: customer._sum.finalAmount || 0
    })),
    customerGrowth: {
      newCustomers,
      growthRate: totalCustomers > 0 ? (newCustomers / totalCustomers) * 100 : 0
    }
  };
}

// Generate supplier report
async function generateSupplierReport(startDate: Date, endDate: Date, filters?: any) {
  // Get all suppliers
  const suppliers = await prisma.supplier.findMany({
    include: {
      medicines: {
        include: {
          inventoryItems: true,
          reviews: true
        }
      }
    }
  });

  // Calculate supplier performance
  const supplierPerformance = suppliers.map(supplier => {
    const totalMedicines = supplier.medicines.length;
    const activeMedicines = supplier.medicines.filter(m => m.isActive).length;
    const totalInventory = supplier.medicines.reduce((sum, medicine) => {
      return sum + medicine.inventoryItems.reduce((invSum, inv) => invSum + inv.quantity, 0);
    }, 0);

    const allReviews = supplier.medicines.flatMap(m => m.reviews);
    const avgRating = allReviews.length > 0 
      ? allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length
      : 0;

    return {
      id: supplier.id,
      name: supplier.name,
      type: supplier.type,
      totalMedicines,
      activeMedicines,
      totalInventory,
      averageRating: Math.round(avgRating * 100) / 100,
      performance: (activeMedicines / totalMedicines) * 100
    };
  });

  // Get top suppliers by medicine count
  const topSuppliers = supplierPerformance
    .sort((a, b) => b.totalMedicines - a.totalMedicines)
    .slice(0, 10);

  // Get suppliers by type
  const suppliersByType = await prisma.supplier.groupBy({
    by: ['type'],
    _count: { type: true }
  });

  return {
    summary: {
      totalSuppliers: suppliers.length,
      activeSuppliers: suppliers.filter(s => s.isActive).length,
      averageMedicinesPerSupplier: suppliers.length > 0 
        ? suppliers.reduce((sum, s) => sum + s.medicines.length, 0) / suppliers.length 
        : 0
    },
    supplierPerformance,
    topSuppliers,
    suppliersByType: suppliersByType.map(item => ({
      type: item.type,
      count: item._count.type
    }))
  };
}

// Get dashboard statistics
export const getDashboardStats = async (
  req: GetDashboardStatsRequest,
  res: Response<ControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { period = 'month', date } = req.query;

    let startDate: Date;
    let endDate: Date = new Date();

    // Calculate date range based on period
    switch (period) {
      case 'today':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
    }

    // Get quick stats
    const totalUsers = await prisma.user.count();
    const totalMedicines = await prisma.medicine.count();
    const totalOrders = await prisma.order.count();
    const totalSuppliers = await prisma.supplier.count();

    // Get recent activity
    const recentOrders = await prisma.order.count({
      where: {
        createdAt: { gte: startDate }
      }
    });

    const recentUsers = await prisma.user.count({
      where: {
        createdAt: { gte: startDate }
      }
    });

    // Get revenue for period
    const periodRevenue = await prisma.order.aggregate({
      where: {
        createdAt: { gte: startDate },
        status: 'DELIVERED',
        paymentStatus: 'COMPLETED'
      },
      _sum: {
        finalAmount: true
      }
    });

    // Get low stock alerts
    const lowStockItems = await prisma.inventoryItem.count({
      where: {
        quantity: {
          lte: prisma.inventoryItem.fields.minQuantity
        }
      }
    });

    // Get expiring medicines (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringMedicines = await prisma.medicine.count({
      where: {
        expiryDate: {
          lte: thirtyDaysFromNow,
          gte: new Date()
        },
        isActive: true
      }
    });

    const dashboardStats = {
      period: {
        type: period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
      overview: {
        totalUsers,
        totalMedicines,
        totalOrders,
        totalSuppliers
      },
      recentActivity: {
        orders: recentOrders,
        newUsers: recentUsers,
        revenue: periodRevenue._sum.finalAmount || 0
      },
      alerts: {
        lowStockItems,
        expiringMedicines
      },
      trends: {
        // Add trend data here if needed
      }
    };

    res.status(200).json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: dashboardStats,
      statusCode: 200
    });

  } catch (error) {
    logger.error('Get dashboard stats error:', error);
    next(error);
  }
};

// Export all functions
export {
  generateReport,
  getDashboardStats
};
