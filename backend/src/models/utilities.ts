import { 
  IMedicine, 
  IInventoryItem, 
  IOrder, 
  IPrescription, 
  ISearchFilters, 
  IPaginationOptions, 
  ISearchResult,
  ValidationResult,
  ValidationError
} from './interfaces';
import { 
  InventoryStatus, 
  OrderStatus, 
  PaymentStatus, 
  PrescriptionStatus,
  DosageForm,
  Schedule
} from './enums';

// Medicine utilities
export const calculateMedicinePrice = (price: number, taxRate: number, discountPercentage: number): number => {
  const taxAmount = price * (taxRate / 100);
  const discountAmount = price * (discountPercentage / 100);
  return price + taxAmount - discountAmount;
};

export const calculateProfitMargin = (price: number, cost: number): { margin: number; percentage: number } => {
  const margin = price - cost;
  const percentage = cost > 0 ? (margin / cost) * 100 : 0;
  return { margin, percentage };
};

export const isMedicineExpired = (expiryDate: Date): boolean => {
  return new Date() > expiryDate;
};

export const getDaysUntilExpiry = (expiryDate: Date): number => {
  const today = new Date();
  const timeDiff = expiryDate.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

export const isPrescriptionRequired = (schedule: Schedule): boolean => {
  return schedule !== 'OTC';
};

export const isControlledSubstance = (schedule: Schedule): boolean => {
  return schedule !== 'OTC';
};

// Inventory utilities
export const calculateInventoryStatus = (quantity: number, minQuantity: number): InventoryStatus => {
  if (quantity <= 0) return InventoryStatus.OUT_OF_STOCK;
  if (quantity <= minQuantity) return InventoryStatus.LOW_STOCK;
  return InventoryStatus.IN_STOCK;
};

export const isLowStock = (quantity: number, minQuantity: number): boolean => {
  return quantity <= minQuantity;
};

export const isOutOfStock = (quantity: number): boolean => {
  return quantity <= 0;
};

export const calculateReorderPoint = (minQuantity: number, leadTime: number, dailyUsage: number): number => {
  return minQuantity + (leadTime * dailyUsage);
};

export const calculateStockTurnover = (totalSales: number, averageInventory: number): number => {
  return averageInventory > 0 ? totalSales / averageInventory : 0;
};

// Order utilities
export const calculateOrderTotal = (items: Array<{ quantity: number; unitPrice: number }>): number => {
  return items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
};

export const calculateTaxAmount = (subtotal: number, taxRate: number): number => {
  return subtotal * (taxRate / 100);
};

export const calculateDiscountAmount = (subtotal: number, discountPercentage: number): number => {
  return subtotal * (discountPercentage / 100);
};

export const calculateFinalAmount = (subtotal: number, taxAmount: number, discountAmount: number): number => {
  return subtotal + taxAmount - discountAmount;
};

export const canCancelOrder = (status: OrderStatus): boolean => {
  return [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PROCESSING].includes(status);
};

export const canRefundOrder = (status: OrderStatus, paymentStatus: PaymentStatus): boolean => {
  return status === OrderStatus.DELIVERED && paymentStatus === PaymentStatus.COMPLETED;
};

// Prescription utilities
export const isPrescriptionValid = (expiryDate: Date): boolean => {
  return new Date() <= expiryDate;
};

export const canRefillPrescription = (status: PrescriptionStatus, expiryDate: Date): boolean => {
  return status === PrescriptionStatus.DISPENSED && isPrescriptionValid(expiryDate);
};

export const calculateRefillDate = (prescribedDate: Date, duration: string): Date => {
  // Parse duration string (e.g., "30 days", "2 weeks")
  const durationMatch = duration.match(/(\d+)\s*(day|week|month|year)s?/i);
  if (!durationMatch) return new Date();
  
  const amount = parseInt(durationMatch[1]);
  const unit = durationMatch[2].toLowerCase();
  
  const refillDate = new Date(prescribedDate);
  switch (unit) {
    case 'day':
      refillDate.setDate(refillDate.getDate() + amount);
      break;
    case 'week':
      refillDate.setDate(refillDate.getDate() + (amount * 7));
      break;
    case 'month':
      refillDate.setMonth(refillDate.getMonth() + amount);
      break;
    case 'year':
      refillDate.setFullYear(refillDate.getFullYear() + amount);
      break;
  }
  
  return refillDate;
};

// Search and filter utilities
export const buildSearchQuery = (filters: ISearchFilters): any => {
  const query: any = {};
  
  if (filters.query) {
    query.OR = [
      { name: { contains: filters.query, mode: 'insensitive' } },
      { genericName: { contains: filters.query, mode: 'insensitive' } },
      { brandName: { contains: filters.query, mode: 'insensitive' } },
      { description: { contains: filters.query, mode: 'insensitive' } }
    ];
  }
  
  if (filters.category) {
    query.categoryId = filters.category;
  }
  
  if (filters.supplier) {
    query.supplierId = filters.supplier;
  }
  
  if (filters.priceRange) {
    query.price = {
      gte: filters.priceRange.min,
      lte: filters.priceRange.max
    };
  }
  
  if (filters.inStock !== undefined) {
    query.inventoryItems = {
      some: {
        quantity: filters.inStock ? { gt: 0 } : { lte: 0 }
      }
    };
  }
  
  if (filters.prescriptionRequired !== undefined) {
    query.prescriptionRequired = filters.prescriptionRequired;
  }
  
  if (filters.tags && filters.tags.length > 0) {
    query.tags = { hasSome: filters.tags };
  }
  
  if (filters.dosageForm) {
    query.dosageForm = filters.dosageForm;
  }
  
  if (filters.schedule) {
    query.schedule = filters.schedule;
  }
  
  return query;
};

export const buildPaginationQuery = (options: IPaginationOptions): { skip: number; take: number; orderBy?: any } => {
  const skip = (options.page - 1) * options.limit;
  const take = options.limit;
  
  let orderBy: any = undefined;
  if (options.sortBy) {
    orderBy = { [options.sortBy]: options.sortOrder || 'asc' };
  }
  
  return { skip, take, orderBy };
};

export const createSearchResult = <T>(
  data: T[], 
  total: number, 
  page: number, 
  limit: number
): ISearchResult<T> => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    total,
    page,
    totalPages,
    hasNext: page < totalPages,
    hasPrevious: page > 1
  };
};

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone);
};

