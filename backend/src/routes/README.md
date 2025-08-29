# Routes

The `routes/` folder contains all API endpoint definitions for the Pharmacy System. It provides a clean, organized structure for handling HTTP requests and responses.

## Architecture

The routes layer serves as the entry point for all API requests, providing:

- **RESTful API Design**: Consistent HTTP method usage and URL structure
- **Middleware Integration**: Authentication, validation, and error handling
- **Role-Based Access Control**: Different permission levels for different user roles
- **API Versioning**: Structured API versioning for future compatibility
- **Comprehensive Documentation**: Detailed endpoint documentation with examples

## Folder Structure

```
routes/
├── index.ts              # Main route setup and configuration
├── auth.ts               # Authentication routes (login, register, etc.)
├── user.ts               # User management routes
├── medicine.ts           # Medicine/product routes
├── order.ts              # Sales/order routes
├── supplier.ts           # Supplier management routes
├── inventory.ts          # Inventory management routes
├── report.ts             # Reporting and analytics routes
└── README.md             # This documentation file
```

## API Base URL

All routes are prefixed with `/api/v1` for version 1 of the API.

## Authentication & Authorization

### User Roles
- **Admin**: Full access to all endpoints
- **Manager**: Access to most endpoints (excluding user deletion)
- **Customer**: Limited access to own data and public endpoints
- **Staff**: Basic access to inventory and order management

### Authentication Middleware
All protected routes use the `authenticate` middleware to verify JWT tokens.

## Route Categories

### 1. Authentication Routes (`/api/v1/auth`)

**Public endpoints for user authentication:**

```typescript
POST   /auth/register          # User registration
POST   /auth/login            # User login
POST   /auth/refresh-token    # Refresh access token
POST   /auth/forgot-password  # Request password reset
POST   /auth/reset-password   # Reset password with token
POST   /auth/logout           # User logout
GET    /auth/profile          # Get user profile
PUT    /auth/profile          # Update user profile
PUT    /auth/change-password  # Change password
```

### 2. User Management Routes (`/api/v1/users`)

**User CRUD operations and management:**

```typescript
GET    /users                 # Get all users (paginated)
GET    /users/:id             # Get user by ID
POST   /users                 # Create new user
PUT    /users/:id             # Update user
DELETE /users/:id             # Delete user (soft delete)
PATCH  /users/:id/status      # Toggle user status
GET    /users/:id/stats       # Get user statistics
GET    /users/role/:role      # Get users by role
GET    /users/search          # Search users
```

**Access Control:**
- `GET /users` - Admin, Manager
- `POST /users` - Admin only
- `DELETE /users` - Admin only
- Other operations - Admin, Manager, or Self

### 3. Medicine Routes (`/api/v1/medicines`)

**Medicine/product management:**

```typescript
GET    /medicines                    # Get all medicines
GET    /medicines/:id                # Get medicine by ID
POST   /medicines                    # Create new medicine
PUT    /medicines/:id                # Update medicine
DELETE /medicines/:id                # Delete medicine
GET    /medicines/category/:category # Get by category
GET    /medicines/search             # Search medicines
GET    /medicines/expiring/:days     # Get expiring medicines
GET    /medicines/low-stock/:threshold # Get low stock
GET    /medicines/:id/stats          # Get medicine statistics
```

**Access Control:**
- Read operations - Authenticated users
- Write operations - Manager, Admin

### 4. Order Routes (`/api/v1/orders`)

**Sales and order management:**

```typescript
GET    /orders                      # Get all orders
GET    /orders/:id                  # Get order by ID
POST   /orders                      # Create new order
PUT    /orders/:id                  # Update order
DELETE /orders/:id                  # Cancel order
PATCH  /orders/:id/status           # Update order status
GET    /orders/customer/:customerId # Get customer orders
GET    /orders/status/:status       # Get by status
GET    /orders/date-range           # Get by date range
GET    /orders/search               # Search orders
GET    /orders/stats/sales          # Get sales statistics
```

**Access Control:**
- Read operations - Manager, Admin, or Customer (own orders)
- Write operations - Manager, Admin, or Customer (own orders)

### 5. Supplier Routes (`/api/v1/suppliers`)

**Supplier management:**

```typescript
GET    /suppliers                   # Get all suppliers
GET    /suppliers/:id               # Get supplier by ID
POST   /suppliers                   # Create new supplier
PUT    /suppliers/:id               # Update supplier
DELETE /suppliers/:id               # Delete supplier
GET    /suppliers/category/:category # Get by category
GET    /suppliers/location/:location # Get by location
GET    /suppliers/status/:status    # Get by status
GET    /suppliers/search            # Search suppliers
PATCH  /suppliers/:id/contact       # Update contact info
PATCH  /suppliers/:id/rating        # Update rating
GET    /suppliers/:id/medicines     # Get supplier medicines
GET    /suppliers/stats/overview    # Get supplier statistics
```

