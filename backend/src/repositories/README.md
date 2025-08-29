# Repositories

The `repositories/` folder contains the data access layer for the Pharmacy System. It implements the Repository pattern to provide a clean abstraction over data persistence operations.

## Architecture

The repository layer sits between the services and the database, providing:

- **Data Access Abstraction**: Clean interfaces for database operations
- **Type Safety**: Full TypeScript support with Prisma integration
- **Error Handling**: Consistent error handling and logging
- **Query Optimization**: Efficient database queries with pagination and filtering
- **Transaction Support**: Database transaction management capabilities

## Folder Structure

```
repositories/
├── index.ts              # Main entry point - exports all repositories
├── types.ts              # Repository interfaces and type definitions
├── userRepository.ts     # User data access operations
├── medicineRepository.ts # Medicine data access operations
├── orderRepository.ts    # Order data access operations
├── supplierRepository.ts # Supplier data access operations
├── inventoryRepository.ts # Inventory data access operations
└── README.md            # This documentation file
```

## Core Components

### 1. Base Repository Interface (`types.ts`)

The `IBaseRepository<T>` interface provides common CRUD operations:

```typescript
interface IBaseRepository<T> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findOne(filter: Partial<T>): Promise<T | null>;
  findMany(filter?: Partial<T>, options?: RepositoryOptions): Promise<T[]>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
  count(filter?: Partial<T>): Promise<number>;
}
```

### 2. Repository Options

```typescript
interface RepositoryOptions {
  pagination?: IPaginationOptions;
  search?: ISearchFilters;
  include?: string[];
  orderBy?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  select?: string[];
}
```

### 3. Result Wrappers

- **RepositoryResult<T>**: Basic result wrapper with success/error status
- **PaginatedRepositoryResult<T>**: Paginated results with metadata
- **SearchRepositoryResult<T>**: Search results with suggestions and filters

## Individual Repositories

### UserRepository

Handles user-related data operations:

```typescript
// Find user by email
const user = await userRepository.findByEmail('user@example.com');

// Get users by role with pagination
const result = await userRepository.getUsersByRole('admin', {
  pagination: { page: 1, limit: 10 }
});

// Search users
const searchResult = await userRepository.searchUsers('john', {
  role: 'customer'
});
```

**Key Methods:**
- `findByEmail()`, `findByPhone()`, `findByRole()`, `findByStatus()`
- `updatePassword()`, `updateLastLogin()`
- `deactivateUser()`, `reactivateUser()`
- `getUsersByRole()`, `searchUsers()`

### MedicineRepository

Manages medicine data operations:

```typescript
// Find medicines by category
const antibiotics = await medicineRepository.findByCategory('antibiotics');

// Find low stock medicines
const lowStock = await medicineRepository.findLowStockMedicines(10);

// Get medicine with inventory
const medicine = await medicineRepository.getMedicineWithInventory(medicineId);
```

**Key Methods:**
- `findByName()`, `findByCategory()`, `findByManufacturer()`
- `findExpiringMedicines()`, `findLowStockMedicines()`
- `updateStock()`, `getMedicineWithInventory()`
- `searchMedicines()`, `getMedicinesByCategory()`

### OrderRepository

Handles order-related data operations:

```typescript
// Find orders by customer
const customerOrders = await orderRepository.findByCustomer(customerId);

// Get orders by date range
const orders = await orderRepository.getOrdersByDateRange(
  startDate, 
  endDate, 
  { pagination: { page: 1, limit: 20 } }
);

// Update order status
await orderRepository.updateOrderStatus(orderId, 'completed');
```

**Key Methods:**
- `findByCustomer()`, `findByStatus()`, `findByDateRange()`
- `findPendingOrders()`, `findCompletedOrders()`, `findCancelledOrders()`
- `updateOrderStatus()`, `updatePaymentStatus()`
- `getOrderWithItems()`, `getOrdersByCustomer()`

### SupplierRepository

Manages supplier data operations:

```typescript
// Find suppliers by location
const localSuppliers = await supplierRepository.findByLocation('New York');

// Get active suppliers
const activeSuppliers = await supplierRepository.findActiveSuppliers();

// Update supplier rating
await supplierRepository.updateRating(supplierId, 4.5);
```

**Key Methods:**
- `findByName()`, `findByCategory()`, `findByLocation()`
- `findActiveSuppliers()`, `findInactiveSuppliers()`
- `updateContactInfo()`, `updateRating()`
- `getSupplierWithMedicines()`, `searchSuppliers()`

