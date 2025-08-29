# Services Module

This directory contains all the service layer classes for the Pharmacy System, implementing business logic and data operations that are separate from the controllers and database layers.

## 🚀 Features

- **Business Logic Separation**: Clean separation of concerns between controllers and business logic
- **Type Safety**: Full TypeScript support with comprehensive interfaces
- **Error Handling**: Consistent error handling and logging across all services
- **Transaction Management**: Proper database transaction handling for complex operations
- **Validation**: Input validation and business rule enforcement
- **Logging**: Comprehensive logging for debugging and monitoring
- **Testability**: Services are easily testable due to dependency injection

## 📁 Structure

```
services/
├── index.ts              # Main exports and service types
├── types.ts              # TypeScript types and interfaces
├── authService.ts        # Authentication and user management
├── inventoryService.ts   # Medicine and inventory management
├── salesService.ts       # Order and sales management
├── reportService.ts      # Business reports and analytics
├── syncService.ts        # Data synchronization
└── README.md            # This documentation
```

## 🔧 Architecture

### Service Layer Pattern

The services follow a layered architecture pattern:

```
Controllers → Services → Database (Prisma)
    ↓           ↓           ↓
HTTP Layer  Business    Data Access
           Logic Layer    Layer
```

### Benefits

1. **Separation of Concerns**: Controllers handle HTTP, services handle business logic
2. **Reusability**: Services can be used by multiple controllers
3. **Testability**: Business logic can be tested independently
4. **Maintainability**: Changes to business logic don't affect HTTP layer
5. **Scalability**: Services can be easily extended or modified

## 📊 Service Overview

### 1. Authentication Service (`authService.ts`)

Handles all authentication and user management operations.

**Key Features:**
- User registration and authentication
- JWT token management
- Password hashing and validation
- Email verification
- Password reset functionality
- User profile management

**Main Methods:**
```typescript
// User authentication
await authService.authenticateUser(email, password);
await authService.registerUser(userData);
await authService.validateToken(token);

// Password management
await authService.changePassword(userId, currentPassword, newPassword);
await authService.generatePasswordResetToken(email);
await authService.resetPassword(token, newPassword);

// User management
await authService.updateUserProfile(userId, updates);
await authService.deactivateUser(userId);
await authService.reactivateUser(userId);
```

**Usage Example:**
```typescript
import { authService } from '@/services';

// In a controller
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.authenticateUser(email, password);
    
    res.json({
      success: true,
      data: result,
      message: 'Login successful'
    });
  } catch (error) {
    // Handle error
  }
};
```

### 2. Inventory Service (`inventoryService.ts`)

Manages medicine inventory and stock operations.

**Key Features:**
- Medicine CRUD operations
- Stock management and updates
- Low stock monitoring
- Expiry date tracking
- Inventory adjustments
- Location transfers

**Main Methods:**
```typescript
// Medicine management
await inventoryService.addMedicine(medicineData);
await inventoryService.updateMedicine(id, updates);
await inventoryService.removeMedicine(id);

// Stock operations
await inventoryService.updateStock(medicineId, quantity, 'add');
await inventoryService.checkLowStock(threshold);
await inventoryService.getExpiringMedicines(days);

// Inventory operations
await inventoryService.adjustInventory(medicineId, adjustment);
await inventoryService.transferInventory(fromId, toId, quantity);
```

**Usage Example:**
```typescript
import { inventoryService } from '@/services';

// Add new medicine
const medicine = await inventoryService.addMedicine({
  name: 'Paracetamol',
  genericName: 'Acetaminophen',
  brandName: 'Tylenol',
  description: 'Pain reliever and fever reducer',
  // ... other fields
});

// Update stock
await inventoryService.updateStock(medicine.id, 100, 'add');
```

### 3. Sales Service (`salesService.ts`)

Handles order management and sales operations.

**Key Features:**
- Order creation and management
- Payment processing
- Order status updates
- Inventory integration
- Sales analytics
- Invoice generation

**Main Methods:**
```typescript
// Order management
await salesService.createOrder(orderData);
await salesService.updateOrder(id, updates);
await salesService.cancelOrder(id, reason);

// Payment processing
await salesService.processPayment(orderId, paymentData);
await salesService.refundOrder(orderId, refundData);

// Analytics
await salesService.getSalesStats(period);
await salesService.generateInvoice(orderId);
```

**Usage Example:**
```typescript
import { salesService } from '@/services';

// Create order
const order = await salesService.createOrder({
  customerId: 'user123',
  items: [
    { medicineId: 'med456', quantity: 2, unitPrice: 10.99 }
  ],
  paymentMethod: 'CREDIT_CARD',
  shippingAddress: '123 Main St',
  // ... other fields
});

// Process payment
const paymentResult = await salesService.processPayment(order.id, {
  method: 'CREDIT_CARD',
  amount: order.totalAmount
});
```

### 4. Report Service (`reportService.ts`)

Generates business reports and analytics.

**Key Features:**
- Sales reports
- Inventory reports
- Revenue analysis
- Customer insights
- Supplier performance
- Custom report generation

**Main Methods:**
```typescript
// Report generation
await reportService.generateSalesReport(period, filters);
await reportService.generateInventoryReport(filters);
await reportService.generateRevenueReport(period, filters);

// Export and scheduling
await reportService.exportReport(report, 'pdf');
await reportService.scheduleReport(reportConfig);
```

