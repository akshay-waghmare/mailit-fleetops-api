// Pickup related types
export interface PickupRecord {
  id: string;
  pickupId: string;
  clientName: string;
  clientCompany: string;
  clientId: string;
  pickupAddress: string;
  contactNumber: string;
  itemCount: number;
  totalWeight: number;
  itemDescription?: string;
  specialInstructions?: string;
  pickupType: 'vendor' | 'direct';
  carrierName?: string;
  carrierId?: string;
  assignedStaff: string;
  staffId: string;
  staffDepartment: string;
  pickupDate: string | Date;
  pickupTime: string;
  estimatedDuration?: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'delayed';
  statusUpdatedAt: string | Date;
  statusUpdatedBy: string;
  estimatedCost?: number;
  actualCost?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  createdBy: string;
  notes?: string;
  customerFeedback?: string;
  rating?: number;
}

export interface PickupQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  pickupType?: 'vendor' | 'direct';
  staffId?: string;
  clientId?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