### InventoryRepository

Handles inventory data operations:

```typescript
// Find low stock items
const lowStock = await inventoryRepository.findLowStockItems(5);

// Get inventory statistics
const stats = await inventoryRepository.getInventoryStats();

// Update item quantity
await inventoryRepository.updateQuantity(itemId, newQuantity);
```

**Key Methods:**
- `findByMedicine()`, `findByLocation()`, `findByStatus()`
- `findLowStockItems()`, `findExpiringItems()`, `findOutOfStockItems()`
- `updateQuantity()`, `updateLocation()`, `updateStatus()`
- `getInventoryWithMedicine()`, `getInventoryStats()`

## Usage Examples

### Basic CRUD Operations

```typescript
import { userRepository } from '@/repositories';

// Create
const newUser = await userRepository.create({
  name: 'John Doe',
  email: 'john@example.com',
  role: 'customer'
});

// Read
const user = await userRepository.findById(userId);
const users = await userRepository.findMany({ role: 'admin' });

// Update
const updatedUser = await userRepository.update(userId, {
  name: 'John Smith'
});

// Delete
await userRepository.delete(userId);
```

### Advanced Queries with Options

```typescript
// Paginated search with filters
const result = await medicineRepository.searchMedicines('aspirin', {
  category: 'painkiller',
  dosageForm: 'tablet'
}, {
  pagination: { page: 1, limit: 20 },
  orderBy: { field: 'name', direction: 'asc' },
  select: ['id', 'name', 'category', 'price']
});
```

### Transaction Support

```typescript
import { prisma } from '@/database';

// Using Prisma transactions
await prisma.$transaction(async (tx) => {
  // Create order
  const order = await tx.order.create({ data: orderData });
  
  // Update inventory
  await tx.inventoryItem.update({
    where: { medicineId },
    data: { quantity: { decrement: quantity } }
  });
  
  // Create order items
  await tx.orderItem.createMany({ data: orderItems });
});
```

## Error Handling

All repository methods include comprehensive error handling:

```typescript
try {
  const result = await repository.findById(id);
  return result;
} catch (error) {
  logger.error(`Error finding item by ID ${id}:`, error);
  throw error; // Re-throw for service layer handling
}
```

## Performance Considerations

### Pagination
- Always use pagination for large datasets
- Default limit is 10 items per page
- Use `count()` queries sparingly for large tables

### Query Optimization
- Use `select` to limit returned fields
- Leverage `include` for related data when needed
- Use database indexes on frequently queried fields

### Caching
- Consider implementing Redis caching for frequently accessed data
- Cache inventory statistics and user profiles
- Implement cache invalidation strategies

## Testing

Repository testing should focus on:

```typescript
// Unit tests
describe('UserRepository', () => {
  it('should create a new user', async () => {
    const userData = { name: 'Test User', email: 'test@example.com' };
    const user = await userRepository.create(userData);
    expect(user.name).toBe(userData.name);
  });
  
  it('should find user by email', async () => {
    const user = await userRepository.findByEmail('test@example.com');
    expect(user).toBeDefined();
  });
});

// Integration tests
describe('Repository Integration', () => {
  it('should handle database transactions', async () => {
    // Test transaction rollback scenarios
  });
});
```

## Best Practices

1. **Always use TypeScript**: Leverage type safety for better code quality
2. **Implement proper error handling**: Log errors and provide meaningful error messages
3. **Use transactions for complex operations**: Ensure data consistency
4. **Optimize queries**: Use pagination, filtering, and selective field loading
5. **Maintain separation of concerns**: Keep business logic in services, not repositories
6. **Test thoroughly**: Unit test all repository methods
7. **Document complex queries**: Add comments for complex database operations
8. **Monitor performance**: Use database query logging in development

## Dependencies

- **Prisma**: ORM for database operations
- **Logger**: Winston-based logging utility
- **Models**: TypeScript interfaces and types from the models layer

## Future Enhancements

- **Query Builder**: Advanced query building capabilities
- **Caching Layer**: Redis integration for performance
- **Audit Logging**: Track all data modifications
- **Soft Deletes**: Implement soft delete functionality
- **Bulk Operations**: Optimize bulk insert/update operations
- **Search Engine**: Integrate with Elasticsearch for advanced search
- **Data Validation**: Schema validation at the repository level