**Access Control:**
- All operations - Manager, Admin

### 6. Inventory Routes (`/api/v1/inventory`)

**Inventory management:**

```typescript
GET    /inventory                   # Get all inventory items
GET    /inventory/:id               # Get item by ID
POST   /inventory                   # Create new item
PUT    /inventory/:id               # Update item
DELETE /inventory/:id               # Delete item
GET    /inventory/medicine/:medicineId # Get by medicine
GET    /inventory/location/:location # Get by location
GET    /inventory/status/:status    # Get by status
GET    /inventory/low-stock/:threshold # Get low stock
GET    /inventory/expiring/:days    # Get expiring items
GET    /inventory/out-of-stock      # Get out of stock
PATCH  /inventory/:id/quantity      # Update quantity
PATCH  /inventory/:id/location      # Update location
PATCH  /inventory/:id/status        # Update status
GET    /inventory/search            # Search inventory
GET    /inventory/stats/overview    # Get inventory statistics
```

**Access Control:**
- Read operations - Manager, Admin
- Write operations - Manager, Admin

### 7. Report Routes (`/api/v1/reports`)

**Reporting and analytics:**

```typescript
GET    /reports/dashboard                    # Dashboard statistics
POST   /reports/generate                     # Generate custom report
GET    /reports/sales                        # Sales reports
GET    /reports/sales/:period                # Sales by period
GET    /reports/inventory                    # Inventory reports
GET    /reports/inventory/low-stock          # Low stock report
GET    /reports/inventory/expiring           # Expiring inventory
GET    /reports/revenue                      # Revenue reports
GET    /reports/revenue/:period              # Revenue by period
GET    /reports/customers                    # Customer reports
GET    /reports/customers/top                # Top customers
GET    /reports/suppliers                    # Supplier reports
GET    /reports/suppliers/performance        # Supplier performance
GET    /reports/medicines                    # Medicine reports
GET    /reports/medicines/popular            # Popular medicines
GET    /reports/export/:type                 # Export reports
GET    /reports/scheduled                    # Scheduled reports
POST   /reports/schedule                     # Schedule new report
```

**Access Control:**
- All operations - Manager, Admin

## Request/Response Format

### Standard Response Structure

```typescript
// Success Response
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "timestamp": "2024-01-01T00:00:00.000Z"
}

// Error Response
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00.000Z"
}

// Paginated Response
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Query Parameters

**Common query parameters for list endpoints:**

```typescript
// Pagination
?page=1&limit=10

// Sorting
?sortBy=name&sortOrder=asc

// Filtering
?status=active&role=admin

// Search
?search=john&category=user
```

## Error Handling

### HTTP Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (missing/invalid token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **409**: Conflict (duplicate data)
- **422**: Unprocessable Entity
- **500**: Internal Server Error

### Error Response Format

```typescript
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ],
  "code": "VALIDATION_ERROR"
}
```

## Rate Limiting

All API endpoints are subject to rate limiting:

- **Authentication endpoints**: 5 requests per minute
- **Read operations**: 100 requests per minute
- **Write operations**: 20 requests per minute
- **Report generation**: 10 requests per minute

## API Versioning

The current API version is `v1`. Future versions will maintain backward compatibility where possible.

### Version Migration

When introducing breaking changes:

1. Create new version (e.g., `v2`)
2. Maintain old version for deprecation period
3. Provide migration guides
4. Sunset old version after reasonable notice

## Testing

### Endpoint Testing

```typescript
// Example test for user creation
describe('POST /api/v1/users', () => {
  it('should create a new user with valid data', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'customer'
    };
    
    const response = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(userData);
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe(userData.name);
  });
});
```

## Best Practices

1. **Consistent Naming**: Use plural nouns for resources
2. **HTTP Methods**: Use appropriate HTTP methods (GET, POST, PUT, DELETE, PATCH)
3. **Status Codes**: Return appropriate HTTP status codes
4. **Error Handling**: Provide meaningful error messages
5. **Validation**: Validate all input data
6. **Documentation**: Keep route documentation up to date
7. **Testing**: Write comprehensive tests for all endpoints
8. **Security**: Implement proper authentication and authorization
9. **Performance**: Use pagination for large datasets
10. **Monitoring**: Log all API requests and responses

## Future Enhancements

- **GraphQL Support**: Add GraphQL endpoints for complex queries
- **WebSocket Support**: Real-time updates for inventory and orders
- **API Analytics**: Track API usage and performance
- **Caching**: Implement Redis caching for frequently accessed data
- **Compression**: Add response compression for large datasets
- **API Gateway**: Implement API gateway for microservices
- **Documentation**: Auto-generate API documentation from code
- **Testing**: Automated API testing and monitoring