export const validatePassword = (password: string): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters long' });
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push({ field: 'password', message: 'Password must contain at least one lowercase letter' });
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push({ field: 'password', message: 'Password must contain at least one uppercase letter' });
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push({ field: 'password', message: 'Password must contain at least one number' });
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push({ field: 'password', message: 'Password must contain at least one special character' });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateMedicineData = (data: Partial<IMedicine>): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (!data.name || data.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Medicine name is required' });
  }
  
  if (!data.genericName || data.genericName.trim().length === 0) {
    errors.push({ field: 'genericName', message: 'Generic name is required' });
  }
  
  if (!data.brandName || data.brandName.trim().length === 0) {
    errors.push({ field: 'brandName', message: 'Brand name is required' });
  }
  
  if (!data.description || data.description.trim().length === 0) {
    errors.push({ field: 'description', message: 'Description is required' });
  }
  
  if (!data.activeIngredients || data.activeIngredients.length === 0) {
    errors.push({ field: 'activeIngredients', message: 'At least one active ingredient is required' });
  }
  
  if (!data.strength || data.strength.trim().length === 0) {
    errors.push({ field: 'strength', message: 'Strength is required' });
  }
  
  if (!data.unit || data.unit.trim().length === 0) {
    errors.push({ field: 'unit', message: 'Unit is required' });
  }
  
  if (!data.manufacturer || data.manufacturer.trim().length === 0) {
    errors.push({ field: 'manufacturer', message: 'Manufacturer is required' });
  }
  
  if (!data.storageConditions || data.storageConditions.trim().length === 0) {
    errors.push({ field: 'storageConditions', message: 'Storage conditions are required' });
  }
  
  if (!data.expiryDate) {
    errors.push({ field: 'expiryDate', message: 'Expiry date is required' });
  } else if (isMedicineExpired(data.expiryDate)) {
    errors.push({ field: 'expiryDate', message: 'Expiry date cannot be in the past' });
  }
  
  if (!data.batchNumber || data.batchNumber.trim().length === 0) {
    errors.push({ field: 'batchNumber', message: 'Batch number is required' });
  }
  
  if (!data.sku || data.sku.trim().length === 0) {
    errors.push({ field: 'sku', message: 'SKU is required' });
  }
  
  if (data.price !== undefined && data.price < 0) {
    errors.push({ field: 'price', message: 'Price cannot be negative' });
  }
  
  if (data.cost !== undefined && data.cost < 0) {
    errors.push({ field: 'cost', message: 'Cost cannot be negative' });
  }
  
  if (data.taxRate !== undefined && (data.taxRate < 0 || data.taxRate > 100)) {
    errors.push({ field: 'taxRate', message: 'Tax rate must be between 0 and 100' });
  }
  
  if (data.discountPercentage !== undefined && (data.discountPercentage < 0 || data.discountPercentage > 100)) {
    errors.push({ field: 'discountPercentage', message: 'Discount percentage must be between 0 and 100' });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Export all utilities
export {
  calculateMedicinePrice,
  calculateProfitMargin,
  isMedicineExpired,
  getDaysUntilExpiry,
  isPrescriptionRequired,
  isControlledSubstance,
  calculateInventoryStatus,
  isLowStock,
  isOutOfStock,
  calculateReorderPoint,
  calculateStockTurnover,
  calculateOrderTotal,
  calculateTaxAmount,
  calculateDiscountAmount,
  calculateFinalAmount,
  canCancelOrder,
  canRefundOrder,
  isPrescriptionValid,
  canRefillPrescription,
  calculateRefillDate,
  buildSearchQuery,
  buildPaginationQuery,
  createSearchResult,
  validateEmail,
  validatePhone,
  validatePassword,
  validateMedicineData
};
