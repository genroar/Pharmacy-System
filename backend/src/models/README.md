# Models Module

This directory contains TypeScript types, interfaces, enums, and utility functions for the Pharmacy System models.

## 🚀 Features

- **Type Safety**: Comprehensive TypeScript types and interfaces
- **Enum Definitions**: Centralized enum values for consistent data
- **Utility Functions**: Helper functions for common operations
- **Validation**: Built-in validation utilities
- **Prisma Integration**: Seamless integration with Prisma ORM

## 📁 Structure

```
models/
├── index.ts          # Main exports and Prisma types
├── types.ts          # TypeScript type definitions
├── interfaces.ts     # TypeScript interfaces
├── enums.ts          # Enum definitions
├── utilities.ts      # Utility functions
└── README.md         # This documentation
```

## 🔧 Usage

### Importing Models

```typescript
// Import everything
import * as Models from '@/models';

// Import specific types
import { IUser, IMedicine, UserRole } from '@/models';

// Import utilities
import { calculateMedicinePrice, validateEmail } from '@/models';

// Import Prisma types
import { User, Medicine } from '@/models';
```

### Using Types and Interfaces

```typescript
import { IUserCreate, IUserUpdate, UserRole } from '@/models';

// Create user data
const userData: IUserCreate = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  password: 'securePassword123!',
  phone: '+1234567890',
  role: UserRole.CUSTOMER
};

// Update user data
const updateData: IUserUpdate = {
  firstName: 'Jane',
  phone: '+0987654321'
};
```

### Using Enums

```typescript
import { 
  DosageForm, 
  Schedule, 
  OrderStatus, 
  PaymentMethod 
} from '@/models';

// Medicine dosage form
const dosageForm = DosageForm.TABLET;

// Medicine schedule
const schedule = Schedule.SCHEDULE_II;

// Order status
const orderStatus = OrderStatus.PENDING;

// Payment method
const paymentMethod = PaymentMethod.CREDIT_CARD;
```

### Using Utility Functions

```typescript
import { 
  calculateMedicinePrice,
  isMedicineExpired,
  validatePassword,
  buildSearchQuery
} from '@/models';

// Calculate final price
const finalPrice = calculateMedicinePrice(100, 8.5, 10); // $98.50

// Check if medicine is expired
const isExpired = isMedicineExpired(new Date('2024-12-31'));

// Validate password
const passwordValidation = validatePassword('MyPassword123!');
if (!passwordValidation.isValid) {
  console.log('Password errors:', passwordValidation.errors);
}

// Build search query
const searchQuery = buildSearchQuery({
  query: 'aspirin',
  inStock: true,
  priceRange: { min: 5, max: 20 }
});
```

## 📊 Model Overview

### Core Entities

#### User Management
- **User**: Complete user information with roles
- **UserRole**: ADMIN, PHARMACIST, STAFF, CUSTOMER
- **UserProfile**: Public user profile information

#### Medicine Management
- **Medicine**: Complete medicine information
- **DosageForm**: TABLET, CAPSULE, LIQUID, etc.
- **Schedule**: OTC, SCHEDULE_I through SCHEDULE_V
- **MedicineType**: GENERIC, BRAND, BIOSIMILAR

#### Inventory Management
- **InventoryItem**: Stock levels and locations
- **InventoryStatus**: IN_STOCK, LOW_STOCK, OUT_OF_STOCK
- **StockMovementType**: PURCHASE, SALE, RETURN, etc.

#### Order Management
- **Order**: Customer orders and status
- **OrderStatus**: PENDING, CONFIRMED, PROCESSING, etc.
- **PaymentMethod**: CREDIT_CARD, CASH, BANK_TRANSFER, etc.
- **PaymentStatus**: PENDING, COMPLETED, FAILED, etc.

#### Prescription System
- **Prescription**: Patient prescriptions
- **PrescriptionStatus**: PENDING, APPROVED, DISPENSED, etc.
- **PrescriptionType**: NEW, REFILL, TRANSFER, etc.

#### Supplier Management
- **Supplier**: Pharmaceutical suppliers
- **SupplierType**: MANUFACTURER, DISTRIBUTOR, WHOLESALER
- **SupplierStatus**: ACTIVE, INACTIVE, SUSPENDED

#### Review System
- **Review**: Medicine reviews and ratings
- **ReviewRating**: 1-5 star ratings
- **ReviewStatus**: PENDING, APPROVED, REJECTED

#### Audit System
- **AuditLog**: Complete audit trail
- **AuditAction**: CREATE, READ, UPDATE, DELETE, etc.
- **AuditEntity**: USER, MEDICINE, ORDER, etc.

## 🔍 Search and Filtering

