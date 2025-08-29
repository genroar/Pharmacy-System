# Controllers Module

This directory contains all the controller functions for the Pharmacy System API, handling HTTP requests and responses with proper validation, error handling, and business logic.

## 🚀 Features

- **Type Safety**: Full TypeScript support with proper type definitions
- **Input Validation**: Comprehensive request validation and sanitization
- **Error Handling**: Consistent error responses with proper HTTP status codes
- **Business Logic**: Centralized business logic for each domain
- **Prisma Integration**: Seamless integration with Prisma ORM
- **Logging**: Comprehensive logging for debugging and monitoring
- **Response Standardization**: Consistent API response format

## 📁 Structure

```
controllers/
├── index.ts              # Main exports and controller types
├── types.ts              # TypeScript types for controllers
├── authController.ts     # Authentication and user management
├── userController.ts     # User CRUD operations
├── productController.ts  # Medicine/product management
├── salesController.ts    # Order and sales management
├── supplierController.ts # Supplier management
├── reportController.ts   # Business reports and analytics
├── syncController.ts     # Data synchronization
└── README.md            # This documentation
```

## 🔧 Usage

### Importing Controllers

```typescript
// Import all controllers
import * as Controllers from '@/controllers';

// Import specific controllers
import { 
  createUser, 
  getUsers, 
  updateUser 
} from '@/controllers/userController';

// Import types
import { 
  CreateUserRequest, 
  ControllerResponse 
} from '@/controllers/types';
```

### Controller Function Signature

All controllers follow this pattern:

```typescript
export const functionName = async (
  req: RequestType,
  res: Response<ResponseType>,
  next: NextFunction
): Promise<void> => {
  try {
    // Controller logic here
  } catch (error) {
    logger.error('Error message:', error);
    next(error);
  }
};
```

## 📊 Controller Overview

### 1. Authentication Controller (`authController.ts`)

Handles user authentication and authorization.

**Functions:**
- `register` - User registration
- `login` - User login
- `refreshToken` - Token refresh
- `changePassword` - Password change
- `forgotPassword` - Password reset request
- `resetPassword` - Password reset
- `logout` - User logout
- `getProfile` - Get user profile

**Usage:**
```typescript
import { register, login, getProfile } from '@/controllers/authController';

// Register new user
app.post('/auth/register', register);

// User login
app.post('/auth/login', login);

// Get profile (protected route)
app.get('/auth/profile', authenticate, getProfile);
```

### 2. User Controller (`userController.ts`)

Manages user operations and administration.

**Functions:**
- `createUser` - Create new user (Admin only)
- `getUserById` - Get user by ID
- `getUsers` - Get all users with pagination
- `updateUser` - Update user information
- `deleteUser` - Soft delete user
- `toggleUserStatus` - Activate/deactivate user
- `getUserStats` - Get user statistics
- `getUsersByRole` - Get users by role

**Usage:**
```typescript
import { 
  createUser, 
  getUsers, 
  updateUser 
} from '@/controllers/userController';

// Create user (Admin only)
app.post('/users', authenticate, authorize(['ADMIN']), createUser);

// Get all users
app.get('/users', authenticate, getUsers);

// Update user
app.put('/users/:id', authenticate, updateUser);
```

### 3. Product Controller (`productController.ts`)

Manages medicine and product operations.

**Functions:**
- `createMedicine` - Create new medicine
- `getMedicineById` - Get medicine by ID
- `getMedicines` - Get all medicines with search/filter
- `updateMedicine` - Update medicine information
- `deleteMedicine` - Soft delete medicine
- `getMedicineStats` - Get medicine statistics
- `getMedicinesByCategory` - Get medicines by category

**Usage:**
```typescript
import { 
  createMedicine, 
  getMedicines, 
  updateMedicine 
} from '@/controllers/productController';

// Create medicine
app.post('/medicines', authenticate, authorize(['ADMIN', 'PHARMACIST']), createMedicine);

// Get medicines with search
app.get('/medicines', getMedicines);

// Update medicine
app.put('/medicines/:id', authenticate, authorize(['ADMIN', 'PHARMACIST']), updateMedicine);
```

### 4. Sales Controller (`salesController.ts`)

Handles order management and sales operations.

**Functions:**
- `createOrder` - Create new order
- `getOrderById` - Get order by ID
- `getOrders` - Get all orders with filters
- `updateOrderStatus` - Update order status
- `cancelOrder` - Cancel order
- `getSalesStats` - Get sales statistics
- `getCustomerOrders` - Get customer orders

**Usage:**
```typescript
import { 
  createOrder, 
  getOrders, 
  updateOrderStatus 
} from '@/controllers/salesController';

// Create order
app.post('/orders', authenticate, createOrder);

// Get orders
app.get('/orders', authenticate, getOrders);

// Update order status
app.put('/orders/:id/status', authenticate, authorize(['ADMIN', 'PHARMACIST']), updateOrderStatus);
```

### 5. Supplier Controller (`supplierController.ts`)

Manages supplier operations and relationships.

**Functions:**
- `createSupplier` - Create new supplier
- `getSupplierById` - Get supplier by ID
- `getSuppliers` - Get all suppliers with search
- `updateSupplier` - Update supplier information
- `deleteSupplier` - Soft delete supplier
- `getSupplierStats` - Get supplier statistics
- `getSuppliersByType` - Get suppliers by type
- `getSuppliersByLocation` - Get suppliers by location

**Usage:**
```typescript
import { 
  createSupplier, 
  getSuppliers, 
  updateSupplier 
} from '@/controllers/supplierController';

// Create supplier
app.post('/suppliers', authenticate, authorize(['ADMIN']), createSupplier);

// Get suppliers
app.get('/suppliers', authenticate, getSuppliers);

// Update supplier
app.put('/suppliers/:id', authenticate, authorize(['ADMIN']), updateSupplier);
```

