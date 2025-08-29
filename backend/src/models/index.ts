// Export all model types and interfaces
export * from './types';
export * from './interfaces';
export * from './enums';
export * from './utilities';

// Export Prisma-generated types
export type { 
  User, 
  Medicine, 
  Category, 
  Supplier, 
  InventoryItem, 
  Prescription, 
  PrescriptionItem, 
  Order, 
  OrderItem, 
  Review, 
  AuditLog 
} from '@prisma/client';

// Export Prisma client
export { prisma } from '@/database';
