import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  changePassword
} from '@/controllers/authController';
import { validateRegistration, validateLogin, validateProfileUpdate, validatePasswordChange } from '@/validations/authValidation';

const router = Router();

// Public routes
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.use(authenticate); // Apply authentication middleware to all routes below

router.post('/logout', logout);
router.get('/profile', getProfile);
router.put('/profile', validateProfileUpdate, updateProfile);
router.put('/change-password', validatePasswordChange, changePassword);

export default router;
