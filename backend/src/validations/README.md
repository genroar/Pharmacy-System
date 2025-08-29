# Validations Module

The `validations/` module provides comprehensive Joi validation schemas for all API endpoints in the Pharmacy System backend.

## 📁 Module Structure

```
validations/
├── authValidation.ts      # Authentication and user management validations
├── productValidation.ts   # Medicine/product management validations
├── salesValidation.ts     # Sales and order management validations
└── index.ts               # Main export file
```

## 🚀 Quick Start

```typescript
import { 
  authValidation, 
  productValidation, 
  salesValidation,
  validationHelpers 
} from '@/validations';

// Use in middleware
app.post('/auth/register', validateRequest(authValidation.register), authController.register);
app.post('/medicines', validateRequest(productValidation.createMedicine), productController.createMedicine);
app.post('/orders', validateRequest(salesValidation.createOrder), salesController.createOrder);
```

## 🔐 AuthValidation

Comprehensive validation schemas for authentication and user management operations.

### Available Schemas

#### User Registration
```typescript
authValidation.register
```
**Validates:**
- Personal information (name, email, phone, address)
- Password strength and confirmation
- Role assignment
- Emergency contact details
- Date of birth validation

**Required Fields:**
- `firstName`, `lastName`, `email`, `phone`, `password`, `confirmPassword`, `address`

**Password Requirements:**
- Minimum 8 characters
- Maximum 128 characters
- Must contain: lowercase, uppercase, number, special character

#### User Login
```typescript
authValidation.login
```
**Validates:**
- Email format
- Password presence
- Optional device information
- Remember me functionality

#### Password Management
```typescript
authValidation.changePassword
authValidation.requestPasswordReset
authValidation.resetPassword
```
**Validates:**
- Current password verification
- New password strength
- Password confirmation
- Reset token validation

#### Two-Factor Authentication
```typescript
authValidation.setup2FA
authValidation.verify2FA
```
**Validates:**
- 2FA method selection (TOTP, SMS, Email)
- Required fields based on method
- Verification code format

#### Session Management
```typescript
authValidation.manageSessions
authValidation.revokeSession
```
**Validates:**
- Session ID format
- Query parameters for filtering
- Pagination limits

#### Profile Updates
```typescript
authValidation.updateProfile
authValidation.adminCreateUser
authValidation.adminUpdateUser
```
**Validates:**
- Optional field updates
- Role-based permissions
- Administrative operations

### Usage Examples

```typescript
import { authValidation } from '@/validations';

// In route definition
router.post('/register', validateRequest(authValidation.register), authController.register);
router.post('/login', validateRequest(authValidation.login), authController.login);
router.put('/profile', validateRequest(authValidation.updateProfile), authController.updateProfile);

// In middleware
app.use('/auth', validateRequest(authValidation.login));
```

## 💊 ProductValidation

Comprehensive validation schemas for medicine and product management operations.

### Available Schemas

#### Medicine Creation
```typescript
productValidation.createMedicine
```
**Validates:**
- Basic information (name, category, strength, dosage form)
- Manufacturer and supplier details
- Active/inactive ingredients
- Medical information (indications, contraindications, side effects)
- Storage conditions and packaging
- Pricing and regulatory information
- Barcode and NDC formats

**Required Fields:**
- `name`, `category`, `strength`, `dosageForm`, `manufacturer`, `supplier`, `packaging`, `pricing`

**Category Options:**
- antibiotics, analgesics, antihistamines, antihypertensives, antidiabetics, antidepressants, antipsychotics, bronchodilators, corticosteroids, diuretics, gastrointestinal, hormones, immunosuppressants, muscle_relaxants, narcotics, sedatives, vitamins, supplements, other

#### Medicine Updates
```typescript
productValidation.updateMedicine
```
**Validates:**
- Optional field updates
- Conditional field requirements
- Data integrity maintenance

#### Medicine Queries
```typescript
productValidation.getMedicines
productValidation.getMedicineById
productValidation.getMedicinesByCategory
productValidation.searchMedicines
```
**Validates:**
- Query parameters
- Pagination limits
- Search criteria
- Filter options

#### Specialized Queries
```typescript
productValidation.getExpiringMedicines
productValidation.getLowStockMedicines
productValidation.getMedicineStats
```
**Validates:**
- Date ranges
- Threshold values
- Statistical parameters

#### Bulk Operations
```typescript
productValidation.bulkUpdateMedicines
productValidation.importMedicines
```
**Validates:**
- Batch sizes
- File formats
- Import options

### Usage Examples

