import {
  IUser,
  IMedicine,
  IOrder,
  ISupplier,
  IInventoryItem,
  IPrescription,
  IReview,
  IAuditLog,
  ISearchFilters,
  IPaginationOptions,
  ISearchResult
} from '@/models';

// Base repository interface
export interface IBaseRepository<T> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findOne(filter: Partial<T>): Promise<T | null>;
  findMany(filter?: Partial<T>, options?: RepositoryOptions): Promise<T[]>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
  count(filter?: Partial<T>): Promise<number>;
}

// Repository options for queries
export interface RepositoryOptions {
  pagination?: IPaginationOptions;
  search?: ISearchFilters;
  include?: string[];
  orderBy?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  select?: string[];
}

// Extended repository options with specific features
export interface ExtendedRepositoryOptions extends RepositoryOptions {
  withDeleted?: boolean;
  cache?: boolean;
  timeout?: number;
}

// Repository result wrapper
export interface RepositoryResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    count?: number;
    totalPages?: number;
    currentPage?: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
  };
}

// Paginated repository result
export interface PaginatedRepositoryResult<T> extends RepositoryResult<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Search repository result
export interface SearchRepositoryResult<T> extends RepositoryResult<T[]> {
  search: {
    query: string;
    filters: ISearchFilters;
    results: T[];
    total: number;
    suggestions?: string[];
  };
}

// User repository interface
export interface IUserRepository extends IBaseRepository<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  findByPhone(phone: string): Promise<IUser | null>;
  findByRole(role: string): Promise<IUser[]>;
  findByStatus(status: string): Promise<IUser[]>;
  updatePassword(userId: string, hashedPassword: string): Promise<boolean>;
  updateLastLogin(userId: string): Promise<boolean>;
  deactivateUser(userId: string): Promise<boolean>;
  reactivateUser(userId: string): Promise<boolean>;
  getUsersByRole(role: string, options?: RepositoryOptions): Promise<PaginatedRepositoryResult<IUser>>;
  searchUsers(query: string, filters?: ISearchFilters, options?: RepositoryOptions): Promise<SearchRepositoryResult<IUser>>;
}

// Medicine repository interface
export interface IMedicineRepository extends IBaseRepository<IMedicine> {
  findByName(name: string): Promise<IMedicine[]>;
  findByCategory(category: string): Promise<IMedicine[]>;
  findByManufacturer(manufacturer: string): Promise<IMedicine[]>;
  findByDosageForm(dosageForm: string): Promise<IMedicine[]>;
  findBySchedule(schedule: string): Promise<IMedicine[]>;
  findExpiringMedicines(days: number): Promise<IMedicine[]>;
  findLowStockMedicines(threshold: number): Promise<IMedicine[]>;
  updateStock(medicineId: string, quantity: number): Promise<boolean>;
  getMedicineWithInventory(medicineId: string): Promise<IMedicine & { inventory: IInventoryItem }>;
  searchMedicines(query: string, filters?: ISearchFilters, options?: RepositoryOptions): Promise<SearchRepositoryResult<IMedicine>>;
  getMedicinesByCategory(category: string, options?: RepositoryOptions): Promise<PaginatedRepositoryResult<IMedicine>>;
}

// Order repository interface
export interface IOrderRepository extends IBaseRepository<IOrder> {
  findByCustomer(customerId: string): Promise<IOrder[]>;
  findByStatus(status: string): Promise<IOrder[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<IOrder[]>;
  findByPaymentStatus(paymentStatus: string): Promise<IOrder[]>;
  findPendingOrders(): Promise<IOrder[]>;
  findCompletedOrders(): Promise<IOrder[]>;
  findCancelledOrders(): Promise<IOrder[]>;
  updateOrderStatus(orderId: string, status: string): Promise<boolean>;
  updatePaymentStatus(orderId: string, paymentStatus: string): Promise<boolean>;
  getOrderWithItems(orderId: string): Promise<IOrder & { items: IOrderItem[] }>;
  getOrdersByCustomer(customerId: string, options?: RepositoryOptions): Promise<PaginatedRepositoryResult<IOrder>>;
  getOrdersByDateRange(startDate: Date, endDate: Date, options?: RepositoryOptions): Promise<PaginatedRepositoryResult<IOrder>>;
  searchOrders(query: string, filters?: ISearchFilters, options?: RepositoryOptions): Promise<SearchRepositoryResult<IOrder>>;
}

// Supplier repository interface
export interface ISupplierRepository extends IBaseRepository<ISupplier> {
  findByName(name: string): Promise<ISupplier[]>;
  findByCategory(category: string): Promise<ISupplier[]>;
  findByLocation(location: string): Promise<ISupplier[]>;
  findActiveSuppliers(): Promise<ISupplier[]>;
  findInactiveSuppliers(): Promise<ISupplier[]>;
  updateContactInfo(supplierId: string, contactInfo: any): Promise<boolean>;
  updateRating(supplierId: string, rating: number): Promise<boolean>;
  getSupplierWithMedicines(supplierId: string): Promise<ISupplier & { medicines: IMedicine[] }>;
  searchSuppliers(query: string, filters?: ISearchFilters, options?: RepositoryOptions): Promise<SearchRepositoryResult<ISupplier>>;
  getSuppliersByCategory(category: string, options?: RepositoryOptions): Promise<PaginatedRepositoryResult<ISupplier>>;
}

// Inventory repository interface
export interface IInventoryRepository extends IBaseRepository<IInventoryItem> {
  findByMedicine(medicineId: string): Promise<IInventoryItem | null>;
  findByLocation(location: string): Promise<IInventoryItem[]>;
  findByStatus(status: string): Promise<IInventoryItem[]>;
  findLowStockItems(threshold: number): Promise<IInventoryItem[]>;
  findExpiringItems(days: number): Promise<IInventoryItem[]>;
  findOutOfStockItems(): Promise<IInventoryItem[]>;
  updateQuantity(itemId: string, quantity: number): Promise<boolean>;
  updateLocation(itemId: string, location: string): Promise<boolean>;
  updateStatus(itemId: string, status: string): Promise<boolean>;
  getInventoryWithMedicine(itemId: string): Promise<IInventoryItem & { medicine: IMedicine }>;
  getInventoryStats(): Promise<{
    totalItems: number;
    lowStockItems: number;
    outOfStockItems: number;
    expiringItems: number;
    totalValue: number;
  }>;
  searchInventory(query: string, filters?: ISearchFilters, options?: RepositoryOptions): Promise<SearchRepositoryResult<IInventoryItem>>;
  getInventoryByLocation(location: string, options?: RepositoryOptions): Promise<PaginatedRepositoryResult<IInventoryItem>>;
}

// Repository transaction interface
export interface IRepositoryTransaction {
  commit(): Promise<void>;
  rollback(): Promise<void>;
  isActive(): boolean;
}

// Repository factory interface
export interface IRepositoryFactory {
  getUserRepository(): IUserRepository;
  getMedicineRepository(): IMedicineRepository;
  getOrderRepository(): IOrderRepository;
  getSupplierRepository(): ISupplierRepository;
  getInventoryRepository(): IInventoryRepository;
  beginTransaction(): Promise<IRepositoryTransaction>;
}

// Export all types
export type {
  IBaseRepository,
  RepositoryOptions,
  ExtendedRepositoryOptions,
  RepositoryResult,
  PaginatedRepositoryResult,
  SearchRepositoryResult,
  IUserRepository,
  IMedicineRepository,
  IOrderRepository,
  ISupplierRepository,
  IInventoryRepository,
  IRepositoryTransaction,
  IRepositoryFactory
};
