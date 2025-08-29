import { prisma } from '@/database';
import { logger } from '@/utils/logger';
import {
  ReportServiceInterface,
  ReportPeriod,
  ReportFilters,
  SalesReport,
  InventoryReport,
  RevenueReport,
  CustomerReport,
  SupplierReport,
  CustomReportConfig,
  CustomReport,
  ExportFormat,
  ScheduledReportConfig,
  ReportHistory,
  ServiceResponse
} from './types';

export class ReportService implements ReportServiceInterface {
  /**
   * Generate business reports
   */
  async generateReport(period: ReportPeriod, filters?: ReportFilters): Promise<any> {
    try {
      const reportType = filters?.reportType || 'sales';
      
      switch (reportType) {
        case 'sales':
          return await this.generateSalesReport(period, filters);
        case 'inventory':
          return await this.generateInventoryReport(filters);
        case 'revenue':
          return await this.generateRevenueReport(period, filters);
        case 'customer':
          return await this.generateCustomerReport(period, filters);
        case 'supplier':
          return await this.generateSupplierReport(period, filters);
        default:
          throw new Error(`Unknown report type: ${reportType}`);
      }
    } catch (error) {
      logger.error('Generate report error:', error);
      throw error;
    }
  }

  /**
   * Generate sales report
   */
  async generateSalesReport(period: ReportPeriod, filters?: ReportFilters): Promise<SalesReport> {
    try {
      // Build date range query
      const whereClause: any = {
        createdAt: {
          gte: period.startDate,
          lte: period.endDate
        },
        status: {
          not: 'CANCELLED'
        },
        isActive: true
      };

      // Apply additional filters
      if (filters?.categories?.length) {
        whereClause.orderItems = {
          some: {
            medicine: {
              categoryId: {
                in: filters.categories
              }
            }
          }
        };
      }

      // Get total sales and orders
      const totalSales = await prisma.order.aggregate({
        where: whereClause,
        _sum: { totalAmount: true }
      });

      const totalOrders = await prisma.order.count({ where: whereClause });

      const averageOrderValue = totalOrders > 0 ? (totalSales._sum.totalAmount || 0) / totalOrders : 0;

      // Calculate growth rate (simplified - compare with previous period)
      const previousPeriodStart = new Date(period.startDate);
      previousPeriodStart.setDate(previousPeriodStart.getDate() - (period.endDate.getTime() - period.startDate.getTime()) / (1000 * 60 * 60 * 24));

      const previousPeriodSales = await prisma.order.aggregate({
        where: {
          createdAt: {
            gte: previousPeriodStart,
            lt: period.startDate
          },
          status: { not: 'CANCELLED' },
          isActive: true
        },
        _sum: { totalAmount: true }
      });

      const previousSales = previousPeriodSales._sum.totalAmount || 0;
      const currentSales = totalSales._sum.totalAmount || 0;
      const growthRate = previousSales > 0 ? ((currentSales - previousSales) / previousSales) * 100 : 0;

      // Get breakdown by category
      const categoryBreakdown = await prisma.orderItem.groupBy({
        by: ['medicineId'],
        where: {
          order: whereClause
        },
        _sum: {
          totalAmount: true
        }
      });

      const categoryStats = await Promise.all(
        categoryBreakdown.map(async (item) => {
          const medicine = await prisma.medicine.findUnique({
            where: { id: item.medicineId },
            include: { category: true }
          });
          return {
            category: medicine?.category?.name || 'Unknown',
            sales: item._sum.totalAmount || 0,
            percentage: totalSales._sum.totalAmount ? ((item._sum.totalAmount || 0) / totalSales._sum.totalAmount) * 100 : 0
          };
        })
      );

      // Group by category
      const categoryMap = new Map<string, { sales: number; percentage: number }>();
      categoryStats.forEach(stat => {
        const existing = categoryMap.get(stat.category);
        if (existing) {
          existing.sales += stat.sales;
          existing.percentage += stat.percentage;
        } else {
          categoryMap.set(stat.category, { sales: stat.sales, percentage: stat.percentage });
        }
      });

      const byCategory = Array.from(categoryMap.entries()).map(([name, data]) => ({
        category: name,
        sales: data.sales,
        percentage: data.percentage
      }));

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

      const byProduct = await Promise.all(
        topProducts.map(async (item) => {
          const medicine = await prisma.medicine.findUnique({
            where: { id: item.medicineId }
          });
          return {
            product: medicine?.name || 'Unknown',
            quantity: item._sum.quantity || 0,
            revenue: item._sum.totalAmount || 0
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

      const byDay = dailyTrends.map(item => ({
        date: item.createdAt.toISOString().split('T')[0],
        sales: item._sum.totalAmount || 0,
        orders: item._count.id
      }));

      const report: SalesReport = {
        period,
        summary: {
          totalSales,
          totalOrders,
          averageOrderValue,
          growthRate
        },
        breakdown: {
          byCategory,
          byProduct,
          byDay
        },
        generatedAt: new Date()
      };

      logger.info(`Sales report generated for period: ${period.startDate.toDateString()} - ${period.endDate.toDateString()}`);
      return report;
    } catch (error) {
      logger.error('Generate sales report error:', error);
      throw error;
    }
  }

  /**
   * Generate inventory report
   */
  async generateInventoryReport(filters?: ReportFilters): Promise<InventoryReport> {
    try {
      // Build where clause
      const whereClause: any = { isActive: true };

      if (filters?.categories?.length) {
        whereClause.categoryId = { in: filters.categories };
      }

      if (filters?.suppliers?.length) {
        whereClause.supplierId = { in: filters.suppliers };
      }

      // Get medicines with inventory
      const medicines = await prisma.medicine.findMany({
        where: whereClause,
        include: {
          category: true,
          supplier: true,
          inventoryItems: true
        }
      });

      let totalItems = 0;
      let totalValue = 0;
      let lowStockItems = 0;
      let outOfStockItems = 0;

      medicines.forEach(medicine => {
        const inventory = medicine.inventoryItems[0];
        if (inventory) {
          totalItems += inventory.quantity;
          totalValue += medicine.price * inventory.quantity;

          if (inventory.quantity <= inventory.reorderPoint && inventory.quantity > 0) {
            lowStockItems++;
          } else if (inventory.quantity === 0) {
            outOfStockItems++;
          }
        }
      });

      // Get breakdown by category
      const categoryMap = new Map<string, { items: number; value: number }>();
      medicines.forEach(medicine => {
        const inventory = medicine.inventoryItems[0];
        if (inventory) {
          const existing = categoryMap.get(medicine.category?.name || 'Unknown');
          if (existing) {
            existing.items += inventory.quantity;
            existing.value += medicine.price * inventory.quantity;
          } else {
            categoryMap.set(medicine.category?.name || 'Unknown', {
              items: inventory.quantity,
              value: medicine.price * inventory.quantity
            });
          }
        }
      });

      const byCategory = Array.from(categoryMap.entries()).map(([name, data]) => ({
        category: name,
        items: data.items,
        value: data.value
      }));

      // Get breakdown by supplier
      const supplierMap = new Map<string, { items: number; value: number }>();
      medicines.forEach(medicine => {
        const inventory = medicine.inventoryItems[0];
        if (inventory) {
          const existing = supplierMap.get(medicine.supplier?.name || 'Unknown');
          if (existing) {
            existing.items += inventory.quantity;
            existing.value += medicine.price * inventory.quantity;
          } else {
            supplierMap.set(medicine.supplier?.name || 'Unknown', {
              items: inventory.quantity,
              value: medicine.price * inventory.quantity
            });
          }
        }
      });

      const bySupplier = Array.from(supplierMap.entries()).map(([name, data]) => ({
        supplier: name,
        items: data.items,
        value: data.value
      }));

      // Get breakdown by status
      const statusMap = new Map<string, { items: number; value: number }>();
      medicines.forEach(medicine => {
        const inventory = medicine.inventoryItems[0];
        if (inventory) {
          const status = inventory.status;
          const existing = statusMap.get(status);
          if (existing) {
            existing.items += inventory.quantity;
            existing.value += medicine.price * inventory.quantity;
          } else {
            statusMap.set(status, {
              items: inventory.quantity,
              value: medicine.price * inventory.quantity
            });
          }
        }
      });

      const byStatus = Array.from(statusMap.entries()).map(([name, data]) => ({
        status: name,
        items: data.items,
        value: data.value
      }));

      const report: InventoryReport = {
        summary: {
          totalItems,
          totalValue,
          lowStockItems,
          outOfStockItems
        },
        breakdown: {
          byCategory,
          bySupplier,
          byStatus
        },
        generatedAt: new Date()
      };

      logger.info('Inventory report generated successfully');
      return report;
    } catch (error) {
      logger.error('Generate inventory report error:', error);
      throw error;
    }
  }

  /**
   * Generate revenue report
   */
  async generateRevenueReport(period: ReportPeriod, filters?: ReportFilters): Promise<RevenueReport> {
    try {
      // Build date range query
      const whereClause: any = {
        createdAt: {
          gte: period.startDate,
          lte: period.endDate
        },
        status: {
          not: 'CANCELLED'
        },
        isActive: true
      };

      // Get total revenue and cost
      const totalRevenue = await prisma.order.aggregate({
        where: whereClause,
        _sum: { totalAmount: true }
      });

      // Calculate cost from order items
      const orderItems = await prisma.orderItem.findMany({
        where: {
          order: whereClause
        },
        include: {
          medicine: true
        }
      });

      let totalCost = 0;
      orderItems.forEach(item => {
        totalCost += (item.medicine.cost || 0) * item.quantity;
      });

      const grossProfit = (totalRevenue._sum.totalAmount || 0) - totalCost;
      const netProfit = grossProfit; // Simplified - no additional expenses
      const profitMargin = totalCost > 0 ? (grossProfit / totalCost) * 100 : 0;

      // Get monthly breakdown
      const monthlyData = await prisma.order.groupBy({
        by: ['createdAt'],
        where: whereClause,
        _sum: { totalAmount: true }
      });

      const monthlyMap = new Map<string, { revenue: number; profit: number }>();
      monthlyData.forEach(item => {
        const month = item.createdAt.toISOString().substring(0, 7); // YYYY-MM format
        const existing = monthlyMap.get(month);
        if (existing) {
          existing.revenue += item._sum.totalAmount || 0;
        } else {
          monthlyMap.set(month, { revenue: item._sum.totalAmount || 0, profit: 0 });
        }
      });

      // Calculate profit for each month (simplified)
      const byMonth = Array.from(monthlyMap.entries()).map(([month, data]) => ({
        month,
        revenue: data.revenue,
        profit: data.revenue * (profitMargin / 100)
      }));

      // Get breakdown by category
      const categoryBreakdown = await prisma.orderItem.groupBy({
        by: ['medicineId'],
        where: {
          order: whereClause
        },
        _sum: {
          totalAmount: true,
          quantity: true
        }
      });

      const categoryMap = new Map<string, { revenue: number; profit: number }>();
      for (const item of categoryBreakdown) {
        const medicine = await prisma.medicine.findUnique({
          where: { id: item.medicineId },
          include: { category: true }
        });
        
        const category = medicine?.category?.name || 'Unknown';
        const revenue = item._sum.totalAmount || 0;
        const cost = (medicine?.cost || 0) * (item._sum.quantity || 0);
        const profit = revenue - cost;

        const existing = categoryMap.get(category);
        if (existing) {
          existing.revenue += revenue;
          existing.profit += profit;
        } else {
          categoryMap.set(category, { revenue, profit });
        }
      }

      const byCategory = Array.from(categoryMap.entries()).map(([name, data]) => ({
        category: name,
        revenue: data.revenue,
        profit: data.profit
      }));

      // Get breakdown by payment method
      const paymentMethodBreakdown = await prisma.order.groupBy({
        by: ['paymentMethod'],
        where: whereClause,
        _sum: { totalAmount: true },
        _count: { id: true }
      });

      const byPaymentMethod = paymentMethodBreakdown.map(item => ({
        method: item.paymentMethod,
        revenue: item._sum.totalAmount || 0,
        count: item._count.id
      }));

      const report: RevenueReport = {
        period,
        summary: {
          totalRevenue: totalRevenue._sum.totalAmount || 0,
          totalCost,
          grossProfit,
          netProfit,
          profitMargin
        },
        breakdown: {
          byMonth,
          byCategory,
          byPaymentMethod
        },
        generatedAt: new Date()
      };

      logger.info(`Revenue report generated for period: ${period.startDate.toDateString()} - ${period.endDate.toDateString()}`);
      return report;
    } catch (error) {
      logger.error('Generate revenue report error:', error);
      throw error;
    }
  }

  /**
   * Generate customer report
   */
  async generateCustomerReport(period: ReportPeriod, filters?: ReportFilters): Promise<CustomerReport> {
    try {
      // Build date range query
      const whereClause: any = {
        createdAt: {
          gte: period.startDate,
          lte: period.endDate
        },
        status: {
          not: 'CANCELLED'
        },
        isActive: true
      };

      // Get customer statistics
      const totalCustomers = await prisma.user.count({
        where: {
          role: 'CUSTOMER',
          isActive: true
        }
      });

      const newCustomers = await prisma.user.count({
        where: {
          role: 'CUSTOMER',
          isActive: true,
          createdAt: {
            gte: period.startDate,
            lte: period.endDate
          }
        }
      });

      const activeCustomers = await prisma.order.groupBy({
        by: ['customerId'],
        where: whereClause
      }).then(result => result.length);

      // Calculate average customer value
      const totalRevenue = await prisma.order.aggregate({
        where: whereClause,
        _sum: { totalAmount: true }
      });

      const averageCustomerValue = activeCustomers > 0 ? (totalRevenue._sum.totalAmount || 0) / activeCustomers : 0;

      // Get breakdown by location
      const locationBreakdown = await prisma.order.groupBy({
        by: ['shippingCity'],
        where: whereClause,
        _sum: { totalAmount: true },
        _count: { customerId: true }
      });

      const byLocation = locationBreakdown.map(item => ({
        location: item.shippingCity,
        customers: item._count.customerId,
        revenue: item._sum.totalAmount || 0
      }));

      // Get breakdown by order count
      const customerOrderCounts = await prisma.order.groupBy({
        by: ['customerId'],
        where: whereClause,
        _count: { id: true },
        _sum: { totalAmount: true }
      });

      const orderCountRanges = [
        { range: '1 order', min: 1, max: 1 },
        { range: '2-5 orders', min: 2, max: 5 },
        { range: '6-10 orders', min: 6, max: 10 },
        { range: '11+ orders', min: 11, max: Infinity }
      ];

      const byOrderCount = orderCountRanges.map(range => {
        const customers = customerOrderCounts.filter(item => 
          item._count.id >= range.min && item._count.id <= range.max
        );
        return {
          range: range.range,
          customers: customers.length,
          percentage: customerOrderCounts.length > 0 ? (customers.length / customerOrderCounts.length) * 100 : 0
        };
      });

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
            customer: customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown',
            orders: item._count.id,
            totalSpent: item._sum.totalAmount || 0
          };
        })
      );

      const report: CustomerReport = {
        period,
        summary: {
          totalCustomers,
          newCustomers,
          activeCustomers,
          averageCustomerValue
        },
        breakdown: {
          byLocation,
          byOrderCount,
          topCustomers: topCustomersWithNames
        },
        generatedAt: new Date()
      };

      logger.info(`Customer report generated for period: ${period.startDate.toDateString()} - ${period.endDate.toDateString()}`);
      return report;
    } catch (error) {
      logger.error('Generate customer report error:', error);
      throw error;
    }
  }