```typescript
import { productValidation } from '@/validations';

// In route definition
router.post('/', validateRequest(productValidation.createMedicine), productController.createMedicine);
router.put('/:id', validateRequest(productValidation.updateMedicine), productController.updateMedicine);
router.get('/', validateRequest(productValidation.getMedicines), productController.getMedicines);
router.get('/expiring/:days', validateRequest(productValidation.getExpiringMedicines), productController.getExpiringMedicines);

// In middleware
app.use('/medicines', validateRequest(productValidation.getMedicines));
```

## 🛒 SalesValidation

Comprehensive validation schemas for sales and order management operations.

### Available Schemas

#### Order Creation
```typescript
salesValidation.createOrder
```
**Validates:**
- Customer information (new or existing)
- Order items with quantities and prices
- Payment method and details
- Billing and shipping addresses
- Delivery method and instructions
- Discounts and tax calculations
- Gift options and loyalty points

**Required Fields:**
- `customerInfo` (if no customerId), `items`, `paymentMethod`

**Payment Methods:**
- cash, credit_card, debit_card, insurance, check, mobile_payment, other

**Delivery Methods:**
- pickup, delivery, shipping

#### Order Management
```typescript
salesValidation.updateOrder
salesValidation.updateOrderStatus
salesValidation.cancelOrder
```
**Validates:**
- Order modifications
- Status transitions
- Cancellation reasons
- Refund processing

#### Order Queries
```typescript
salesValidation.getOrders
salesValidation.getOrderById
salesValidation.getCustomerOrders
salesValidation.getOrdersByStatus
salesValidation.getOrdersByDateRange
salesValidation.searchOrders
```
**Validates:**
- Query parameters
- Date ranges
- Status filters
- Search criteria
- Pagination limits

#### Sales Analytics
```typescript
salesValidation.getSalesStats
```
**Validates:**
- Time periods
- Grouping options
- Custom date ranges
- Currency specifications

#### Refund Processing
```typescript
salesValidation.processRefund
```
**Validates:**
- Refund amounts
- Refund methods
- Partial refunds
- Processing details

### Usage Examples

```typescript
import { salesValidation } from '@/validations';

// In route definition
router.post('/', validateRequest(salesValidation.createOrder), salesController.createOrder);
router.put('/:id', validateRequest(salesValidation.updateOrder), salesController.updateOrder);
router.patch('/:id/status', validateRequest(salesValidation.updateOrderStatus), salesController.updateOrderStatus);
router.get('/', validateRequest(salesValidation.getOrders), salesController.getOrders);
router.get('/stats/sales', validateRequest(salesValidation.getSalesStats), salesController.getSalesStats);

// In middleware
app.use('/orders', validateRequest(salesValidation.getOrders));
```

## 🛠️ Validation Helpers

Utility functions for common validation tasks and custom validation logic.

### Available Helpers

#### Data Type Validation
```typescript
validationHelpers.isValidUUID(value: string): boolean
validationHelpers.isValidEmail(value: string): boolean
validationHelpers.isValidPhone(value: string): boolean
validationHelpers.isValidDate(value: any): boolean
validationHelpers.isValidNumber(value: any): boolean
validationHelpers.isValidInteger(value: any): boolean
validationHelpers.isValidPositiveNumber(value: any): boolean
validationHelpers.isValidPercentage(value: any): boolean
validationHelpers.isValidCurrencyAmount(value: any): boolean
```

#### Payment Validation
```typescript
validationHelpers.isValidCardNumber(value: string): boolean
validationHelpers.isValidExpiryDate(value: string): boolean
validationHelpers.isValidCVV(value: string): boolean
```

#### Business Logic Validation
```typescript
validationHelpers.isValidNDC(value: string): boolean
validationHelpers.isValidBarcode(value: string): boolean
validationHelpers.isValidFileSize(size: number, maxSize?: number): boolean
validationHelpers.isValidMimeType(mimeType: string): boolean
```

#### Utility Functions
```typescript
validationHelpers.sanitizeString(value: string): string
validationHelpers.formatValidationError(error: any): string
validationHelpers.createValidationError(message: string, field?: string): any
validationHelpers.validateRequiredFields(data: any, requiredFields: string[]): string[]
validationHelpers.validateFieldLengths(data: any, fieldLimits: Record<string, { min?: number; max: number }>): string[]
validationHelpers.validateNumericRanges(data: any, fieldRanges: Record<string, { min?: number; max?: number }>): string[]
```

### Usage Examples

