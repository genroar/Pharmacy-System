# Utils Module

The `utils/` module provides comprehensive utility functions and classes for common operations across the Pharmacy System backend.

## 📁 Module Structure

```
utils/
├── crypto.ts          # Cryptographic utilities
├── barcode.ts         # Barcode generation and validation
├── dateHelper.ts      # Date manipulation and formatting
├── reportFormatter.ts # Report formatting and export utilities
├── logger.ts          # Logging configuration
└── index.ts           # Main export file
```

## 🚀 Quick Start

```typescript
import { 
  CryptoUtils, 
  BarcodeUtils, 
  DateHelper, 
  ReportFormatter,
  utilityHelpers 
} from '@/utils';

// Use utilities
const hashedPassword = await CryptoUtils.hashPassword('password123');
const barcode = BarcodeUtils.generateCode128('MED001');
const formattedDate = DateHelper.formatDate(new Date(), 'YYYY-MM-DD');
```

## 🔐 CryptoUtils

Cryptographic utilities for encryption, hashing, and secure operations.

### Features
- **AES-256-GCM Encryption/Decryption**
- **Password Hashing with bcrypt**
- **SHA-256/512/MD5 Hashing**
- **HMAC Signing**
- **Secure Token Generation**
- **UUID Generation**

### Usage Examples

```typescript
import { CryptoUtils } from '@/utils';

// Password hashing
const hashedPassword = await CryptoUtils.hashPassword('password123');
const isValid = await CryptoUtils.comparePassword('password123', hashedPassword);

// Encryption
const key = CryptoUtils.generateKey();
const { encrypted, iv, tag } = CryptoUtils.encrypt('sensitive data', key);
const decrypted = CryptoUtils.decrypt(encrypted, key, iv, tag);

// Storage encryption (uses environment variable)
const encryptedData = CryptoUtils.encryptForStorage('sensitive data');
const decryptedData = CryptoUtils.decryptFromStorage(encryptedData);

// Token generation
const token = CryptoUtils.generateToken(32);
const uuid = CryptoUtils.generateUUID();
```

### Configuration
Set the `ENCRYPTION_KEY` environment variable for storage encryption:
```bash
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

## 📊 BarcodeUtils

Barcode generation and validation utilities for various formats.

### Supported Formats
- **Code 128** - General purpose barcode
- **Code 39** - Alphanumeric barcode
- **EAN-13** - European Article Number
- **QR Code** - Quick Response code
- **Data Matrix** - 2D barcode

### Usage Examples

```typescript
import { BarcodeUtils } from '@/utils';

// Generate Code 128 barcode
const code128Barcode = BarcodeUtils.generateCode128('MED001', {
  width: 400,
  height: 150,
  showText: true
});

// Generate EAN-13 barcode
const ean13Barcode = BarcodeUtils.generateEAN13('123456789012');

// Generate QR Code
const qrCode = BarcodeUtils.generateQRCode('https://pharmacy.com/med001');

// Generate medicine-specific barcode
const medicineBarcode = BarcodeUtils.generateMedicineBarcode(
  'MED001',
  'BATCH123',
  '2024-12-31',
  { format: 'code128' }
);

// Validate barcode data
const validation = BarcodeUtils.validateBarcodeData('1234567890123', 'ean13');
```

### Output
All barcode methods return a `Buffer` containing PNG image data that can be:
- Sent as HTTP response
- Saved to file system
- Embedded in HTML
- Used for printing

## 📅 DateHelper

Comprehensive date manipulation and formatting utilities.

### Features
- **Date Formatting** - Multiple format support
- **Date Calculations** - Add/subtract days, months, years
- **Date Comparisons** - Past, future, today, etc.
- **Period Calculations** - Start/end of day, week, month, year
- **Age Calculation** - From birth date
- **Expiry Management** - Days until expiry, expired status

### Usage Examples

```typescript
import { DateHelper } from '@/utils';

// Format dates
const formattedDate = DateHelper.formatDate(new Date(), 'YYYY-MM-DD');
const formattedTime = DateHelper.formatTime(new Date(), 'HH:mm:ss');
const formattedDateTime = DateHelper.formatDateTime(new Date());

// Date calculations
const tomorrow = DateHelper.addDays(new Date(), 1);
const nextMonth = DateHelper.addMonths(new Date(), 1);
const nextYear = DateHelper.addYears(new Date(), 1);

