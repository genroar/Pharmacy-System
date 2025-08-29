import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { config } from '@/config';

/**
 * Crypto utility class for encryption, hashing, and security operations
 */
export class CryptoUtils {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32; // 256 bits
  private static readonly IV_LENGTH = 16; // 128 bits
  private static readonly TAG_LENGTH = 16; // 128 bits
  private static readonly SALT_ROUNDS = 12;

  /**
   * Generate a random encryption key
   * @returns Buffer containing the key
   */
  static generateKey(): Buffer {
    return crypto.randomBytes(this.KEY_LENGTH);
  }

  /**
   * Generate a random initialization vector
   * @returns Buffer containing the IV
   */
  static generateIV(): Buffer {
    return crypto.randomBytes(this.IV_LENGTH);
  }

  /**
   * Generate a random salt
   * @param length - Salt length in bytes
   * @returns Buffer containing the salt
   */
  static generateSalt(length: number = 16): Buffer {
    return crypto.randomBytes(length);
  }

  /**
   * Encrypt data using AES-256-GCM
   * @param data - Data to encrypt
   * @param key - Encryption key
   * @param iv - Initialization vector
   * @returns Object containing encrypted data, IV, and auth tag
   */
  static encrypt(data: string | Buffer, key: Buffer, iv?: Buffer): {
    encrypted: Buffer;
    iv: Buffer;
    tag: Buffer;
  } {
    const cipher = crypto.createCipher(this.ALGORITHM, key);
    
    if (iv) {
      cipher.setAAD(iv);
    }

    const encrypted = Buffer.concat([
      cipher.update(data),
      cipher.final()
    ]);

    return {
      encrypted,
      iv: iv || this.generateIV(),
      tag: cipher.getAuthTag()
    };
  }

  /**
   * Decrypt data using AES-256-GCM
   * @param encryptedData - Encrypted data
   * @param key - Decryption key
   * @param iv - Initialization vector
   * @param tag - Authentication tag
   * @returns Decrypted data
   */
  static decrypt(
    encryptedData: Buffer,
    key: Buffer,
    iv: Buffer,
    tag: Buffer
  ): Buffer {
    const decipher = crypto.createDecipher(this.ALGORITHM, key);
    decipher.setAuthTag(tag);
    decipher.setAAD(iv);

    return Buffer.concat([
      decipher.update(encryptedData),
      decipher.final()
    ]);
  }

  /**
   * Hash password using bcrypt
   * @param password - Plain text password
   * @returns Hashed password
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Compare password with hash
   * @param password - Plain text password
   * @param hash - Hashed password
   * @returns True if password matches
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate SHA-256 hash
   * @param data - Data to hash
   * @returns Hash string
   */
  static sha256(data: string | Buffer): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generate SHA-512 hash
   * @param data - Data to hash
   * @returns Hash string
   */
  static sha512(data: string | Buffer): string {
    return crypto.createHash('sha512').update(data).digest('hex');
  }

  /**
   * Generate MD5 hash (for compatibility, not recommended for security)
   * @param data - Data to hash
   * @returns Hash string
   */
  static md5(data: string | Buffer): string {
    return crypto.createHash('md5').update(data).digest('hex');
  }

  /**
   * Generate HMAC signature
   * @param data - Data to sign
   * @param secret - Secret key
   * @param algorithm - Hash algorithm (default: sha256)
   * @returns HMAC signature
   */
  static hmac(
    data: string | Buffer,
    secret: string | Buffer,
    algorithm: string = 'sha256'
  ): string {
    return crypto
      .createHmac(algorithm, secret)
      .update(data)
      .digest('hex');
  }

  /**
   * Generate random token
   * @param length - Token length in bytes
   * @param encoding - Output encoding
   * @returns Random token
   */
  static generateToken(length: number = 32, encoding: BufferEncoding = 'hex'): string {
    return crypto.randomBytes(length).toString(encoding);
  }

  /**
   * Generate UUID v4
   * @returns UUID string
   */
  static generateUUID(): string {
    return crypto.randomUUID();
  }

