import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger';
import bcrypt from 'bcryptjs';

// Initialize Prisma client
const prisma = new PrismaClient();

// Main seeding function
const main = async (): Promise<void> => {
  try {
    logger.info('🌱 Starting database seeding...');
    
    // Seed data in dependency order
    await seedCategories(prisma);
    await seedSuppliers(prisma);
    await seedUsers(prisma);
    await seedMedicines(prisma);
    await seedInventory(prisma);
    
    logger.info('✅ Database seeding completed successfully!');
  } catch (error) {
    logger.error('❌ Database seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

// Seed categories
const seedCategories = async (prisma: PrismaClient): Promise<void> => {
  logger.info('📦 Seeding categories...');
  
  const categories = [
    { name: 'Antibiotics', description: 'Medications that fight bacterial infections' },
    { name: 'Painkillers', description: 'Medications for pain relief' },
    { name: 'Vitamins', description: 'Essential vitamins and supplements' },
    { name: 'Diabetes', description: 'Medications for diabetes management' },
    { name: 'Cardiovascular', description: 'Heart and blood pressure medications' },
    { name: 'Respiratory', description: 'Medications for breathing problems' },
    { name: 'Dermatology', description: 'Skin medications and treatments' },
    { name: 'Mental Health', description: 'Psychiatric medications' },
    { name: 'Women\'s Health', description: 'Medications specific to women' },
    { name: 'Children\'s Medicine', description: 'Medications for children' }
  ];
  
  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category
    });
  }
  
  logger.info(`✅ Seeded ${categories.length} categories`);
};

// Seed suppliers
const seedSuppliers = async (prisma: PrismaClient): Promise<void> => {
  logger.info('🏭 Seeding suppliers...');
  
  const suppliers = [
    {
      name: 'PharmaCorp Inc.',
      email: 'contact@pharmacorp.com',
      phone: '+1-555-0101',
      address: '123 Pharma Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    {
      name: 'MediSupply Ltd.',
      email: 'info@medisupply.com',
      phone: '+1-555-0102',
      address: '456 Medicine Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'USA'
    },
    {
      name: 'HealthTech Solutions',
      email: 'hello@healthtech.com',
      phone: '+1-555-0103',
      address: '789 Health Blvd',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA'
    }
  ];
  
  for (const supplier of suppliers) {
    await prisma.supplier.upsert({
      where: { email: supplier.email },
      update: {},
      create: supplier
    });
  }
  
  logger.info(`✅ Seeded ${suppliers.length} suppliers`);
};

// Seed users
const seedUsers = async (prisma: PrismaClient): Promise<void> => {
  logger.info('👥 Seeding users...');
  
  const hashedPassword = await bcrypt.hash('Password123!', 12);
  
  const users = [
    {
      email: 'admin@pharmacy.com',
      firstName: 'Admin',
      lastName: 'User',
      password: hashedPassword,
      phone: '+1-555-0001',
      role: 'ADMIN' as const,
      street: '100 Admin Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    {
      email: 'pharmacist@pharmacy.com',
      firstName: 'John',
      lastName: 'Pharmacist',
      password: hashedPassword,
      phone: '+1-555-0002',
      role: 'PHARMACIST' as const,
      street: '200 Pharmacy Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    {
      email: 'staff@pharmacy.com',
      firstName: 'Jane',
      lastName: 'Staff',
      password: hashedPassword,
      phone: '+1-555-0003',
      role: 'STAFF' as const,
      street: '300 Staff Blvd',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    {
      email: 'customer@pharmacy.com',
      firstName: 'Bob',
      lastName: 'Customer',
      password: hashedPassword,
      phone: '+1-555-0004',
      role: 'CUSTOMER' as const,
      street: '400 Customer Lane',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    }
  ];
  
  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user
    });
  }
  
  logger.info(`✅ Seeded ${users.length} users`);
};

