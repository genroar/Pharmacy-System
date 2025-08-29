// Export all validation schemas
export { default as authValidation } from './authValidation';
export { default as productValidation } from './productValidation';
export { default as salesValidation } from './salesValidation';

// Re-export individual validation functions for convenience
export const {
  register,
  login,
  changePassword,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  refreshToken,
  logout,
  setup2FA,
  verify2FA,
  manageSessions,
  revokeSession,
  updateProfile,
  adminCreateUser,
  adminUpdateUser
} from './authValidation';

export const {
  createMedicine,
  updateMedicine,
  getMedicines,
  getMedicineById,
  deleteMedicine,
  getMedicinesByCategory,
  searchMedicines,
  getExpiringMedicines,
  getLowStockMedicines,
  getMedicineStats,
  bulkUpdateMedicines,
  importMedicines
} from './productValidation';

export const {
  createOrder,
  updateOrder,
  updateOrderStatus,
  getOrders,
  getOrderById,
  cancelOrder,
  getCustomerOrders,
  getOrdersByStatus,
  getOrdersByDateRange,
  searchOrders,
  getSalesStats,
  processRefund
} from './salesValidation';

// Export validation types
export interface ValidationTypes {
  // Auth validation types
  AuthValidation: {
    register: any;
    login: any;
    changePassword: any;
    requestPasswordReset: any;
    resetPassword: any;
    verifyEmail: any;
    refreshToken: any;
    logout: any;
    setup2FA: any;
    verify2FA: any;
    manageSessions: any;
    revokeSession: any;
    updateProfile: any;
    adminCreateUser: any;
    adminUpdateUser: any;
  };

  // Product validation types
  ProductValidation: {
    createMedicine: any;
    updateMedicine: any;
    getMedicines: any;
    getMedicineById: any;
    deleteMedicine: any;
    getMedicinesByCategory: any;
    searchMedicines: any;
    getExpiringMedicines: any;
    getLowStockMedicines: any;
    getMedicineStats: any;
    bulkUpdateMedicines: any;
    importMedicines: any;
  };

  // Sales validation types
  SalesValidation: {
    createOrder: any;
    updateOrder: any;
    updateOrderStatus: any;
    getOrders: any;
    getOrderById: any;
    cancelOrder: any;
    getCustomerOrders: any;
    getOrdersByStatus: any;
    getOrdersByDateRange: any;
    searchOrders: any;
    getSalesStats: any;
    processRefund: any;
  };
}

