import { Response, NextFunction } from 'express';
import { prisma } from '@/database';
import { logger } from '@/utils/logger';
import { 
  CreateSupplierRequest, 
  UpdateSupplierRequest, 
  GetSupplierRequest,
  GetSuppliersRequest,
  ControllerResponse,
  PaginatedControllerResponse
} from './types';
import { 
  ISupplierCreate, 
  ISupplierUpdate, 
  validateEmail, 
  validatePhone,
  buildPaginationQuery,
  createSearchResult
} from '@/models';

// Create new supplier
export const createSupplier = async (
  req: CreateSupplierRequest,
  res: Response<ControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, phone, address, city, state, zipCode, country, type, paymentTerms } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !address || !city || !state || !zipCode || !country) {
      res.status(400).json({
        success: false,
        message: 'All required fields must be provided',
        error: 'MISSING_REQUIRED_FIELDS',
        statusCode: 400
      });
      return;
    }

    // Validate email format
    if (!validateEmail(email)) {
      res.status(400).json({
        success: false,
        message: 'Invalid email format',
        error: 'INVALID_EMAIL_FORMAT',
        statusCode: 400
      });
      return;
    }

    // Validate phone format
    if (!validatePhone(phone)) {
      res.status(400).json({
        success: false,
        message: 'Invalid phone format',
        error: 'INVALID_PHONE_FORMAT',
        statusCode: 400
      });
      return;
    }

    // Check if supplier with same email already exists
    const existingSupplier = await prisma.supplier.findUnique({
      where: { email }
    });

    if (existingSupplier) {
      res.status(409).json({
        success: false,
        message: 'Supplier with this email already exists',
        error: 'SUPPLIER_ALREADY_EXISTS',
        statusCode: 409
      });
      return;
    }

    // Create supplier
    const supplier = await prisma.supplier.create({
      data: {
        name,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        country,
        type: type || 'LOCAL_SUPPLIER',
        paymentTerms: paymentTerms || 'NET_30'
      }
    });

    logger.info(`Supplier created successfully: ${supplier.name}`);

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: supplier,
      statusCode: 201
    });

  } catch (error) {
    logger.error('Create supplier error:', error);
    next(error);
  }
};

// Get supplier by ID
export const getSupplierById = async (
  req: GetSupplierRequest,
  res: Response<ControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        medicines: {
          select: {
            id: true,
            name: true,
            genericName: true,
            brandName: true,
            price: true,
            isActive: true
          }
        },
        _count: {
          select: {
            medicines: true
          }
        }
      }
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

    res.status(200).json({
      success: true,
      message: 'Supplier retrieved successfully',
      data: supplier,
      statusCode: 200
    });

  } catch (error) {
    logger.error('Get supplier by ID error:', error);
    next(error);
  }
};

// Get all suppliers with pagination and search
export const getSuppliers = async (
  req: GetSuppliersRequest,
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
      type,
      country,
      city
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Build search query
    const searchQuery: any = {};
    
    if (query) {
      searchQuery.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } },
        { address: { contains: query, mode: 'insensitive' } }
      ];
    }

    if (type) {
      searchQuery.type = type;
    }

    if (country) {
      searchQuery.country = { contains: country, mode: 'insensitive' };
    }

    if (city) {
      searchQuery.city = { contains: city, mode: 'insensitive' };
    }

    // Build pagination query
    const paginationQuery = buildPaginationQuery({
      page: pageNum,
      limit: limitNum,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    // Get total count
    const total = await prisma.supplier.count({ where: searchQuery });

    // Get suppliers
    const suppliers = await prisma.supplier.findMany({
      where: searchQuery,
      skip: paginationQuery.skip,
      take: paginationQuery.take,
      orderBy: paginationQuery.orderBy,
      include: {
        _count: {
          select: {
            medicines: true
          }
        }
      }
    });

    // Create search result
    const searchResult = createSearchResult(suppliers, total, pageNum, limitNum);

    res.status(200).json({
      success: true,
      message: 'Suppliers retrieved successfully',
      data: searchResult,
      statusCode: 200
    });

  } catch (error) {
    logger.error('Get suppliers error:', error);
    next(error);
  }
};

// Update supplier
export const updateSupplier = async (
  req: UpdateSupplierRequest,
  res: Response<ControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: ISupplierUpdate = req.body;

    // Check if supplier exists
    const existingSupplier = await prisma.supplier.findUnique({
      where: { id }
    });

    if (!existingSupplier) {
      res.status(404).json({
        success: false,
        message: 'Supplier not found',
        error: 'SUPPLIER_NOT_FOUND',
        statusCode: 404
      });
      return;
    }

    // Validate email if provided
    if (updateData.email && !validateEmail(updateData.email)) {
      res.status(400).json({
        success: false,
        message: 'Invalid email format',
        error: 'INVALID_EMAIL_FORMAT',
        statusCode: 400
      });
      return;
    }

    // Validate phone if provided
    if (updateData.phone && !validatePhone(updateData.phone)) {
      res.status(400).json({
        success: false,
        message: 'Invalid phone format',
        error: 'INVALID_PHONE_FORMAT',
        statusCode: 400
      });
      return;
    }

    // Check if email is already taken by another supplier
    if (updateData.email && updateData.email !== existingSupplier.email) {
      const emailExists = await prisma.supplier.findUnique({
        where: { email: updateData.email }
      });

      if (emailExists) {
        res.status(409).json({
          success: false,
          message: 'Email is already taken by another supplier',
          error: 'EMAIL_ALREADY_TAKEN',
          statusCode: 409
        });
        return;
      }
    }

    // Update supplier
    const updatedSupplier = await prisma.supplier.update({
      where: { id },
      data: updateData
    });

    logger.info(`Supplier updated successfully: ${updatedSupplier.name}`);

    res.status(200).json({
      success: true,
      message: 'Supplier updated successfully',
      data: updatedSupplier,
      statusCode: 200
    });

  } catch (error) {
    logger.error('Update supplier error:', error);
    next(error);
  }
};