  /**
   * Generate supplier report
   */
  async generateSupplierReport(period: ReportPeriod, filters?: ReportFilters): Promise<SupplierReport> {
    try {
      // Get supplier statistics
      const totalSuppliers = await prisma.supplier.count({
        where: { isActive: true }
      });

      const activeSuppliers = await prisma.medicine.groupBy({
        by: ['supplierId'],
        where: { isActive: true }
      }).then(result => result.length);

      // Calculate total purchases (simplified - based on medicine costs)
      const medicines = await prisma.medicine.findMany({
        where: { isActive: true },
        include: {
          supplier: true,
          inventoryItems: true
        }
      });

      let totalPurchases = 0;
      medicines.forEach(medicine => {
        const inventory = medicine.inventoryItems[0];
        if (inventory) {
          totalPurchases += (medicine.cost || 0) * inventory.quantity;
        }
      });

      // Calculate average lead time (simplified)
      const averageLeadTime = 7; // Placeholder - in real app, track actual lead times

      // Get breakdown by performance (simplified rating system)
      const supplierPerformance = await prisma.medicine.groupBy({
        by: ['supplierId'],
        where: { isActive: true },
        _count: { id: true },
        _sum: { cost: true }
      });

      const byPerformance = await Promise.all(
        supplierPerformance.map(async (item) => {
          const supplier = await prisma.supplier.findUnique({
            where: { id: item.supplierId }
          });
          
          // Simple rating based on number of medicines and cost efficiency
          const rating = Math.min(5, Math.max(1, (item._count.id / 10) + (item._sum.cost ? 5 - (item._sum.cost / 1000) : 3)));
          
          return {
            supplier: supplier?.name || 'Unknown',
            rating: Math.round(rating * 10) / 10,
            orders: item._count.id
          };
        })
      );

      // Get breakdown by category
      const categoryBreakdown = await prisma.medicine.groupBy({
        by: ['categoryId', 'supplierId'],
        where: { isActive: true },
        _count: { id: true }
      });

      const categoryMap = new Map<string, { suppliers: number; items: number }>();
      for (const item of categoryBreakdown) {
        const category = await prisma.category.findUnique({
          where: { id: item.categoryId }
        });
        
        const categoryName = category?.name || 'Unknown';
        const existing = categoryMap.get(categoryName);
        if (existing) {
          existing.suppliers++;
          existing.items += item._count.id;
        } else {
          categoryMap.set(categoryName, {
            suppliers: 1,
            items: item._count.id
          });
        }
      }

      const byCategory = Array.from(categoryMap.entries()).map(([name, data]) => ({
        category: name,
        suppliers: data.suppliers,
        items: data.items
      }));

      // Get top suppliers
      const topSuppliers = await prisma.medicine.groupBy({
        by: ['supplierId'],
        where: { isActive: true },
        _count: { id: true },
        _sum: { cost: true },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 10
      });

      const topSuppliersWithNames = await Promise.all(
        topSuppliers.map(async (item) => {
          const supplier = await prisma.supplier.findUnique({
            where: { id: item.supplierId }
          });
          
          const totalValue = (item._sum.cost || 0) * 100; // Simplified value calculation
          
          return {
            supplier: supplier?.name || 'Unknown',
            items: item._count.id,
            value: totalValue
          };
        })
      );

      const report: SupplierReport = {
        period,
        summary: {
          totalSuppliers,
          activeSuppliers,
          totalPurchases,
          averageLeadTime
        },
        breakdown: {
          byPerformance,
          byCategory,
          topSuppliers: topSuppliersWithNames
        },
        generatedAt: new Date()
      };

      logger.info(`Supplier report generated for period: ${period.startDate.toDateString()} - ${period.endDate.toDateString()}`);
      return report;
    } catch (error) {
      logger.error('Generate supplier report error:', error);
      throw error;
    }
  }