```typescript
import { validationHelpers } from '@/validations';

// Custom validation logic
const validateCustomData = (data: any) => {
  const errors: string[] = [];
  
  // Check required fields
  const missingFields = validationHelpers.validateRequiredFields(data, ['name', 'email']);
  if (missingFields.length > 0) {
    errors.push(`Missing required fields: ${missingFields.join(', ')}`);
  }
  
  // Validate email format
  if (data.email && !validationHelpers.isValidEmail(data.email)) {
    errors.push('Invalid email format');
  }
  
  // Validate phone number
  if (data.phone && !validationHelpers.isValidPhone(data.phone)) {
    errors.push('Invalid phone number format');
  }
  
  return errors;
};

// Error formatting
try {
  // Validation logic
} catch (error) {
  const formattedError = validationHelpers.formatValidationError(error);
  console.error('Validation failed:', formattedError);
}
```

## 📊 Validation Constants

Predefined constants for validation limits and configurations.

### Available Constants

#### Common Limits
```typescript
VALIDATION_CONSTANTS.COMMON
```
- Name lengths (2-50 characters)
- Email length (100 characters)
- Phone length (20 characters)
- Address lengths (100 characters)
- Description length (1000 characters)
- Notes length (500 characters)

#### Medicine Limits
```typescript
VALIDATION_CONSTANTS.MEDICINE
```
- Name lengths (2-200 characters)
- Ingredient limits (10 active, 20 inactive)
- Medical information limits (20 items each)
- File limits (10 images, 20 documents)
- Tag limits (20 tags)

#### Order Limits
```typescript
VALIDATION_CONSTANTS.ORDER
```
- Item limits (1-50 items)
- Quantity limits (1000 max)
- Message lengths (1000 characters)
- Instruction lengths (500 characters)

#### Payment Limits
```typescript
VALIDATION_CONSTANTS.PAYMENT
```
- Name lengths (100 characters)
- Policy lengths (50 characters)
- Code lengths (50 characters)

#### Search and Pagination
```typescript
VALIDATION_CONSTANTS.SEARCH
```
- Query length (2-200 characters)
- Page limits (1+)
- Result limits (1-100, default 20)

#### File Validation
```typescript
VALIDATION_CONSTANTS.FILE
```
- Maximum size (10MB)
- Allowed MIME types (CSV, Excel)

### Usage Examples

```typescript
import { VALIDATION_CONSTANTS } from '@/validations';

// Use constants in custom validation
const validateMedicineName = (name: string) => {
  if (name.length < VALIDATION_CONSTANTS.MEDICINE.MIN_NAME_LENGTH) {
    return `Name must be at least ${VALIDATION_CONSTANTS.MEDICINE.MIN_NAME_LENGTH} characters long`;
  }
  
  if (name.length > VALIDATION_CONSTANTS.MEDICINE.MAX_NAME_LENGTH) {
    return `Name cannot exceed ${VALIDATION_CONSTANTS.MEDICINE.MAX_NAME_LENGTH} characters`;
  }
  
  return null; // Valid
};

// Use in business logic
const validateFileUpload = (file: any) => {
  if (!validationHelpers.isValidFileSize(file.size)) {
    return `File size cannot exceed ${VALIDATION_CONSTANTS.FILE.MAX_SIZE / (1024 * 1024)}MB`;
  }
  
  if (!validationHelpers.isValidMimeType(file.mimetype)) {
    return `File type not allowed. Allowed types: ${VALIDATION_CONSTANTS.FILE.ALLOWED_MIME_TYPES.join(', ')}`;
  }
  
  return null; // Valid
};
```

## 🔧 Configuration

### Environment Variables
```bash
# Validation configuration (optional)
NODE_ENV=production
VALIDATION_STRICT_MODE=true
VALIDATION_CUSTOM_RULES=false
```

### Custom Validation Rules
```typescript
// Create custom validation schema
const customValidation = Joi.object({
  // Your custom validation rules
}).custom((value, helpers) => {
  // Custom validation logic
  if (/* custom condition */) {
    return helpers.error('any.custom');
  }
  return value;
}, 'custom-validation');
```

### Validation Options
```typescript
// Validation middleware options
const validationOptions = {
  abortEarly: false,        // Return all validation errors
  allowUnknown: false,      // Reject unknown fields
  stripUnknown: true,       // Remove unknown fields
  convert: true,            // Convert types when possible
  presence: 'required'      // Default field presence
};

// Use in middleware
app.use(validateRequest(schema, validationOptions));
```

## 📝 Error Handling

### Error Format
```typescript
// Validation error response format
{
  "error": "ValidationError",
  "message": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Please provide a valid email address",
      "value": "invalid-email"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters long",
      "value": "123"
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Custom Error Messages
```typescript
// Define custom error messages
const customSchema = Joi.object({
  email: Joi.string().email().messages({
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required for registration'
  })
});
```

### Error Handling in Controllers
```typescript
// Handle validation errors in controllers
const createMedicine = async (req: Request, res: Response) => {
  try {
    // Validation is handled by middleware
    const result = await medicineService.create(req.body);
    res.status(201).json(result);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).json({
        error: 'ValidationError',
        message: 'Medicine data validation failed',
        details: error.details
      });
    } else {
      res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to create medicine'
      });
    }
  }
};
```

## 🧪 Testing

### Unit Tests
```typescript
import { authValidation, productValidation, salesValidation } from '@/validations';

