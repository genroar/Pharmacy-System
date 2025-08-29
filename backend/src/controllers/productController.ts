import { Response, NextFunction } from 'express';
import { prisma } from '@/database';
import { logger } from '@/utils/logger';
import { 
  CreateMedicineRequest, 
  UpdateMedicineRequest, 
  GetMedicineRequest,
  SearchMedicineRequest,
  ControllerResponse,
  PaginatedControllerResponse
} from './types';
import { 
  IMedicineCreate, 
  IMedicineUpdate, 
  validateMedicineData,
  buildSearchQuery,
  buildPaginationQuery,
  createSearchResult
} from '@/models';

// Create new medicine
export const createMedicine = async (
  req: CreateMedicineRequest,
  res: Response<ControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const medicineData = req.body;

    // Validate medicine data
    const validation = validateMedicineData(medicineData);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: 'Medicine data validation failed',
        error: 'VALIDATION_FAILED',
        data: validation.errors,
        statusCode: 400
      });
      return;
    }

    // Check if medicine with same SKU already exists
    const existingMedicine = await prisma.medicine.findUnique({
      where: { sku: medicineData.sku }
    });

    if (existingMedicine) {
      res.status(409).json({
        success: false,
        message: 'Medicine with this SKU already exists',
        error: 'SKU_ALREADY_EXISTS',
        statusCode: 409
      });
      return;
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: medicineData.categoryId }
    });

    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Category not found',
        error: 'CATEGORY_NOT_FOUND',
        statusCode: 404
      });
      return;
    }

    // Check if supplier exists
    const supplier = await prisma.supplier.findUnique({
      where: { id: medicineData.supplierId }
    });

    if (!supplier) {
      res.status(404).json({
        success: false,
        message: 'Supplier not found',
        error: 'SUPPLIER_NOT_FOUND',
        statusCode: 404
      });
      return;
    }

    // Create medicine
    const medicine = await prisma.medicine.create({
      data: {
        ...medicineData,
        expiryDate: new Date(medicineData.expiryDate),
        activeIngredients: medicineData.activeIngredients,
        sideEffects: medicineData.sideEffects || [],
        contraindications: medicineData.contraindications || [],
        interactions: medicineData.interactions || [],
        tags: medicineData.tags || []
      },
      include: {
        category: true,
        supplier: true
      }
    });

    logger.info(`Medicine created successfully: ${medicine.name}`);

    res.status(201).json({
      success: true,
      message: 'Medicine created successfully',
      data: medicine,
      statusCode: 201
    });

  } catch (error) {
    logger.error('Create medicine error:', error);
    next(error);
  }
};