// Seed medicines
const seedMedicines = async (prisma: PrismaClient): Promise<void> => {
  logger.info('💊 Seeding medicines...');
  
  // Get categories and suppliers for relationships
  const categories = await prisma.category.findMany();
  const suppliers = await prisma.supplier.findMany();
  
  if (categories.length === 0 || suppliers.length === 0) {
    throw new Error('Categories and suppliers must be seeded before medicines');
  }
  
  const medicines = [
    {
      name: 'Amoxicillin 500mg',
      genericName: 'Amoxicillin',
      brandName: 'Amoxil',
      description: 'Broad-spectrum antibiotic for bacterial infections',
      activeIngredients: ['Amoxicillin'],
      dosageForm: 'TABLET' as const,
      strength: '500',
      unit: 'mg',
      manufacturer: 'PharmaCorp Inc.',
      prescriptionRequired: true,
      controlledSubstance: false,
      schedule: 'OTC' as const,
      sideEffects: ['Nausea', 'Diarrhea', 'Rash'],
      contraindications: ['Penicillin allergy'],
      interactions: ['Methotrexate', 'Warfarin'],
      storageConditions: 'Store at room temperature, away from moisture',
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      batchNumber: 'AMX-2024-001',
      sku: 'AMX-500-001',
      barcode: '1234567890123',
      requiresRefrigeration: false,
      price: 15.99,
      cost: 8.50,
      taxRate: 8.5,
      discountPercentage: 0,
      tags: ['antibiotic', 'infection', 'bacterial']
    },
    {
      name: 'Ibuprofen 400mg',
      genericName: 'Ibuprofen',
      brandName: 'Advil',
      description: 'Non-steroidal anti-inflammatory drug for pain and fever',
      activeIngredients: ['Ibuprofen'],
      dosageForm: 'TABLET' as const,
      strength: '400',
      unit: 'mg',
      manufacturer: 'MediSupply Ltd.',
      prescriptionRequired: false,
      controlledSubstance: false,
      schedule: 'OTC' as const,
      sideEffects: ['Stomach upset', 'Dizziness'],
      contraindications: ['Stomach ulcers', 'Kidney disease'],
      interactions: ['Aspirin', 'Blood thinners'],
      storageConditions: 'Store at room temperature',
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      batchNumber: 'IBU-2024-001',
      sku: 'IBU-400-001',
      barcode: '1234567890124',
      requiresRefrigeration: false,
      price: 8.99,
      cost: 3.50,
      taxRate: 8.5,
      discountPercentage: 0,
      tags: ['pain', 'fever', 'anti-inflammatory']
    }
  ];
  
  for (const medicine of medicines) {
    await prisma.medicine.upsert({
      where: { sku: medicine.sku },
      update: {},
      create: {
        ...medicine,
        categoryId: categories[0].id, // Use first category
        supplierId: suppliers[0].id   // Use first supplier
      }
    });
  }
  
  logger.info(`✅ Seeded ${medicines.length} medicines`);
};

// Seed inventory
const seedInventory = async (prisma: PrismaClient): Promise<void> => {
  logger.info('📦 Seeding inventory...');
  
  const medicines = await prisma.medicine.findMany();
  
  if (medicines.length === 0) {
    throw new Error('Medicines must be seeded before inventory');
  }
  
  for (const medicine of medicines) {
    await prisma.inventoryItem.upsert({
      where: { medicineId: medicine.id },
      update: {},
      create: {
        medicineId: medicine.id,
        quantity: Math.floor(Math.random() * 100) + 50, // Random quantity between 50-150
        minQuantity: 10,
        maxQuantity: 1000,
        location: 'Main Warehouse'
      }
    });
  }
  
  logger.info(`✅ Seeded inventory for ${medicines.length} medicines`);
};

// Run the seeder
if (require.main === module) {
  main()
    .catch((error) => {
      logger.error('Seeding failed:', error);
      process.exit(1);
    });
}

export { main as seedDatabase };
