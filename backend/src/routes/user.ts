import { Router } from 'express';
import { authenticate, requireAdmin, requireManager } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validation';
import { userValidation } from '@/validations/userValidation';
import { userController } from '@/controllers';

const router = Router();

// Apply authentication middleware to all user routes
router.use(authenticate);

/**
 * @route   GET /api/v1/users
 * @desc    Get all users with pagination and filtering
 * @access  Admin, Manager
 */
router.get('/', 
  requireManager, 
  userController.getUsers
);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Admin, Manager, Self
 */
router.get('/:id', 
  userController.getUserById
);

/**
 * @route   POST /api/v1/users
 * @desc    Create new user
 * @access  Admin
 */
router.post('/', 
  requireAdmin, 
  validateRequest(userValidation.createUser),
  userController.createUser
);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user
 * @access  Admin, Manager, Self
 */
router.put('/:id', 
  validateRequest(userValidation.updateUser),
  userController.updateUser
);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user (soft delete)
 * @access  Admin
 */
router.delete('/:id', 
  requireAdmin, 
  userController.deleteUser
);

/**
 * @route   PATCH /api/v1/users/:id/status
 * @desc    Toggle user status (active/inactive)
 * @access  Admin, Manager
 */
router.patch('/:id/status', 
  requireManager, 
  userController.toggleUserStatus
);

/**
 * @route   GET /api/v1/users/:id/stats
 * @desc    Get user statistics
 * @access  Admin, Manager
 */
router.get('/:id/stats', 
  requireManager, 
  userController.getUserStats
);

/**
 * @route   GET /api/v1/users/role/:role
 * @desc    Get users by role
 * @access  Admin, Manager
 */
router.get('/role/:role', 
  requireManager, 
  userController.getUsersByRole
);

/**
 * @route   GET /api/v1/users/search
 * @desc    Search users
 * @access  Admin, Manager
 */
router.get('/search', 
  requireManager, 
  userController.searchUsers
);

export default router;
