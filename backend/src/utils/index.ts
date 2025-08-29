// Export all utility classes and functions
export { default as CryptoUtils, generateKey, encrypt, decrypt, hashPassword, comparePassword, sha256, generateToken, generateUUID, encryptForStorage, decryptFromStorage } from './crypto';
export { default as BarcodeUtils, generateCode128, generateCode39, generateEAN13, generateQRCode, generateDataMatrix, generateMedicineBarcode, generateInventoryBarcode, validateBarcodeData } from './barcode';
export { default as DateHelper, formatDate, formatTime, formatDateTime, parseDate, getCurrentDate, getCurrentTime, getCurrentDateTime, addDays, subtractDays, addMonths, subtractMonths, addYears, subtractYears, getDateDifference, isToday, isYesterday, isTomorrow, isSameDay, getStartOfDay, getEndOfDay, getStartOfWeek, getEndOfWeek, getStartOfMonth, getEndOfMonth, getStartOfYear, getEndOfYear, isPast, isFuture, isExpired, getDaysUntilExpiry, getAge, convertToTimezone, getTimezoneOffset } from './dateHelper';
export { default as ReportFormatter, formatSalesReport, formatInventoryReport, formatCustomerReport, formatSupplierReport, formatMedicineReport, formatDashboardSummary, exportToCSV, exportToJSON } from './reportFormatter';

// Re-export logger for convenience
export { logger } from './logger';

// Export utility types
export interface UtilityTypes {
  // Crypto types
  CryptoOptions: {
    algorithm?: string;
    keyLength?: number;
    saltRounds?: number;
  };

  // Barcode types
  BarcodeOptions: {
    width?: number;
    height?: number;
    margin?: number;
    showText?: boolean;
    textSize?: number;
    format?: 'code128' | 'code39' | 'ean13' | 'qr' | 'datamatrix';
  };

  // Date types
  DateFormat: string;
  TimeFormat: string;
  DateTimeFormat: string;
  DateUnit: 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds';

  // Report types
  ReportOptions: {
    includeTotals?: boolean;
    includeSummary?: boolean;
    includeStats?: boolean;
    includePerformance?: boolean;
    includeAnalytics?: boolean;
    includeCharts?: boolean;
    groupBy?: string;
    currency?: string;
    dateFormat?: string;
    pretty?: boolean;
    includeMetadata?: boolean;
  };

  // Export types
  ExportOptions: {
    format: 'csv' | 'json';
    headers?: string[];
    pretty?: boolean;
    includeMetadata?: boolean;
  };
}

// Export utility constants
export const UTILITY_CONSTANTS = {
  // Crypto constants
  CRYPTO: {
    DEFAULT_ALGORITHM: 'aes-256-gcm',
    DEFAULT_KEY_LENGTH: 32,
    DEFAULT_SALT_ROUNDS: 12,
    DEFAULT_IV_LENGTH: 16,
    DEFAULT_TAG_LENGTH: 16
  },

  // Barcode constants
  BARCODE: {
    DEFAULT_WIDTH: 300,
    DEFAULT_HEIGHT: 100,
    DEFAULT_MARGIN: 10,
    DEFAULT_TEXT_SIZE: 14,
    DEFAULT_QR_SIZE: 256,
    DEFAULT_DATAMATRIX_SIZE: 200
  },

  // Date constants
  DATE: {
    DEFAULT_FORMAT: 'YYYY-MM-DD',
    DEFAULT_TIME_FORMAT: 'HH:mm:ss',
    DEFAULT_DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
    DEFAULT_TIMEZONE: 'UTC',
    WEEK_START_DAY: 1 // Monday
  },

  // Report constants
  REPORT: {
    DEFAULT_CURRENCY: 'USD',
    DEFAULT_CURRENCY_FORMAT: 'en-US',
    DEFAULT_DATE_FORMAT: 'YYYY-MM-DD',
    DEFAULT_GROUP_BY: 'category',
    DEFAULT_EXPORT_FORMAT: 'json'
  },

  // Validation constants
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 8,
    MAX_PASSWORD_LENGTH: 128,
    MIN_TOKEN_LENGTH: 16,
    MAX_TOKEN_LENGTH: 64,
    MIN_UUID_LENGTH: 36,
    MAX_UUID_LENGTH: 36
  }
};

// Export utility enums
export enum BarcodeFormat {
  CODE_128 = 'code128',
  CODE_39 = 'code39',
  EAN_13 = 'ean13',
  QR_CODE = 'qr',
  DATA_MATRIX = 'datamatrix'
}

export enum DateGrouping {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year'
}

export enum ReportGrouping {
  CATEGORY = 'category',
  LOCATION = 'location',
  SUPPLIER = 'supplier',
  STATUS = 'status',
  MANUFACTURER = 'manufacturer',
  EXPIRY_STATUS = 'expiryStatus',
  AGE = 'age',
  REGISTRATION_DATE = 'registrationDate',
  TOTAL_SPENT = 'totalSpent',
  RATING = 'rating'
}

export enum ExportFormat {
  CSV = 'csv',
  JSON = 'json'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  INR = 'INR',
  CAD = 'CAD',
  AUD = 'AUD'
}

// Export utility functions
export const utilityHelpers = {
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
   * Check if a value is a valid string
   */
  isValidString: (value: any): boolean => {
    return typeof value === 'string' && value.trim().length > 0;
  },

  /**
   * Check if a value is a valid email
   */
  isValidEmail: (value: any): boolean => {
    if (!utilityHelpers.isValidString(value)) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  /**
   * Check if a value is a valid phone number
   */
  isValidPhone: (value: any): boolean => {
    if (!utilityHelpers.isValidString(value)) return false;
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
  },

  /**
   * Check if a value is a valid UUID
   */
  isValidUUID: (value: any): boolean => {
    if (!utilityHelpers.isValidString(value)) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  },

  /**
   * Sanitize string input
   */
  sanitizeString: (value: string): string => {
    if (!utilityHelpers.isValidString(value)) return '';
    return value.trim().replace(/[<>]/g, '');
  },

  /**
   * Format number with specified decimal places
   */
  formatNumber: (value: number, decimals: number = 2): string => {
    if (!utilityHelpers.isValidNumber(value)) return '0';
    return value.toFixed(decimals);
  },

  /**
   * Generate random string
   */
  generateRandomString: (length: number = 8, charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  },

  /**
   * Deep clone object
   */
  deepClone: <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as T;
    if (obj instanceof Array) return obj.map(item => utilityHelpers.deepClone(item)) as T;
    if (typeof obj === 'object') {
      const cloned = {} as T;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = utilityHelpers.deepClone(obj[key]);
        }
      }
      return cloned;
    }
    return obj;
  },

  /**
   * Debounce function
   */
  debounce: <T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  /**
   * Throttle function
   */
  throttle: <T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

// Default export for the entire utils module
export default {
  CryptoUtils,
  BarcodeUtils,
  DateHelper,
  ReportFormatter,
  logger,
  utilityHelpers,
  UTILITY_CONSTANTS,
  BarcodeFormat,
  DateGrouping,
  ReportGrouping,
  ExportFormat,
  CurrencyCode
};