### 6. Report Controller (`reportController.ts`)

Generates business reports and analytics.

**Functions:**
- `generateReport` - Generate various business reports
- `getDashboardStats` - Get dashboard statistics

**Report Types:**
- Sales reports
- Inventory reports
- Revenue reports
- Customer reports
- Supplier reports

**Usage:**
```typescript
import { 
  generateReport, 
  getDashboardStats 
} from '@/controllers/reportController';

// Generate report
app.post('/reports', authenticate, authorize(['ADMIN', 'PHARMACIST']), generateReport);

// Get dashboard stats
app.get('/dashboard/stats', authenticate, getDashboardStats);
```

### 7. Sync Controller (`syncController.ts`)

Handles data synchronization between local and remote databases.

**Functions:**
- `syncData` - Sync data between databases
- `getSyncStatus` - Get synchronization status
- `forceSync` - Force synchronization
- `getSyncConflicts` - Get sync conflicts
- `resolveSyncConflicts` - Resolve sync conflicts
- `getSyncStats` - Get sync statistics

**Usage:**
```typescript
import { 
  syncData, 
  getSyncStatus, 
  forceSync 
} from '@/controllers/syncController';

// Sync data
app.post('/sync', authenticate, authorize(['ADMIN']), syncData);

// Get sync status
app.get('/sync/status', authenticate, getSyncStatus);

// Force sync
app.post('/sync/force', authenticate, authorize(['ADMIN']), forceSync);
```

## 🔒 Authentication & Authorization

### Middleware Usage

```typescript
import { authenticate, authorize } from '@/middleware/auth';

// Protected route
app.get('/users', authenticate, getUsers);

// Role-based access
app.post('/users', authenticate, authorize(['ADMIN']), createUser);

// Multiple roles
app.put('/medicines/:id', authenticate, authorize(['ADMIN', 'PHARMACIST']), updateMedicine);
```

### Role Hierarchy

1. **ADMIN** - Full access to all endpoints
2. **PHARMACIST** - Access to medicines, orders, prescriptions
3. **STAFF** - Limited access to basic operations
4. **CUSTOMER** - Access to own profile and orders

## 📝 Response Format

All controllers return consistent response formats:

### Success Response
```typescript
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* response data */ },
  "statusCode": 200
}
```

### Error Response
```typescript
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE",
  "statusCode": 400,
  "data": { /* additional error details */ }
}
```

### Paginated Response
```typescript
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "data": [ /* items array */ ],
    "total": 100,
    "page": 1,
    "totalPages": 5,
    "hasNext": true,
    "hasPrevious": false
  },
  "statusCode": 200
}
```

## 🔍 Search and Filtering

### Common Query Parameters

```typescript
// Pagination
?page=1&limit=20

// Sorting
?sortBy=createdAt&sortOrder=desc

// Search
?query=search_term

// Date range
?startDate=2024-01-01&endDate=2024-12-31

// Filters
?status=active&category=medicines
```

### Search Implementation

```typescript
// Build search query
const searchQuery: any = {};
if (query) {
  searchQuery.OR = [
    { name: { contains: query, mode: 'insensitive' } },
    { email: { contains: query, mode: 'insensitive' } }
  ];
}

// Apply filters
if (status) {
  searchQuery.status = status;
}

// Execute with pagination
const results = await prisma.entity.findMany({
  where: searchQuery,
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { [sortBy]: sortOrder }
});
```

## 🚨 Error Handling

### Controller Error Pattern

```typescript
export const functionName = async (req, res, next) => {
  try {
    // Validation
    if (!requiredField) {
      res.status(400).json({
        success: false,
        message: 'Field is required',
        error: 'MISSING_FIELD',
        statusCode: 400
      });
      return;
    }

    // Business logic
    const result = await businessOperation();

    // Success response
    res.status(200).json({
      success: true,
      message: 'Operation successful',
      data: result,
      statusCode: 200
    });

  } catch (error) {
    logger.error('Operation error:', error);
    next(error);
  }
};
```

### Common Error Codes

- `MISSING_REQUIRED_FIELDS` - Required fields not provided
- `INVALID_FORMAT` - Data format is invalid
- `NOT_FOUND` - Resource not found
- `ALREADY_EXISTS` - Resource already exists
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `VALIDATION_FAILED` - Data validation failed

## 📊 Logging

### Logging Pattern

```typescript
import { logger } from '@/utils/logger';

// Info logging
logger.info(`User created successfully: ${user.email}`);

// Warning logging
logger.warn(`Prescription required medicine ordered: ${medicine.name}`);

// Error logging
logger.error('Create user error:', error);
```

### Log Levels

- **INFO** - Successful operations
- **WARN** - Potential issues
- **ERROR** - Operation failures

## 🧪 Testing

### Controller Testing

```typescript
import request from 'supertest';
import { app } from '@/app';

describe('User Controller', () => {
  it('should create a new user', async () => {
    const response = await request(app)
      .post('/users')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '+1234567890'
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.firstName).toBe('John');
  });
});
```

## 🔧 Best Practices

1. **Input Validation**: Always validate request data
2. **Error Handling**: Use consistent error response format
3. **Logging**: Log important operations and errors
4. **Type Safety**: Use TypeScript types for all parameters
5. **Authorization**: Check user permissions before operations
6. **Transaction Usage**: Use Prisma transactions for complex operations
7. **Response Consistency**: Maintain consistent API response format
8. **Performance**: Implement pagination for large datasets

## 📚 Additional Resources

- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [JWT Authentication](https://jwt.io/introduction)

---

**Note**: This controllers module provides a robust foundation for handling all API requests. Each controller follows consistent patterns for validation, error handling, and response formatting.
