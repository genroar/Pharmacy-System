import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './user';
import medicineRoutes from './medicine';
import orderRoutes from './order';
import supplierRoutes from './supplier';
import inventoryRoutes from './inventory';
import reportRoutes from './report';

const router = Router();

// API version prefix
const API_VERSION = '/api/v1';

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API info endpoint
router.get(API_VERSION, (req, res) => {
  res.json({
    message: 'Pharmacy System API',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      auth: `${API_VERSION}/auth`,
      users: `${API_VERSION}/users`,
      medicines: `${API_VERSION}/medicines`,
      orders: `${API_VERSION}/orders`,
      suppliers: `${API_VERSION}/suppliers`,
      inventory: `${API_VERSION}/inventory`,
      reports: `${API_VERSION}/reports`
    },
    documentation: '/api/docs'
  });
});

// Mount route modules
router.use(`${API_VERSION}/auth`, authRoutes);
router.use(`${API_VERSION}/users`, userRoutes);
router.use(`${API_VERSION}/medicines`, medicineRoutes);
router.use(`${API_VERSION}/orders`, orderRoutes);
router.use(`${API_VERSION}/suppliers`, supplierRoutes);
router.use(`${API_VERSION}/inventory`, inventoryRoutes);
router.use(`${API_VERSION}/reports`, reportRoutes);

// 404 handler for undefined routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

export default router;