  /**
   * Generate secure random number
   * @param min - Minimum value
   * @param max - Maximum value
   * @returns Random number
   */
  static secureRandom(min: number, max: number): number {
    const range = max - min + 1;
    const bytes = crypto.randomBytes(4);
    const value = bytes.readUInt32BE(0);
    return min + (value % range);
  }

  /**
   * Generate API key
   * @param prefix - Key prefix
   * @param length - Key length
   * @returns API key
   */
  static generateAPIKey(prefix: string = 'pk', length: number = 32): string {
    const randomPart = crypto.randomBytes(length).toString('base64url');
    return `${prefix}_${randomPart}`;
  }

  /**
   * Encrypt sensitive data for storage
   * @param data - Data to encrypt
   * @returns Encrypted data as base64 string
   */
  static encryptForStorage(data: string): string {
    // Use environment variable or generate a default key
    const encryptionKey = process.env['ENCRYPTION_KEY'] || 
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    const key = Buffer.from(encryptionKey, 'hex');
    const iv = this.generateIV();
    const { encrypted, tag } = this.encrypt(data, key, iv);
    
    // Combine IV, encrypted data, and tag
    const combined = Buffer.concat([iv, tag, encrypted]);
    return combined.toString('base64');
  }

  /**
   * Decrypt data from storage
   * @param encryptedData - Base64 encrypted data
   * @returns Decrypted data
   */
  static decryptFromStorage(encryptedData: string): string {
    // Use environment variable or generate a default key
    const encryptionKey = process.env['ENCRYPTION_KEY'] || 
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    const key = Buffer.from(encryptionKey, 'hex');
    const combined = Buffer.from(encryptedData, 'base64');
    
    // Extract IV, tag, and encrypted data
    const iv = combined.subarray(0, this.IV_LENGTH);
    const tag = combined.subarray(this.IV_LENGTH, this.IV_LENGTH + this.TAG_LENGTH);
    const encrypted = combined.subarray(this.IV_LENGTH + this.TAG_LENGTH);
    
    const decrypted = this.decrypt(encrypted, key, iv, tag);
    return decrypted.toString();
  }

  /**
   * Generate password reset token
   * @returns Reset token
   */
  static generatePasswordResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate email verification token
   * @returns Verification token
   */
  static generateEmailVerificationToken(): string {
    return crypto.randomBytes(24).toString('base64url');
  }

  /**
   * Generate session token
   * @returns Session token
   */
  static generateSessionToken(): string {
    return crypto.randomBytes(48).toString('base64url');
  }

  /**
   * Validate encryption key format
   * @param key - Key to validate
   * @returns True if valid
   */
  static isValidKey(key: string): boolean {
    try {
      const buffer = Buffer.from(key, 'hex');
      return buffer.length === this.KEY_LENGTH;
    } catch {
      return false;
    }
  }

  /**
   * Generate key derivation function (PBKDF2)
   * @param password - Password to derive from
   * @param salt - Salt for derivation
   * @param iterations - Number of iterations
   * @param keyLength - Derived key length
   * @returns Derived key
   */
  static pbkdf2(
    password: string | Buffer,
    salt: Buffer,
    iterations: number = 100000,
    keyLength: number = 64
  ): Buffer {
    return crypto.pbkdf2Sync(password, salt, iterations, keyLength, 'sha512');
  }

  /**
   * Generate secure random string
   * @param length - String length
   * @param charset - Character set
   * @returns Random string
   */
  static randomString(
    length: number = 16,
    charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  ): string {
    let result = '';
    const charsLength = charset.length;
    
    for (let i = 0; i < length; i++) {
      result += charset.charAt(this.secureRandom(0, charsLength - 1));
    }
    
    return result;
  }
}

// Export individual functions for convenience
export const {
  generateKey,
  generateIV,
  generateSalt,
  encrypt,
  decrypt,
  hashPassword,
  comparePassword,
  sha256,
  sha512,
  md5,
  hmac,
  generateToken,
  generateUUID,
  secureRandom,
  generateAPIKey,
  encryptForStorage,
  decryptFromStorage,
  generatePasswordResetToken,
  generateEmailVerificationToken,
  generateSessionToken,
  isValidKey,
  pbkdf2,
  randomString
} = CryptoUtils;

export default CryptoUtils;
