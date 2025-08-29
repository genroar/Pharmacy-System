import { logger } from './logger';

/**
 * Date utility class for date formatting, calculations, and timezone handling
 */
export class DateHelper {
  private static readonly DEFAULT_FORMAT = 'YYYY-MM-DD';
  private static readonly DEFAULT_TIME_FORMAT = 'HH:mm:ss';
  private static readonly DEFAULT_DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
  private static readonly DEFAULT_TIMEZONE = 'UTC';

  /**
   * Format date to string
   * @param date - Date to format
   * @param format - Format string
   * @returns Formatted date string
   */
  static formatDate(
    date: Date | string | number,
    format: string = this.DEFAULT_FORMAT
  ): string {
    try {
      const dateObj = this.parseDate(date);
      if (!dateObj) {
        throw new Error('Invalid date provided');
      }

      return this.formatDateString(dateObj, format);
    } catch (error) {
      logger.error('Error formatting date:', error);
      throw new Error('Failed to format date');
    }
  }

  /**
   * Format time to string
   * @param date - Date to format
   * @param format - Format string
   * @returns Formatted time string
   */
  static formatTime(
    date: Date | string | number,
    format: string = this.DEFAULT_TIME_FORMAT
  ): string {
    try {
      const dateObj = this.parseDate(date);
      if (!dateObj) {
        throw new Error('Invalid date provided');
      }

      return this.formatTimeString(dateObj, format);
    } catch (error) {
      logger.error('Error formatting time:', error);
      throw new Error('Failed to format time');
    }
  }

  /**
   * Format datetime to string
   * @param date - Date to format
   * @param format - Format string
   * @returns Formatted datetime string
   */
  static formatDateTime(
    date: Date | string | number,
    format: string = this.DEFAULT_DATETIME_FORMAT
  ): string {
    try {
      const dateObj = this.parseDate(date);
      if (!dateObj) {
        throw new Error('Invalid date provided');
      }

      return this.formatDateTimeString(dateObj, format);
    } catch (error) {
      logger.error('Error formatting datetime:', error);
      throw new Error('Failed to format datetime');
    }
  }

  /**
   * Parse date from various formats
   * @param date - Date to parse
   * @returns Date object or null
   */
  static parseDate(date: Date | string | number): Date | null {
    try {
      if (date instanceof Date) {
        return date;
      }

      if (typeof date === 'number') {
        return new Date(date);
      }

      if (typeof date === 'string') {
        // Try ISO format first
        const isoDate = new Date(date);
        if (!isNaN(isoDate.getTime())) {
          return isoDate;
        }

        // Try common formats
        const formats = [
          'YYYY-MM-DD',
          'MM/DD/YYYY',
          'DD/MM/YYYY',
          'MM-DD-YYYY',
          'DD-MM-YYYY',
          'YYYY/MM/DD'
        ];

        for (const format of formats) {
          const parsed = this.parseDateByFormat(date, format);
          if (parsed) {
            return parsed;
          }
        }
      }

      return null;
    } catch (error) {
      logger.error('Error parsing date:', error);
      return null;
    }
  }

  /**
   * Get current date in various formats
   * @param format - Format string
   * @returns Formatted current date string
   */
  static getCurrentDate(format: string = this.DEFAULT_FORMAT): string {
    return this.formatDate(new Date(), format);
  }

  /**
   * Get current time in various formats
   * @param format - Format string
   * @returns Formatted current time string
   */
  static getCurrentTime(format: string = this.DEFAULT_TIME_FORMAT): string {
    return this.formatTime(new Date(), format);
  }

  /**
   * Get current datetime in various formats
   * @param format - Format string
   * @returns Formatted current datetime string
   */
  static getCurrentDateTime(format: string = this.DEFAULT_DATETIME_FORMAT): string {
    return this.formatDateTime(new Date(), format);
  }

