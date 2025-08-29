import Joi from 'joi';
import { UTILITY_CONSTANTS } from '@/utils';

/**
 * Sales/Order validation schemas using Joi
 */
export const salesValidation = {
  /**
   * Create order validation schema
   */
  createOrder: Joi.object({
    body: Joi.object({
      customerId: Joi.string()
        .min(UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH)
        .max(UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH)
        .optional()
        .messages({
          'string.min': `Customer ID must be at least ${UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH} characters long`,
          'string.max': `Customer ID cannot exceed ${UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH} characters`
        }),

      customerInfo: Joi.object({
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
          .optional()
          .messages({
            'date.max': 'Date of birth cannot be in the future',
            'date.format': 'Date of birth must be in ISO format (YYYY-MM-DD)'
          })
      }).when('customerId', {
        is: Joi.exist(),
        then: Joi.optional(),
        otherwise: Joi.required()
      }),

      items: Joi.array()
        .items(
          Joi.object({
            medicineId: Joi.string()
              .min(UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH)
              .max(UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH)
              .required()
              .messages({
                'string.min': `Medicine ID must be at least ${UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH} characters long`,
                'string.max': `Medicine ID cannot exceed ${UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH} characters`,
                'any.required': 'Medicine ID is required'
              }),

            quantity: Joi.number()
              .integer()
              .positive()
              .max(1000)
              .required()
              .messages({
                'number.integer': 'Quantity must be a whole number',
                'number.positive': 'Quantity must be positive',
                'number.max': 'Quantity cannot exceed 1000',
                'any.required': 'Quantity is required'
              }),

            unitPrice: Joi.number()
              .positive()
              .precision(2)
              .required()
              .messages({
                'number.positive': 'Unit price must be positive',
                'number.precision': 'Unit price can have maximum 2 decimal places',
                'any.required': 'Unit price is required'
              }),

            prescriptionRequired: Joi.boolean().default(false),
            prescriptionId: Joi.string()
              .min(UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH)
              .max(UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH)
              .when('prescriptionRequired', {
                is: true,
                then: Joi.required(),
                otherwise: Joi.optional()
              })
              .messages({
                'string.min': `Prescription ID must be at least ${UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH} characters long`,
                'string.max': `Prescription ID cannot exceed ${UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH} characters`,
                'any.required': 'Prescription ID is required for prescription medicines'
              }),

            notes: Joi.string().max(500).optional(),
            specialInstructions: Joi.string().max(500).optional()
          })
        )
        .min(1)
        .max(50)
        .required()
        .messages({
          'array.min': 'At least one item is required',
          'array.max': 'Cannot exceed 50 items per order',
          'any.required': 'Order items are required'
        }),

      paymentMethod: Joi.string()
        .valid('cash', 'credit_card', 'debit_card', 'insurance', 'check', 'mobile_payment', 'other')
        .required()
        .messages({
          'any.only': 'Invalid payment method selected',
          'any.required': 'Payment method is required'
        }),

      paymentDetails: Joi.object({
        cardNumber: Joi.string()
          .pattern(/^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/)
          .when('paymentMethod', {
            is: Joi.string().valid('credit_card', 'debit_card'),
            then: Joi.required(),
            otherwise: Joi.optional()
          })
          .messages({
            'string.pattern.base': 'Invalid card number format',
            'any.required': 'Card number is required for card payments'
          }),

        expiryDate: Joi.string()
          .pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)
          .when('paymentMethod', {
            is: Joi.string().valid('credit_card', 'debit_card'),
            then: Joi.required(),
            otherwise: Joi.optional()
          })
          .messages({
            'string.pattern.base': 'Expiry date must be in MM/YY format',
            'any.required': 'Expiry date is required for card payments'
          }),

        cvv: Joi.string()
          .pattern(/^\d{3,4}$/)
          .when('paymentMethod', {
            is: Joi.string().valid('credit_card', 'debit_card'),
            then: Joi.required(),
            otherwise: Joi.optional()
          })
          .messages({
            'string.pattern.base': 'CVV must be 3 or 4 digits',
            'any.required': 'CVV is required for card payments'
          }),

        cardholderName: Joi.string()
          .max(100)
          .when('paymentMethod', {
            is: Joi.string().valid('credit_card', 'debit_card'),
            then: Joi.required(),
            otherwise: Joi.optional()
          })
          .messages({
            'string.max': 'Cardholder name cannot exceed 100 characters',
            'any.required': 'Cardholder name is required for card payments'
          }),

        insuranceProvider: Joi.string()
          .max(100)
          .when('paymentMethod', {
            is: 'insurance',
            then: Joi.required(),
            otherwise: Joi.optional()
          })
          .messages({
            'string.max': 'Insurance provider cannot exceed 100 characters',
            'any.required': 'Insurance provider is required for insurance payments'
          }),

        insurancePolicyNumber: Joi.string()
          .max(50)
          .when('paymentMethod', {
            is: 'insurance',
            then: Joi.required(),
            otherwise: Joi.optional()
          })
          .messages({
            'string.max': 'Insurance policy number cannot exceed 50 characters',
            'any.required': 'Insurance policy number is required for insurance payments'
          }),

        checkNumber: Joi.string()
          .max(20)
          .when('paymentMethod', {
            is: 'check',
            then: Joi.required(),
            otherwise: Joi.optional()
          })
          .messages({
            'string.max': 'Check number cannot exceed 20 characters',
            'any.required': 'Check number is required for check payments'
          }),

        mobilePaymentProvider: Joi.string()
          .max(50)
          .when('paymentMethod', {
            is: 'mobile_payment',
            then: Joi.required(),
            otherwise: Joi.optional()
          })
          .messages({
            'string.max': 'Mobile payment provider cannot exceed 50 characters',
            'any.required': 'Mobile payment provider is required for mobile payments'
          })
      }).optional(),

      billingAddress: Joi.object({
        street: Joi.string().max(100).required(),
        city: Joi.string().max(50).required(),
        state: Joi.string().max(50).required(),
        zipCode: Joi.string().max(10).required(),
        country: Joi.string().max(50).default('USA')
      }).optional(),

      shippingAddress: Joi.object({
        street: Joi.string().max(100).required(),
        city: Joi.string().max(50).required(),
        state: Joi.string().max(50).required(),
        zipCode: Joi.string().max(10).required(),
        country: Joi.string().max(50).default('USA'),
        deliveryInstructions: Joi.string().max(500).optional()
      }).optional(),

      deliveryMethod: Joi.string()
        .valid('pickup', 'delivery', 'shipping')
        .default('pickup')
        .messages({
          'any.only': 'Invalid delivery method selected'
        }),

      deliveryInstructions: Joi.string().max(500).optional(),
      specialInstructions: Joi.string().max(500).optional(),
      notes: Joi.string().max(1000).optional(),

      discount: Joi.object({
        type: Joi.string()
          .valid('percentage', 'fixed', 'coupon')
          .required(),
        value: Joi.number()
          .positive()
          .precision(2)
          .required(),
        code: Joi.string().max(50).optional(),
        description: Joi.string().max(200).optional()
      }).optional(),

      tax: Joi.object({
        rate: Joi.number()
          .min(0)
          .max(100)
          .precision(2)
          .default(0),
        amount: Joi.number()
          .min(0)
          .precision(2)
          .optional(),
        exempt: Joi.boolean().default(false),
        exemptionReason: Joi.string().max(200).optional()
      }).default(),

      urgency: Joi.string()
        .valid('normal', 'urgent', 'emergency')
        .default('normal')
        .messages({
          'any.only': 'Invalid urgency level selected'
        }),

      expectedDeliveryDate: Joi.date()
        .min('now')
        .iso()
        .optional()
        .messages({
          'date.min': 'Expected delivery date must be in the future',
          'date.format': 'Expected delivery date must be in ISO format (YYYY-MM-DD)'
        }),

      isGift: Joi.boolean().default(false),
      giftMessage: Joi.string().max(500).optional(),
      giftWrapping: Joi.boolean().default(false),
      giftWrappingType: Joi.string()
        .valid('standard', 'premium', 'custom')
        .when('giftWrapping', {
          is: true,
          then: Joi.required(),
          otherwise: Joi.optional()
        })
        .messages({
          'any.only': 'Invalid gift wrapping type',
          'any.required': 'Gift wrapping type is required when gift wrapping is selected'
        }),

      loyaltyPoints: Joi.number().integer().min(0).default(0),
      useLoyaltyPoints: Joi.boolean().default(false),
      loyaltyPointsToUse: Joi.number()
        .integer()
        .min(0)
        .when('useLoyaltyPoints', {
          is: true,
          then: Joi.required(),
          otherwise: Joi.optional()
        })
        .messages({
          'number.integer': 'Loyalty points must be a whole number',
          'number.min': 'Loyalty points cannot be negative',
          'any.required': 'Loyalty points to use is required when using loyalty points'
        }),

      source: Joi.string()
        .valid('in_store', 'online', 'phone', 'mobile_app', 'other')
        .default('in_store')
        .messages({
          'any.only': 'Invalid order source selected'
        }),

      salespersonId: Joi.string()
        .min(UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH)
        .max(UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH)
        .optional()
        .messages({
          'string.min': `Salesperson ID must be at least ${UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH} characters long`,
          'string.max': `Salesperson ID cannot exceed ${UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH} characters`
        }),

      status: Joi.string()
        .valid('pending', 'confirmed', 'processing', 'ready', 'shipped', 'delivered', 'cancelled', 'refunded')
        .default('pending')
        .messages({
          'any.only': 'Invalid order status selected'
        })
    })
  }),

  /**
   * Update order validation schema
   */
  updateOrder: Joi.object({
    params: Joi.object({
      orderId: Joi.string()
        .min(UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH)
        .max(UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH)
        .required()
        .messages({
          'string.min': `Order ID must be at least ${UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH} characters long`,
          'string.max': `Order ID cannot exceed ${UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH} characters`,
          'any.required': 'Order ID is required'
        })
    }),

    body: Joi.object({
      customerInfo: Joi.object({
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

        address: Joi.object({
          street: Joi.string().max(100).optional(),
          city: Joi.string().max(50).optional(),
          state: Joi.string().max(50).optional(),
          zipCode: Joi.string().max(10).optional(),
          country: Joi.string().max(50).optional()
        }).optional()
      }).optional(),

      items: Joi.array()
        .items(
          Joi.object({
            medicineId: Joi.string()
              .min(UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH)
              .max(UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH)
              .required(),
            quantity: Joi.number().integer().positive().max(1000).required(),
            unitPrice: Joi.number().positive().precision(2).required(),
            prescriptionRequired: Joi.boolean().default(false),
            prescriptionId: Joi.string()
              .min(UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH)
              .max(UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH)
              .optional(),
            notes: Joi.string().max(500).optional(),
            specialInstructions: Joi.string().max(500).optional()
          })
        )
        .min(1)
        .max(50)
        .optional()
        .messages({
          'array.min': 'At least one item is required',
          'array.max': 'Cannot exceed 50 items per order'
        }),

      paymentMethod: Joi.string()
        .valid('cash', 'credit_card', 'debit_card', 'insurance', 'check', 'mobile_payment', 'other')
        .optional()
        .messages({
          'any.only': 'Invalid payment method selected'
        }),

      paymentDetails: Joi.object({
        cardNumber: Joi.string()
          .pattern(/^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/)
          .optional()
          .messages({
            'string.pattern.base': 'Invalid card number format'
          }),

        expiryDate: Joi.string()
          .pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)
          .optional()
          .messages({
            'string.pattern.base': 'Expiry date must be in MM/YY format'
          }),

        cvv: Joi.string()
          .pattern(/^\d{3,4}$/)
          .optional()
          .messages({
            'string.pattern.base': 'CVV must be 3 or 4 digits'
          }),

        cardholderName: Joi.string().max(100).optional(),
        insuranceProvider: Joi.string().max(100).optional(),
        insurancePolicyNumber: Joi.string().max(50).optional(),
        checkNumber: Joi.string().max(20).optional(),
        mobilePaymentProvider: Joi.string().max(50).optional()
      }).optional(),

      billingAddress: Joi.object({
        street: Joi.string().max(100).optional(),
        city: Joi.string().max(50).optional(),
        state: Joi.string().max(50).optional(),
        zipCode: Joi.string().max(10).optional(),
        country: Joi.string().max(50).optional()
      }).optional(),

      shippingAddress: Joi.object({
        street: Joi.string().max(100).optional(),
        city: Joi.string().max(50).optional(),
        state: Joi.string().max(50).optional(),
        zipCode: Joi.string().max(10).optional(),
        country: Joi.string().max(50).optional(),
        deliveryInstructions: Joi.string().max(500).optional()
      }).optional(),

      deliveryMethod: Joi.string()
        .valid('pickup', 'delivery', 'shipping')
        .optional()
        .messages({
          'any.only': 'Invalid delivery method selected'
        }),

      deliveryInstructions: Joi.string().max(500).optional(),
      specialInstructions: Joi.string().max(500).optional(),
      notes: Joi.string().max(1000).optional(),

      discount: Joi.object({
        type: Joi.string()
          .valid('percentage', 'fixed', 'coupon')
          .optional(),
        value: Joi.number().positive().precision(2).optional(),
        code: Joi.string().max(50).optional(),
        description: Joi.string().max(200).optional()
      }).optional(),

      tax: Joi.object({
        rate: Joi.number().min(0).max(100).precision(2).optional(),
        amount: Joi.number().min(0).precision(2).optional(),
        exempt: Joi.boolean().optional(),
        exemptionReason: Joi.string().max(200).optional()
      }).optional(),

      urgency: Joi.string()
        .valid('normal', 'urgent', 'emergency')
        .optional()
        .messages({
          'any.only': 'Invalid urgency level selected'
        }),

      expectedDeliveryDate: Joi.date()
        .min('now')
        .iso()
        .optional()
        .messages({
          'date.min': 'Expected delivery date must be in the future',
          'date.format': 'Expected delivery date must be in ISO format (YYYY-MM-DD)'
        }),

      isGift: Joi.boolean().optional(),
      giftMessage: Joi.string().max(500).optional(),
      giftWrapping: Joi.boolean().optional(),
      giftWrappingType: Joi.string()
        .valid('standard', 'premium', 'custom')
        .optional()
        .messages({
          'any.only': 'Invalid gift wrapping type'
        }),

      loyaltyPoints: Joi.number().integer().min(0).optional(),
      useLoyaltyPoints: Joi.boolean().optional(),
      loyaltyPointsToUse: Joi.number().integer().min(0).optional(),

      source: Joi.string()
        .valid('in_store', 'online', 'phone', 'mobile_app', 'other')
        .optional()
        .messages({
          'any.only': 'Invalid order source selected'
        }),

      salespersonId: Joi.string()
        .min(UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH)
        .max(UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH)
        .optional()
        .messages({
          'string.min': `Salesperson ID must be at least ${UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH} characters long`,
          'string.max': `Salesperson ID cannot exceed ${UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH} characters`
        }),

      status: Joi.string()
        .valid('pending', 'confirmed', 'processing', 'ready', 'shipped', 'delivered', 'cancelled', 'refunded')
        .optional()
        .messages({
          'any.only': 'Invalid order status selected'
        })
    })
  }),

  /**
   * Update order status validation schema
   */
  updateOrderStatus: Joi.object({
    params: Joi.object({
      orderId: Joi.string()
        .min(UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH)
        .max(UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH)
        .required()
        .messages({
          'string.min': `Order ID must be at least ${UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH} characters long`,
          'string.max': `Order ID cannot exceed ${UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH} characters`,
          'any.required': 'Order ID is required'
        })
    }),

    body: Joi.object({
      status: Joi.string()
        .valid('pending', 'confirmed', 'processing', 'ready', 'shipped', 'delivered', 'cancelled', 'refunded')
        .required()
        .messages({
          'any.only': 'Invalid order status selected',
          'any.required': 'Order status is required'
        }),

      notes: Joi.string().max(500).optional(),
      estimatedDeliveryDate: Joi.date()
        .min('now')
        .iso()
        .optional()
        .messages({
          'date.min': 'Estimated delivery date must be in the future',
          'date.format': 'Estimated delivery date must be in ISO format (YYYY-MM-DD)'
        }),

      trackingNumber: Joi.string().max(100).optional(),
      carrier: Joi.string().max(100).optional(),
      reason: Joi.string().max(500).optional()
    })
  }),

  /**
   * Get orders query validation schema
   */
  getOrders: Joi.object({
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20),
      status: Joi.string()
        .valid('pending', 'confirmed', 'processing', 'ready', 'shipped', 'delivered', 'cancelled', 'refunded', 'all')
        .default('all'),
      customerId: Joi.string()
        .min(UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH)
        .max(UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH)
        .optional(),
      paymentMethod: Joi.string()
        .valid('cash', 'credit_card', 'debit_card', 'insurance', 'check', 'mobile_payment', 'other', 'all')
        .default('all'),
      deliveryMethod: Joi.string()
        .valid('pickup', 'delivery', 'shipping', 'all')
        .default('all'),
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().optional(),
      minAmount: Joi.number().positive().precision(2).optional(),
      maxAmount: Joi.number().positive().precision(2).optional(),
      sortBy: Joi.string()
        .valid('createdAt', 'updatedAt', 'totalAmount', 'status', 'customerName')
        .default('createdAt'),
      sortOrder: Joi.string().valid('asc', 'desc').default('desc')
    })
  }),

  /**
   * Get order by ID validation schema
   */
  getOrderById: Joi.object({
    params: Joi.object({
      orderId: Joi.string()
        .min(UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH)
        .max(UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH)
        .required()
        .messages({
          'string.min': `Order ID must be at least ${UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH} characters long`,
          'string.max': `Order ID cannot exceed ${UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH} characters`,
          'any.required': 'Order ID is required'
        })
    })
  }),

  /**
   * Cancel order validation schema
   */
  cancelOrder: Joi.object({
    params: Joi.object({
      orderId: Joi.string()
        .min(UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH)
        .max(UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH)
        .required()
        .messages({
          'string.min': `Order ID must be at least ${UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH} characters long`,
          'string.max': `Order ID cannot exceed ${UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH} characters`,
          'any.required': 'Order ID is required'
        })
    }),

    body: Joi.object({
      reason: Joi.string()
        .max(500)
        .required()
        .messages({
          'string.max': 'Cancellation reason cannot exceed 500 characters',
          'any.required': 'Cancellation reason is required'
        }),

      refundAmount: Joi.number()
        .positive()
        .precision(2)
        .optional()
        .messages({
          'number.positive': 'Refund amount must be positive',
          'number.precision': 'Refund amount can have maximum 2 decimal places'
        }),

      refundMethod: Joi.string()
        .valid('original_payment', 'store_credit', 'gift_card', 'other')
        .when('refundAmount', {
          is: Joi.exist(),
          then: Joi.required(),
          otherwise: Joi.optional()
        })
        .messages({
          'any.only': 'Invalid refund method selected',
          'any.required': 'Refund method is required when refund amount is specified'
        }),

      notes: Joi.string().max(500).optional()
    })
  }),

  /**
   * Get customer orders validation schema
   */
  getCustomerOrders: Joi.object({
    params: Joi.object({
      customerId: Joi.string()
        .min(UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH)
        .max(UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH)
        .required()
        .messages({
          'string.min': `Customer ID must be at least ${UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH} characters long`,
          'string.max': `Customer ID cannot exceed ${UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH} characters`,
          'any.required': 'Customer ID is required'
        })
    }),

    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20),
      status: Joi.string()
        .valid('pending', 'confirmed', 'processing', 'ready', 'shipped', 'delivered', 'cancelled', 'refunded', 'all')
        .default('all'),
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().optional(),
      sortBy: Joi.string()
        .valid('createdAt', 'updatedAt', 'totalAmount', 'status')
        .default('createdAt'),
      sortOrder: Joi.string().valid('asc', 'desc').default('desc')
    })
  }),

  /**
   * Get orders by status validation schema
   */
  getOrdersByStatus: Joi.object({
    params: Joi.object({
      status: Joi.string()
        .valid('pending', 'confirmed', 'processing', 'ready', 'shipped', 'delivered', 'cancelled', 'refunded')
        .required()
        .messages({
          'any.only': 'Invalid order status',
          'any.required': 'Order status is required'
        })
    }),

    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20),
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().optional(),
      sortBy: Joi.string()
        .valid('createdAt', 'updatedAt', 'totalAmount', 'customerName')
        .default('createdAt'),
      sortOrder: Joi.string().valid('asc', 'desc').default('desc')
    })
  }),

  /**
   * Get orders by date range validation schema
   */
  getOrdersByDateRange: Joi.object({
    query: Joi.object({
      startDate: Joi.date()
        .iso()
        .required()
        .messages({
          'date.format': 'Start date must be in ISO format (YYYY-MM-DD)',
          'any.required': 'Start date is required'
        }),

      endDate: Joi.date()
        .iso()
        .min(Joi.ref('startDate'))
        .required()
        .messages({
          'date.format': 'End date must be in ISO format (YYYY-MM-DD)',
          'date.min': 'End date must be after start date',
          'any.required': 'End date is required'
        }),

      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20),
      status: Joi.string()
        .valid('pending', 'confirmed', 'processing', 'ready', 'shipped', 'delivered', 'cancelled', 'refunded', 'all')
        .default('all'),
      paymentMethod: Joi.string()
        .valid('cash', 'credit_card', 'debit_card', 'insurance', 'check', 'mobile_payment', 'other', 'all')
        .default('all'),
      sortBy: Joi.string()
        .valid('createdAt', 'updatedAt', 'totalAmount', 'customerName')
        .default('createdAt'),
      sortOrder: Joi.string().valid('asc', 'desc').default('desc')
    })
  }),

  /**
   * Search orders validation schema
   */
  searchOrders: Joi.object({
    query: Joi.object({
      q: Joi.string()
        .min(2)
        .max(200)
        .required()
        .messages({
          'string.min': 'Search query must be at least 2 characters long',
          'string.max': 'Search query cannot exceed 200 characters',
          'any.required': 'Search query is required'
        }),

      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20),
      status: Joi.string()
        .valid('pending', 'confirmed', 'processing', 'ready', 'shipped', 'delivered', 'cancelled', 'refunded', 'all')
        .default('all'),
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().optional(),
      sortBy: Joi.string()
        .valid('relevance', 'createdAt', 'updatedAt', 'totalAmount')
        .default('relevance'),
      sortOrder: Joi.string().valid('asc', 'desc').default('desc')
    })
  }),

  /**
   * Get sales statistics validation schema
   */
  getSalesStats: Joi.object({
    query: Joi.object({
      period: Joi.string()
        .valid('day', 'week', 'month', 'quarter', 'year', 'custom')
        .default('month'),
      startDate: Joi.date()
        .iso()
        .when('period', {
          is: 'custom',
          then: Joi.required(),
          otherwise: Joi.optional()
        })
        .messages({
          'date.format': 'Start date must be in ISO format (YYYY-MM-DD)',
          'any.required': 'Start date is required for custom period'
        }),

      endDate: Joi.date()
        .iso()
        .min(Joi.ref('startDate'))
        .when('period', {
          is: 'custom',
          then: Joi.required(),
          otherwise: Joi.optional()
        })
        .messages({
          'date.format': 'End date must be in ISO format (YYYY-MM-DD)',
          'date.min': 'End date must be after start date',
          'any.required': 'End date is required for custom period'
        }),

      groupBy: Joi.string()
        .valid('day', 'week', 'month', 'quarter', 'year', 'category', 'payment_method', 'delivery_method')
        .default('day'),
      includeDetails: Joi.boolean().default(false),
      currency: Joi.string().max(3).default('USD')
    })
  }),

  /**
   * Process refund validation schema
   */
  processRefund: Joi.object({
    params: Joi.object({
      orderId: Joi.string()
        .min(UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH)
        .max(UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH)
        .required()
        .messages({
          'string.min': `Order ID must be at least ${UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH} characters long`,
          'string.max': `Order ID cannot exceed ${UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH} characters`,
          'any.required': 'Order ID is required'
        })
    }),

    body: Joi.object({
      refundAmount: Joi.number()
        .positive()
        .precision(2)
        .required()
        .messages({
          'number.positive': 'Refund amount must be positive',
          'number.precision': 'Refund amount can have maximum 2 decimal places',
          'any.required': 'Refund amount is required'
        }),

      refundMethod: Joi.string()
        .valid('original_payment', 'store_credit', 'gift_card', 'other')
        .required()
        .messages({
          'any.only': 'Invalid refund method selected',
          'any.required': 'Refund method is required'
        }),

      reason: Joi.string()
        .max(500)
        .required()
        .messages({
          'string.max': 'Refund reason cannot exceed 500 characters',
          'any.required': 'Refund reason is required'
        }),

      partialRefund: Joi.boolean().default(false),
      itemsToRefund: Joi.array()
        .items(
          Joi.object({
            itemId: Joi.string()
              .min(UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH)
              .max(UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH)
              .required(),
            quantity: Joi.number().integer().positive().required(),
            reason: Joi.string().max(200).optional()
          })
        )
        .when('partialRefund', {
          is: true,
          then: Joi.required(),
          otherwise: Joi.optional()
        })
        .messages({
          'any.required': 'Items to refund are required for partial refunds'
        }),

      notes: Joi.string().max(500).optional(),
      processedBy: Joi.string()
        .min(UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH)
        .max(UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH)
        .required()
        .messages({
          'string.min': `Processor ID must be at least ${UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH} characters long`,
          'string.max': `Processor ID cannot exceed ${UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH} characters`,
          'any.required': 'Processor ID is required'
        })
    })
  })
};

export default salesValidation;