// Export validation constants
export const VALIDATION_CONSTANTS = {
  // Common validation limits
  COMMON: {
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 50,
    MAX_EMAIL_LENGTH: 100,
    MAX_PHONE_LENGTH: 20,
    MAX_ADDRESS_LENGTH: 100,
    MAX_CITY_LENGTH: 50,
    MAX_STATE_LENGTH: 50,
    MAX_ZIPCODE_LENGTH: 10,
    MAX_COUNTRY_LENGTH: 50,
    MAX_DESCRIPTION_LENGTH: 1000,
    MAX_NOTES_LENGTH: 500,
    MAX_SPECIAL_INSTRUCTIONS_LENGTH: 500
  },

  // Medicine validation limits
  MEDICINE: {
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 200,
    MAX_GENERIC_NAME_LENGTH: 200,
    MAX_BRAND_NAME_LENGTH: 200,
    MAX_SUBCATEGORY_LENGTH: 100,
    MAX_STRENGTH_LENGTH: 50,
    MAX_MANUFACTURER_LENGTH: 200,
    MAX_DESCRIPTION_LENGTH: 1000,
    MAX_ACTIVE_INGREDIENTS: 10,
    MAX_INACTIVE_INGREDIENTS: 20,
    MAX_INDICATIONS: 20,
    MAX_CONTRAINDICATIONS: 20,
    MAX_SIDE_EFFECTS: 20,
    MAX_DRUG_INTERACTIONS: 20,
    MAX_SPECIAL_INSTRUCTIONS_LENGTH: 500,
    MAX_NDC_LENGTH: 13,
    MAX_BARCODE_LENGTH: 100,
    MAX_TAGS: 20,
    MAX_IMAGES: 10,
    MAX_DOCUMENTS: 20
  },

  // Order validation limits
  ORDER: {
    MIN_ITEMS: 1,
    MAX_ITEMS: 50,
    MAX_QUANTITY: 1000,
    MAX_NOTES_LENGTH: 1000,
    MAX_GIFT_MESSAGE_LENGTH: 500,
    MAX_DELIVERY_INSTRUCTIONS_LENGTH: 500,
    MAX_SPECIAL_INSTRUCTIONS_LENGTH: 500,
    MAX_CANCELLATION_REASON_LENGTH: 500,
    MAX_REFUND_REASON_LENGTH: 500,
    MAX_TRACKING_NUMBER_LENGTH: 100,
    MAX_CARRIER_LENGTH: 100
  },

  // Payment validation limits
  PAYMENT: {
    MAX_CARDHOLDER_NAME_LENGTH: 100,
    MAX_INSURANCE_PROVIDER_LENGTH: 100,
    MAX_INSURANCE_POLICY_LENGTH: 50,
    MAX_CHECK_NUMBER_LENGTH: 20,
    MAX_MOBILE_PAYMENT_PROVIDER_LENGTH: 50,
    MAX_COUPON_CODE_LENGTH: 50,
    MAX_DISCOUNT_DESCRIPTION_LENGTH: 200,
    MAX_EXEMPTION_REASON_LENGTH: 200
  },

  // Search and pagination limits
  SEARCH: {
    MIN_QUERY_LENGTH: 2,
    MAX_QUERY_LENGTH: 200,
    MIN_PAGE: 1,
    MAX_LIMIT: 100,
    DEFAULT_LIMIT: 20
  },

  // Date validation
  DATE: {
    MIN_EXPIRY_DAYS: 1,
    MAX_EXPIRY_DAYS: 365,
    MIN_EXPIRY_THRESHOLD: 1,
    MAX_EXPIRY_THRESHOLD: 1000
  },

  // File validation
  FILE: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_MIME_TYPES: [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
  }
};

// Export validation enums
export enum ValidationStatus {
  VALID = 'valid',
  INVALID = 'invalid',
  PENDING = 'pending'
}

export enum ValidationLevel {
  BASIC = 'basic',
  STRICT = 'strict',
  CUSTOM = 'custom'
}

export enum ValidationScope {
  BODY = 'body',
  QUERY = 'query',
  PARAMS = 'params',
  HEADERS = 'headers',
  ALL = 'all'
}

