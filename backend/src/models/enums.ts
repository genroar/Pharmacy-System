// User-related enums
export enum UserRole {
  ADMIN = 'ADMIN',
  PHARMACIST = 'PHARMACIST',
  STAFF = 'STAFF',
  CUSTOMER = 'CUSTOMER'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION'
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED'
}

// Medicine-related enums
export enum DosageForm {
  TABLET = 'TABLET',
  CAPSULE = 'CAPSULE',
  LIQUID = 'LIQUID',
  INJECTION = 'INJECTION',
  CREAM = 'CREAM',
  OINTMENT = 'OINTMENT',
  DROPS = 'DROPS',
  INHALER = 'INHALER',
  SUPPOSITORY = 'SUPPOSITORY',
  PATCH = 'PATCH',
  GEL = 'GEL',
  SUSPENSION = 'SUSPENSION',
  SYRUP = 'SYRUP'
}

export enum Schedule {
  OTC = 'OTC',
  SCHEDULE_I = 'SCHEDULE_I',
  SCHEDULE_II = 'SCHEDULE_II',
  SCHEDULE_III = 'SCHEDULE_III',
  SCHEDULE_IV = 'SCHEDULE_IV',
  SCHEDULE_V = 'SCHEDULE_V'
}

export enum MedicineType {
  GENERIC = 'GENERIC',
  BRAND = 'BRAND',
  BIOSIMILAR = 'BIOSIMILAR',
  COMPOUNDED = 'COMPOUNDED'
}

export enum StorageCondition {
  ROOM_TEMPERATURE = 'ROOM_TEMPERATURE',
  REFRIGERATED = 'REFRIGERATED',
  FROZEN = 'FROZEN',
  PROTECT_FROM_LIGHT = 'PROTECT_FROM_LIGHT',
  PROTECT_FROM_MOISTURE = 'PROTECT_FROM_MOISTURE'
}

// Inventory-related enums
export enum InventoryStatus {
  IN_STOCK = 'IN_STOCK',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  DISCONTINUED = 'DISCONTINUED',
  EXPIRED = 'EXPIRED'
}

export enum StockMovementType {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  RETURN = 'RETURN',
  ADJUSTMENT = 'ADJUSTMENT',
  TRANSFER = 'TRANSFER',
  EXPIRY = 'EXPIRY',
  DAMAGE = 'DAMAGE'
}

export enum LocationType {
  MAIN_WAREHOUSE = 'MAIN_WAREHOUSE',
  BRANCH_STORE = 'BRANCH_STORE',
  REFRIGERATOR = 'REFRIGERATOR',
  FREEZER = 'FREEZER',
  SECURE_STORAGE = 'SECURE_STORAGE'
}

// Order-related enums
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  ON_HOLD = 'ON_HOLD'
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
  DIGITAL_WALLET = 'DIGITAL_WALLET',
  INSURANCE = 'INSURANCE',
  CHECK = 'CHECK'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
  CANCELLED = 'CANCELLED'
}

export enum ShippingMethod {
  STANDARD = 'STANDARD',
  EXPRESS = 'EXPRESS',
  SAME_DAY = 'SAME_DAY',
  PICKUP = 'PICKUP',
  DELIVERY = 'DELIVERY'
}

export enum ShippingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  RETURNED = 'RETURNED'
}

// Prescription-related enums
export enum PrescriptionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DISPENSED = 'DISPENSED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  REFILLED = 'REFILLED'
}

export enum PrescriptionType {
  NEW = 'NEW',
  REFILL = 'REFILL',
  TRANSFER = 'TRANSFER',
  EMERGENCY = 'EMERGENCY',
  COMPOUNDED = 'COMPOUNDED'
}

export enum DosageFrequency {
  DAILY = 'DAILY',
  TWICE_DAILY = 'TWICE_DAILY',
  THREE_TIMES_DAILY = 'THREE_TIMES_DAILY',
  FOUR_TIMES_DAILY = 'FOUR_TIMES_DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  AS_NEEDED = 'AS_NEEDED',
  CUSTOM = 'CUSTOM'
}

// Supplier-related enums
export enum SupplierType {
  MANUFACTURER = 'MANUFACTURER',
  DISTRIBUTOR = 'DISTRIBUTOR',
  WHOLESALER = 'WHOLESALER',
  IMPORTER = 'IMPORTER',
  LOCAL_SUPPLIER = 'LOCAL_SUPPLIER'
}

export enum SupplierStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  BLACKLISTED = 'BLACKLISTED'
}

export enum PaymentTerms {
  IMMEDIATE = 'IMMEDIATE',
  NET_30 = 'NET_30',
  NET_60 = 'NET_60',
  NET_90 = 'NET_90',
  CUSTOM = 'CUSTOM'
}

// Review-related enums
export enum ReviewRating {
  ONE_STAR = 1,
  TWO_STARS = 2,
  THREE_STARS = 3,
  FOUR_STARS = 4,
  FIVE_STARS = 5
}

export enum ReviewStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  FLAGGED = 'FLAGGED'
}

// Audit-related enums
export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  DISPENSE = 'DISPENSE',
  REFUND = 'REFUND'
}

export enum AuditEntity {
  USER = 'USER',
  MEDICINE = 'MEDICINE',
  CATEGORY = 'CATEGORY',
  SUPPLIER = 'SUPPLIER',
  INVENTORY = 'INVENTORY',
  PRESCRIPTION = 'PRESCRIPTION',
  ORDER = 'ORDER',
  REVIEW = 'REVIEW',
  AUDIT_LOG = 'AUDIT_LOG'
}

export enum AuditLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

// Notification-related enums
export enum NotificationType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP'
}

export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum NotificationCategory {
  ORDER = 'ORDER',
  PRESCRIPTION = 'PRESCRIPTION',
  INVENTORY = 'INVENTORY',
  SECURITY = 'SECURITY',
  SYSTEM = 'SYSTEM',
  MARKETING = 'MARKETING'
}

// Export all enums
export {
  UserRole,
  UserStatus,
  VerificationStatus,
  DosageForm,
  Schedule,
  MedicineType,
  StorageCondition,
  InventoryStatus,
  StockMovementType,
  LocationType,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ShippingMethod,
  ShippingStatus,
  PrescriptionStatus,
  PrescriptionType,
  DosageFrequency,
  SupplierType,
  SupplierStatus,
  PaymentTerms,
  ReviewRating,
  ReviewStatus,
  AuditAction,
  AuditEntity,
  AuditLevel,
  NotificationType,
  NotificationPriority,
  NotificationCategory
};