// Get medicine by ID
export const getMedicineById = async (
  req: GetMedicineRequest,
  res: Response<ControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const medicine = await prisma.medicine.findUnique({
      where: { id },
      include: {
        category: true,
        supplier: true,
        inventoryItems: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    if (!medicine) {
      res.status(404).json({
        success: false,
        message: 'Medicine not found',
        error: 'MEDICINE_NOT_FOUND',
        statusCode: 404
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Medicine retrieved successfully',
      data: medicine,
      statusCode: 200
    });

  } catch (error) {
    logger.error('Get medicine by ID error:', error);
    next(error);
  }
};

// Get all medicines with pagination and search
export const getMedicines = async (
  req: SearchMedicineRequest,
  res: Response<PaginatedControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { 
      page = '1', 
      limit = '20', 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      query,
      category,
      supplier,
      minPrice,
      maxPrice,
      inStock,
      prescriptionRequired,
      tags,
      dosageForm,
      schedule
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Build search query
    const searchQuery: any = {};
    
    if (query) {
      searchQuery.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { genericName: { contains: query, mode: 'insensitive' } },
        { brandName: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ];
    }

    if (category) {
      searchQuery.categoryId = category;
    }

    if (supplier) {
      searchQuery.supplierId = supplier;
    }

    if (minPrice || maxPrice) {
      searchQuery.price = {};
      if (minPrice) searchQuery.price.gte = parseFloat(minPrice);
      if (maxPrice) searchQuery.price.lte = parseFloat(maxPrice);
    }

    if (inStock !== undefined) {
      const inStockBool = inStock === 'true';
      searchQuery.inventoryItems = {
        some: {
          quantity: inStockBool ? { gt: 0 } : { lte: 0 }
        }
      };
    }

    if (prescriptionRequired !== undefined) {
      searchQuery.prescriptionRequired = prescriptionRequired === 'true';
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      searchQuery.tags = { hasSome: tagArray };
    }

    if (dosageForm) {
      searchQuery.dosageForm = dosageForm;
    }

    if (schedule) {
      searchQuery.schedule = schedule;
    }

    // Build pagination query
    const paginationQuery = buildPaginationQuery({
      page: pageNum,
      limit: limitNum,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    // Get total count
    const total = await prisma.medicine.count({ where: searchQuery });

    // Get medicines
    const medicines = await prisma.medicine.findMany({
      where: searchQuery,
      skip: paginationQuery.skip,
      take: paginationQuery.take,
      orderBy: paginationQuery.orderBy,
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        supplier: {
          select: {
            id: true,
            name: true
          }
        },
        inventoryItems: {
          select: {
            quantity: true,
            minQuantity: true,
            maxQuantity: true
          }
        }
      }
    });

    // Create search result
    const searchResult = createSearchResult(medicines, total, pageNum, limitNum);

    res.status(200).json({
      success: true,
      message: 'Medicines retrieved successfully',
      data: searchResult,
      statusCode: 200
    });

  } catch (error) {
    logger.error('Get medicines error:', error);
    next(error);
  }
};

// Update medicine
export const updateMedicine = async (
  req: UpdateMedicineRequest,
  res: Response<ControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: IMedicineUpdate = req.body;

    // Check if medicine exists
    const existingMedicine = await prisma.medicine.findUnique({
      where: { id }
    });

    if (!existingMedicine) {
      res.status(404).json({
        success: false,
        message: 'Medicine not found',
        error: 'MEDICINE_NOT_FOUND',
        statusCode: 404
      });
      return;
    }

    // Check if SKU is being changed and if it's already taken
    if (updateData.sku && updateData.sku !== existingMedicine.sku) {
      const skuExists = await prisma.medicine.findUnique({
        where: { sku: updateData.sku }
      });

      if (skuExists) {
        res.status(409).json({
          success: false,
          message: 'SKU is already taken by another medicine',
          error: 'SKU_ALREADY_TAKEN',
          statusCode: 409
        });
        return;
      }
    }

    // Check category if being updated
    if (updateData.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: updateData.categoryId }
      });

      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Category not found',
          error: 'CATEGORY_NOT_FOUND',
          statusCode: 404
        });
        return;
      }
    }

    // Check supplier if being updated
    if (updateData.supplierId) {
      const supplier = await prisma.supplier.findUnique({
        where: { id: updateData.supplierId }
      });

      if (!supplier) {
        res.status(404).json({
          success: false,
          message: 'Supplier not found',
          error: 'SUPPLIER_NOT_FOUND',
          statusCode: 404
        });
        return;
      }
    }

    // Prepare update data
    const dataToUpdate: any = { ...updateData };
    
    if (updateData.expiryDate) {
      dataToUpdate.expiryDate = new Date(updateData.expiryDate);
    }

    // Update medicine
    const updatedMedicine = await prisma.medicine.update({
      where: { id },
      data: dataToUpdate,
      include: {
        category: true,
        supplier: true
      }
    });

    logger.info(`Medicine updated successfully: ${updatedMedicine.name}`);

    res.status(200).json({
      success: true,
      message: 'Medicine updated successfully',
      data: updatedMedicine,
      statusCode: 200
    });

  } catch (error) {
    logger.error('Update medicine error:', error);
    next(error);
  }
};

// Delete medicine (soft delete)
export const deleteMedicine = async (
  req: GetMedicineRequest,
  res: Response<ControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if medicine exists
    const existingMedicine = await prisma.medicine.findUnique({
      where: { id }
    });

    if (!existingMedicine) {
      res.status(404).json({
        success: false,
        message: 'Medicine not found',
        error: 'MEDICINE_NOT_FOUND',
        statusCode: 404
      });
      return;
    }

    // Check if medicine has active inventory
    const activeInventory = await prisma.inventoryItem.findFirst({
      where: {
        medicineId: id,
        quantity: { gt: 0 }
      }
    });

    if (activeInventory) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete medicine with active inventory',
        error: 'ACTIVE_INVENTORY_EXISTS',
        statusCode: 400
      });
      return;
    }

    // Soft delete medicine
    await prisma.medicine.update({
      where: { id },
      data: { isActive: false }
    });

    logger.info(`Medicine deleted successfully: ${existingMedicine.name}`);

    res.status(200).json({
      success: true,
      message: 'Medicine deleted successfully',
      statusCode: 200
    });

  } catch (error) {
    logger.error('Delete medicine error:', error);
    next(error);
  }
};

