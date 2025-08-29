import { logger } from './logger';
import { DateHelper } from './dateHelper';

/**
 * Report formatter utility class for formatting various types of business reports
 */
export class ReportFormatter {
  private static readonly DEFAULT_DATE_FORMAT = 'YYYY-MM-DD';
  private static readonly DEFAULT_CURRENCY_FORMAT = 'en-US';
  private static readonly DEFAULT_CURRENCY_CODE = 'USD';

  /**
   * Format sales report data
   * @param data - Sales data to format
   * @param options - Formatting options
   * @returns Formatted sales report
   */
  static formatSalesReport(
    data: any[],
    options: {
      includeTotals?: boolean;
      groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year';
      currency?: string;
      dateFormat?: string;
    } = {}
  ): any {
    try {
      const {
        includeTotals = true,
        groupBy = 'day',
        currency = this.DEFAULT_CURRENCY_CODE,
        dateFormat = this.DEFAULT_DATE_FORMAT
      } = options;

      const formattedData = data.map(item => ({
        date: DateHelper.formatDate(item.date, dateFormat),
        orderId: item.orderId,
        customerName: item.customerName,
        items: item.items,
        subtotal: this.formatCurrency(item.subtotal, currency),
        tax: this.formatCurrency(item.tax, currency),
        discount: this.formatCurrency(item.discount, currency),
        total: this.formatCurrency(item.total, currency),
        paymentMethod: item.paymentMethod,
        status: item.status
      }));

      if (includeTotals) {
        const totals = this.calculateSalesTotals(data);
        return {
          data: formattedData,
          summary: {
            totalOrders: data.length,
            totalRevenue: this.formatCurrency(totals.revenue, currency),
            totalTax: this.formatCurrency(totals.tax, currency),
            totalDiscount: this.formatCurrency(totals.discount, currency),
            averageOrderValue: this.formatCurrency(totals.averageOrder, currency),
            currency
          },
          groupedData: this.groupSalesData(data, groupBy, dateFormat)
        };
      }

      return { data: formattedData };
    } catch (error) {
      logger.error('Error formatting sales report:', error);
      throw new Error('Failed to format sales report');
    }
  }

  /**
   * Format inventory report data
   * @param data - Inventory data to format
   * @param options - Formatting options
   * @returns Formatted inventory report
   */
  static formatInventoryReport(
    data: any[],
    options: {
      includeSummary?: boolean;
      groupBy?: 'category' | 'location' | 'supplier' | 'status';
      includeLowStock?: boolean;
      includeExpiring?: boolean;
      currency?: string;
    } = {}
  ): any {
    try {
      const {
        includeSummary = true,
        groupBy = 'category',
        includeLowStock = true,
        includeExpiring = true,
        currency = this.DEFAULT_CURRENCY_CODE
      } = options;

      const formattedData = data.map(item => ({
        itemId: item.itemId,
        name: item.name,
        category: item.category,
        location: item.location,
        supplier: item.supplier,
        currentStock: item.currentStock,
        minStock: item.minStock,
        maxStock: item.maxStock,
        unitPrice: this.formatCurrency(item.unitPrice, currency),
        totalValue: this.formatCurrency(item.currentStock * item.unitPrice, currency),
        lastUpdated: DateHelper.formatDateTime(item.lastUpdated),
        status: item.status,
        expiryDate: item.expiryDate ? DateHelper.formatDate(item.expiryDate) : null,
        daysUntilExpiry: item.expiryDate ? DateHelper.getDaysUntilExpiry(item.expiryDate) : null
      }));

      if (includeSummary) {
        const summary = this.calculateInventorySummary(data, currency);
        return {
          data: formattedData,
          summary,
          lowStockItems: includeLowStock ? this.getLowStockItems(data) : [],
          expiringItems: includeExpiring ? this.getExpiringItems(data) : [],
          groupedData: this.groupInventoryData(data, groupBy)
        };
      }

      return { data: formattedData };
    } catch (error) {
      logger.error('Error formatting inventory report:', error);
      throw new Error('Failed to format inventory report');
    }
  }