**Usage Example:**
```typescript
import { reportService } from '@/services';

// Generate sales report
const salesReport = await reportService.generateSalesReport({
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
  type: 'monthly'
}, {
  categories: ['antibiotics', 'painkillers']
});

// Export to PDF
const pdfContent = await reportService.exportReport(salesReport, 'pdf');
```

### 5. Sync Service (`syncService.ts`)

Manages data synchronization between local and remote databases.

**Key Features:**
- Data push/pull operations
- Conflict detection and resolution
- Sync status monitoring
- Backup and restore
- Scheduled synchronization

**Main Methods:**
```typescript
// Sync operations
await syncService.pushData(entityType, data);
await syncService.pullData(entityType, lastSyncTime);
await syncService.performFullSync(entityType);

// Status and monitoring
await syncService.getSyncStatus(entityType);
await syncService.getSyncConflicts();
await syncService.resolveConflicts(conflicts);
```

**Usage Example:**
```typescript
import { syncService } from '@/services';

// Perform full sync
const syncResult = await syncService.performFullSync('medicines');

// Check sync status
const status = await syncService.getSyncStatus('medicines');
console.log(`Last sync: ${status[0]?.lastSyncTime}`);
```

## 🔒 Error Handling

### Service Error Pattern

All services follow a consistent error handling pattern:

```typescript
try {
  // Business logic
  const result = await businessOperation();
  return result;
} catch (error) {
  logger.error('Operation error:', error);
  throw error; // Let controller handle HTTP response
}
```

### Error Types

- **Validation Errors**: Invalid input data
- **Business Rule Errors**: Violation of business logic
- **Database Errors**: Database operation failures
- **External Service Errors**: Third-party service failures

### Error Logging

```typescript
import { logger } from '@/utils/logger';

// Info logging
logger.info(`User created successfully: ${user.email}`);

// Warning logging
logger.warn(`Low stock alert: ${medicine.name}`);

// Error logging
logger.error('Create user error:', error);
```

## 📝 Validation

### Input Validation

Services validate input data before processing:

```typescript
private validateUserData(userData: IUserCreate): { success: boolean; error?: string } {
  if (!userData.firstName || !userData.email) {
    return { success: false, error: 'Required fields missing' };
  }
  
  if (!validateEmail(userData.email)) {
    return { success: false, error: 'Invalid email format' };
  }
  
  return { success: true };
}
```

### Business Rule Validation

```typescript
// Check if order can be cancelled
if (!canCancelOrder(order.status)) {
  throw new Error(`Order cannot be cancelled in status: ${order.status}`);
}

// Check inventory availability
if (inventory.quantity < item.quantity) {
  throw new Error(`Insufficient stock for ${medicine.name}`);
}
```

## 🔄 Transaction Management

### Prisma Transactions

Services use Prisma transactions for complex operations:

```typescript
const order = await prisma.$transaction(async (tx) => {
  // Create order
  const newOrder = await tx.order.create({ data: orderData });
  
  // Create order items
  for (const item of orderItems) {
    await tx.orderItem.create({ data: item });
  }
  
  // Update inventory
  await tx.inventoryItem.updateMany({
    where: { medicineId: item.medicineId },
    data: { quantity: { decrement: item.quantity } }
  });
  
  return newOrder;
});
```

### Benefits

1. **Atomicity**: All operations succeed or fail together
2. **Consistency**: Database remains in valid state
3. **Isolation**: Concurrent transactions don't interfere
4. **Durability**: Committed changes are permanent

## 🧪 Testing

### Service Testing

Services are easily testable due to dependency injection:

```typescript
import { AuthService } from '@/services/authService';
import { mockPrisma } from '@/tests/mocks/prisma';

describe('AuthService', () => {
  let authService: AuthService;
  
  beforeEach(() => {
    authService = new AuthService();
    // Mock dependencies
  });
  
  it('should register user successfully', async () => {
    const userData = { /* test data */ };
    const result = await authService.registerUser(userData);
    
    expect(result.user.email).toBe(userData.email);
    expect(result.token).toBeDefined();
  });
});
```

### Mocking Dependencies

```typescript
// Mock Prisma client
jest.mock('@/database', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn()
    }
  }
}));

// Mock logger
jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}));
```

## 🔧 Best Practices

### 1. Single Responsibility

Each service handles one domain:

```typescript
// ✅ Good - Single responsibility
export class AuthService {
  async authenticateUser() { /* ... */ }
  async registerUser() { /* ... */ }
  async changePassword() { /* ... */ }
}

// ❌ Bad - Multiple responsibilities
export class UserService {
  async authenticateUser() { /* ... */ }
  async createMedicine() { /* ... */ } // Wrong!
  async processOrder() { /* ... */ }   // Wrong!
}
```

### 2. Error Handling

Always handle errors properly:

```typescript
try {
  const result = await operation();
  return result;
} catch (error) {
  logger.error('Operation failed:', error);
  throw new Error('User-friendly error message');
}
```

### 3. Input Validation

Validate all inputs:

```typescript
private validateInput(data: any): { success: boolean; error?: string } {
  // Validate required fields
  // Validate data types
  // Validate business rules
  return { success: true };
}
```

### 4. Logging

Log important operations:

```typescript
logger.info(`User ${userId} logged in successfully`);
logger.warn(`Low stock alert for medicine ${medicineId}`);
logger.error('Payment processing failed:', error);
```

### 5. Transaction Usage

Use transactions for complex operations:

```typescript
await prisma.$transaction(async (tx) => {
  // Multiple related operations
});
```

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

---

**Note**: The services module provides a robust foundation for business logic implementation. Each service follows consistent patterns for error handling, validation, and transaction management, making the codebase maintainable and testable.
