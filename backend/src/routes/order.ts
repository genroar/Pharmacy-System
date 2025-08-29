import { Router } from 'express';
import { authenticate, requireManager } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validation';
import { orderValidation } from '@/validations/orderValidation';
import { salesController } from '@/controllers';

const router = Router();

// Apply authentication middleware to all order routes
router.use(authenticate);

/**
 * @route   GET /api/v1/orders
 * @desc    Get all orders with pagination and filtering
 * @access  Manager, Admin
 */
router.get('/', 
  requireManager, 
  salesController.getOrders
);

/**
 * @route   GET /api/v1/orders/:id
 * @desc    Get order by ID
 * @access  Manager, Admin, Customer (own orders)
 */
router.get('/:id', 
  salesController.getOrderById
);

/**
 * @route   POST /api/v1/orders
 * @desc    Create new order
 * @access  Authenticated users
 */
router.post('/', 
  validateRequest(orderValidation.createOrder),
  salesController.createOrder
);

/**
 * @route   PUT /api/v1/orders/:id
 * @desc    Update order
 * @access  Manager, Admin
 */
router.put('/:id', 
  requireManager, 
  validateRequest(orderValidation.updateOrder),
  salesController.updateOrder
);

/**
 * @route   DELETE /api/v1/orders/:id
 * @desc    Cancel order
 * @access  Manager, Admin, Customer (own orders)
 */
router.delete('/:id', 
  salesController.cancelOrder
);

/**
 * @route   PATCH /api/v1/orders/:id/status
 * @desc    Update order status
 * @access  Manager, Admin
 */
router.patch('/:id/status', 
  requireManager, 
  validateRequest(orderValidation.updateOrderStatus),
  salesController.updateOrderStatus
);

/**
 * @route   GET /api/v1/orders/customer/:customerId
 * @desc    Get orders by customer
 * @access  Manager, Admin, Customer (own orders)
 */
router.get('/customer/:customerId', 
  salesController.getCustomerOrders
);

/**
 * @route   GET /api/v1/orders/status/:status
 * @desc    Get orders by status
 * @access  Manager, Admin
 */
router.get('/status/:status', 
  requireManager, 
  salesController.getOrdersByStatus
);

/**
 * @route   GET /api/v1/orders/date-range
 * @desc    Get orders by date range
 * @access  Manager, Admin
 */
router.get('/date-range', 
  requireManager, 
  salesController.getOrdersByDateRange
);

/**
 * @route   GET /api/v1/orders/search
 * @desc    Search orders
 * @access  Manager, Admin
 */
router.get('/search', 
  requireManager, 
  salesController.searchOrders
);

/**
 * @route   GET /api/v1/orders/stats/sales
 * @desc    Get sales statistics
 * @access  Manager, Admin
 */
router.get('/stats/sales', 
  requireManager, 
  salesController.getSalesStats
);

export default router;