  /**
   * Format customer report data
   * @param data - Customer data to format
   * @param options - Formatting options
   * @returns Formatted customer report
   */
  static formatCustomerReport(
    data: any[],
    options: {
      includeStats?: boolean;
      groupBy?: 'location' | 'age' | 'registrationDate' | 'totalSpent';
      currency?: string;
      dateFormat?: string;
    } = {}
  ): any {
    try {
      const {
        includeStats = true,
        groupBy = 'location',
        currency = this.DEFAULT_CURRENCY_CODE,
        dateFormat = this.DEFAULT_DATE_FORMAT
      } = options;

      const formattedData = data.map(customer => ({
        customerId: customer.customerId,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        location: customer.location,
        age: customer.birthDate ? DateHelper.getAge(customer.birthDate) : null,
        registrationDate: DateHelper.formatDate(customer.registrationDate, dateFormat),
        totalOrders: customer.totalOrders,
        totalSpent: this.formatCurrency(customer.totalSpent, currency),
        averageOrderValue: this.formatCurrency(customer.averageOrderValue, currency),
        lastOrderDate: customer.lastOrderDate ? DateHelper.formatDate(customer.lastOrderDate, dateFormat) : null,
        status: customer.status
      }));

      if (includeStats) {
        const stats = this.calculateCustomerStats(data, currency);
        return {
          data: formattedData,
          stats,
          groupedData: this.groupCustomerData(data, groupBy, dateFormat)
        };
      }

      return { data: formattedData };
    } catch (error) {
      logger.error('Error formatting customer report:', error);
      throw new Error('Failed to format customer report');
    }
  }

  /**
   * Format supplier report data
   * @param data - Supplier data to format
   * @param options - Formatting options
   * @returns Formatted supplier report
   */
  static formatSupplierReport(
    data: any[],
    options: {
      includePerformance?: boolean;
      groupBy?: 'category' | 'location' | 'rating' | 'status';
      currency?: string;
      dateFormat?: string;
    } = {}
  ): any {
    try {
      const {
        includePerformance = true,
        groupBy = 'category',
        currency = this.DEFAULT_CURRENCY_CODE,
        dateFormat = this.DEFAULT_DATE_FORMAT
      } = options;

      const formattedData = data.map(supplier => ({
        supplierId: supplier.supplierId,
        name: supplier.name,
        category: supplier.category,
        location: supplier.location,
        contactPerson: supplier.contactPerson,
        email: supplier.email,
        phone: supplier.phone,
        rating: supplier.rating,
        totalOrders: supplier.totalOrders,
        totalValue: this.formatCurrency(supplier.totalValue, currency),
        averageOrderValue: this.formatCurrency(supplier.averageOrderValue, currency),
        lastOrderDate: supplier.lastOrderDate ? DateHelper.formatDate(supplier.lastOrderDate, dateFormat) : null,
        onTimeDelivery: supplier.onTimeDelivery,
        qualityRating: supplier.qualityRating,
        status: supplier.status
      }));

      if (includePerformance) {
        const performance = this.calculateSupplierPerformance(data, currency);
        return {
          data: formattedData,
          performance,
          groupedData: this.groupSupplierData(data, groupBy)
        };
      }

      return { data: formattedData };
    } catch (error) {
      logger.error('Error formatting supplier report:', error);
      throw new Error('Failed to format supplier report');
    }
  }