### Search Filters
```typescript
import { ISearchFilters, buildSearchQuery } from '@/models';

const filters: ISearchFilters = {
  query: 'pain relief',
  category: 'painkillers',
  priceRange: { min: 5, max: 50 },
  inStock: true,
  prescriptionRequired: false
};

const query = buildSearchQuery(filters);
```

### Pagination
```typescript
import { IPaginationOptions, buildPaginationQuery } from '@/models';

const options: IPaginationOptions = {
  page: 1,
  limit: 20,
  sortBy: 'name',
  sortOrder: 'asc'
};

const pagination = buildPaginationQuery(options);
```

## ✅ Validation

### Built-in Validators
```typescript
import { 
  validateEmail, 
  validatePhone, 
  validatePassword,
  validateMedicineData 
} from '@/models';

// Email validation
const isValidEmail = validateEmail('user@example.com');

// Phone validation
const isValidPhone = validatePhone('+1234567890');

// Password validation
const passwordResult = validatePassword('MyPassword123!');
if (!passwordResult.isValid) {
  passwordResult.errors.forEach(error => {
    console.log(`${error.field}: ${error.message}`);
  });
}

// Medicine data validation
const medicineData = { /* ... */ };
const validationResult = validateMedicineData(medicineData);
```

## 🧮 Calculations

### Price Calculations
```typescript
import { 
  calculateMedicinePrice,
  calculateProfitMargin,
  calculateOrderTotal,
  calculateTaxAmount,
  calculateDiscountAmount
} from '@/models';

// Medicine pricing
const finalPrice = calculateMedicinePrice(100, 8.5, 10);
const profit = calculateProfitMargin(100, 60);

// Order calculations
const items = [
  { quantity: 2, unitPrice: 25 },
  { quantity: 1, unitPrice: 15 }
];
const subtotal = calculateOrderTotal(items);
const tax = calculateTaxAmount(subtotal, 8.5);
const discount = calculateDiscountAmount(subtotal, 5);
```

### Inventory Calculations
```typescript
import { 
  calculateInventoryStatus,
  calculateReorderPoint,
  calculateStockTurnover
} from '@/models';

// Inventory status
const status = calculateInventoryStatus(15, 20);

// Reorder point
const reorderPoint = calculateReorderPoint(20, 7, 5);

// Stock turnover
const turnover = calculateStockTurnover(1000, 200);
```

## 🔄 Status Management

### Order Status Flow
```typescript
import { OrderStatus, canCancelOrder, canRefundOrder } from '@/models';

const orderStatus = OrderStatus.PROCESSING;
const paymentStatus = PaymentStatus.COMPLETED;

// Check if order can be cancelled
if (canCancelOrder(orderStatus)) {
  // Allow cancellation
}

// Check if order can be refunded
if (canRefundOrder(orderStatus, paymentStatus)) {
  // Allow refund
}
```

### Prescription Status Flow
```typescript
import { 
  PrescriptionStatus, 
  isPrescriptionValid,
  canRefillPrescription 
} from '@/models';

const prescriptionStatus = PrescriptionStatus.DISPENSED;
const expiryDate = new Date('2024-12-31');

// Check if prescription is valid
if (isPrescriptionValid(expiryDate)) {
  // Prescription is still valid
}

// Check if prescription can be refilled
if (canRefillPrescription(prescriptionStatus, expiryDate)) {
  // Allow refill
}
```

## 🚨 Error Handling

### Validation Errors
```typescript
import { ValidationResult, ValidationError } from '@/models';

const validation: ValidationResult = validateMedicineData(data);
if (!validation.isValid) {
  validation.errors.forEach((error: ValidationError) => {
    console.log(`Field: ${error.field}`);
    console.log(`Message: ${error.message}`);
    console.log(`Value: ${error.value}`);
  });
}
```

## 📝 Best Practices

1. **Use Type Safety**: Always use the provided types and interfaces
2. **Leverage Enums**: Use enums for consistent status values
3. **Validate Data**: Use built-in validation functions
4. **Handle Errors**: Properly handle validation errors
5. **Use Utilities**: Leverage utility functions for common operations

## 🔗 Integration

### With Prisma
```typescript
import { prisma, IUserCreate, User } from '@/models';

// Create user with type safety
const userData: IUserCreate = { /* ... */ };
const user: User = await prisma.user.create({
  data: userData
});
```

### With Controllers
```typescript
import { IUserUpdate, validateEmail } from '@/models';

export const updateUser = async (req: Request, res: Response) => {
  const updateData: IUserUpdate = req.body;
  
  // Validate email if provided
  if (updateData.email && !validateEmail(updateData.email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  // Update user logic...
};
```

## 📚 Additional Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

---

**Note**: This models module provides a robust foundation for type-safe development. Always use the provided types and interfaces to ensure consistency across the application.