// Date comparisons
const isToday = DateHelper.isToday(someDate);
const isExpired = DateHelper.isExpired(currentDate, expiryDate);
const daysUntilExpiry = DateHelper.getDaysUntilExpiry(expiryDate);

// Period calculations
const startOfWeek = DateHelper.getStartOfWeek(new Date());
const endOfMonth = DateHelper.getEndOfMonth(new Date());

// Age calculation
const age = DateHelper.getAge(birthDate);

// Current dates
const today = DateHelper.getCurrentDate();
const now = DateHelper.getCurrentDateTime();
```

### Supported Formats
- `YYYY-MM-DD` - ISO date format
- `MM/DD/YYYY` - US date format
- `DD/MM/YYYY` - European date format
- `HH:mm:ss` - Time format
- `YYYY-MM-DD HH:mm:ss` - DateTime format

## 📋 ReportFormatter

Utilities for formatting and exporting various business reports.

### Supported Report Types
- **Sales Reports** - Order data with totals and grouping
- **Inventory Reports** - Stock levels with summaries
- **Customer Reports** - Customer data with statistics
- **Supplier Reports** - Supplier performance data
- **Medicine Reports** - Product analytics
- **Dashboard Summary** - Overview with charts

### Export Formats
- **CSV** - Comma-separated values
- **JSON** - JavaScript Object Notation

### Usage Examples

```typescript
import { ReportFormatter } from '@/utils';

// Format sales report
const salesReport = ReportFormatter.formatSalesReport(salesData, {
  includeTotals: true,
  groupBy: 'month',
  currency: 'USD'
});

// Format inventory report
const inventoryReport = ReportFormatter.formatInventoryReport(inventoryData, {
  includeSummary: true,
  groupBy: 'category',
  includeLowStock: true,
  includeExpiring: true
});

// Export to CSV
const csvData = ReportFormatter.exportToCSV(data, ['id', 'name', 'price']);

// Export to JSON
const jsonData = ReportFormatter.exportToJSON(data, {
  pretty: true,
  includeMetadata: true
});
```

### Grouping Options
- **Sales**: day, week, month, quarter, year
- **Inventory**: category, location, supplier, status
- **Customers**: location, age, registrationDate, totalSpent
- **Suppliers**: category, location, rating, status
- **Medicines**: category, manufacturer, status, expiryStatus

## 🛠️ Utility Helpers

Common utility functions for validation and data manipulation.

### Validation Functions
```typescript
import { utilityHelpers } from '@/utils';

// Data validation
const isValidEmail = utilityHelpers.isValidEmail('user@example.com');
const isValidPhone = utilityHelpers.isValidPhone('+1234567890');
const isValidUUID = utilityHelpers.isValidUUID('uuid-string');
const isValidDate = utilityHelpers.isValidDate('2024-01-01');

// String utilities
const sanitized = utilityHelpers.sanitizeString('<script>alert("xss")</script>');
const randomString = utilityHelpers.generateRandomString(16);

// Number formatting
const formatted = utilityHelpers.formatNumber(123.456, 2); // "123.46"

// Object utilities
const cloned = utilityHelpers.deepClone(originalObject);

// Function utilities
const debouncedFn = utilityHelpers.debounce(expensiveFunction, 300);
const throttledFn = utilityHelpers.throttle(expensiveFunction, 1000);
```

## 📊 Constants and Enums

### UTILITY_CONSTANTS
```typescript
import { UTILITY_CONSTANTS } from '@/utils';

// Crypto constants
const keyLength = UTILITY_CONSTANTS.CRYPTO.DEFAULT_KEY_LENGTH;

// Barcode constants
const defaultWidth = UTILITY_CONSTANTS.BARCODE.DEFAULT_WIDTH;

// Date constants
const dateFormat = UTILITY_CONSTANTS.DATE.DEFAULT_FORMAT;

// Report constants
const currency = UTILITY_CONSTANTS.REPORT.DEFAULT_CURRENCY;
```

### Enums
```typescript
import { BarcodeFormat, DateGrouping, ExportFormat, CurrencyCode } from '@/utils';

// Barcode formats
const format = BarcodeFormat.CODE_128;

// Date grouping
const grouping = DateGrouping.MONTH;

// Export formats
const exportFormat = ExportFormat.CSV;

