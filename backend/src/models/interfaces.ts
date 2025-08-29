import { BaseEntity, UserRole, DosageForm, Schedule, OrderStatus, PaymentMethod, PaymentStatus, PrescriptionStatus } from './types';

// User interfaces
export interface IUser extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLogin?: Date;
  profileImage?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  notifications: boolean;
  language: string;
  timezone: string;
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
  notifications?: boolean;
  language?: string;
  timezone?: string;
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

export interface IUserLogin {
  email: string;
  password: string;
}

export interface IUserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  profileImage?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  preferences: {
    notifications: boolean;
    language: string;
    timezone: string;
  };
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Medicine interfaces
export interface IMedicine extends BaseEntity {
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
  expiryDate: Date;
  batchNumber: string;
  sku: string;
  barcode?: string;
  requiresRefrigeration: boolean;
  price: number;
  cost: number;
  taxRate: number;
  discountPercentage: number;
  imageUrl?: string;
  tags: string[];
  categoryId: string;
  supplierId: string;
}

export interface IMedicineCreate {
  name: string;
  genericName: string;
  brandName: string;
  description: string;
  activeIngredients: string[];
  dosageForm: DosageForm;
  strength: string;
  unit: string;
  manufacturer: string;
  prescriptionRequired?: boolean;
  controlledSubstance?: boolean;
  schedule?: Schedule;
  sideEffects?: string[];
  contraindications?: string[];
  interactions?: string[];
  storageConditions: string;
  expiryDate: Date;
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

export interface IMedicineUpdate {
  name?: string;
  genericName?: string;
  brandName?: string;
  description?: string;
  activeIngredients?: string[];
  dosageForm?: DosageForm;
  strength?: string;
  unit?: string;
  manufacturer?: string;
  prescriptionRequired?: boolean;
  controlledSubstance?: boolean;
  schedule?: Schedule;
  sideEffects?: string[];
  contraindications?: string[];
  interactions?: string[];
  storageConditions?: string;
  expiryDate?: Date;
  batchNumber?: string;
  barcode?: string;
  requiresRefrigeration?: boolean;
  price?: number;
  cost?: number;
  taxRate?: number;
  discountPercentage?: number;
  imageUrl?: string;
  tags?: string[];
  categoryId?: string;
  supplierId?: string;
}

// Category interfaces
export interface ICategory extends BaseEntity {
  name: string;
  description?: string;
}

export interface ICategoryCreate {
  name: string;
  description?: string;
}

export interface ICategoryUpdate {
  name?: string;
  description?: string;
}

// Supplier interfaces
export interface ISupplier extends BaseEntity {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ISupplierCreate {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ISupplierUpdate {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

// Inventory interfaces
export interface IInventoryItem extends BaseEntity {
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  location?: string;
  medicineId: string;
}

export interface IInventoryItemCreate {
  quantity: number;
  minQuantity?: number;
  maxQuantity?: number;
  location?: string;
  medicineId: string;
}

export interface IInventoryItemUpdate {
  quantity?: number;
  minQuantity?: number;
  maxQuantity?: number;
  location?: string;
}

export interface IInventoryLevel {
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  reorderPoint: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
}

// Order interfaces
export interface IOrder extends BaseEntity {
  orderNumber: string;
  customerId: string;
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  finalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZipCode: string;
  shippingCountry: string;
  notes?: string;
}

export interface IOrderCreate {
  customerId: string;
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: PaymentMethod;
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
  shippingZipCode?: string;
  shippingCountry?: string;
  notes?: string;
}

// Order Item interfaces
export interface IOrderItem extends BaseEntity {
  orderId: string;
  medicineId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IOrderItemCreate {
  orderId: string;
  medicineId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IOrderItemUpdate {
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
}

// Prescription interfaces
export interface IPrescription extends BaseEntity {
  prescriptionNumber: string;
  patientId: string;
  prescribedBy: string;
  prescribedDate: Date;
  expiryDate: Date;
  status: PrescriptionStatus;
  notes?: string;
}

export interface IPrescriptionCreate {
  patientId: string;
  prescribedBy: string;
  expiryDate: Date;
  notes?: string;
}

export interface IPrescriptionUpdate {
  status?: PrescriptionStatus;
  notes?: string;
}

// Prescription Item interfaces
export interface IPrescriptionItem extends BaseEntity {
  prescriptionId: string;
  medicineId: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  quantity: number;
}

export interface IPrescriptionItemCreate {
  prescriptionId: string;
  medicineId: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  quantity: number;
}

export interface IPrescriptionItemUpdate {
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  quantity?: number;
}

// Review interfaces
export interface IReview extends BaseEntity {
  userId: string;
  medicineId: string;
  rating: number;
  comment?: string;
}

export interface IReviewCreate {
  userId: string;
  medicineId: string;
  rating: number;
  comment?: string;
}

export interface IReviewUpdate {
  rating?: number;
  comment?: string;
}

// Audit Log interfaces
export interface IAuditLog extends BaseEntity {
  action: string;
  entityType: string;
  entityId: string;
  userId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface IAuditLogCreate {
  action: string;
  entityType: string;
  entityId: string;
  userId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

// Search interfaces
export interface ISearchFilters {
  query?: string;
  category?: string;
  supplier?: string;
  priceRange?: { min: number; max: number };
  inStock?: boolean;
  prescriptionRequired?: boolean;
  tags?: string[];
  dosageForm?: DosageForm;
  schedule?: Schedule;
}

export interface IPaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ISearchResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Export all interfaces
export type {
  IUser,
  IUserCreate,
  IUserUpdate,
  IUserLogin,
  IUserProfile,
  IMedicine,
  IMedicineCreate,
  IMedicineUpdate,
  ICategory,
  ICategoryCreate,
  ICategoryUpdate,
  ISupplier,
  ISupplierCreate,
  ISupplierUpdate,
  IInventoryItem,
  IInventoryItemCreate,
  IInventoryItemUpdate,
  IInventoryLevel,
  IOrder,
  IOrderCreate,
  IOrderUpdate,
  IOrderItem,
  IOrderItemCreate,
  IOrderItemUpdate,
  IPrescription,
  IPrescriptionCreate,
  IPrescriptionUpdate,
  IPrescriptionItem,
  IPrescriptionItemCreate,
  IPrescriptionItemUpdate,
  IReview,
  IReviewCreate,
  IReviewUpdate,
  IAuditLog,
  IAuditLogCreate,
  ISearchFilters,
  IPaginationOptions,
  ISearchResult
};
