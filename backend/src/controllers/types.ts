import { Request, Response, NextFunction } from 'express';
import { 
  IUser, 
  IMedicine, 
  IOrder, 
  ISupplier, 
  IPrescription,
  ISearchFilters,
  IPaginationOptions,
  ISearchResult,
  ValidationResult
} from '@/models';

// Controller function type
export type ControllerFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

// Extended Request types with user authentication
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    permissions?: string[];
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
  path: string;
}

export interface PaginatedResponse<T> extends ApiResponse<ISearchResult<T>> {}

export interface ErrorResponse {
  success: false;
  message: string;
  error: string;
  timestamp: string;
  path: string;
  details?: any;
}

// Controller Response types
export interface ControllerResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  statusCode: number;
}

export interface PaginatedControllerResponse<T> extends ControllerResponse<ISearchResult<T>> {}

// Search and Filter types
export interface SearchRequest extends Request {
  query: {
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    query?: string;
    category?: string;
    supplier?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    prescriptionRequired?: string;
    tags?: string;
    dosageForm?: string;
    schedule?: string;
  };
}

export interface FilterRequest extends Request {
  body: ISearchFilters;
}

export interface PaginationRequest extends Request {
  body: IPaginationOptions;
}

// Authentication types
export interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
    rememberMe?: boolean;
  };
}

export interface RegisterRequest extends Request {
  body: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
    role?: string;
  };
}

export interface ChangePasswordRequest extends Request {
  body: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
}

export interface ForgotPasswordRequest extends Request {
  body: {
    email: string;
  };
}

export interface ResetPasswordRequest extends Request {
  body: {
    token: string;
    newPassword: string;
    confirmPassword: string;
  };
}

// User management types
export interface CreateUserRequest extends Request {
  body: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    role: string;
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

export interface UpdateUserRequest extends Request {
  params: { id: string };
  body: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    profileImage?: string;
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    notifications?: boolean;
    language?: string;
    timezone?: string;
  };
}

export interface GetUserRequest extends Request {
  params: { id: string };
}

// Product/Medicine types
export interface CreateMedicineRequest extends Request {
  body: {
    name: string;
    genericName: string;
    brandName: string;
    description: string;
    activeIngredients: string[];
    dosageForm: string;
    strength: string;
    unit: string;
    manufacturer: string;
    prescriptionRequired?: boolean;
    controlledSubstance?: boolean;
    schedule?: string;
    sideEffects?: string[];
    contraindications?: string[];
    interactions?: string[];
    storageConditions: string;
    expiryDate: string;
    batchNumber: string;
    sku: string;
    barcode?: string;
    requiresRefrigeration?: boolean;
    price: number;
    cost: number;
    taxRate?: number;
    discountPercentage?: number;
    imageUrl?: string;
    tags?: string[];
    categoryId: string;
    supplierId: string;
  };
}

export interface UpdateMedicineRequest extends Request {
  params: { id: string };
  body: Partial<CreateMedicineRequest['body']>;
}

export interface GetMedicineRequest extends Request {
  params: { id: string };
}

export interface SearchMedicineRequest extends SearchRequest {}

// Sales/Order types
export interface CreateOrderRequest extends Request {
  body: {
    customerId: string;
    items: Array<{
      medicineId: string;
      quantity: number;
      unitPrice: number;
    }>;
    paymentMethod: string;
    shippingAddress: string;
    shippingCity: string;
    shippingState: string;
    shippingZipCode: string;
    shippingCountry: string;
    notes?: string;
  };
}

export interface UpdateOrderRequest extends Request {
  params: { id: string };
  body: {
    status?: string;
    paymentStatus?: string;
    shippingAddress?: string;
    shippingCity?: string;
    shippingState?: string;
    shippingZipCode?: string;
    shippingCountry?: string;
    notes?: string;
  };
}

export interface GetOrderRequest extends Request {
  params: { id: string };
}

export interface GetOrdersRequest extends SearchRequest {}

// Supplier types
export interface CreateSupplierRequest extends Request {
  body: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    type?: string;
    paymentTerms?: string;
  };
}

export interface UpdateSupplierRequest extends Request {
  params: { id: string };
  body: Partial<CreateSupplierRequest['body']>;
}

export interface GetSupplierRequest extends Request {
  params: { id: string };
}

export interface GetSuppliersRequest extends SearchRequest {}

// Report types
export interface GenerateReportRequest extends Request {
  body: {
    reportType: 'sales' | 'inventory' | 'revenue' | 'customer' | 'supplier';
    dateRange: {
      startDate: string;
      endDate: string;
    };
    filters?: Record<string, any>;
    format?: 'pdf' | 'excel' | 'csv';
  };
}

export interface GetDashboardStatsRequest extends Request {
  query: {
    period?: 'today' | 'week' | 'month' | 'year';
    date?: string;
  };
}

// Sync types
export interface SyncRequest extends Request {
  body: {
    entityType: 'users' | 'medicines' | 'orders' | 'suppliers' | 'inventory';
    action: 'push' | 'pull' | 'sync';
    data?: any[];
    lastSyncTime?: string;
  };
}

export interface SyncStatusRequest extends Request {
  query: {
    entityType?: string;
    status?: 'pending' | 'in_progress' | 'completed' | 'failed';
  };
}

// File upload types
export interface FileUploadRequest extends Request {
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}

// Validation types
export interface ValidationRequest extends Request {
  validationResult?: ValidationResult;
}

// Export all types
export type {
  ControllerFunction,
  AuthenticatedRequest,
  ApiResponse,
  PaginatedResponse,
  ErrorResponse,
  ControllerResponse,
  PaginatedControllerResponse,
  SearchRequest,
  FilterRequest,
  PaginationRequest,
  LoginRequest,
  RegisterRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  CreateUserRequest,
  UpdateUserRequest,
  GetUserRequest,
  CreateMedicineRequest,
  UpdateMedicineRequest,
  GetMedicineRequest,
  SearchMedicineRequest,
  CreateOrderRequest,
  UpdateOrderRequest,
  GetOrderRequest,
  GetOrdersRequest,
  CreateSupplierRequest,
  UpdateSupplierRequest,
  GetSupplierRequest,
  GetSuppliersRequest,
  GenerateReportRequest,
  GetDashboardStatsRequest,
  SyncRequest,
  SyncStatusRequest,
  FileUploadRequest,
  ValidationRequest
};
