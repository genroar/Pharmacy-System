# Database Module

This directory contains all database-related functionality for the Pharmacy System using **Prisma ORM**.

## 🚀 Features

- **Prisma ORM**: Type-safe database access with auto-generated client
- **Multi-Database Support**: PostgreSQL, MySQL, and SQLite
- **Automatic Migrations**: Database schema versioning and updates
- **Database Seeding**: Populate database with initial data
- **Connection Management**: Robust connection handling with pooling
- **Health Monitoring**: Database health checks and performance monitoring
- **Backup & Recovery**: Database backup and restoration utilities

## 📁 Structure

```
database/
├── connection.ts      # Main Prisma client and connection management
├── sqlite.ts         # SQLite database handler for local development
├── remote.ts         # Remote database handler (PostgreSQL/MySQL)
├── migrations/       # Database migration files (auto-generated)
├── seeders/          # Database seeding scripts
│   └── index.ts      # Main seeder coordinator
└── index.ts          # Database module exports
```

## 🗄️ Database Support

### PostgreSQL (Recommended for Production)
- Full ACID compliance
- Advanced indexing and query optimization
- JSON support
- Extensions and custom functions

### MySQL
- High performance
- Replication support
- ACID compliance with InnoDB
- Wide hosting support

### SQLite (Development)
- File-based database
- Zero configuration
- Perfect for development and testing
- No external dependencies

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
```bash
# For PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/pharmacy_system"

# For MySQL
DATABASE_URL="mysql://username:password@localhost:3306/pharmacy_system"

# For SQLite (Development)
DATABASE_URL="file:./database/pharmacy_system.db"
```

### 3. Generate Prisma Client
```bash
npm run db:generate
```

### 4. Run Migrations
```bash
npm run db:migrate
```

### 5. Seed Database
```bash
npm run db:seed
```

## 🔧 Database Commands

### Prisma Commands
```bash
# Generate Prisma client
npm run db:generate

# Push schema changes (development)
npm run db:push

# Create and apply migration
npm run db:migrate

# Deploy migrations (production)
npm run db:migrate:deploy

# Reset database and migrations
npm run db:migrate:reset

# Check migration status
npm run db:migrate:status

# Open Prisma Studio
npm run db:studio
```

### Custom Commands
```bash
# Seed database with sample data
npm run db:seed

# Backup database
npm run db:backup

# Optimize database
npm run db:optimize
```

## 📊 Database Schema

### Core Models

#### User Management
- **User**: Customers, staff, pharmacists, and admins
- **UserRole**: Role-based access control

#### Medicine Management
- **Medicine**: Complete medicine information
- **Category**: Medicine categorization
- **Supplier**: Pharmaceutical suppliers
- **InventoryItem**: Stock management

#### Prescription System
- **Prescription**: Patient prescriptions
- **PrescriptionItem**: Individual prescription items
- **PrescriptionStatus**: Prescription workflow

#### Order Management
- **Order**: Customer orders
- **OrderItem**: Order line items
- **OrderStatus**: Order workflow
- **PaymentMethod**: Payment options

#### Review System
- **Review**: Medicine reviews and ratings

#### Audit System
- **AuditLog**: Complete audit trail

## 🔌 Connection Management

### Main Connection
```typescript
import { prisma, connectDatabase } from '@/database';

// Connect to database
await connectDatabase();

// Use Prisma client
const users = await prisma.user.findMany();
```

### SQLite Connection
```typescript
import { sqliteClient, backupSQLiteDatabase } from '@/database/sqlite';

// Backup SQLite database
const backupPath = await backupSQLiteDatabase();
```

### Remote Database Connection
```typescript
import { remoteDBClient, checkRemoteDBConnection } from '@/database/remote';

// Check connection
const isConnected = await checkRemoteDBConnection(remoteDBClient);
```

## 🌱 Database Seeding

### Run All Seeders
```typescript
import { seedDatabase } from '@/database';

await seedDatabase();
```

### Individual Seeders
```typescript
import { seedUsers, seedMedicines } from '@/database/seeders';

await seedUsers(prisma);
await seedMedicines(prisma);
```

### Sample Data
The seeder creates:
- **10 Medicine Categories** (Antibiotics, Painkillers, etc.)
- **3 Suppliers** (PharmaCorp, MediSupply, HealthTech)
- **4 Users** (Admin, Pharmacist, Staff, Customer)
- **2 Sample Medicines** (Amoxicillin, Ibuprofen)
- **Inventory Items** for each medicine

## 🔄 Migrations

### Create Migration
```bash
npm run db:migrate -- --name add_new_field
```

### Apply Migrations
```bash
# Development
npm run db:migrate

# Production
npm run db:migrate:deploy
```

### Migration Best Practices
1. **Never modify existing migrations**
2. **Test migrations in development first**
3. **Use descriptive migration names**
4. **Keep migrations small and focused**
5. **Always backup before migration**

## 📈 Performance & Monitoring

### Health Checks
```typescript
import { checkDatabaseHealth, performDatabaseHealthCheck } from '@/database';

// Basic health check
const health = await checkDatabaseHealth();

// Detailed health check with type detection
const detailedHealth = await performDatabaseHealthCheck();
```

### Performance Monitoring
```typescript
import { monitorRemoteDBPerformance } from '@/database/remote';

// Get performance statistics
const performance = await monitorRemoteDBPerformance(prisma);
```

### Database Optimization
```typescript
import { optimizeDatabase } from '@/database';

// Optimize database
await optimizeDatabase();
```

## 💾 Backup & Recovery

### SQLite Backup
```typescript
import { backupSQLiteDatabase, restoreSQLiteDatabase } from '@/database/sqlite';

// Create backup
const backupPath = await backupSQLiteDatabase();

// Restore from backup
await restoreSQLiteDatabase(backupPath);
```

### Remote Database Backup
```typescript
import { backupRemoteDB } from '@/database/remote';

// Generate backup command
const backupPath = await backupRemoteDB(prisma, './backups');
```

## 🛡️ Security Features

- **Connection Pooling**: Prevents connection exhaustion
- **SSL Support**: Encrypted connections for production
- **Query Logging**: Development-only query logging
- **Transaction Support**: ACID-compliant operations
- **Input Validation**: Prisma's built-in validation

## 🔍 Troubleshooting

### Common Issues

#### Connection Errors
```bash
# Check database status
npm run db:migrate:status

# Reset database
npm run db:migrate:reset
```

#### Prisma Client Issues
```bash
# Regenerate Prisma client
npm run db:generate

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Migration Issues
```bash
# Check migration status
npm run db:migrate:status

# Reset and recreate
npm run db:migrate:reset
npm run db:seed
```

## 📝 Best Practices

1. **Use Transactions**: Wrap related operations in transactions
2. **Connection Management**: Always disconnect properly
3. **Error Handling**: Implement proper error handling
4. **Logging**: Use structured logging for database operations
5. **Testing**: Test database operations in isolation
6. **Backup**: Regular database backups
7. **Monitoring**: Monitor database performance

## 🔄 Environment Configuration

### Development
```bash
DATABASE_URL="file:./database/pharmacy_system.db"
NODE_ENV="development"
```

### Production
```bash
DATABASE_URL="postgresql://user:pass@host:port/db"
NODE_ENV="production"
```

### Testing
```bash
DATABASE_URL="file:./database/test.db"
NODE_ENV="test"
```

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/schema-reference)
- [Database Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Migration Guide](https://www.prisma.io/docs/guides/migrate)

---

**Note**: This database module provides a robust foundation for the Pharmacy System. Always test database operations in a safe environment before applying to production.