// Get medicine statistics
export const getMedicineStats = async (
  req: GetMedicineRequest,
  res: Response<ControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if medicine exists
    const medicine = await prisma.medicine.findUnique({
      where: { id },
      include: {
        inventoryItems: true,
        reviews: true,
        category: true,
        supplier: true
      }
    });

    if (!medicine) {
      res.status(404).json({
        success: false,
        message: 'Medicine not found',
        error: 'MEDICINE_NOT_FOUND',
        statusCode: 404
      });
      return;
    }

    // Calculate inventory statistics
    const totalQuantity = medicine.inventoryItems.reduce((sum, item) => sum + item.quantity, 0);
    const avgRating = medicine.reviews.length > 0 
      ? medicine.reviews.reduce((sum, review) => sum + review.rating, 0) / medicine.reviews.length
      : 0;

    // Get recent sales (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSales = await prisma.orderItem.count({
      where: {
        medicineId: id,
        order: {
          createdAt: { gte: thirtyDaysAgo },
          status: 'DELIVERED'
        }
      }
    });

    const stats = {
      medicine: {
        id: medicine.id,
        name: medicine.name,
        genericName: medicine.genericName,
        brandName: medicine.brandName,
        category: medicine.category.name,
        supplier: medicine.supplier.name
      },
      inventory: {
        totalQuantity,
        lowStock: medicine.inventoryItems.some(item => item.quantity <= item.minQuantity),
        outOfStock: totalQuantity === 0
      },
      reviews: {
        total: medicine.reviews.length,
        averageRating: Math.round(avgRating * 100) / 100
      },
      sales: {
        recentSales
      }
    };

    res.status(200).json({
      success: true,
      message: 'Medicine statistics retrieved successfully',
      data: stats,
      statusCode: 200
    });

  } catch (error) {
    logger.error('Get medicine stats error:', error);
    next(error);
  }
};

// Get medicines by category
export const getMedicinesByCategory = async (
  req: SearchMedicineRequest,
  res: Response<PaginatedControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { category, page = '1', limit = '20' } = req.query;

    if (!category) {
      res.status(400).json({
        success: false,
        message: 'Category parameter is required',
        error: 'MISSING_CATEGORY_PARAMETER',
        statusCode: 400
      });
      return;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Find category by name or ID
    const categoryRecord = await prisma.category.findFirst({
      where: {
        OR: [
          { id: category },
          { name: { contains: category, mode: 'insensitive' } }
        ]
      }
    });

    if (!categoryRecord) {
      res.status(404).json({
        success: false,
        message: 'Category not found',
        error: 'CATEGORY_NOT_FOUND',
        statusCode: 404
      });
      return;
    }

    // Get total count
    const total = await prisma.medicine.count({
      where: { categoryId: categoryRecord.id }
    });

    // Get medicines by category
    const medicines = await prisma.medicine.findMany({
      where: { categoryId: categoryRecord.id },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      orderBy: { name: 'asc' },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        supplier: {
          select: {
            id: true,
            name: true
          }
        },
        inventoryItems: {
          select: {
            quantity: true,
            minQuantity: true,
            maxQuantity: true
          }
        }
      }
    });

    // Create search result
    const searchResult = createSearchResult(medicines, total, pageNum, limitNum);

    res.status(200).json({
      success: true,
      message: `Medicines in category '${categoryRecord.name}' retrieved successfully`,
      data: searchResult,
      statusCode: 200
    });

  } catch (error) {
    logger.error('Get medicines by category error:', error);
    next(error);
  }
};

// Export all functions
export {
  createMedicine,
  getMedicineById,
  getMedicines,
  updateMedicine,
  deleteMedicine,
  getMedicineStats,
  getMedicinesByCategory
};