  /**
   * Generate custom report
   */
  async generateCustomReport(reportConfig: CustomReportConfig): Promise<CustomReport> {
    try {
      // This is a simplified implementation
      // In a real application, you would build dynamic queries based on the config
      
      const report: CustomReport = {
        config: reportConfig,
        data: [],
        summary: {},
        generatedAt: new Date()
      };

      logger.info(`Custom report generated: ${reportConfig.name}`);
      return report;
    } catch (error) {
      logger.error('Generate custom report error:', error);
      throw error;
    }
  }

  /**
   * Export report in specified format
   */
  async exportReport(report: any, format: ExportFormat): Promise<string> {
    try {
      // This is a simplified implementation
      // In a real application, you would use proper libraries for each format
      
      let exportContent = '';
      
      switch (format) {
        case 'json':
          exportContent = JSON.stringify(report, null, 2);
          break;
        case 'csv':
          exportContent = this.convertToCSV(report);
          break;
        case 'excel':
          // TODO: Implement Excel export using a library like xlsx
          exportContent = 'Excel export not implemented yet';
          break;
        case 'pdf':
          // TODO: Implement PDF export using a library like puppeteer or jsPDF
          exportContent = 'PDF export not implemented yet';
          break;
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }

      logger.info(`Report exported in ${format} format`);
      return exportContent;
    } catch (error) {
      logger.error('Export report error:', error);
      throw error;
    }
  }