// Delete supplier (soft delete)
export const deleteSupplier = async (
  req: GetSupplierRequest,
  res: Response<ControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if supplier exists
    const existingSupplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        medicines: {
          where: { isActive: true },
          select: { id: true, name: true }
        }
      }
    });

    if (!existingSupplier) {
      res.status(404).json({
        success: false,
        message: 'Supplier not found',
        error: 'SUPPLIER_NOT_FOUND',
        statusCode: 404
      });
      return;
    }

    // Check if supplier has active medicines
    if (existingSupplier.medicines.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete supplier with active medicines',
        error: 'ACTIVE_MEDICINES_EXIST',
        data: existingSupplier.medicines,
        statusCode: 400
      });
      return;
    }

    // Soft delete supplier
    await prisma.supplier.update({
      where: { id },
      data: { isActive: false }
    });

    logger.info(`Supplier deleted successfully: ${existingSupplier.name}`);

    res.status(200).json({
      success: true,
      message: 'Supplier deleted successfully',
      statusCode: 200
    });

  } catch (error) {
    logger.error('Delete supplier error:', error);
    next(error);
  }
};

// Get supplier statistics
export const getSupplierStats = async (
  req: GetSupplierRequest,
  res: Response<ControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if supplier exists
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        medicines: {
          include: {
            inventoryItems: true,
            reviews: true
          }
        }
      }
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

    // Calculate statistics
    const totalMedicines = supplier.medicines.length;
    const activeMedicines = supplier.medicines.filter(m => m.isActive).length;
    const totalInventory = supplier.medicines.reduce((sum, medicine) => {
      return sum + medicine.inventoryItems.reduce((invSum, inv) => invSum + inv.quantity, 0);
    }, 0);

    // Calculate average rating
    const allReviews = supplier.medicines.flatMap(m => m.reviews);
    const avgRating = allReviews.length > 0 
      ? allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length
      : 0;

    // Get recent orders (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentOrders = await prisma.orderItem.count({
      where: {
        medicine: {
          supplierId: id
        },
        order: {
          createdAt: { gte: thirtyDaysAgo },
          status: 'DELIVERED'
        }
      }
    });

    const stats = {
      supplier: {
        id: supplier.id,
        name: supplier.name,
        email: supplier.email,
        type: supplier.type,
        country: supplier.country
      },
      medicines: {
        total: totalMedicines,
        active: activeMedicines,
        inactive: totalMedicines - activeMedicines
      },
      inventory: {
        totalQuantity: totalInventory,
        averagePerMedicine: totalMedicines > 0 ? totalInventory / totalMedicines : 0
      },
      reviews: {
        total: allReviews.length,
        averageRating: Math.round(avgRating * 100) / 100
      },
      orders: {
        recentOrders
      }
    };

    res.status(200).json({
      success: true,
      message: 'Supplier statistics retrieved successfully',
      data: stats,
      statusCode: 200
    });

  } catch (error) {
    logger.error('Get supplier stats error:', error);
    next(error);
  }
};

// Get suppliers by type
export const getSuppliersByType = async (
  req: GetSuppliersRequest,
  res: Response<PaginatedControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { type, page = '1', limit = '20' } = req.query;

    if (!type) {
      res.status(400).json({
        success: false,
        message: 'Supplier type is required',
        error: 'MISSING_SUPPLIER_TYPE',
        statusCode: 400
      });
      return;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Get total count
    const total = await prisma.supplier.count({
      where: { type }
    });

    // Get suppliers by type
    const suppliers = await prisma.supplier.findMany({
      where: { type },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            medicines: true
          }
        }
      }
    });

    // Create search result
    const searchResult = createSearchResult(suppliers, total, pageNum, limitNum);

    res.status(200).json({
      success: true,
      message: `Suppliers of type '${type}' retrieved successfully`,
      data: searchResult,
      statusCode: 200
    });

  } catch (error) {
    logger.error('Get suppliers by type error:', error);
    next(error);
  }
};

// Get suppliers by location
export const getSuppliersByLocation = async (
  req: GetSuppliersRequest,
  res: Response<PaginatedControllerResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { country, city, page = '1', limit = '20' } = req.query;

    if (!country && !city) {
      res.status(400).json({
        success: false,
        message: 'Either country or city must be provided',
        error: 'MISSING_LOCATION_PARAMETER',
        statusCode: 400
      });
      return;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Build location query
    const locationQuery: any = {};
    if (country) {
      locationQuery.country = { contains: country, mode: 'insensitive' };
    }
    if (city) {
      locationQuery.city = { contains: city, mode: 'insensitive' };
    }

    // Get total count
    const total = await prisma.supplier.count({
      where: locationQuery
    });

    // Get suppliers by location
    const suppliers = await prisma.supplier.findMany({
      where: locationQuery,
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            medicines: true
          }
        }
      }
    });

    // Create search result
    const searchResult = createSearchResult(suppliers, total, pageNum, limitNum);

    const location = city ? `${city}, ${country}` : country;
    res.status(200).json({
      success: true,
      message: `Suppliers in ${location} retrieved successfully`,
      data: searchResult,
      statusCode: 200
    });

  } catch (error) {
    logger.error('Get suppliers by location error:', error);
    next(error);
  }
};

// Export all functions
export {
  createSupplier,
  getSupplierById,
  getSuppliers,
  updateSupplier,
  deleteSupplier,
  getSupplierStats,
  getSuppliersByType,
  getSuppliersByLocation
};