// Currency codes
const currency = CurrencyCode.USD;
```

## 🔧 Configuration

### Environment Variables
```bash
# Required for storage encryption
ENCRYPTION_KEY=your-64-character-hex-key

# Optional: Override defaults
NODE_ENV=production
LOG_LEVEL=info
```

### Dependencies
The utils module requires the following packages:
```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "canvas": "^2.11.0"
  }
}
```

## 📝 Error Handling

All utility functions include comprehensive error handling:

```typescript
try {
  const result = await CryptoUtils.hashPassword(password);
} catch (error) {
  logger.error('Password hashing failed:', error);
  // Handle error appropriately
}
```

## 🧪 Testing

### Unit Tests
```typescript
import { CryptoUtils, DateHelper, utilityHelpers } from '@/utils';

describe('CryptoUtils', () => {
  test('should hash password correctly', async () => {
    const password = 'test123';
    const hash = await CryptoUtils.hashPassword(password);
    const isValid = await CryptoUtils.comparePassword(password, hash);
    expect(isValid).toBe(true);
  });
});

describe('DateHelper', () => {
  test('should format date correctly', () => {
    const date = new Date('2024-01-01');
    const formatted = DateHelper.formatDate(date, 'YYYY-MM-DD');
    expect(formatted).toBe('2024-01-01');
  });
});
```

### Integration Tests
```typescript
describe('ReportFormatter Integration', () => {
  test('should format and export sales report', () => {
    const salesData = [/* mock data */];
    const report = ReportFormatter.formatSalesReport(salesData);
    const csv = ReportFormatter.exportToCSV(report.data, ['date', 'total']);
    
    expect(report.summary.totalOrders).toBe(salesData.length);
    expect(csv).toContain('date,total');
  });
});
```

## 🚀 Performance Considerations

### Optimization Tips
1. **Reuse Instances**: Utility classes are static, no need to instantiate
2. **Batch Operations**: Use array methods for multiple items
3. **Lazy Loading**: Import only needed utilities
4. **Caching**: Cache expensive operations like barcode generation

### Memory Management
- Barcode images are returned as Buffers (dispose after use)
- Large reports should be streamed rather than loaded entirely
- Use pagination for large datasets

## 🔒 Security Features

### Input Validation
- All inputs are validated before processing
- XSS prevention through string sanitization
- SQL injection prevention through parameterized queries

### Encryption
- AES-256-GCM for data encryption
- Secure random number generation
- Environment-based key management

### Access Control
- No sensitive data in logs
- Secure token generation
- Input sanitization

## 📚 Best Practices

### Usage Guidelines
1. **Import Only What You Need**: Avoid importing entire utils module
2. **Handle Errors Gracefully**: Always wrap utility calls in try-catch
3. **Validate Inputs**: Use utility helpers for input validation
4. **Log Operations**: Use logger for debugging and monitoring
5. **Test Thoroughly**: Write tests for custom utility functions

### Code Examples
```typescript
// Good: Import specific utilities
import { DateHelper, utilityHelpers } from '@/utils';

// Good: Validate inputs
if (!utilityHelpers.isValidDate(date)) {
  throw new Error('Invalid date provided');
}

// Good: Handle errors
try {
  const result = DateHelper.formatDate(date, format);
  return result;
} catch (error) {
  logger.error('Date formatting failed:', error);
  throw new Error('Failed to format date');
}

// Good: Use constants
const formattedDate = DateHelper.formatDate(date, UTILITY_CONSTANTS.DATE.DEFAULT_FORMAT);
```

## 🔄 Version History

### v1.0.0
- Initial release with core utilities
- Crypto, barcode, date, and report utilities
- Comprehensive validation helpers
- TypeScript support with full type definitions

## 🤝 Contributing

When adding new utilities:

1. **Follow Naming Convention**: Use PascalCase for classes, camelCase for functions
2. **Add TypeScript Types**: Include proper interfaces and types
3. **Write Documentation**: Add JSDoc comments for all public methods
4. **Include Tests**: Write unit tests for new functionality
5. **Update Index**: Export new utilities from `index.ts`
6. **Update README**: Document new features and usage examples

## 📞 Support

For questions or issues with the utils module:

1. Check the documentation above
2. Review the TypeScript types for usage
3. Examine the test files for examples
4. Check the logger for error details
5. Review the source code for implementation details

---

**Note**: This module is designed to be lightweight and focused. For complex operations, consider using specialized libraries or creating custom utilities in the appropriate service layer.