describe('Auth Validation', () => {
  test('should validate valid registration data', () => {
    const validData = {
      body: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345',
          country: 'USA'
        }
      }
    };
    
    const { error } = authValidation.register.validate(validData);
    expect(error).toBeUndefined();
  });
  
  test('should reject invalid email format', () => {
    const invalidData = {
      body: {
        email: 'invalid-email',
        // ... other required fields
      }
    };
    
    const { error } = authValidation.register.validate(invalidData);
    expect(error).toBeDefined();
    expect(error.details[0].message).toContain('valid email address');
  });
});
```

### Integration Tests
```typescript
describe('Validation Middleware Integration', () => {
  test('should reject invalid medicine data', async () => {
    const invalidMedicine = {
      name: '', // Invalid: empty name
      category: 'invalid-category', // Invalid: not in allowed list
      strength: '100mg',
      dosageForm: 'tablet',
      manufacturer: 'Test Pharma',
      supplier: 'invalid-uuid', // Invalid: not UUID format
      packaging: {
        type: 'bottle',
        quantity: -1, // Invalid: negative quantity
        unit: 'tablets'
      },
      pricing: {
        costPrice: -10, // Invalid: negative price
        sellingPrice: 0 // Invalid: zero price
      }
    };
    
    const response = await request(app)
      .post('/api/v1/medicines')
      .send(invalidMedicine)
      .expect(400);
    
    expect(response.body.error).toBe('ValidationError');
    expect(response.body.details).toHaveLength(5); // 5 validation errors
  });
});
```

## 🚀 Performance Considerations

### Optimization Tips
1. **Use Specific Schemas**: Import only needed validation schemas
2. **Cache Validation Results**: Cache validation results for repeated requests
3. **Lazy Validation**: Validate only when necessary
4. **Async Validation**: Use async validation for database checks

### Memory Management
- Validation schemas are lightweight and reusable
- Error objects are created only when validation fails
- No persistent state maintained between requests

## 🔒 Security Features

### Input Sanitization
- Automatic XSS prevention through Joi sanitization
- HTML tag removal from string inputs
- SQL injection prevention through parameterized queries

### Data Validation
- Strict type checking
- Length and format validation
- Business rule enforcement
- Malicious input rejection

### Access Control
- Role-based validation rules
- Permission checking in validation schemas
- Secure field access control

## 📚 Best Practices

### Schema Design
1. **Be Specific**: Define exact validation rules for each field
2. **Use Enums**: Use predefined value lists for categorical fields
3. **Conditional Validation**: Use `when()` clauses for dependent fields
4. **Custom Messages**: Provide clear, user-friendly error messages

### Error Handling
1. **Consistent Format**: Use consistent error response format
2. **Detailed Messages**: Provide specific error details
3. **User-Friendly**: Use language appropriate for end users
4. **Logging**: Log validation errors for debugging

### Performance
1. **Efficient Schemas**: Design schemas for optimal performance
2. **Caching**: Cache validation results when possible
3. **Async Validation**: Use async validation for external checks
4. **Batch Validation**: Validate multiple items together

### Maintenance
1. **Documentation**: Keep validation rules documented
2. **Testing**: Write comprehensive tests for all schemas
3. **Versioning**: Version validation schemas with API changes
4. **Monitoring**: Monitor validation error rates

## 🔄 Version History

### v1.0.0
- Initial release with comprehensive validation schemas
- Authentication, product, and sales validation coverage
- Utility functions and helper methods
- TypeScript support with full type definitions

## 🤝 Contributing

When adding new validation schemas:

1. **Follow Naming Convention**: Use camelCase for schema names
2. **Add TypeScript Types**: Include proper interfaces and types
3. **Write Documentation**: Add JSDoc comments for all schemas
4. **Include Tests**: Write unit tests for new validation rules
5. **Update Index**: Export new schemas from `index.ts`
6. **Update README**: Document new features and usage examples

## 📞 Support

For questions or issues with the validations module:

1. Check the documentation above
2. Review the Joi documentation for schema syntax
3. Examine the test files for usage examples
4. Check the validation error logs
5. Review the source code for implementation details

---

**Note**: This module is designed to work seamlessly with the Express middleware system and provides comprehensive validation for all API endpoints. For complex business logic validation, consider using custom validation functions or extending the existing schemas.
