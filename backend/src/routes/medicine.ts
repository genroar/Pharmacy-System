import { Router } from 'express';
import { authenticate, requireManager } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validation';
import { medicineValidation } from '@/validations/medicineValidation';
import { productController } from '@/controllers';

const router = Router();

// Apply authentication middleware to all medicine routes
router.use(authenticate);

/**
 * @route   GET /api/v1/medicines
 * @desc    Get all medicines with pagination and filtering
 * @access  Public (authenticated)
 */
router.get('/', 
  productController.getMedicines
);

/**
 * @route   GET /api/v1/medicines/:id
 * @desc    Get medicine by ID
 * @access  Public (authenticated)
 */
router.get('/:id', 
  productController.getMedicineById
);

/**
 * @route   POST /api/v1/medicines
 * @desc    Create new medicine
 * @access  Manager, Admin
 */
router.post('/', 
  requireManager, 
  validateRequest(medicineValidation.createMedicine),
  productController.createMedicine
);

/**
 * @route   PUT /api/v1/medicines/:id
 * @desc    Update medicine
 * @access  Manager, Admin
 */
router.put('/:id', 
  requireManager, 
  validateRequest(medicineValidation.updateMedicine),
  productController.updateMedicine
);

/**
 * @route   DELETE /api/v1/medicines/:id
 * @desc    Delete medicine (soft delete)
 * @access  Manager, Admin
 */
router.delete('/:id', 
  requireManager, 
  productController.deleteMedicine
);

/**
 * @route   GET /api/v1/medicines/category/:category
 * @desc    Get medicines by category
 * @access  Public (authenticated)
 */
router.get('/category/:category', 
  productController.getMedicinesByCategory
);

/**
 * @route   GET /api/v1/medicines/search
 * @desc    Search medicines
 * @access  Public (authenticated)
 */
router.get('/search', 
  productController.searchMedicines
);

/**
 * @route   GET /api/v1/medicines/expiring/:days
 * @desc    Get medicines expiring within specified days
 * @access  Manager, Admin
 */
router.get('/expiring/:days', 
  requireManager, 
  productController.getExpiringMedicines
);

/**
 * @route   GET /api/v1/medicines/low-stock/:threshold
 * @desc    Get medicines with low stock
 * @access  Manager, Admin
 */
router.get('/low-stock/:threshold', 
  requireManager, 
  productController.getLowStockMedicines
);

/**
 * @route   GET /api/v1/medicines/:id/stats
 * @desc    Get medicine statistics
 * @access  Manager, Admin
 */
router.get('/:id/stats', 
  requireManager, 
  productController.getMedicineStats
);

export default router;