  /**
   * Add days to date
   * @param date - Base date
   * @param days - Number of days to add
   * @returns New date
   */
  static addDays(date: Date | string | number, days: number): Date {
    const dateObj = this.parseDate(date);
    if (!dateObj) {
      throw new Error('Invalid date provided');
    }

    const result = new Date(dateObj);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Subtract days from date
   * @param date - Base date
   * @param days - Number of days to subtract
   * @returns New date
   */
  static subtractDays(date: Date | string | number, days: number): Date {
    return this.addDays(date, -days);
  }

  /**
   * Add months to date
   * @param date - Base date
   * @param months - Number of months to add
   * @returns New date
   */
  static addMonths(date: Date | string | number, months: number): Date {
    const dateObj = this.parseDate(date);
    if (!dateObj) {
      throw new Error('Invalid date provided');
    }

    const result = new Date(dateObj);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  /**
   * Subtract months from date
   * @param date - Base date
   * @param months - Number of months to subtract
   * @returns New date
   */
  static subtractMonths(date: Date | string | number, months: number): Date {
    return this.addMonths(date, -months);
  }

  /**
   * Add years to date
   * @param date - Base date
   * @param years - Number of years to add
   * @returns New date
   */
  static addYears(date: Date | string | number, years: number): Date {
    const dateObj = this.parseDate(date);
    if (!dateObj) {
      throw new Error('Invalid date provided');
    }

    const result = new Date(dateObj);
    result.setFullYear(result.getFullYear() + years);
    return result;
  }

  /**
   * Subtract years from date
   * @param date - Base date
   * @param years - Number of years to subtract
   * @returns New date
   */
  static subtractYears(date: Date | string | number, years: number): Date {
    return this.addYears(date, -years);
  }

  /**
   * Calculate difference between two dates
   * @param date1 - First date
   * @param date2 - Second date
   * @param unit - Unit of measurement
   * @returns Difference in specified unit
   */
  static getDateDifference(
    date1: Date | string | number,
    date2: Date | string | number,
    unit: 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds' = 'days'
  ): number {
    try {
      const dateObj1 = this.parseDate(date1);
      const dateObj2 = this.parseDate(date2);

      if (!dateObj1 || !dateObj2) {
        throw new Error('Invalid date provided');
      }

      const diffMs = Math.abs(dateObj2.getTime() - dateObj1.getTime());

      switch (unit) {
        case 'days':
          return Math.floor(diffMs / (1000 * 60 * 60 * 24));
        case 'hours':
          return Math.floor(diffMs / (1000 * 60 * 60));
        case 'minutes':
          return Math.floor(diffMs / (1000 * 60));
        case 'seconds':
          return Math.floor(diffMs / 1000);
        case 'milliseconds':
          return diffMs;
        default:
          return diffMs;
      }
    } catch (error) {
      logger.error('Error calculating date difference:', error);
      throw new Error('Failed to calculate date difference');
    }
  }

  /**
   * Check if date is today
   * @param date - Date to check
   * @returns True if date is today
   */
  static isToday(date: Date | string | number): boolean {
    const dateObj = this.parseDate(date);
    if (!dateObj) {
      return false;
    }

    const today = new Date();
    return this.isSameDay(dateObj, today);
  }

  /**
   * Check if date is yesterday
   * @param date - Date to check
   * @returns True if date is yesterday
   */
  static isYesterday(date: Date | string | number): boolean {
    const dateObj = this.parseDate(date);
    if (!dateObj) {
      return false;
    }

    const yesterday = this.subtractDays(new Date(), 1);
    return this.isSameDay(dateObj, yesterday);
  }

  /**
   * Check if date is tomorrow
   * @param date - Date to check
   * @returns True if date is tomorrow
   */
  static isTomorrow(date: Date | string | number): boolean {
    const dateObj = this.parseDate(date);
    if (!dateObj) {
      return false;
    }

    const tomorrow = this.addDays(new Date(), 1);
    return this.isSameDay(dateObj, tomorrow);
  }

  /**
   * Check if two dates are the same day
   * @param date1 - First date
   * @param date2 - Second date
   * @returns True if dates are the same day
   */
  static isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  /**
   * Get start of day
   * @param date - Date to get start of day for
   * @returns Start of day date
   */
  static getStartOfDay(date: Date | string | number): Date {
    const dateObj = this.parseDate(date);
    if (!dateObj) {
      throw new Error('Invalid date provided');
    }

    const result = new Date(dateObj);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  /**
   * Get end of day
   * @param date - Date to get end of day for
   * @returns End of day date
   */
  static getEndOfDay(date: Date | string | number): Date {
    const dateObj = this.parseDate(date);
    if (!dateObj) {
      throw new Error('Invalid date provided');
    }

    const result = new Date(dateObj);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  /**
   * Get start of week
   * @param date - Date to get start of week for
   * @param startDay - Day to start week (0 = Sunday, 1 = Monday)
   * @returns Start of week date
   */
  static getStartOfWeek(date: Date | string | number, startDay: number = 1): Date {
    const dateObj = this.parseDate(date);
    if (!dateObj) {
      throw new Error('Invalid date provided');
    }

    const result = new Date(dateObj);
    const day = result.getDay();
    const diff = result.getDate() - day + (day === 0 ? -6 : startDay);
    result.setDate(diff);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  /**
   * Get end of week
   * @param date - Date to get end of week for
   * @param startDay - Day to start week (0 = Sunday, 1 = Monday)
   * @returns End of week date
   */
  static getEndOfWeek(date: Date | string | number, startDay: number = 1): Date {
    const start = this.getStartOfWeek(date, startDay);
    const result = new Date(start);
    result.setDate(result.getDate() + 6);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  /**
   * Get start of month
   * @param date - Date to get start of month for
   * @returns Start of month date
   */
  static getStartOfMonth(date: Date | string | number): Date {
    const dateObj = this.parseDate(date);
    if (!dateObj) {
      throw new Error('Invalid date provided');
    }

    const result = new Date(dateObj);
    result.setDate(1);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  /**
   * Get end of month
   * @param date - Date to get end of month for
   * @returns End of month date
   */
  static getEndOfMonth(date: Date | string | number): Date {
    const dateObj = this.parseDate(date);
    if (!dateObj) {
      throw new Error('Invalid date provided');
    }

    const result = new Date(dateObj);
    result.setMonth(result.getMonth() + 1, 0);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  /**
   * Get start of year
   * @param date - Date to get start of year for
   * @returns Start of year date
   */
  static getStartOfYear(date: Date | string | number): Date {
    const dateObj = this.parseDate(date);
    if (!dateObj) {
      throw new Error('Invalid date provided');
    }

    const result = new Date(dateObj);
    result.setMonth(0, 1);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  /**
   * Get end of year
   * @param date - Date to get end of year for
   * @returns End of year date
   */
  static getEndOfYear(date: Date | string | number): Date {
    const dateObj = this.parseDate(date);
    if (!dateObj) {
      throw new Error('Invalid date provided');
    }

    const result = new Date(dateObj);
    result.setMonth(11, 31);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  /**
   * Check if date is in the past
   * @param date - Date to check
   * @returns True if date is in the past
   */
  static isPast(date: Date | string | number): boolean {
    const dateObj = this.parseDate(date);
    if (!dateObj) {
      return false;
    }

    return dateObj < new Date();
  }

  /**
   * Check if date is in the future
   * @param date - Date to check
   * @returns True if date is in the future
   */
  static isFuture(date: Date | string | number): boolean {
    const dateObj = this.parseDate(date);
    if (!dateObj) {
      return false;
    }

    return dateObj > new Date();
  }

  /**
   * Check if date is expired (past expiry date)
   * @param date - Date to check
   * @param expiryDate - Expiry date
   * @returns True if date is expired
   */
  static isExpired(date: Date | string | number, expiryDate: Date | string | number): boolean {
    const dateObj = this.parseDate(date);
    const expiryObj = this.parseDate(expiryDate);

    if (!dateObj || !expiryObj) {
      return false;
    }

    return dateObj > expiryObj;
  }

  /**
   * Get days until expiry
   * @param expiryDate - Expiry date
   * @returns Days until expiry
   */
  static getDaysUntilExpiry(expiryDate: Date | string | number): number {
    const expiryObj = this.parseDate(expiryDate);
    if (!expiryObj) {
      return -1;
    }

    const now = new Date();
    const diff = expiryObj.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Get age from birth date
   * @param birthDate - Birth date
   * @returns Age in years
   */
  static getAge(birthDate: Date | string | number): number {
    const birthObj = this.parseDate(birthDate);
    if (!birthObj) {
      return -1;
    }

    const today = new Date();
    let age = today.getFullYear() - birthObj.getFullYear();
    const monthDiff = today.getMonth() - birthObj.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthObj.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Convert date to timezone
   * @param date - Date to convert
   * @param timezone - Target timezone
   * @returns Date in target timezone
   */
  static convertToTimezone(
    date: Date | string | number,
    timezone: string = this.DEFAULT_TIMEZONE
  ): Date {
    const dateObj = this.parseDate(date);
    if (!dateObj) {
      throw new Error('Invalid date provided');
    }

    // For now, return the date as-is
    // In production, use a proper timezone library like 'moment-timezone' or 'date-fns-tz'
    return dateObj;
  }

  /**
   * Get timezone offset
   * @param timezone - Timezone to get offset for
   * @returns Timezone offset in minutes
   */
  static getTimezoneOffset(timezone: string = this.DEFAULT_TIMEZONE): number {
    // For now, return local timezone offset
    // In production, use a proper timezone library
    return new Date().getTimezoneOffset();
  }

  // Private helper methods

  private static formatDateString(date: Date, format: string): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return format
      .replace('YYYY', year.toString())
      .replace('MM', month)
      .replace('DD', day);
  }

  private static formatTimeString(date: Date, format: string): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return format
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }

  private static formatDateTimeString(date: Date, format: string): string {
    return format
      .replace('YYYY-MM-DD', this.formatDateString(date, 'YYYY-MM-DD'))
      .replace('HH:mm:ss', this.formatTimeString(date, 'HH:mm:ss'));
  }

  private static parseDateByFormat(dateStr: string, format: string): Date | null {
    try {
      const parts = dateStr.split(/[-\/\s]/);
      const formatParts = format.split(/[-\/\s]/);

      if (parts.length !== formatParts.length) {
        return null;
      }

      let year = 0;
      let month = 0;
      let day = 0;

      for (let i = 0; i < formatParts.length; i++) {
        const part = parts[i];
        const formatPart = formatParts[i];

        if (formatPart === 'YYYY') {
          year = parseInt(part);
        } else if (formatPart === 'MM') {
          month = parseInt(part) - 1;
        } else if (formatPart === 'DD') {
          day = parseInt(part);
        }
      }

      if (year && month >= 0 && month <= 11 && day >= 1 && day <= 31) {
        const result = new Date(year, month, day);
        if (result.getFullYear() === year && result.getMonth() === month && result.getDate() === day) {
          return result;
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }
}

// Export individual functions for convenience
export const {
  formatDate,
  formatTime,
  formatDateTime,
  parseDate,
  getCurrentDate,
  getCurrentTime,
  getCurrentDateTime,
  addDays,
  subtractDays,
  addMonths,
  subtractMonths,
  addYears,
  subtractYears,
  getDateDifference,
  isToday,
  isYesterday,
  isTomorrow,
  isSameDay,
  getStartOfDay,
  getEndOfDay,
  getStartOfWeek,
  getEndOfWeek,
  getStartOfMonth,
  getEndOfMonth,
  getStartOfYear,
  getEndOfYear,
  isPast,
  isFuture,
  isExpired,
  getDaysUntilExpiry,
  getAge,
  convertToTimezone,
  getTimezoneOffset
} = DateHelper;

export default DateHelper;
