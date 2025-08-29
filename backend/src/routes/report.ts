import { Router } from 'express';
import { authenticate, requireManager } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validation';
import { reportValidation } from '@/validations/reportValidation';
import { reportController } from '@/controllers';

const router = Router();

// Apply authentication middleware to all report routes
router.use(authenticate);

/**
 * @route   GET /api/v1/reports/dashboard
 * @desc    Get dashboard statistics
 * @access  Manager, Admin
 */
router.get('/dashboard', 
  requireManager, 
  reportController.getDashboardStats
);

/**
 * @route   POST /api/v1/reports/generate
 * @desc    Generate custom report
 * @access  Manager, Admin
 */
router.post('/generate', 
  requireManager, 
  validateRequest(reportValidation.generateReport),
  reportController.generateReport
);

/**
 * @route   GET /api/v1/reports/sales
 * @desc    Get sales reports
 * @access  Manager, Admin
 */
router.get('/sales', 
  requireManager, 
  reportController.getSalesReport
);

/**
 * @route   GET /api/v1/reports/sales/:period
 * @desc    Get sales report by period (daily, weekly, monthly, yearly)
 * @access  Manager, Admin
 */
router.get('/sales/:period', 
  requireManager, 
  reportController.getSalesReportByPeriod
);

/**
 * @route   GET /api/v1/reports/inventory
 * @desc    Get inventory reports
 * @access  Manager, Admin
 */
router.get('/inventory', 
  requireManager, 
  reportController.getInventoryReport
);

/**
 * @route   GET /api/v1/reports/inventory/low-stock
 * @desc    Get low stock report
 * @access  Manager, Admin
 */
router.get('/inventory/low-stock', 
  requireManager, 
  reportController.getLowStockReport
);

/**
 * @route   GET /api/v1/reports/inventory/expiring
 * @desc    Get expiring inventory report
 * @access  Manager, Admin
 */
router.get('/inventory/expiring', 
  requireManager, 
  reportController.getExpiringInventoryReport
);

/**
 * @route   GET /api/v1/reports/revenue
 * @desc    Get revenue reports
 * @access  Manager, Admin
 */
router.get('/revenue', 
  requireManager, 
  reportController.getRevenueReport
);

/**
 * @route   GET /api/v1/reports/revenue/:period
 * @desc    Get revenue report by period
 * @access  Manager, Admin
 */
router.get('/revenue/:period', 
  requireManager, 
  reportController.getRevenueReportByPeriod
);

/**
 * @route   GET /api/v1/reports/customers
 * @desc    Get customer reports
 * @access  Manager, Admin
 */
router.get('/customers', 
  requireManager, 
  reportController.getCustomerReport
);

/**
 * @route   GET /api/v1/reports/customers/top
 * @desc    Get top customers report
 * @access  Manager, Admin
 */
router.get('/customers/top', 
  requireManager, 
  reportController.getTopCustomersReport
);

/**
 * @route   GET /api/v1/reports/suppliers
 * @desc    Get supplier reports
 * @access  Manager, Admin
 */
router.get('/suppliers', 
  requireManager, 
  reportController.getSupplierReport
);

/**
 * @route   GET /api/v1/reports/suppliers/performance
 * @desc    Get supplier performance report
 * @access  Manager, Admin
 */
router.get('/suppliers/performance', 
  requireManager, 
  reportController.getSupplierPerformanceReport
);

/**
 * @route   GET /api/v1/reports/medicines
 * @desc    Get medicine reports
 * @access  Manager, Admin
 */
router.get('/medicines', 
  requireManager, 
  reportController.getMedicineReport
);

/**
 * @route   GET /api/v1/reports/medicines/popular
 * @desc    Get popular medicines report
 * @access  Manager, Admin
 */
router.get('/medicines/popular', 
  requireManager, 
  reportController.getPopularMedicinesReport
);

/**
 * @route   GET /api/v1/reports/export/:type
 * @desc    Export report to different formats (PDF, Excel, CSV)
 * @access  Manager, Admin
 */
router.get('/export/:type', 
  requireManager, 
  reportController.exportReport
);

/**
 * @route   GET /api/v1/reports/scheduled
 * @desc    Get scheduled reports
 * @access  Manager, Admin
 */
router.get('/scheduled', 
  requireManager, 
  reportController.getScheduledReports
);

/**
 * @route   POST /api/v1/reports/schedule
 * @desc    Schedule a new report
 * @access  Manager, Admin
 */
router.post('/schedule', 
  requireManager, 
  validateRequest(reportValidation.scheduleReport),
  reportController.scheduleReport
);

export default router;
