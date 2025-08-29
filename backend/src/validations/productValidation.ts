import Joi from 'joi';
import { UTILITY_CONSTANTS } from '@/utils';

/**
 * Product/Medicine validation schemas using Joi
 */
export const productValidation = {
  /**
   * Create medicine validation schema
   */
  createMedicine: Joi.object({
    body: Joi.object({
      name: Joi.string()
        .min(2)
        .max(200)
        .required()
        .messages({
          'string.min': 'Medicine name must be at least 2 characters long',
          'string.max': 'Medicine name cannot exceed 200 characters',
          'any.required': 'Medicine name is required'
        }),

      genericName: Joi.string()
        .min(2)
        .max(200)
        .optional()
        .messages({
          'string.min': 'Generic name must be at least 2 characters long',
          'string.max': 'Generic name cannot exceed 200 characters'
        }),

      brandName: Joi.string()
        .min(2)
        .max(200)
        .optional()
        .messages({
          'string.min': 'Brand name must be at least 2 characters long',
          'string.max': 'Brand name cannot exceed 200 characters'
        }),

      category: Joi.string()
        .valid(
          'antibiotics',
          'analgesics',
          'antihistamines',
          'antihypertensives',
          'antidiabetics',
          'antidepressants',
          'antipsychotics',
          'bronchodilators',
          'corticosteroids',
          'diuretics',
          'gastrointestinal',
          'hormones',
          'immunosuppressants',
          'muscle_relaxants',
          'narcotics',
          'sedatives',
          'vitamins',
          'supplements',
          'other'
        )
        .required()
        .messages({
          'any.only': 'Invalid medicine category selected',
          'any.required': 'Medicine category is required'
        }),

      subcategory: Joi.string()
        .max(100)
        .optional()
        .messages({
          'string.max': 'Subcategory cannot exceed 100 characters'
        }),

      strength: Joi.string()
        .max(50)
        .required()
        .messages({
          'string.max': 'Strength cannot exceed 50 characters',
          'any.required': 'Medicine strength is required'
        }),

      dosageForm: Joi.string()
        .valid(
          'tablet',
          'capsule',
          'liquid',
          'injection',
          'cream',
          'ointment',
          'gel',
          'suppository',
          'inhaler',
          'drops',
          'spray',
          'patch',
          'powder',
          'suspension',
          'syrup',
          'other'
        )
        .required()
        .messages({
          'any.only': 'Invalid dosage form selected',
          'any.required': 'Dosage form is required'
        }),

      manufacturer: Joi.string()
        .min(2)
        .max(200)
        .required()
        .messages({
          'string.min': 'Manufacturer name must be at least 2 characters long',
          'string.max': 'Manufacturer name cannot exceed 200 characters',
          'any.required': 'Manufacturer is required'
        }),

      supplier: Joi.string()
        .min(UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH)
        .max(UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH)
        .required()
        .messages({
          'string.min': `Supplier ID must be at least ${UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH} characters long`,
          'string.max': `Supplier ID cannot exceed ${UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH} characters`,
          'any.required': 'Supplier is required'
        }),

      description: Joi.string()
        .max(1000)
        .optional()
        .messages({
          'string.max': 'Description cannot exceed 1000 characters'
        }),

      activeIngredients: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().max(100).required(),
            strength: Joi.string().max(50).required(),
            unit: Joi.string().max(20).required()
          })
        )
        .min(1)
        .max(10)
        .optional()
        .messages({
          'array.min': 'At least one active ingredient is required',
          'array.max': 'Cannot exceed 10 active ingredients'
        }),

      inactiveIngredients: Joi.array()
        .items(Joi.string().max(100))
        .max(20)
        .optional()
        .messages({
          'array.max': 'Cannot exceed 20 inactive ingredients'
        }),

      indications: Joi.array()
        .items(Joi.string().max(200))
        .max(20)
        .optional()
        .messages({
          'array.max': 'Cannot exceed 20 indications'
        }),

      contraindications: Joi.array()
        .items(Joi.string().max(200))
        .max(20)
        .optional()
        .messages({
          'array.max': 'Cannot exceed 20 contraindications'
        }),

      sideEffects: Joi.array()
        .items(Joi.string().max(200))
        .max(20)
        .optional()
        .messages({
          'array.max': 'Cannot exceed 20 side effects'
        }),

      drugInteractions: Joi.array()
        .items(Joi.string().max(200))
        .max(20)
        .optional()
        .messages({
          'array.max': 'Cannot exceed 20 drug interactions'
        }),

      pregnancyCategory: Joi.string()
        .valid('A', 'B', 'C', 'D', 'X', 'N')
        .optional()
        .messages({
          'any.only': 'Invalid pregnancy category'
        }),

      lactationCategory: Joi.string()
        .valid('safe', 'caution', 'avoid', 'unknown')
        .optional()
        .messages({
          'any.only': 'Invalid lactation category'
        }),

      pediatricUse: Joi.string()
        .valid('safe', 'caution', 'avoid', 'consult_physician', 'unknown')
        .optional()
        .messages({
          'any.only': 'Invalid pediatric use category'
        }),

      geriatricUse: Joi.string()
        .valid('safe', 'caution', 'avoid', 'consult_physician', 'unknown')
        .optional()
        .messages({
          'any.only': 'Invalid geriatric use category'
        }),

      renalImpairment: Joi.string()
        .valid('no_adjustment', 'reduce_dose', 'avoid', 'consult_physician', 'unknown')
        .optional()
        .messages({
          'any.only': 'Invalid renal impairment category'
        }),

      hepaticImpairment: Joi.string()
        .valid('no_adjustment', 'reduce_dose', 'avoid', 'consult_physician', 'unknown')
        .optional()
        .messages({
          'any.only': 'Invalid hepatic impairment category'
        }),

      storageConditions: Joi.object({
        temperature: Joi.string()
          .valid('room_temp', 'refrigerated', 'frozen', 'controlled_room_temp')
          .default('room_temp'),
        humidity: Joi.string()
          .valid('low', 'moderate', 'high', 'any')
          .default('any'),
        light: Joi.string()
          .valid('protected', 'unprotected', 'any')
          .default('any'),
        specialInstructions: Joi.string().max(500).optional()
      }).default(),

      packaging: Joi.object({
        type: Joi.string()
          .valid('bottle', 'blister', 'strip', 'vial', 'ampoule', 'tube', 'other')
          .required(),
        quantity: Joi.number().integer().positive().required(),
        unit: Joi.string()
          .valid('tablets', 'capsules', 'ml', 'mg', 'g', 'units', 'other')
          .required(),
        size: Joi.string().max(50).optional()
      }).required(),

      pricing: Joi.object({
        costPrice: Joi.number().positive().precision(2).required(),
        sellingPrice: Joi.number().positive().precision(2).required(),
        markup: Joi.number().positive().precision(2).optional(),
        discount: Joi.number().min(0).max(100).precision(2).default(0),
        taxRate: Joi.number().min(0).max(100).precision(2).default(0),
        insuranceCoverage: Joi.boolean().default(false),
        insuranceCode: Joi.string().max(50).optional()
      }).required(),

      prescriptionRequired: Joi.boolean().default(true),
      controlledSubstance: Joi.boolean().default(false),
      controlledSubstanceSchedule: Joi.string()
        .valid('I', 'II', 'III', 'IV', 'V')
        .when('controlledSubstance', {
          is: true,
          then: Joi.required(),
          otherwise: Joi.optional()
        })
        .messages({
          'any.only': 'Invalid controlled substance schedule',
          'any.required': 'Controlled substance schedule is required for controlled substances'
        }),

      otc: Joi.boolean().default(false),
      homeopathic: Joi.boolean().default(false),
      herbal: Joi.boolean().default(false),
      generic: Joi.boolean().default(false),

      barcode: Joi.string().max(100).optional(),
      ndc: Joi.string()
        .pattern(/^\d{5}-\d{4}-\d{2}$/)
        .optional()
        .messages({
          'string.pattern.base': 'NDC must be in format: XXXXX-XXXX-XX'
        }),

      fdaApproval: Joi.boolean().default(false),
      fdaApprovalDate: Joi.date()
        .max('now')
        .iso()
        .when('fdaApproval', {
          is: true,
          then: Joi.required(),
          otherwise: Joi.optional()
        })
        .messages({
          'date.max': 'FDA approval date cannot be in the future',
          'date.format': 'FDA approval date must be in ISO format (YYYY-MM-DD)',
          'any.required': 'FDA approval date is required for FDA approved medicines'
        }),

      expiryDate: Joi.date()
        .min('now')
        .iso()
        .optional()
        .messages({
          'date.min': 'Expiry date must be in the future',
          'date.format': 'Expiry date must be in ISO format (YYYY-MM-DD)'
        }),

      batchNumber: Joi.string().max(50).optional(),
      lotNumber: Joi.string().max(50).optional(),

      images: Joi.array()
        .items(
          Joi.object({
            url: Joi.string().uri().max(500).required(),
            alt: Joi.string().max(200).optional(),
            primary: Joi.boolean().default(false)
          })
        )
        .max(10)
        .optional()
        .messages({
          'array.max': 'Cannot exceed 10 images'
        }),

      documents: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().max(200).required(),
            url: Joi.string().uri().max(500).required(),
            type: Joi.string()
              .valid('prescribing_info', 'patient_info', 'safety_data', 'other')
              .required()
          })
        )
        .max(20)
        .optional()
        .messages({
          'array.max': 'Cannot exceed 20 documents'
        }),

      tags: Joi.array()
        .items(Joi.string().max(50))
        .max(20)
        .optional()
        .messages({
          'array.max': 'Cannot exceed 20 tags'
        }),

      isActive: Joi.boolean().default(true),
      requiresRefrigeration: Joi.boolean().default(false),
      requiresSpecialHandling: Joi.boolean().default(false),
      specialHandlingInstructions: Joi.string().max(500).optional()
    })
  }),

  /**
   * Update medicine validation schema
   */
  updateMedicine: Joi.object({
    params: Joi.object({
      medicineId: Joi.string()
        .min(UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH)
        .max(UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH)
        .required()
        .messages({
          'string.min': `Medicine ID must be at least ${UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH} characters long`,
          'string.max': `Medicine ID cannot exceed ${UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH} characters`,
          'any.required': 'Medicine ID is required'
        })
    }),

    body: Joi.object({
      name: Joi.string()
        .min(2)
        .max(200)
        .optional()
        .messages({
          'string.min': 'Medicine name must be at least 2 characters long',
          'string.max': 'Medicine name cannot exceed 200 characters'
        }),

      genericName: Joi.string()
        .min(2)
        .max(200)
        .optional()
        .messages({
          'string.min': 'Generic name must be at least 2 characters long',
          'string.max': 'Generic name cannot exceed 200 characters'
        }),

      brandName: Joi.string()
        .min(2)
        .max(200)
        .optional()
        .messages({
          'string.min': 'Brand name must be at least 2 characters long',
          'string.max': 'Brand name cannot exceed 200 characters'
        }),

      category: Joi.string()
        .valid(
          'antibiotics',
          'analgesics',
          'antihistamines',
          'antihypertensives',
          'antidiabetics',
          'antidepressants',
          'antipsychotics',
          'bronchodilators',
          'corticosteroids',
          'diuretics',
          'gastrointestinal',
          'hormones',
          'immunosuppressants',
          'muscle_relaxants',
          'narcotics',
          'sedatives',
          'vitamins',
          'supplements',
          'other'
        )
        .optional()
        .messages({
          'any.only': 'Invalid medicine category selected'
        }),

      subcategory: Joi.string()
        .max(100)
        .optional()
        .messages({
          'string.max': 'Subcategory cannot exceed 100 characters'
        }),

      strength: Joi.string()
        .max(50)
        .optional()
        .messages({
          'string.max': 'Strength cannot exceed 50 characters'
        }),

      dosageForm: Joi.string()
        .valid(
          'tablet',
          'capsule',
          'liquid',
          'injection',
          'cream',
          'ointment',
          'gel',
          'suppository',
          'inhaler',
          'drops',
          'spray',
          'patch',
          'powder',
          'suspension',
          'syrup',
          'other'
        )
        .optional()
        .messages({
          'any.only': 'Invalid dosage form selected'
        }),

      manufacturer: Joi.string()
        .min(2)
        .max(200)
        .optional()
        .messages({
          'string.min': 'Manufacturer name must be at least 2 characters long',
          'string.max': 'Manufacturer name cannot exceed 200 characters'
        }),

      supplier: Joi.string()
        .min(UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH)
        .max(UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH)
        .optional()
        .messages({
          'string.min': `Supplier ID must be at least ${UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH} characters long`,
          'string.max': `Supplier ID cannot exceed ${UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH} characters`
        }),

      description: Joi.string()
        .max(1000)
        .optional()
        .messages({
          'string.max': 'Description cannot exceed 1000 characters'
        }),

      activeIngredients: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().max(100).required(),
            strength: Joi.string().max(50).required(),
            unit: Joi.string().max(20).required()
          })
        )
        .min(1)
        .max(10)
        .optional()
        .messages({
          'array.min': 'At least one active ingredient is required',
          'array.max': 'Cannot exceed 10 active ingredients'
        }),

      inactiveIngredients: Joi.array()
        .items(Joi.string().max(100))
        .max(20)
        .optional()
        .messages({
          'array.max': 'Cannot exceed 20 inactive ingredients'
        }),

      indications: Joi.array()
        .items(Joi.string().max(200))
        .max(20)
        .optional()
        .messages({
          'array.max': 'Cannot exceed 20 indications'
        }),

      contraindications: Joi.array()
        .items(Joi.string().max(200))
        .max(20)
        .optional()
        .messages({
          'array.max': 'Cannot exceed 20 contraindications'
        }),

      sideEffects: Joi.array()
        .items(Joi.string().max(200))
        .max(20)
        .optional()
        .messages({
          'array.max': 'Cannot exceed 20 side effects'
        }),

      drugInteractions: Joi.array()
        .items(Joi.string().max(200))
        .max(20)
        .optional()
        .messages({
          'array.max': 'Cannot exceed 20 drug interactions'
        }),

      pregnancyCategory: Joi.string()
        .valid('A', 'B', 'C', 'D', 'X', 'N')
        .optional()
        .messages({
          'any.only': 'Invalid pregnancy category'
        }),

      lactationCategory: Joi.string()
        .valid('safe', 'caution', 'avoid', 'unknown')
        .optional()
        .messages({
          'any.only': 'Invalid lactation category'
        }),

      pediatricUse: Joi.string()
        .valid('safe', 'caution', 'avoid', 'consult_physician', 'unknown')
        .optional()
        .messages({
          'any.only': 'Invalid pediatric use category'
        }),

      geriatricUse: Joi.string()
        .valid('safe', 'caution', 'avoid', 'consult_physician', 'unknown')
        .optional()
        .messages({
          'any.only': 'Invalid geriatric use category'
        }),

      renalImpairment: Joi.string()
        .valid('no_adjustment', 'reduce_dose', 'avoid', 'consult_physician', 'unknown')
        .optional()
        .messages({
          'any.only': 'Invalid renal impairment category'
        }),

      hepaticImpairment: Joi.string()
        .valid('no_adjustment', 'reduce_dose', 'avoid', 'consult_physician', 'unknown')
        .optional()
        .messages({
          'any.only': 'Invalid hepatic impairment category'
        }),

      storageConditions: Joi.object({
        temperature: Joi.string()
          .valid('room_temp', 'refrigerated', 'frozen', 'controlled_room_temp')
          .optional(),
        humidity: Joi.string()
          .valid('low', 'moderate', 'high', 'any')
          .optional(),
        light: Joi.string()
          .valid('protected', 'unprotected', 'any')
          .optional(),
        specialInstructions: Joi.string().max(500).optional()
      }).optional(),

      packaging: Joi.object({
        type: Joi.string()
          .valid('bottle', 'blister', 'strip', 'vial', 'ampoule', 'tube', 'other')
          .optional(),
        quantity: Joi.number().integer().positive().optional(),
        unit: Joi.string()
          .valid('tablets', 'capsules', 'ml', 'mg', 'g', 'units', 'other')
          .optional(),
        size: Joi.string().max(50).optional()
      }).optional(),

      pricing: Joi.object({
        costPrice: Joi.number().positive().precision(2).optional(),
        sellingPrice: Joi.number().positive().precision(2).optional(),
        markup: Joi.number().positive().precision(2).optional(),
        discount: Joi.number().min(0).max(100).precision(2).optional(),
        taxRate: Joi.number().min(0).max(100).precision(2).optional(),
        insuranceCoverage: Joi.boolean().optional(),
        insuranceCode: Joi.string().max(50).optional()
      }).optional(),

      prescriptionRequired: Joi.boolean().optional(),
      controlledSubstance: Joi.boolean().optional(),
      controlledSubstanceSchedule: Joi.string()
        .valid('I', 'II', 'III', 'IV', 'V')
        .when('controlledSubstance', {
          is: true,
          then: Joi.required(),
          otherwise: Joi.optional()
        })
        .messages({
          'any.only': 'Invalid controlled substance schedule',
          'any.required': 'Controlled substance schedule is required for controlled substances'
        }),

      otc: Joi.boolean().optional(),
      homeopathic: Joi.boolean().optional(),
      herbal: Joi.boolean().optional(),
      generic: Joi.boolean().optional(),

      barcode: Joi.string().max(100).optional(),
      ndc: Joi.string()
        .pattern(/^\d{5}-\d{4}-\d{2}$/)
        .optional()
        .messages({
          'string.pattern.base': 'NDC must be in format: XXXXX-XXXX-XX'
        }),

      fdaApproval: Joi.boolean().optional(),
      fdaApprovalDate: Joi.date()
        .max('now')
        .iso()
        .when('fdaApproval', {
          is: true,
          then: Joi.required(),
          otherwise: Joi.optional()
        })
        .messages({
          'date.max': 'FDA approval date cannot be in the future',
          'date.format': 'FDA approval date must be in ISO format (YYYY-MM-DD)',
          'any.required': 'FDA approval date is required for FDA approved medicines'
        }),

      expiryDate: Joi.date()
        .min('now')
        .iso()
        .optional()
        .messages({
          'date.min': 'Expiry date must be in the future',
          'date.format': 'Expiry date must be in ISO format (YYYY-MM-DD)'
        }),

      batchNumber: Joi.string().max(50).optional(),
      lotNumber: Joi.string().max(50).optional(),

      images: Joi.array()
        .items(
          Joi.object({
            url: Joi.string().uri().max(500).required(),
            alt: Joi.string().max(200).optional(),
            primary: Joi.boolean().default(false)
          })
        )
        .max(10)
        .optional()
        .messages({
          'array.max': 'Cannot exceed 10 images'
        }),

      documents: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().max(200).required(),
            url: Joi.string().uri().max(500).required(),
            type: Joi.string()
              .valid('prescribing_info', 'patient_info', 'safety_data', 'other')
              .required()
          })
        )
        .max(20)
        .optional()
        .messages({
          'array.max': 'Cannot exceed 20 documents'
        }),

      tags: Joi.array()
        .items(Joi.string().max(50))
        .max(20)
        .optional()
        .messages({
          'array.max': 'Cannot exceed 20 tags'
        }),

      isActive: Joi.boolean().optional(),
      requiresRefrigeration: Joi.boolean().optional(),
      requiresSpecialHandling: Joi.boolean().optional(),
      specialHandlingInstructions: Joi.string().max(500).optional()
    })
  }),

  /**
   * Get medicines query validation schema
   */
  getMedicines: Joi.object({
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20),
      search: Joi.string().max(100).optional(),
      category: Joi.string().max(100).optional(),
      manufacturer: Joi.string().max(200).optional(),
      dosageForm: Joi.string().max(50).optional(),
      prescriptionRequired: Joi.boolean().optional(),
      controlledSubstance: Joi.boolean().optional(),
      otc: Joi.boolean().optional(),
      generic: Joi.boolean().optional(),
      isActive: Joi.boolean().optional(),
      minPrice: Joi.number().positive().precision(2).optional(),
      maxPrice: Joi.number().positive().precision(2).optional(),
      inStock: Joi.boolean().optional(),
      expiringSoon: Joi.boolean().optional(),
      sortBy: Joi.string()
        .valid('name', 'price', 'createdAt', 'updatedAt', 'expiryDate')
        .default('name'),
      sortOrder: Joi.string().valid('asc', 'desc').default('asc')
    })
  }),

  /**
   * Get medicine by ID validation schema
   */
  getMedicineById: Joi.object({
    params: Joi.object({
      medicineId: Joi.string()
        .min(UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH)
        .max(UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH)
        .required()
        .messages({
          'string.min': `Medicine ID must be at least ${UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH} characters long`,
          'string.max': `Medicine ID cannot exceed ${UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH} characters`,
          'any.required': 'Medicine ID is required'
        })
    })
  }),

  /**
   * Delete medicine validation schema
   */
  deleteMedicine: Joi.object({
    params: Joi.object({
      medicineId: Joi.string()
        .min(UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH)
        .max(UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH)
        .required()
        .messages({
          'string.min': `Medicine ID must be at least ${UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH} characters long`,
          'string.max': `Medicine ID cannot exceed ${UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH} characters`,
          'any.required': 'Medicine ID is required'
        })
    })
  }),

  /**
   * Get medicines by category validation schema
   */
  getMedicinesByCategory: Joi.object({
    params: Joi.object({
      category: Joi.string()
        .valid(
          'antibiotics',
          'analgesics',
          'antihistamines',
          'antihypertensives',
          'antidiabetics',
          'antidepressants',
          'antipsychotics',
          'bronchodilators',
          'corticosteroids',
          'diuretics',
          'gastrointestinal',
          'hormones',
          'immunosuppressants',
          'muscle_relaxants',
          'narcotics',
          'sedatives',
          'vitamins',
          'supplements',
          'other'
        )
        .required()
        .messages({
          'any.only': 'Invalid medicine category',
          'any.required': 'Category is required'
        })
    }),

    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20),
      search: Joi.string().max(100).optional(),
      manufacturer: Joi.string().max(200).optional(),
      dosageForm: Joi.string().max(50).optional(),
      prescriptionRequired: Joi.boolean().optional(),
      inStock: Joi.boolean().optional(),
      sortBy: Joi.string()
        .valid('name', 'price', 'createdAt', 'updatedAt')
        .default('name'),
      sortOrder: Joi.string().valid('asc', 'desc').default('asc')
    })
  }),

  /**
   * Search medicines validation schema
   */
  searchMedicines: Joi.object({
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
      category: Joi.string().max(100).optional(),
      manufacturer: Joi.string().max(200).optional(),
      dosageForm: Joi.string().max(50).optional(),
      prescriptionRequired: Joi.boolean().optional(),
      inStock: Joi.boolean().optional(),
      sortBy: Joi.string()
        .valid('relevance', 'name', 'price', 'createdAt')
        .default('relevance'),
      sortOrder: Joi.string().valid('asc', 'desc').default('desc')
    })
  }),

  /**
   * Get expiring medicines validation schema
   */
  getExpiringMedicines: Joi.object({
    params: Joi.object({
      days: Joi.number()
        .integer()
        .min(1)
        .max(365)
        .default(30)
        .messages({
          'number.min': 'Days must be at least 1',
          'number.max': 'Days cannot exceed 365'
        })
    }),

    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20),
      category: Joi.string().max(100).optional(),
      manufacturer: Joi.string().max(200).optional(),
      includeExpired: Joi.boolean().default(false),
      sortBy: Joi.string()
        .valid('expiryDate', 'name', 'quantity')
        .default('expiryDate'),
      sortOrder: Joi.string().valid('asc', 'desc').default('asc')
    })
  }),

  /**
   * Get low stock medicines validation schema
   */
  getLowStockMedicines: Joi.object({
    params: Joi.object({
      threshold: Joi.number()
        .integer()
        .min(1)
        .max(1000)
        .default(10)
        .messages({
          'number.min': 'Threshold must be at least 1',
          'number.max': 'Threshold cannot exceed 1000'
        })
    }),

    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20),
      category: Joi.string().max(100).optional(),
      manufacturer: Joi.string().max(200).optional(),
      includeOutOfStock: Joi.boolean().default(true),
      sortBy: Joi.string()
        .valid('quantity', 'name', 'lastRestocked')
        .default('quantity'),
      sortOrder: Joi.string().valid('asc', 'desc').default('asc')
    })
  }),

  /**
   * Get medicine statistics validation schema
   */
  getMedicineStats: Joi.object({
    params: Joi.object({
      medicineId: Joi.string()
        .min(UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH)
        .max(UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH)
        .required()
        .messages({
          'string.min': `Medicine ID must be at least ${UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH} characters long`,
          'string.max': `Medicine ID cannot exceed ${UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH} characters`,
          'any.required': 'Medicine ID is required'
        })
    }),

    query: Joi.object({
      period: Joi.string()
        .valid('day', 'week', 'month', 'quarter', 'year', 'all')
        .default('month'),
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().optional()
    })
  }),

  /**
   * Bulk update medicines validation schema
   */
  bulkUpdateMedicines: Joi.object({
    body: Joi.object({
      medicineIds: Joi.array()
        .items(
          Joi.string()
            .min(UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH)
            .max(UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH)
        )
        .min(1)
        .max(100)
        .required()
        .messages({
          'array.min': 'At least one medicine ID is required',
          'array.max': 'Cannot exceed 100 medicines at once'
        }),

      updates: Joi.object({
        category: Joi.string().max(100).optional(),
        manufacturer: Joi.string().max(200).optional(),
        supplier: Joi.string()
          .min(UTILITY_CONSTANTS.VALIDATION.MIN_UUID_LENGTH)
          .max(UTILITY_CONSTANTS.VALIDATION.MAX_UUID_LENGTH)
          .optional(),
        isActive: Joi.boolean().optional(),
        requiresRefrigeration: Joi.boolean().optional(),
        requiresSpecialHandling: Joi.boolean().optional(),
        tags: Joi.array().items(Joi.string().max(50)).max(20).optional()
      }).required()
    })
  }),

  /**
   * Import medicines validation schema
   */
  importMedicines: Joi.object({
    body: Joi.object({
      file: Joi.object({
        mimetype: Joi.string()
          .valid('text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
          .required()
          .messages({
            'any.only': 'File must be CSV or Excel format',
            'any.required': 'File is required'
          }),
        size: Joi.number()
          .max(10 * 1024 * 1024) // 10MB
          .required()
          .messages({
            'number.max': 'File size cannot exceed 10MB',
            'any.required': 'File size is required'
          })
      }).required(),

      options: Joi.object({
        updateExisting: Joi.boolean().default(false),
        skipDuplicates: Joi.boolean().default(true),
        validateData: Joi.boolean().default(true),
        categoryMapping: Joi.object().pattern(/.*/, Joi.string().max(100)).optional()
      }).optional()
    })
  })
};

export default productValidation;
