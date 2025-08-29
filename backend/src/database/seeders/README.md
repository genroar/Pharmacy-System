# Database Seeders

This folder contains database seeder files for populating the Pharmacy System with initial data.

## 🚀 Using Prisma Seed

### Setup
Add this to your `package.json`:
```json
{
  "prisma": {
    "seed": "ts-node src/database/seeders/index.ts"
  }
}
```

### Run Seeders
```bash
npx prisma db seed
```

## 📁 Seeder Files

### `index.ts` - Main Seeder
Coordinates all seeders and runs them in the correct order.

### `userSeeder.ts` - User Data
Seeds admin users, staff, and sample customers.

### `categorySeeder.ts` - Medicine Categories
Seeds medicine categories like antibiotics, painkillers, etc.

### `supplierSeeder.ts` - Supplier Data
Seeds pharmaceutical suppliers and manufacturers.

### `medicineSeeder.ts` - Medicine Data
Seeds sample medicines with proper relationships.

### `inventorySeeder.ts` - Inventory Data
Seeds initial inventory levels for medicines.

## 🔧 Seeder Structure

```typescript
export const seedUsers = async (prisma: PrismaClient): Promise<void> => {
  try {
    // Create admin user
    await prisma.user.upsert({
      where: { email: 'admin@pharmacy.com' },
      update: {},
      create: {
        email: 'admin@pharmacy.com',
        firstName: 'Admin',
        lastName: 'User',
        password: 'hashedPassword',
        role: 'ADMIN',
        // ... other fields
      }
    });
    
    logger.info('Users seeded successfully');
  } catch (error) {
    logger.error('Failed to seed users:', error);
    throw error;
  }
};
```

## 📝 Best Practices

1. **Use upsert for idempotent seeding**
2. **Seed data in dependency order**
3. **Handle errors gracefully**
4. **Log seeding progress**
5. **Use realistic sample data**
6. **Respect foreign key constraints**

## 🚨 Important Notes

- Seeders should be idempotent (safe to run multiple times)
- Always check for existing data before creating
- Use proper error handling
- Seed data should be realistic but not production-ready
- Test seeders in development environment first

## 🔄 Running Seeders

### Development
```bash
npm run db:seed
```

### Production
```bash
npm run db:seed:prod
```

### Reset and Seed
```bash
npm run db:reset:seed
```