  /**
   * Format medicine/product report data
   * @param data - Medicine data to format
   * @param options - Formatting options
   * @returns Formatted medicine report
   */
  static formatMedicineReport(
    data: any[],
    options: {
      includeAnalytics?: boolean;
      groupBy?: 'category' | 'manufacturer' | 'status' | 'expiryStatus';
      currency?: string;
      dateFormat?: string;
    } = {}
  ): any {
    try {
      const {
        includeAnalytics = true,
        groupBy = 'category',
        currency = this.DEFAULT_CURRENCY_CODE,
        dateFormat = this.DEFAULT_DATE_FORMAT
      } = options;

      const formattedData = data.map(medicine => ({
        medicineId: medicine.medicineId,
        name: medicine.name,
        genericName: medicine.genericName,
        category: medicine.category,
        manufacturer: medicine.manufacturer,
        strength: medicine.strength,
        dosageForm: medicine.dosageForm,
        currentStock: medicine.currentStock,
        unitPrice: this.formatCurrency(medicine.unitPrice, currency),
        totalValue: this.formatCurrency(medicine.currentStock * medicine.unitPrice, currency),
        expiryDate: medicine.expiryDate ? DateHelper.formatDate(medicine.expiryDate, dateFormat) : null,
        daysUntilExpiry: medicine.expiryDate ? DateHelper.getDaysUntilExpiry(medicine.expiryDate) : null,
        status: medicine.status,
        prescriptionRequired: medicine.prescriptionRequired
      }));

      if (includeAnalytics) {
        const analytics = this.calculateMedicineAnalytics(data, currency);
        return {
          data: formattedData,
          analytics,
          groupedData: this.groupMedicineData(data, groupBy)
        };
      }

      return { data: formattedData };
    } catch (error) {
      logger.error('Error formatting medicine report:', error);
      throw new Error('Failed to format medicine report');
    }
  }

  /**
   * Format dashboard summary data
   * @param data - Dashboard data to format
   * @param options - Formatting options
   * @returns Formatted dashboard summary
   */
  static formatDashboardSummary(
    data: any,
    options: {
      currency?: string;
      dateFormat?: string;
      includeCharts?: boolean;
    } = {}
  ): any {
    try {
      const {
        currency = this.DEFAULT_CURRENCY_CODE,
        dateFormat = this.DEFAULT_DATE_FORMAT,
        includeCharts = true
      } = options;

      const formattedSummary = {
        overview: {
          totalRevenue: this.formatCurrency(data.totalRevenue, currency),
          totalOrders: data.totalOrders,
          totalCustomers: data.totalCustomers,
          totalProducts: data.totalProducts,
          averageOrderValue: this.formatCurrency(data.averageOrderValue, currency)
        },
        sales: {
          today: this.formatCurrency(data.sales.today, currency),
          thisWeek: this.formatCurrency(data.sales.thisWeek, currency),
          thisMonth: this.formatCurrency(data.sales.thisMonth, currency),
          thisYear: this.formatCurrency(data.sales.thisYear, currency)
        },
        inventory: {
          totalItems: data.inventory.totalItems,
          lowStockItems: data.inventory.lowStockItems,
          outOfStockItems: data.inventory.outOfStockItems,
          expiringItems: data.inventory.expiringItems
        },
        customers: {
          newCustomers: data.customers.newCustomers,
          activeCustomers: data.customers.activeCustomers,
          returningCustomers: data.customers.returningCustomers
        },
        lastUpdated: DateHelper.formatDateTime(data.lastUpdated, dateFormat)
      };

      if (includeCharts && data.charts) {
        formattedSummary.charts = {
          salesTrend: this.formatChartData(data.charts.salesTrend, dateFormat),
          topProducts: data.charts.topProducts,
          topCategories: data.charts.topCategories,
          customerGrowth: this.formatChartData(data.charts.customerGrowth, dateFormat)
        };
      }

      return formattedSummary;
    } catch (error) {
      logger.error('Error formatting dashboard summary:', error);
      throw new Error('Failed to format dashboard summary');
    }
  }

