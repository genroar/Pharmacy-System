import Joi from 'joi';
import { UTILITY_CONSTANTS } from '@/utils';

/**
 * Authentication validation schemas using Joi
 */
export const authValidation = {
  /**
   * User registration validation schema
   */
  register: Joi.object({
    body: Joi.object({
      firstName: Joi.string()
        .min(2)
        .max(50)
        .pattern(/^[a-zA-Z\s]+$/)
        .required()
        .messages({
          'string.min': 'First name must be at least 2 characters long',
          'string.max': 'First name cannot exceed 50 characters',
          'string.pattern.base': 'First name can only contain letters and spaces',
          'any.required': 'First name is required'
        }),

      lastName: Joi.string()
        .min(2)
        .max(50)
        .pattern(/^[a-zA-Z\s]+$/)
        .required()
        .messages({
          'string.min': 'Last name must be at least 2 characters long',
          'string.max': 'Last name cannot exceed 50 characters',
          'string.pattern.base': 'Last name can only contain letters and spaces',
          'any.required': 'Last name is required'
        }),

      email: Joi.string()
        .email()
        .max(100)
        .required()
        .messages({
          'string.email': 'Please provide a valid email address',
          'string.max': 'Email cannot exceed 100 characters',
          'any.required': 'Email is required'
        }),

      phone: Joi.string()
        .pattern(/^[\+]?[1-9][\d]{0,15}$/)
        .max(20)
        .required()
        .messages({
          'string.pattern.base': 'Please provide a valid phone number',
          'string.max': 'Phone number cannot exceed 20 characters',
          'any.required': 'Phone number is required'
        }),

      password: Joi.string()
        .min(UTILITY_CONSTANTS.VALIDATION.MIN_PASSWORD_LENGTH)
        .max(UTILITY_CONSTANTS.VALIDATION.MAX_PASSWORD_LENGTH)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .messages({
          'string.min': `Password must be at least ${UTILITY_CONSTANTS.VALIDATION.MIN_PASSWORD_LENGTH} characters long`,
          'string.max': `Password cannot exceed ${UTILITY_CONSTANTS.VALIDATION.MAX_PASSWORD_LENGTH} characters`,
          'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
          'any.required': 'Password is required'
        }),

      confirmPassword: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .messages({
          'any.only': 'Passwords do not match',
          'any.required': 'Please confirm your password'
        }),

      role: Joi.string()
        .valid('admin', 'manager', 'staff', 'pharmacist', 'cashier')
        .default('staff')
        .messages({
          'any.only': 'Invalid role selected',
          'any.default': 'Default role will be assigned'
        }),

      address: Joi.object({
        street: Joi.string().max(100).required(),
        city: Joi.string().max(50).required(),
        state: Joi.string().max(50).required(),
        zipCode: Joi.string().max(10).required(),
        country: Joi.string().max(50).default('USA')
      }).required(),

      dateOfBirth: Joi.date()
        .max('now')
        .iso()
        .messages({
          'date.max': 'Date of birth cannot be in the future',
          'date.format': 'Date of birth must be in ISO format (YYYY-MM-DD)'
        }),

      emergencyContact: Joi.object({
        name: Joi.string().max(100).required(),
        relationship: Joi.string().max(50).required(),
        phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).max(20).required(),
        email: Joi.string().email().max(100).optional()
      }).optional(),

      isActive: Joi.boolean().default(true),
      requiresPasswordChange: Joi.boolean().default(false)
    })
  }),

  /**
   * User login validation schema
   */
  login: Joi.object({
    body: Joi.object({
      email: Joi.string()
        .email()
        .required()
        .messages({
          'string.email': 'Please provide a valid email address',
          'any.required': 'Email is required'
        }),

      password: Joi.string()
        .required()
        .messages({
          'any.required': 'Password is required'
        }),

      rememberMe: Joi.boolean().default(false),
      deviceInfo: Joi.object({
        userAgent: Joi.string().max(500),
        ipAddress: Joi.string().ip(),
        deviceType: Joi.string().valid('mobile', 'tablet', 'desktop'),
        os: Joi.string().max(100),
        browser: Joi.string().max(100)
      }).optional()
    })
  }),

  /**
   * Password change validation schema
   */
  changePassword: Joi.object({
    body: Joi.object({
      currentPassword: Joi.string()
        .required()
        .messages({
          'any.required': 'Current password is required'
        }),

      newPassword: Joi.string()
        .min(UTILITY_CONSTANTS.VALIDATION.MIN_PASSWORD_LENGTH)
        .max(UTILITY_CONSTANTS.VALIDATION.MAX_PASSWORD_LENGTH)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .invalid(Joi.ref('currentPassword'))
        .required()
        .messages({
          'string.min': `New password must be at least ${UTILITY_CONSTANTS.VALIDATION.MIN_PASSWORD_LENGTH} characters long`,
          'string.max': `New password cannot exceed ${UTILITY_CONSTANTS.VALIDATION.MAX_PASSWORD_LENGTH} characters`,
          'string.pattern.base': 'New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
          'any.invalid': 'New password must be different from current password',
          'any.required': 'New password is required'
        }),

      confirmNewPassword: Joi.string()
        .valid(Joi.ref('newPassword'))
        .required()
        .messages({
          'any.only': 'New passwords do not match',
          'any.required': 'Please confirm your new password'
        })
    })
  }),

  /**
   * Password reset request validation schema
   */
  requestPasswordReset: Joi.object({
    body: Joi.object({
      email: Joi.string()
        .email()
        .required()
        .messages({
          'string.email': 'Please provide a valid email address',
          'any.required': 'Email is required'
        }),

      resetMethod: Joi.string()
        .valid('email', 'sms')
        .default('email')
        .messages({
          'any.only': 'Invalid reset method selected'
        })
    })
  }),

  /**
   * Password reset validation schema
   */
  resetPassword: Joi.object({
    body: Joi.object({
      token: Joi.string()
        .min(UTILITY_CONSTANTS.VALIDATION.MIN_TOKEN_LENGTH)
        .max(UTILITY_CONSTANTS.VALIDATION.MAX_TOKEN_LENGTH)
        .required()
        .messages({
          'string.min': `Token must be at least ${UTILITY_CONSTANTS.VALIDATION.MIN_TOKEN_LENGTH} characters long`,
          'string.max': `Token cannot exceed ${UTILITY_CONSTANTS.VALIDATION.MAX_TOKEN_LENGTH} characters`,
          'any.required': 'Reset token is required'
        }),

      newPassword: Joi.string()
        .min(UTILITY_CONSTANTS.VALIDATION.MIN_PASSWORD_LENGTH)
        .max(UTILITY_CONSTANTS.VALIDATION.MAX_PASSWORD_LENGTH)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .messages({
          'string.min': `New password must be at least ${UTILITY_CONSTANTS.VALIDATION.MIN_PASSWORD_LENGTH} characters long`,
          'string.max': `New password cannot exceed ${UTILITY_CONSTANTS.VALIDATION.MAX_PASSWORD_LENGTH} characters`,
          'string.pattern.base': 'New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
          'any.required': 'New password is required'
        }),

      confirmNewPassword: Joi.string()
        .valid(Joi.ref('newPassword'))
        .required()
        .messages({
          'any.only': 'New passwords do not match',
          'any.required': 'Please confirm your new password'
        })
    })
  }),

  /**
   * Email verification validation schema
   */
  verifyEmail: Joi.object({
    body: Joi.object({
      token: Joi.string()
        .min(UTILITY_CONSTANTS.VALIDATION.MIN_TOKEN_LENGTH)
        .max(UTILITY_CONSTANTS.VALIDATION.MAX_TOKEN_LENGTH)
        .required()
        .messages({
          'string.min': `Verification token must be at least ${UTILITY_CONSTANTS.VALIDATION.MIN_TOKEN_LENGTH} characters long`,
          'string.max': `Verification token cannot exceed ${UTILITY_CONSTANTS.VALIDATION.MAX_TOKEN_LENGTH} characters`,
          'any.required': 'Verification token is required'
        })
    })
  }),

  /**
   * Refresh token validation schema
   */
  refreshToken: Joi.object({
    body: Joi.object({
      refreshToken: Joi.string()
        .min(UTILITY_CONSTANTS.VALIDATION.MIN_TOKEN_LENGTH)
        .max(UTILITY_CONSTANTS.VALIDATION.MAX_TOKEN_LENGTH)
        .required()
        .messages({
          'string.min': `Refresh token must be at least ${UTILITY_CONSTANTS.VALIDATION.MIN_TOKEN_LENGTH} characters long`,
          'string.max': `Refresh token cannot exceed ${UTILITY_CONSTANTS.VALIDATION.MAX_TOKEN_LENGTH} characters`,
          'any.required': 'Refresh token is required'
        })
    })
  }),

  /**
   * Logout validation schema
   */
  logout: Joi.object({
    body: Joi.object({
      refreshToken: Joi.string()
        .min(UTILITY_CONSTANTS.VALIDATION.MIN_TOKEN_LENGTH)
        .max(UTILITY_CONSTANTS.VALIDATION.MAX_TOKEN_LENGTH)
        .optional()
        .messages({
          'string.min': `Refresh token must be at least ${UTILITY_CONSTANTS.VALIDATION.MIN_TOKEN_LENGTH} characters long`,
          'string.max': `Refresh token cannot exceed ${UTILITY_CONSTANTS.VALIDATION.MAX_TOKEN_LENGTH} characters`
        }),

      logoutAllDevices: Joi.boolean().default(false)
    })
  }),

  /**
   * Two-factor authentication setup validation schema
   */
  setup2FA: Joi.object({
    body: Joi.object({
      method: Joi.string()
        .valid('totp', 'sms', 'email')
        .required()
        .messages({
          'any.only': 'Invalid 2FA method selected',
          'any.required': '2FA method is required'
        }),

      phone: Joi.string()
        .pattern(/^[\+]?[1-9][\d]{0,15}$/)
        .max(20)
        .when('method', {
          is: 'sms',
          then: Joi.required(),
          otherwise: Joi.optional()
        })
        .messages({
          'string.pattern.base': 'Please provide a valid phone number',
          'string.max': 'Phone number cannot exceed 20 characters',
          'any.required': 'Phone number is required for SMS 2FA'
        }),

      email: Joi.string()
        .email()
        .max(100)
        .when('method', {
          is: 'email',
          then: Joi.required(),
          otherwise: Joi.optional()
        })
        .messages({
          'string.email': 'Please provide a valid email address',
          'string.max': 'Email cannot exceed 100 characters',
          'any.required': 'Email is required for email 2FA'
        })
    })
  }),

  /**
   * Two-factor authentication verification validation schema
   */
  verify2FA: Joi.object({
    body: Joi.object({
      code: Joi.string()
        .length(6)
        .pattern(/^\d{6}$/)
        .required()
        .messages({
          'string.length': '2FA code must be exactly 6 digits',
          'string.pattern.base': '2FA code must contain only digits',
          'any.required': '2FA code is required'
        }),

      method: Joi.string()
        .valid('totp', 'sms', 'email')
        .required()
        .messages({
          'any.only': 'Invalid 2FA method',
          'any.required': '2FA method is required'
        })
    })
  }),

  /**
   * Session management validation schema
   */
  manageSessions: Joi.object({
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20),
      status: Joi.string().valid('active', 'expired', 'all').default('active'),
      deviceType: Joi.string().valid('mobile', 'tablet', 'desktop', 'all').default('all')
    })
  }),

  /**
   * Revoke session validation schema
   */
  revokeSession: Joi.object({
    params: Joi.object({
      sessionId: Joi.string()
        .min(UTILITY_CONSTANTS.VALIDATION.MIN_TOKEN_LENGTH)
        .max(UTILITY_CONSTANTS.VALIDATION.MAX_TOKEN_LENGTH)
        .required()
        .messages({
          'string.min': `Session ID must be at least ${UTILITY_CONSTANTS.VALIDATION.MIN_TOKEN_LENGTH} characters long`,
          'string.max': `Session ID cannot exceed ${UTILITY_CONSTANTS.VALIDATION.MAX_TOKEN_LENGTH} characters`,
          'any.required': 'Session ID is required'
        })
    })
  }),

  /**
   * Update profile validation schema
   */
  updateProfile: Joi.object({
    body: Joi.object({
      firstName: Joi.string()
        .min(2)
        .max(50)
        .pattern(/^[a-zA-Z\s]+$/)
        .optional()
        .messages({
          'string.min': 'First name must be at least 2 characters long',
          'string.max': 'First name cannot exceed 50 characters',
          'string.pattern.base': 'First name can only contain letters and spaces'
        }),

      lastName: Joi.string()
        .min(2)
        .max(50)
        .pattern(/^[a-zA-Z\s]+$/)
        .optional()
        .messages({
          'string.min': 'Last name must be at least 2 characters long',
          'string.max': 'Last name cannot exceed 50 characters',
          'string.pattern.base': 'Last name can only contain letters and spaces'
        }),

      phone: Joi.string()
        .pattern(/^[\+]?[1-9][\d]{0,15}$/)
        .max(20)
        .optional()
        .messages({
          'string.pattern.base': 'Please provide a valid phone number',
          'string.max': 'Phone number cannot exceed 20 characters'
        }),

      address: Joi.object({
        street: Joi.string().max(100).optional(),
        city: Joi.string().max(50).optional(),
        state: Joi.string().max(50).optional(),
        zipCode: Joi.string().max(10).optional(),
        country: Joi.string().max(50).optional()
      }).optional(),

      dateOfBirth: Joi.date()
        .max('now')
        .iso()
        .optional()
        .messages({
          'date.max': 'Date of birth cannot be in the future',
          'date.format': 'Date of birth must be in ISO format (YYYY-MM-DD)'
        }),

      emergencyContact: Joi.object({
        name: Joi.string().max(100).optional(),
        relationship: Joi.string().max(50).optional(),
        phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).max(20).optional(),
        email: Joi.string().email().max(100).optional()
      }).optional(),

      preferences: Joi.object({
        language: Joi.string().valid('en', 'es', 'fr', 'de').default('en'),
        timezone: Joi.string().max(50).default('UTC'),
        notifications: Joi.object({
          email: Joi.boolean().default(true),
          sms: Joi.boolean().default(false),
          push: Joi.boolean().default(true)
        }).default(),
        theme: Joi.string().valid('light', 'dark', 'auto').default('auto')
      }).optional()
    })
  }),

  /**
   * Admin user management validation schema
   */
  adminCreateUser: Joi.object({
    body: Joi.object({
      firstName: Joi.string()
        .min(2)
        .max(50)
        .pattern(/^[a-zA-Z\s]+$/)
        .required()
        .messages({
          'string.min': 'First name must be at least 2 characters long',
          'string.max': 'First name cannot exceed 50 characters',
          'string.pattern.base': 'First name can only contain letters and spaces',
          'any.required': 'First name is required'
        }),

      lastName: Joi.string()
        .min(2)
        .max(50)
        .pattern(/^[a-zA-Z\s]+$/)
        .required()
        .messages({
          'string.min': 'Last name must be at least 2 characters long',
          'string.max': 'Last name cannot exceed 50 characters',
          'string.pattern.base': 'Last name can only contain letters and spaces',
          'any.required': 'Last name is required'
        }),

      email: Joi.string()
        .email()
        .max(100)
        .required()
        .messages({
          'string.email': 'Please provide a valid email address',
          'string.max': 'Email cannot exceed 100 characters',
          'any.required': 'Email is required'
        }),

      phone: Joi.string()
        .pattern(/^[\+]?[1-9][\d]{0,15}$/)
        .max(20)
        .required()
        .messages({
          'string.pattern.base': 'Please provide a valid phone number',
          'string.max': 'Phone number cannot exceed 20 characters',
          'any.required': 'Phone number is required'
        }),

      role: Joi.string()
        .valid('admin', 'manager', 'staff', 'pharmacist', 'cashier')
        .required()
        .messages({
          'any.only': 'Invalid role selected',
          'any.required': 'Role is required'
        }),

      department: Joi.string().max(100).optional(),
      supervisor: Joi.string().max(100).optional(),
      hireDate: Joi.date().max('now').iso().optional(),
      salary: Joi.number().positive().optional(),
      isActive: Joi.boolean().default(true),
      requiresPasswordChange: Joi.boolean().default(true)
    })
  }),

  /**
   * Admin update user validation schema
   */
  adminUpdateUser: Joi.object({
    params: Joi.object({
      userId: Joi.string()
        .min(UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH)
        .max(UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH)
        .required()
        .messages({
          'string.min': `User ID must be at least ${UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH} characters long`,
          'string.max': `User ID cannot exceed ${UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH} characters`,
          'any.required': 'User ID is required'
        })
    }),

    body: Joi.object({
      firstName: Joi.string()
        .min(2)
        .max(50)
        .pattern(/^[a-zA-Z\s]+$/)
        .optional()
        .messages({
          'string.min': 'First name must be at least 2 characters long',
          'string.max': 'First name cannot exceed 50 characters',
          'string.pattern.base': 'First name can only contain letters and spaces'
        }),

      lastName: Joi.string()
        .min(2)
        .max(50)
        .pattern(/^[a-zA-Z\s]+$/)
        .optional()
        .messages({
          'string.min': 'Last name must be at least 2 characters long',
          'string.max': 'Last name cannot exceed 50 characters',
          'string.pattern.base': 'Last name can only contain letters and spaces'
        }),

      email: Joi.string()
        .email()
        .max(100)
        .optional()
        .messages({
          'string.email': 'Please provide a valid email address',
          'string.max': 'Email cannot exceed 100 characters'
        }),

      phone: Joi.string()
        .pattern(/^[\+]?[1-9][\d]{0,15}$/)
        .max(20)
        .optional()
        .messages({
          'string.pattern.base': 'Please provide a valid phone number',
          'string.max': 'Phone number cannot exceed 20 characters'
        }),

      role: Joi.string()
        .valid('admin', 'manager', 'staff', 'pharmacist', 'cashier')
        .optional()
        .messages({
          'any.only': 'Invalid role selected'
        }),

      department: Joi.string().max(100).optional(),
      supervisor: Joi.string().max(100).optional(),
      hireDate: Joi.date().max('now').iso().optional(),
      salary: Joi.number().positive().optional(),
      isActive: Joi.boolean().optional(),
      requiresPasswordChange: Joi.boolean().optional()
    })
  })
};

export default authValidation;
