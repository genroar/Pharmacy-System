import {
  IUser,
  IMedicine,
  IOrder,
  ISupplier,
  IInventoryItem,
  IPrescription,
  ISearchFilters,
  IPaginationOptions,
  ISearchResult,
  UserRole,
  OrderStatus,
  PaymentStatus,
  InventoryStatus
} from '@/models';

// Service function types
export type ServiceFunction<T = any> = (...args: any[]) => Promise<T>;

// Authentication service types
export interface AuthServiceInterface {
  registerUser(userData: IUserCreate): Promise<{ user: IUser; token: string }>;
  authenticateUser(email: string, password: string): Promise<{ user: IUser; token: string }>;
  validateToken(token: string): Promise<{ userId: string; email: string; role: string }>;
  refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }>;
  changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean>;
  generatePasswordResetToken(email: string): Promise<string>;
  resetPassword(token: string, newPassword: string): Promise<boolean>;
  verifyEmail(token: string): Promise<boolean>;
  sendVerificationEmail(email: string): Promise<boolean>;
}

export interface IUserCreate {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role?: UserRole;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface IUserUpdate {
  firstName?: string;
  lastName?: string;
  phone?: string;
  profileImage?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  notifications?: boolean;
  language?: string;
  timezone?: string;
}

// Inventory service types
export interface InventoryServiceInterface {
  addMedicine(medicineData: IMedicineCreate): Promise<IMedicine>;
  updateMedicine(id: string, updates: IMedicineUpdate): Promise<IMedicine>;
  removeMedicine(id: string): Promise<boolean>;
  getMedicine(id: string): Promise<IMedicine | null>;
  searchMedicines(filters: ISearchFilters, pagination: IPaginationOptions): Promise<ISearchResult<IMedicine>>;
  updateStock(medicineId: string, quantity: number, operation: 'add' | 'subtract'): Promise<IInventoryItem>;
  checkLowStock(threshold: number): Promise<IInventoryItem[]>;
  getExpiringMedicines(days: number): Promise<IInventoryItem[]>;
  getInventoryStats(): Promise<InventoryStats>;
  adjustInventory(medicineId: string, adjustment: InventoryAdjustment): Promise<IInventoryItem>;
  transferInventory(fromId: string, toId: string, quantity: number): Promise<boolean>;
}

export interface IMedicineCreate {
  name: string;
  genericName: string;
  brandName: string;
  description: string;
  activeIngredients: string[];
  dosageForm: string;
  strength: string;
  unit: string;
  manufacturer: string;
  prescriptionRequired?: boolean;
  controlledSubstance?: boolean;
  schedule?: string;
  sideEffects?: string[];
  contraindications?: string[];
  interactions?: string[];
  storageConditions: string;
  expiryDate: string;
  batchNumber: string;
  sku: string;
  barcode?: string;
  requiresRefrigeration?: boolean;
  price: number;
  cost: number;
  taxRate?: number;
  discountPercentage?: number;
  imageUrl?: string;
  tags?: string[];
  categoryId: string;
  supplierId: string;
}

export interface IMedicineUpdate extends Partial<IMedicineCreate> {}

export interface InventoryAdjustment {
  quantity: number;
  reason: string;
  reference?: string;
  notes?: string;
}

export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  expiringItems: number;
  categories: { name: string; count: number; value: number }[];
}

// Sales service types
export interface SalesServiceInterface {
  createOrder(orderData: IOrderCreate): Promise<IOrder>;
  updateOrder(id: string, updates: IOrderUpdate): Promise<IOrder>;
  cancelOrder(id: string, reason: string): Promise<boolean>;
  getOrder(id: string): Promise<IOrder | null>;
  getOrders(filters: OrderFilters, pagination: IPaginationOptions): Promise<ISearchResult<IOrder>>;
  processPayment(orderId: string, paymentData: PaymentData): Promise<PaymentResult>;
  refundOrder(orderId: string, refundData: RefundData): Promise<RefundResult>;
  getSalesStats(period: SalesPeriod): Promise<SalesStats>;
  generateInvoice(orderId: string): Promise<string>;
  applyDiscount(orderId: string, discountCode: string): Promise<DiscountResult>;
}