  /**
   * Export report to CSV format
   * @param data - Data to export
   * @param headers - CSV headers
   * @returns CSV string
   */
  static exportToCSV(data: any[], headers: string[]): string {
    try {
      if (!data || data.length === 0) {
        return '';
      }

      const csvHeaders = headers.join(',');
      const csvRows = data.map(row => {
        return headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',');
      });

      return [csvHeaders, ...csvRows].join('\n');
    } catch (error) {
      logger.error('Error exporting to CSV:', error);
      throw new Error('Failed to export to CSV');
    }
  }

  /**
   * Export report to JSON format
   * @param data - Data to export
   * @param options - Export options
   * @returns JSON string
   */
  static exportToJSON(
    data: any,
    options: {
      pretty?: boolean;
      includeMetadata?: boolean;
    } = {}
  ): string {
    try {
      const {
        pretty = false,
        includeMetadata = true
      } = options;

      let exportData = data;

      if (includeMetadata) {
        exportData = {
          metadata: {
            exportedAt: DateHelper.getCurrentDateTime(),
            totalRecords: Array.isArray(data) ? data.length : 1,
            format: 'JSON'
          },
          data
        };
      }

      return pretty ? JSON.stringify(exportData, null, 2) : JSON.stringify(exportData);
    } catch (error) {
      logger.error('Error exporting to JSON:', error);
      throw new Error('Failed to export to JSON');
    }
  }

  // Private helper methods

  private static formatCurrency(amount: number, currency: string): string {
    try {
      return new Intl.NumberFormat(this.DEFAULT_CURRENCY_FORMAT, {
        style: 'currency',
        currency: currency
      }).format(amount);
    } catch (error) {
      return `${currency} ${amount.toFixed(2)}`;
    }
  }

  private static calculateSalesTotals(data: any[]): any {
    const totals = data.reduce((acc, item) => {
      acc.revenue += item.total || 0;
      acc.tax += item.tax || 0;
      acc.discount += item.discount || 0;
      return acc;
    }, { revenue: 0, tax: 0, discount: 0 });

    totals.averageOrder = data.length > 0 ? totals.revenue / data.length : 0;
    return totals;
  }

  private static groupSalesData(data: any[], groupBy: string, dateFormat: string): any {
    const grouped = data.reduce((acc, item) => {
      let key: string;

      switch (groupBy) {
        case 'day':
          key = DateHelper.formatDate(item.date, 'YYYY-MM-DD');
          break;
        case 'week':
          key = `Week ${DateHelper.getStartOfWeek(item.date).getTime()}`;
          break;
        case 'month':
          key = DateHelper.formatDate(item.date, 'YYYY-MM');
          break;
        case 'quarter':
          const month = new Date(item.date).getMonth();
          const quarter = Math.floor(month / 3) + 1;
          key = `Q${quarter} ${new Date(item.date).getFullYear()}`;
          break;
        case 'year':
          key = new Date(item.date).getFullYear().toString();
          break;
        default:
          key = DateHelper.formatDate(item.date, 'YYYY-MM-DD');
      }

      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});

    return Object.keys(grouped).map(key => ({
      period: key,
      orders: grouped[key],
      totalRevenue: grouped[key].reduce((sum: number, item: any) => sum + (item.total || 0), 0),
      orderCount: grouped[key].length
    }));
  }

  private static calculateInventorySummary(data: any[], currency: string): any {
    const summary = data.reduce((acc, item) => {
      acc.totalItems += item.currentStock || 0;
      acc.totalValue += (item.currentStock || 0) * (item.unitPrice || 0);
      acc.lowStockCount += (item.currentStock || 0) <= (item.minStock || 0) ? 1 : 0;
      acc.outOfStockCount += (item.currentStock || 0) === 0 ? 1 : 0;
      return acc;
    }, { totalItems: 0, totalValue: 0, lowStockCount: 0, outOfStockCount: 0 });

    summary.totalValue = this.formatCurrency(summary.totalValue, currency);
    return summary;
  }

  private static getLowStockItems(data: any[]): any[] {
    return data.filter(item => (item.currentStock || 0) <= (item.minStock || 0));
  }

  private static getExpiringItems(data: any[]): any[] {
    return data.filter(item => {
      if (!item.expiryDate) return false;
      const daysUntilExpiry = DateHelper.getDaysUntilExpiry(item.expiryDate);
      return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
    });
  }

  private static groupInventoryData(data: any[], groupBy: string): any {
    const grouped = data.reduce((acc, item) => {
      const key = item[groupBy] || 'Unknown';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});

    return Object.keys(grouped).map(key => ({
      group: key,
      items: grouped[key],
      count: grouped[key].length,
      totalValue: grouped[key].reduce((sum: number, item: any) => 
        sum + ((item.currentStock || 0) * (item.unitPrice || 0)), 0
      )
    }));
  }

  private static calculateCustomerStats(data: any[], currency: string): any {
    const stats = data.reduce((acc, customer) => {
      acc.totalCustomers++;
      acc.totalRevenue += customer.totalSpent || 0;
      if (customer.totalOrders > 0) {
        acc.totalOrders += customer.totalOrders;
        acc.customersWithOrders++;
      }
      return acc;
    }, { totalCustomers: 0, totalRevenue: 0, totalOrders: 0, customersWithOrders: 0 });

    stats.averageRevenuePerCustomer = stats.totalCustomers > 0 ? stats.totalRevenue / stats.totalCustomers : 0;
    stats.averageOrdersPerCustomer = stats.customersWithOrders > 0 ? stats.totalOrders / stats.customersWithOrders : 0;
    stats.totalRevenue = this.formatCurrency(stats.totalRevenue, currency);
    stats.averageRevenuePerCustomer = this.formatCurrency(stats.averageRevenuePerCustomer, currency);

    return stats;
  }

  private static groupCustomerData(data: any[], groupBy: string, dateFormat: string): any {
    const grouped = data.reduce((acc, customer) => {
      let key: string;

      switch (groupBy) {
        case 'location':
          key = customer.location || 'Unknown';
          break;
        case 'age':
          const age = customer.birthDate ? DateHelper.getAge(customer.birthDate) : 0;
          if (age < 18) key = 'Under 18';
          else if (age < 30) key = '18-29';
          else if (age < 50) key = '30-49';
          else if (age < 65) key = '50-64';
          else key = '65+';
          break;
        case 'registrationDate':
          key = DateHelper.formatDate(customer.registrationDate, 'YYYY-MM');
          break;
        case 'totalSpent':
          const spent = customer.totalSpent || 0;
          if (spent < 100) key = 'Under $100';
          else if (spent < 500) key = '$100-$499';
          else if (spent < 1000) key = '$500-$999';
          else key = '$1000+';
          break;
        default:
          key = customer.location || 'Unknown';
      }

      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(customer);
      return acc;
    }, {});

    return Object.keys(grouped).map(key => ({
      group: key,
      customers: grouped[key],
      count: grouped[key].length,
      totalRevenue: grouped[key].reduce((sum: number, customer: any) => sum + (customer.totalSpent || 0), 0)
    }));
  }

  private static calculateSupplierPerformance(data: any[], currency: string): any {
    const performance = data.reduce((acc, supplier) => {
      acc.totalSuppliers++;
      acc.totalOrders += supplier.totalOrders || 0;
      acc.totalValue += supplier.totalValue || 0;
      acc.totalRating += supplier.rating || 0;
      return acc;
    }, { totalSuppliers: 0, totalOrders: 0, totalValue: 0, totalRating: 0 });

    performance.averageRating = performance.totalSuppliers > 0 ? performance.totalRating / performance.totalSuppliers : 0;
    performance.averageOrderValue = performance.totalOrders > 0 ? performance.totalValue / performance.totalOrders : 0;
    performance.totalValue = this.formatCurrency(performance.totalValue, currency);
    performance.averageOrderValue = this.formatCurrency(performance.averageOrderValue, currency);

    return performance;
  }

  private static groupSupplierData(data: any[], groupBy: string): any {
    const grouped = data.reduce((acc, supplier) => {
      let key: string;

      switch (groupBy) {
        case 'category':
          key = supplier.category || 'Unknown';
          break;
        case 'location':
          key = supplier.location || 'Unknown';
          break;
        case 'rating':
          const rating = supplier.rating || 0;
          if (rating >= 4.5) key = 'Excellent (4.5+)';
          else if (rating >= 4.0) key = 'Good (4.0-4.4)';
          else if (rating >= 3.5) key = 'Average (3.5-3.9)';
          else key = 'Below Average (<3.5)';
          break;
        case 'status':
          key = supplier.status || 'Unknown';
          break;
        default:
          key = supplier.category || 'Unknown';
      }

      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(supplier);
      return acc;
    }, {});

    return Object.keys(grouped).map(key => ({
      group: key,
      suppliers: grouped[key],
      count: grouped[key].length,
      averageRating: grouped[key].reduce((sum: number, supplier: any) => sum + (supplier.rating || 0), 0) / grouped[key].length
    }));
  }

  private static calculateMedicineAnalytics(data: any[], currency: string): any {
    const analytics = data.reduce((acc, medicine) => {
      acc.totalProducts++;
      acc.totalStock += medicine.currentStock || 0;
      acc.totalValue += (medicine.currentStock || 0) * (medicine.unitPrice || 0);
      if (medicine.prescriptionRequired) {
        acc.prescriptionRequired++;
      }
      return acc;
    }, { totalProducts: 0, totalStock: 0, totalValue: 0, prescriptionRequired: 0 });

    analytics.averagePrice = analytics.totalStock > 0 ? analytics.totalValue / analytics.totalStock : 0;
    analytics.totalValue = this.formatCurrency(analytics.totalValue, currency);
    analytics.averagePrice = this.formatCurrency(analytics.averagePrice, currency);

    return analytics;
  }

  private static groupMedicineData(data: any[], groupBy: string): any {
    const grouped = data.reduce((acc, medicine) => {
      let key: string;

      switch (groupBy) {
        case 'category':
          key = medicine.category || 'Unknown';
          break;
        case 'manufacturer':
          key = medicine.manufacturer || 'Unknown';
          break;
        case 'status':
          key = medicine.status || 'Unknown';
          break;
        case 'expiryStatus':
          if (!medicine.expiryDate) {
            key = 'No Expiry';
          } else {
            const daysUntilExpiry = DateHelper.getDaysUntilExpiry(medicine.expiryDate);
            if (daysUntilExpiry < 0) key = 'Expired';
            else if (daysUntilExpiry <= 30) key = 'Expiring Soon (≤30 days)';
            else if (daysUntilExpiry <= 90) key = 'Expiring Soon (≤90 days)';
            else key = 'Valid (>90 days)';
          }
          break;
        default:
          key = medicine.category || 'Unknown';
      }

      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(medicine);
      return acc;
    }, {});

    return Object.keys(grouped).map(key => ({
      group: key,
      medicines: grouped[key],
      count: grouped[key].length,
      totalStock: grouped[key].reduce((sum: number, medicine: any) => sum + (medicine.currentStock || 0), 0)
    }));
  }

  private static formatChartData(data: any[], dateFormat: string): any[] {
    return data.map(item => ({
      ...item,
      date: item.date ? DateHelper.formatDate(item.date, dateFormat) : item.date
    }));
  }
}

// Export individual functions for convenience
export const {
  formatSalesReport,
  formatInventoryReport,
  formatCustomerReport,
  formatSupplierReport,
  formatMedicineReport,
  formatDashboardSummary,
  exportToCSV,
  exportToJSON
} = ReportFormatter;

export default ReportFormatter;
