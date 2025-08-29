import { Router } from 'express';
import { authenticate, requireManager } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validation';
import { inventoryValidation } from '@/validations/inventoryValidation';
import { inventoryController } from '@/controllers';

const router = Router();

// Apply authentication middleware to all inventory routes
router.use(authenticate);

/**
 * @route   GET /api/v1/inventory
 * @desc    Get all inventory items with pagination and filtering
 * @access  Manager, Admin
 */
router.get('/', 
  requireManager, 
  inventoryController.getInventoryItems
);

/**
 * @route   GET /api/v1/inventory/:id
 * @desc    Get inventory item by ID
 * @access  Manager, Admin
 */
router.get('/:id', 
  inventoryController.getInventoryItemById
);

/**
 * @route   POST /api/v1/inventory
 * @desc    Create new inventory item
 * @access  Manager, Admin
 */
router.post('/', 
  requireManager, 
  validateRequest(inventoryValidation.createInventoryItem),
  inventoryController.createInventoryItem
);

/**
 * @route   PUT /api/v1/inventory/:id
 * @desc    Update inventory item
 * @access  Manager, Admin
 */
router.put('/:id', 
  requireManager, 
  validateRequest(inventoryValidation.updateInventoryItem),
  inventoryController.updateInventoryItem
);

/**
 * @route   DELETE /api/v1/inventory/:id
 * @desc    Delete inventory item
 * @access  Manager, Admin
 */
router.delete('/:id', 
  requireManager, 
  inventoryController.deleteInventoryItem
);

/**
 * @route   GET /api/v1/inventory/medicine/:medicineId
 * @desc    Get inventory by medicine ID
 * @access  Manager, Admin
 */
router.get('/medicine/:medicineId', 
  inventoryController.getInventoryByMedicine
);

/**
 * @route   GET /api/v1/inventory/location/:location
 * @desc    Get inventory by location
 * @access  Manager, Admin
 */
router.get('/location/:location', 
  requireManager, 
  inventoryController.getInventoryByLocation
);

/**
 * @route   GET /api/v1/inventory/status/:status
 * @desc    Get inventory by status
 * @access  Manager, Admin
 */
router.get('/status/:status', 
  requireManager, 
  inventoryController.getInventoryByStatus
);

/**
 * @route   GET /api/v1/inventory/low-stock/:threshold
 * @desc    Get low stock inventory items
 * @access  Manager, Admin
 */
router.get('/low-stock/:threshold', 
  requireManager, 
  inventoryController.getLowStockItems
);

/**
 * @route   GET /api/v1/inventory/expiring/:days
 * @desc    Get expiring inventory items
 * @access  Manager, Admin
 */
router.get('/expiring/:days', 
  requireManager, 
  inventoryController.getExpiringItems
);

/**
 * @route   GET /api/v1/inventory/out-of-stock
 * @desc    Get out of stock items
 * @access  Manager, Admin
 */
router.get('/out-of-stock', 
  requireManager, 
  inventoryController.getOutOfStockItems
);

/**
 * @route   PATCH /api/v1/inventory/:id/quantity
 * @desc    Update inventory quantity
 * @access  Manager, Admin
 */
router.patch('/:id/quantity', 
  requireManager, 
  validateRequest(inventoryValidation.updateQuantity),
  inventoryController.updateQuantity
);

/**
 * @route   PATCH /api/v1/inventory/:id/location
 * @desc    Update inventory location
 * @access  Manager, Admin
 */
router.patch('/:id/location', 
  requireManager, 
  validateRequest(inventoryValidation.updateLocation),
  inventoryController.updateLocation
);

/**
 * @route   PATCH /api/v1/inventory/:id/status
 * @desc    Update inventory status
 * @access  Manager, Admin
 */
router.patch('/:id/status', 
  requireManager, 
  validateRequest(inventoryValidation.updateStatus),
  inventoryController.updateStatus
);

/**
 * @route   GET /api/v1/inventory/search
 * @desc    Search inventory items
 * @access  Manager, Admin
 */
router.get('/search', 
  requireManager, 
  inventoryController.searchInventory
);

/**
 * @route   GET /api/v1/inventory/stats/overview
 * @desc    Get inventory statistics
 * @access  Manager, Admin
 */
router.get('/stats/overview', 
  requireManager, 
  inventoryController.getInventoryStats
);

export default router;