export interface IOrderCreate {
  customerId: string;
  items: Array<{
    medicineId: string;
    quantity: number;
    unitPrice: number;
  }>;
  paymentMethod: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZipCode: string;
  shippingCountry: string;
  notes?: string;
}

export interface IOrderUpdate {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  shippingAddress?: string;
  shippingCity?: string;
  shippingState?: string;
  zipCode?: string;
  shippingCountry?: string;
  notes?: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  customerId?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
}

export interface PaymentData {
  method: string;
  amount: number;
  reference?: string;
  notes?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  message: string;
  error?: string;
}

export interface RefundData {
  amount: number;
  reason: string;
  notes?: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  message: string;
  error?: string;
}

export interface SalesPeriod {
  startDate: Date;
  endDate: Date;
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface SalesStats {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
  topCustomers: Array<{ name: string; orders: number; totalSpent: number }>;
  dailyTrends: Array<{ date: string; sales: number; orders: number }>;
}

export interface DiscountResult {
  success: boolean;
  discountAmount: number;
  message: string;
  error?: string;
}

// Report service types
export interface ReportServiceInterface {
  generateSalesReport(period: ReportPeriod, filters?: ReportFilters): Promise<SalesReport>;
  generateInventoryReport(filters?: ReportFilters): Promise<InventoryReport>;
  generateRevenueReport(period: ReportPeriod, filters?: ReportFilters): Promise<RevenueReport>;
  generateCustomerReport(period: ReportPeriod, filters?: ReportFilters): Promise<CustomerReport>;
  generateSupplierReport(period: ReportPeriod, filters?: ReportFilters): Promise<SupplierReport>;
  generateCustomReport(reportConfig: CustomReportConfig): Promise<CustomReport>;
  exportReport(report: any, format: ExportFormat): Promise<string>;
  scheduleReport(reportConfig: ScheduledReportConfig): Promise<string>;
  getReportHistory(): Promise<ReportHistory[]>;
}

export interface ReportPeriod {
  startDate: Date;
  endDate: Date;
  type: 'custom' | 'today' | 'yesterday' | 'week' | 'month' | 'quarter' | 'year';
}

export interface ReportFilters {
  categories?: string[];
  suppliers?: string[];
  customers?: string[];
  statuses?: string[];
  minAmount?: number;
  maxAmount?: number;
}

export interface SalesReport {
  period: ReportPeriod;
  summary: {
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
    growthRate: number;
  };
  breakdown: {
    byCategory: Array<{ category: string; sales: number; percentage: number }>;
    byProduct: Array<{ product: string; quantity: number; revenue: number }>;
    byDay: Array<{ date: string; sales: number; orders: number }>;
  };
  generatedAt: Date;
}

export interface InventoryReport {
  summary: {
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
  };
  breakdown: {
    byCategory: Array<{ category: string; items: number; value: number }>;
    bySupplier: Array<{ supplier: string; items: number; value: number }>;
    byStatus: Array<{ status: string; items: number; value: number }>;
  };
  generatedAt: Date;
}

export interface RevenueReport {
  period: ReportPeriod;
  summary: {
    totalRevenue: number;
    totalCost: number;
    grossProfit: number;
    netProfit: number;
    profitMargin: number;
  };
  breakdown: {
    byMonth: Array<{ month: string; revenue: number; profit: number }>;
    byCategory: Array<{ category: string; revenue: number; profit: number }>;
    byPaymentMethod: Array<{ method: string; revenue: number; count: number }>;
  };
  generatedAt: Date;
}

export interface CustomerReport {
  period: ReportPeriod;
  summary: {
    totalCustomers: number;
    newCustomers: number;
    activeCustomers: number;
    averageCustomerValue: number;
  };
  breakdown: {
    byLocation: Array<{ location: string; customers: number; revenue: number }>;
    byOrderCount: Array<{ range: string; customers: number; percentage: number }>;
    topCustomers: Array<{ customer: string; orders: number; totalSpent: number }>;
  };
  generatedAt: Date;
}

export interface SupplierReport {
  period: ReportPeriod;
  summary: {
    totalSuppliers: number;
    activeSuppliers: number;
    totalPurchases: number;
    averageLeadTime: number;
  };
  breakdown: {
    byPerformance: Array<{ supplier: string; rating: number; orders: number }>;
    byCategory: Array<{ category: string; suppliers: number; items: number }>;
    topSuppliers: Array<{ supplier: string; items: number; value: number }>;
  };
  generatedAt: Date;
}

export interface CustomReportConfig {
  name: string;
  description: string;
  dataSource: string;
  filters: Record<string, any>;
  aggregations: Array<{ field: string; operation: string; alias: string }>;
  grouping: Array<{ field: string; order: 'asc' | 'desc' }>;
  limit?: number;
}

export interface CustomReport {
  config: CustomReportConfig;
  data: any[];
  summary: Record<string, any>;
  generatedAt: Date;
}

export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json';

export interface ScheduledReportConfig {
  name: string;
  reportType: string;
  schedule: string; // cron expression
  recipients: string[];
  format: ExportFormat;
  filters?: ReportFilters;
  enabled: boolean;
}

export interface ReportHistory {
  id: string;
  name: string;
  type: string;
  generatedAt: Date;
  format: ExportFormat;
  size: number;
  status: 'completed' | 'failed' | 'in_progress';
  downloadUrl?: string;
}

// Sync service types
export interface SyncServiceInterface {
  pushData(entityType: string, data: any[], lastSyncTime?: Date): Promise<SyncResult>;
  pullData(entityType: string, lastSyncTime?: Date): Promise<SyncResult>;
  performFullSync(entityType: string): Promise<SyncResult>;
  getSyncStatus(entityType?: string): Promise<SyncStatus[]>;
  forceSync(entityType: string): Promise<SyncResult>;
  resolveConflicts(conflicts: SyncConflict[]): Promise<ConflictResolutionResult>;
  getSyncStatistics(): Promise<SyncStatistics>;
  backupBeforeSync(entityType: string): Promise<string>;
  restoreFromBackup(backupPath: string): Promise<boolean>;
}

export interface SyncResult {
  success: boolean;
  entityType: string;
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsDeleted: number;
  conflicts: number;
  errors: string[];
  syncTime: Date;
  message: string;
}

export interface SyncStatus {
  entityType: string;
  lastSyncTime: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  recordsProcessed: number;
  errors: string[];
  nextSyncTime?: Date;
}

export interface SyncConflict {
  id: string;
  entityType: string;
  localData: any;
  remoteData: any;
  conflictType: 'update' | 'delete' | 'create';
  timestamp: Date;
  resolution?: 'local' | 'remote' | 'manual';
}

export interface ConflictResolutionResult {
  success: boolean;
  conflictsResolved: number;
  errors: string[];
  message: string;
}

export interface SyncStatistics {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  totalRecordsProcessed: number;
  averageSyncTime: number;
  lastSyncTime: Date;
  entityTypeStats: Array<{
    entityType: string;
    syncCount: number;
    lastSync: Date;
    successRate: number;
  }>;
}

// Service response types
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message: string;
  timestamp: Date;
}

export interface PaginatedServiceResponse<T> extends ServiceResponse<ISearchResult<T>> {}

// Export all types
export type {
  ServiceFunction,
  AuthServiceInterface,
  InventoryServiceInterface,
  SalesServiceInterface,
  ReportServiceInterface,
  SyncServiceInterface,
  IUserCreate,
  IUserUpdate,
  IMedicineCreate,
  IMedicineUpdate,
  InventoryAdjustment,
  InventoryStats,
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
  SyncResult,
  SyncStatus,
  SyncConflict,
  ConflictResolutionResult,
  SyncStatistics,
  ServiceResponse,
  PaginatedServiceResponse
};
