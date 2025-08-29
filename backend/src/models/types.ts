// Base types for all entities
export type BaseEntity = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
};

// User-related types
export type UserRole = 'ADMIN' | 'PHARMACIST' | 'STAFF' | 'CUSTOMER';

export type UserAddress = {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
};

export type UserPreferences = {
  notifications: boolean;
  language: string;
  timezone: string;
};

export type UserProfile = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  profileImage?: string;
  address?: UserAddress;
  preferences: UserPreferences;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLogin?: Date;
};

// Medicine-related types
export type DosageForm = 'TABLET' | 'CAPSULE' | 'LIQUID' | 'INJECTION' | 'CREAM' | 'OINTMENT' | 'DROPS' | 'INHALER' | 'SUPPOSITORY';

export type Schedule = 'OTC' | 'SCHEDULE_I' | 'SCHEDULE_II' | 'SCHEDULE_III' | 'SCHEDULE_IV' | 'SCHEDULE_V';

export type MedicineInfo = {
  name: string;
  genericName: string;
  brandName: string;
  description: string;
  activeIngredients: string[];
  dosageForm: DosageForm;
  strength: string;
  unit: string;
  manufacturer: string;
  prescriptionRequired: boolean;
  controlledSubstance: boolean;
  schedule: Schedule;
  sideEffects: string[];
  contraindications: string[];
  interactions: string[];
  storageConditions: string;
  requiresRefrigeration: boolean;
  tags: string[];
};

export type MedicinePricing = {
  price: number;
  cost: number;
  taxRate: number;
  discountPercentage: number;
  finalPrice: number;
  profitMargin: number;
  profitMarginPercentage: number;
};

export type MedicineInventory = {
  expiryDate: Date;
  batchNumber: string;
  sku: string;
  barcode?: string;
  imageUrl?: string;
};

// Inventory types
export type InventoryLevel = {
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  location?: string;
  reorderPoint: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
};

// Order types
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'CASH' | 'DIGITAL_WALLET';

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export type OrderSummary = {
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  finalAmount: number;
  itemCount: number;
};

// Prescription types
export type PrescriptionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISPENSED' | 'EXPIRED' | 'CANCELLED';

export type PrescriptionItem = {
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  quantity: number;
};

// Supplier types
export type SupplierContact = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

// Review types
export type ReviewRating = 1 | 2 | 3 | 4 | 5;

export type ReviewData = {
  rating: ReviewRating;
  comment?: string;
  helpful: number;
  notHelpful: number;
};

// Audit types
export type AuditAction = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'IMPORT';

export type AuditEntity = 'USER' | 'MEDICINE' | 'CATEGORY' | 'SUPPLIER' | 'INVENTORY' | 'PRESCRIPTION' | 'ORDER' | 'REVIEW';

export type AuditData = {
  action: AuditAction;
  entityType: AuditEntity;
  entityId: string;
  userId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
};

// Search and filter types
export type SearchFilters = {
  query?: string;
  category?: string;
  supplier?: string;
  priceRange?: { min: number; max: number };
  inStock?: boolean;
  prescriptionRequired?: boolean;
  tags?: string[];
};

export type PaginationOptions = {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type SearchResult<T> = {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

// API response types
export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
  path: string;
};

export type PaginatedResponse<T> = ApiResponse<SearchResult<T>>;

// Validation types
export type ValidationError = {
  field: string;
  message: string;
  value?: any;
};

export type ValidationResult = {
  isValid: boolean;
  errors: ValidationError[];
};

// Export all types
export type {
  BaseEntity,
  UserRole,
  UserAddress,
  UserPreferences,
  UserProfile,
  DosageForm,
  Schedule,
  MedicineInfo,
  MedicinePricing,
  MedicineInventory,
  InventoryLevel,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  OrderSummary,
  PrescriptionStatus,
  PrescriptionItem,
  SupplierContact,
  ReviewRating,
  ReviewData,
  AuditAction,
  AuditEntity,
  AuditData,
  SearchFilters,
  PaginationOptions,
  SearchResult,
  ApiResponse,
  PaginatedResponse,
  ValidationError,
  ValidationResult
};