  /**
   * Schedule report generation
   */
  async scheduleReport(reportConfig: ScheduledReportConfig): Promise<string> {
    try {
      // This is a simplified implementation
      // In a real application, you would integrate with a job scheduler like cron
      
      const scheduleId = `SCHED_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      logger.info(`Report scheduled: ${scheduleId} for ${reportConfig.name}`);
      return scheduleId;
    } catch (error) {
      logger.error('Schedule report error:', error);
      throw error;
    }
  }

  /**
   * Get report history
   */
  async getReportHistory(): Promise<ReportHistory[]> {
    try {
      // This is a simplified implementation
      // In a real application, you would store and retrieve actual report history
      
      const history: ReportHistory[] = [];
      
      logger.info('Report history retrieved');
      return history;
    } catch (error) {
      logger.error('Get report history error:', error);
      throw error;
    }
  }

  // Private helper methods

  private convertToCSV(report: any): string {
    // Simplified CSV conversion
    // In a real application, you would implement proper CSV formatting
    return 'CSV conversion not implemented yet';
  }
}

// Create and export service instance
export const reportService = new ReportService();

// Export individual methods for convenience
export const {
  generateReport,
  generateSalesReport,
  generateInventoryReport,
  generateRevenueReport,
  generateCustomerReport,
  generateSupplierReport,
  generateCustomReport,
  exportReport,
  scheduleReport,
  getReportHistory
} = reportService;