// Export validation utilities
export const validationHelpers = {
  /**
   * Check if a value is a valid UUID
   */
  isValidUUID: (value: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  },

  /**
   * Check if a value is a valid email
   */
  isValidEmail: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  /**
   * Check if a value is a valid phone number
   */
  isValidPhone: (value: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
  },

  /**
   * Check if a value is a valid date
   */
  isValidDate: (value: any): boolean => {
    if (value instanceof Date) {
      return !isNaN(value.getTime());
    }
    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      return !isNaN(date.getTime());
    }
    return false;
  },

  /**
   * Check if a value is a valid number
   */
  isValidNumber: (value: any): boolean => {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
  },

  /**
   * Check if a value is a valid integer
   */
  isValidInteger: (value: any): boolean => {
    return Number.isInteger(value) && value > 0;
  },

  /**
   * Check if a value is a valid positive number
   */
  isValidPositiveNumber: (value: any): boolean => {
    return typeof value === 'number' && value > 0 && !isNaN(value) && isFinite(value);
  },

  /**
   * Check if a value is a valid percentage
   */
  isValidPercentage: (value: any): boolean => {
    return typeof value === 'number' && value >= 0 && value <= 100 && !isNaN(value) && isFinite(value);
  },

  /**
   * Check if a value is a valid currency amount
   */
  isValidCurrencyAmount: (value: any): boolean => {
    return typeof value === 'number' && value >= 0 && !isNaN(value) && isFinite(value);
  },

  /**
   * Check if a value is a valid card number
   */
  isValidCardNumber: (value: string): boolean => {
    const cardRegex = /^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/;
    return cardRegex.test(value);
  },

  /**
   * Check if a value is a valid expiry date
   */
  isValidExpiryDate: (value: string): boolean => {
    const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!expiryRegex.test(value)) return false;
    
    const [, month, year] = value.match(expiryRegex) || [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    const expYear = parseInt(year);
    const expMonth = parseInt(month);
    
    if (expYear < currentYear) return false;
    if (expYear === currentYear && expMonth < currentMonth) return false;
    
    return true;
  },

  /**
   * Check if a value is a valid CVV
   */
  isValidCVV: (value: string): boolean => {
    const cvvRegex = /^\d{3,4}$/;
    return cvvRegex.test(value);
  },

  /**
   * Check if a value is a valid NDC
   */
  isValidNDC: (value: string): boolean => {
    const ndcRegex = /^\d{5}-\d{4}-\d{2}$/;
    return ndcRegex.test(value);
  },

  /**
   * Check if a value is a valid barcode
   */
  isValidBarcode: (value: string): boolean => {
    return value.length > 0 && value.length <= 100;
  },

  /**
   * Check if a value is a valid file size
   */
  isValidFileSize: (size: number, maxSize: number = VALIDATION_CONSTANTS.FILE.MAX_SIZE): boolean => {
    return size > 0 && size <= maxSize;
  },

  /**
   * Check if a value is a valid MIME type
   */
  isValidMimeType: (mimeType: string): boolean => {
    return VALIDATION_CONSTANTS.FILE.ALLOWED_MIME_TYPES.includes(mimeType);
  },

  /**
   * Sanitize string input
   */
  sanitizeString: (value: string): string => {
    if (typeof value !== 'string') return '';
    return value.trim().replace(/[<>]/g, '');
  },

  /**
   * Format validation error messages
   */
  formatValidationError: (error: any): string => {
    if (!error || !error.details) return 'Validation error';
    
    return error.details
      .map((detail: any) => detail.message)
      .join(', ');
  },

  /**
   * Create custom validation error
   */
  createValidationError: (message: string, field?: string): any => {
    return {
      error: 'ValidationError',
      message,
      field,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Validate required fields
   */
  validateRequiredFields: (data: any, requiredFields: string[]): string[] => {
    const missingFields: string[] = [];
    
    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        missingFields.push(field);
      }
    }
    
    return missingFields;
  },

  /**
   * Validate field lengths
   */
  validateFieldLengths: (data: any, fieldLimits: Record<string, { min?: number; max: number }>): string[] => {
    const errors: string[] = [];
    
    for (const [field, limits] of Object.entries(fieldLimits)) {
      const value = data[field];
      if (value === undefined || value === null) continue;
      
      const length = String(value).length;
      
      if (limits.min !== undefined && length < limits.min) {
        errors.push(`${field} must be at least ${limits.min} characters long`);
      }
      
      if (length > limits.max) {
        errors.push(`${field} cannot exceed ${limits.max} characters`);
      }
    }
    
    return errors;
  },

  /**
   * Validate numeric ranges
   */
  validateNumericRanges: (data: any, fieldRanges: Record<string, { min?: number; max?: number }>): string[] => {
    const errors: string[] = [];
    
    for (const [field, range] of Object.entries(fieldRanges)) {
      const value = data[field];
      if (value === undefined || value === null) continue;
      
      if (typeof value !== 'number' || isNaN(value)) {
        errors.push(`${field} must be a valid number`);
        continue;
      }
      
      if (range.min !== undefined && value < range.min) {
        errors.push(`${field} must be at least ${range.min}`);
      }
      
      if (range.max !== undefined && value > range.max) {
        errors.push(`${field} cannot exceed ${range.max}`);
      }
    }
    
    return errors;
  }
};

// Default export for the entire validations module
export default {
  authValidation,
  productValidation,
  salesValidation,
  validationHelpers,
  VALIDATION_CONSTANTS,
  ValidationStatus,
  ValidationLevel,
  ValidationScope
};
