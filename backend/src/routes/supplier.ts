import { Router } from 'express';
import { authenticate, requireManager } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validation';
import { supplierValidation } from '@/validations/supplierValidation';
import { supplierController } from '@/controllers';

const router = Router();

// Apply authentication middleware to all supplier routes
router.use(authenticate);

/**
 * @route   GET /api/v1/suppliers
 * @desc    Get all suppliers with pagination and filtering
 * @access  Manager, Admin
 */
router.get('/', 
  requireManager, 
  supplierController.getSuppliers
);

/**
 * @route   GET /api/v1/suppliers/:id
 * @desc    Get supplier by ID
 * @access  Manager, Admin
 */
router.get('/:id', 
  supplierController.getSupplierById
);

/**
 * @route   POST /api/v1/suppliers
 * @desc    Create new supplier
 * @access  Manager, Admin
 */
router.post('/', 
  requireManager, 
  validateRequest(supplierValidation.createSupplier),
  supplierController.createSupplier
);

/**
 * @route   PUT /api/v1/suppliers/:id
 * @desc    Update supplier
 * @access  Manager, Admin
 */
router.put('/:id', 
  requireManager, 
  validateRequest(supplierValidation.updateSupplier),
  supplierController.updateSupplier
);

/**
 * @route   DELETE /api/v1/suppliers/:id
 * @desc    Delete supplier (soft delete)
 * @access  Manager, Admin
 */
router.delete('/:id', 
  requireManager, 
  supplierController.deleteSupplier
);

/**
 * @route   GET /api/v1/suppliers/category/:category
 * @desc    Get suppliers by category
 * @access  Manager, Admin
 */
router.get('/category/:category', 
  requireManager, 
  supplierController.getSuppliersByCategory
);

/**
 * @route   GET /api/v1/suppliers/location/:location
 * @desc    Get suppliers by location
 * @access  Manager, Admin
 */
router.get('/location/:location', 
  requireManager, 
  supplierController.getSuppliersByLocation
);

/**
 * @route   GET /api/v1/suppliers/status/:status
 * @desc    Get suppliers by status
 * @access  Manager, Admin
 */
router.get('/status/:status', 
  requireManager, 
  supplierController.getSuppliersByStatus
);

/**
 * @route   GET /api/v1/suppliers/search
 * @desc    Search suppliers
 * @access  Manager, Admin
 */
router.get('/search', 
  requireManager, 
  supplierController.searchSuppliers
);

/**
 * @route   PATCH /api/v1/suppliers/:id/contact
 * @desc    Update supplier contact information
 * @access  Manager, Admin
 */
router.patch('/:id/contact', 
  requireManager, 
  validateRequest(supplierValidation.updateContactInfo),
  supplierController.updateContactInfo
);

/**
 * @route   PATCH /api/v1/suppliers/:id/rating
 * @desc    Update supplier rating
 * @access  Manager, Admin
 */
router.patch('/:id/rating', 
  requireManager, 
  validateRequest(supplierValidation.updateRating),
  supplierController.updateRating
);

/**
 * @route   GET /api/v1/suppliers/:id/medicines
 * @desc    Get medicines supplied by supplier
 * @access  Manager, Admin
 */
router.get('/:id/medicines', 
  requireManager, 
  supplierController.getSupplierMedicines
);

/**
 * @route   GET /api/v1/suppliers/stats/overview
 * @desc    Get supplier statistics
 * @access  Manager, Admin
 */
router.get('/stats/overview', 
  requireManager, 
  supplierController.getSupplierStats
);

export default router;
