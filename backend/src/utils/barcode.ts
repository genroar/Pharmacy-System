import { createCanvas } from 'canvas';
import { logger } from './logger';

/**
 * Barcode utility class for generating and processing various barcode formats
 */
export class BarcodeUtils {
  private static readonly DEFAULT_WIDTH = 300;
  private static readonly DEFAULT_HEIGHT = 100;
  private static readonly DEFAULT_MARGIN = 10;

  /**
   * Generate Code 128 barcode
   * @param data - Data to encode
   * @param options - Barcode options
   * @returns Buffer containing PNG image
   */
  static generateCode128(
    data: string,
    options: {
      width?: number;
      height?: number;
      margin?: number;
      showText?: boolean;
      textSize?: number;
    } = {}
  ): Buffer {
    try {
      const {
        width = this.DEFAULT_WIDTH,
        height = this.DEFAULT_HEIGHT,
        margin = this.DEFAULT_MARGIN,
        showText = true,
        textSize = 14
      } = options;

      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // Set background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Generate Code 128 pattern
      const pattern = this.generateCode128Pattern(data);
      const barWidth = (width - 2 * margin) / pattern.length;

      // Draw bars
      ctx.fillStyle = '#000000';
      for (let i = 0; i < pattern.length; i++) {
        if (pattern[i] === '1') {
          const x = margin + i * barWidth;
          ctx.fillRect(x, margin, barWidth, height - 2 * margin - (showText ? textSize + 5 : 0));
        }
      }

      // Add text below barcode
      if (showText) {
        ctx.fillStyle = '#000000';
        ctx.font = `${textSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(data, width / 2, height - margin - 5);
      }

      return canvas.toBuffer('image/png');
    } catch (error) {
      logger.error('Error generating Code 128 barcode:', error);
      throw new Error('Failed to generate Code 128 barcode');
    }
  }

  /**
   * Generate Code 39 barcode
   * @param data - Data to encode
   * @param options - Barcode options
   * @returns Buffer containing PNG image
   */
  static generateCode39(
    data: string,
    options: {
      width?: number;
      height?: number;
      margin?: number;
      showText?: boolean;
      textSize?: number;
    } = {}
  ): Buffer {
    try {
      const {
        width = this.DEFAULT_WIDTH,
        height = this.DEFAULT_HEIGHT,
        margin = this.DEFAULT_MARGIN,
        showText = true,
        textSize = 14
      } = options;

      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // Set background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Generate Code 39 pattern
      const pattern = this.generateCode39Pattern(data);
      const barWidth = (width - 2 * margin) / pattern.length;

      // Draw bars
      ctx.fillStyle = '#000000';
      for (let i = 0; i < pattern.length; i++) {
        if (pattern[i] === '1') {
          const x = margin + i * barWidth;
          ctx.fillRect(x, margin, barWidth, height - 2 * margin - (showText ? textSize + 5 : 0));
        }
      }

      // Add text below barcode
      if (showText) {
        ctx.fillStyle = '#000000';
        ctx.font = `${textSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(data, width / 2, height - margin - 5);
      }

      return canvas.toBuffer('image/png');
    } catch (error) {
      logger.error('Error generating Code 39 barcode:', error);
      throw new Error('Failed to generate Code 39 barcode');
    }
  }

  /**
   * Generate EAN-13 barcode
   * @param data - 12 or 13 digit number
   * @param options - Barcode options
   * @returns Buffer containing PNG image
   */
  static generateEAN13(
    data: string,
    options: {
      width?: number;
      height?: number;
      margin?: number;
      showText?: boolean;
      textSize?: number;
    } = {}
  ): Buffer {
    try {
      // Validate EAN-13 data
      if (!/^\d{12,13}$/.test(data)) {
        throw new Error('EAN-13 must be 12 or 13 digits');
      }

      // Calculate check digit if 12 digits provided
      let ean13 = data;
      if (data.length === 12) {
        ean13 = data + this.calculateEAN13CheckDigit(data);
      }

      const {
        width = this.DEFAULT_WIDTH,
        height = this.DEFAULT_HEIGHT,
        margin = this.DEFAULT_MARGIN,
        showText = true,
        textSize = 14
      } = options;

      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // Set background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Generate EAN-13 pattern
      const pattern = this.generateEAN13Pattern(ean13);
      const barWidth = (width - 2 * margin) / pattern.length;

      // Draw bars
      ctx.fillStyle = '#000000';
      for (let i = 0; i < pattern.length; i++) {
        if (pattern[i] === '1') {
          const x = margin + i * barWidth;
          ctx.fillRect(x, margin, barWidth, height - 2 * margin - (showText ? textSize + 5 : 0));
        }
      }

      // Add text below barcode
      if (showText) {
        ctx.fillStyle = '#000000';
        ctx.font = `${textSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(ean13, width / 2, height - margin - 5);
      }

      return canvas.toBuffer('image/png');
    } catch (error) {
      logger.error('Error generating EAN-13 barcode:', error);
      throw new Error('Failed to generate EAN-13 barcode');
    }
  }

  /**
   * Generate QR Code
   * @param data - Data to encode
   * @param options - QR Code options
   * @returns Buffer containing PNG image
   */
  static generateQRCode(
    data: string,
    options: {
      size?: number;
      margin?: number;
      errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    } = {}
  ): Buffer {
    try {
      const {
        size = 256,
        margin = 4,
        errorCorrectionLevel = 'M'
      } = options;

      // For now, create a simple placeholder QR code
      // In production, use a proper QR code library like 'qrcode'
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');

      // Set background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, size, size);

      // Draw placeholder pattern
      ctx.fillStyle = '#000000';
      const cellSize = (size - 2 * margin) / 21;
      
      // Draw corner squares
      this.drawQRCorners(ctx, margin, cellSize);
      
      // Draw data pattern (simplified)
      this.drawQRDataPattern(ctx, margin, cellSize, data);

      return canvas.toBuffer('image/png');
    } catch (error) {
      logger.error('Error generating QR Code:', error);
      throw new Error('Failed to generate QR Code');
    }
  }

  /**
   * Generate Data Matrix barcode
   * @param data - Data to encode
   * @param options - Data Matrix options
   * @returns Buffer containing PNG image
   */
  static generateDataMatrix(
    data: string,
    options: {
      size?: number;
      margin?: number;
    } = {}
  ): Buffer {
    try {
      const {
        size = 200,
        margin = 10
      } = options;

      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');

      // Set background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, size, size);

      // Draw placeholder Data Matrix pattern
      ctx.fillStyle = '#000000';
      const cellSize = (size - 2 * margin) / 24;
      
      // Draw border
      ctx.strokeRect(margin, margin, size - 2 * margin, size - 2 * margin);
      
      // Draw data cells (simplified)
      this.drawDataMatrixPattern(ctx, margin, cellSize, data);

      return canvas.toBuffer('image/png');
    } catch (error) {
      logger.error('Error generating Data Matrix:', error);
      throw new Error('Failed to generate Data Matrix');
    }
  }

  /**
   * Generate barcode for medicine
   * @param medicineCode - Medicine code
   * @param batchNumber - Batch number
   * @param expiryDate - Expiry date
   * @param options - Barcode options
   * @returns Buffer containing PNG image
   */
  static generateMedicineBarcode(
    medicineCode: string,
    batchNumber: string,
    expiryDate: string,
    options: {
      format?: 'code128' | 'code39' | 'ean13';
      width?: number;
      height?: number;
      showText?: boolean;
    } = {}
  ): Buffer {
    try {
      const {
        format = 'code128',
        width = this.DEFAULT_WIDTH,
        height = this.DEFAULT_HEIGHT,
        showText = true
      } = options;

      // Create composite data
      const data = `${medicineCode}|${batchNumber}|${expiryDate}`;

      switch (format) {
        case 'code128':
          return this.generateCode128(data, { width, height, showText });
        case 'code39':
          return this.generateCode39(data, { width, height, showText });
        case 'ean13':
          return this.generateEAN13(data, { width, height, showText });
        default:
          throw new Error(`Unsupported barcode format: ${format}`);
      }
    } catch (error) {
      logger.error('Error generating medicine barcode:', error);
      throw new Error('Failed to generate medicine barcode');
    }
  }

  /**
   * Generate barcode for inventory item
   * @param itemCode - Inventory item code
   * @param location - Storage location
   * @param options - Barcode options
   * @returns Buffer containing PNG image
   */
  static generateInventoryBarcode(
    itemCode: string,
    location: string,
    options: {
      format?: 'code128' | 'code39' | 'qr';
      size?: number;
      showText?: boolean;
    } = {}
  ): Buffer {
    try {
      const {
        format = 'code128',
        size = this.DEFAULT_WIDTH,
        showText = true
      } = options;

      // Create composite data
      const data = `${itemCode}|${location}`;

      switch (format) {
        case 'code128':
          return this.generateCode128(data, { width: size, height: size / 3, showText });
        case 'code39':
          return this.generateCode39(data, { width: size, height: size / 3, showText });
        case 'qr':
          return this.generateQRCode(data, { size, margin: 10 });
        default:
          throw new Error(`Unsupported barcode format: ${format}`);
      }
    } catch (error) {
      logger.error('Error generating inventory barcode:', error);
      throw new Error('Failed to generate inventory barcode');
    }
  }

  /**
   * Validate barcode data
   * @param data - Barcode data to validate
   * @param format - Expected barcode format
   * @returns Validation result
   */
  static validateBarcodeData(data: string, format: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    switch (format.toLowerCase()) {
      case 'ean13':
        if (!/^\d{13}$/.test(data)) {
          errors.push('EAN-13 must be exactly 13 digits');
        }
        if (!this.validateEAN13CheckDigit(data)) {
          errors.push('Invalid EAN-13 check digit');
        }
        break;
      case 'code128':
        if (data.length === 0) {
          errors.push('Code 128 cannot be empty');
        }
        if (data.length > 255) {
          errors.push('Code 128 cannot exceed 255 characters');
        }
        break;
      case 'code39':
        if (data.length === 0) {
          errors.push('Code 39 cannot be empty');
        }
        if (!/^[A-Z0-9\-\.\/\+\s]+$/i.test(data)) {
          errors.push('Code 39 contains invalid characters');
        }
        break;
      default:
        errors.push(`Unsupported barcode format: ${format}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Private helper methods

  private static generateCode128Pattern(data: string): string {
    // Simplified Code 128 pattern generation
    // In production, use a proper Code 128 library
    let pattern = '';
    for (const char of data) {
      const charCode = char.charCodeAt(0);
      const binary = charCode.toString(2).padStart(8, '0');
      pattern += binary;
    }
    return pattern;
  }

  private static generateCode39Pattern(data: string): string {
    // Simplified Code 39 pattern generation
    // In production, use a proper Code 39 library
    let pattern = '';
    for (const char of data) {
      const charCode = char.charCodeAt(0);
      const binary = charCode.toString(2).padStart(8, '0');
      pattern += binary;
    }
    return pattern;
  }

  private static generateEAN13Pattern(data: string): string {
    // Simplified EAN-13 pattern generation
    // In production, use a proper EAN-13 library
    let pattern = '';
    for (const char of data) {
      const digit = parseInt(char);
      const binary = digit.toString(2).padStart(4, '0');
      pattern += binary;
    }
    return pattern;
  }

  private static calculateEAN13CheckDigit(data: string): string {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(data[i]);
      sum += digit * (i % 2 === 0 ? 1 : 3);
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit.toString();
  }

  private static validateEAN13CheckDigit(data: string): boolean {
    const checkDigit = data[12];
    const calculatedCheckDigit = this.calculateEAN13CheckDigit(data.substring(0, 12));
    return checkDigit === calculatedCheckDigit;
  }

  private static drawQRCorners(ctx: any, margin: number, cellSize: number): void {
    // Draw top-left corner
    ctx.fillRect(margin, margin, 7 * cellSize, 7 * cellSize);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(margin + 2 * cellSize, margin + 2 * cellSize, 3 * cellSize, 3 * cellSize);
    ctx.fillStyle = '#000000';

    // Draw top-right corner
    ctx.fillRect(margin + 14 * cellSize, margin, 7 * cellSize, 7 * cellSize);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(margin + 16 * cellSize, margin + 2 * cellSize, 3 * cellSize, 3 * cellSize);
    ctx.fillStyle = '#000000';

    // Draw bottom-left corner
    ctx.fillRect(margin, margin + 14 * cellSize, 7 * cellSize, 7 * cellSize);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(margin + 2 * cellSize, margin + 16 * cellSize, 3 * cellSize, 3 * cellSize);
    ctx.fillStyle = '#000000';
  }

  private static drawQRDataPattern(ctx: any, margin: number, cellSize: number, data: string): void {
    // Simplified QR data pattern
    // In production, use proper QR encoding
    for (let i = 0; i < data.length && i < 100; i++) {
      const row = Math.floor(i / 10);
      const col = i % 10;
      if (Math.random() > 0.5) {
        ctx.fillRect(
          margin + (col + 7) * cellSize,
          margin + (row + 7) * cellSize,
          cellSize,
          cellSize
        );
      }
    }
  }

  private static drawDataMatrixPattern(ctx: any, margin: number, cellSize: number, data: string): void {
    // Simplified Data Matrix pattern
    // In production, use proper Data Matrix encoding
    for (let i = 0; i < data.length && i < 400; i++) {
      const row = Math.floor(i / 20);
      const col = i % 20;
      if (Math.random() > 0.5) {
        ctx.fillRect(
          margin + col * cellSize,
          margin + row * cellSize,
          cellSize,
          cellSize
        );
      }
    }
  }
}

// Export individual functions for convenience
export const {
  generateCode128,
  generateCode39,
  generateEAN13,
  generateQRCode,
  generateDataMatrix,
  generateMedicineBarcode,
  generateInventoryBarcode,
  validateBarcodeData
} = BarcodeUtils;

export default BarcodeUtils;
