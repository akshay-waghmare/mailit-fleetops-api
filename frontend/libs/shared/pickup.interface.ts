// Pickup related types
export interface PickupRecord {
  id: string;
  pickupId: string;
  // Client information (from relationship)
  clientId: string;
  clientName: string;
  clientCompany: string;
  contactNumber: string;
  contactPerson?: string;
  contactEmail?: string;
  // Pickup details
  pickupAddress: string;
  itemCount: number; // For compatibility
  itemsCount?: number; // Backend uses this
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
  // Completion tracking fields
  itemsReceived?: number;
  completionNotes?: string;
  completedAt?: string | Date;
  completedBy?: string;
}

// Interface for data coming from Schedule Pickup component
export interface SchedulePickupData {
  client: {
    id: string;
    clientName: string;
    clientCompany?: string;
    address: string;
    contactNumber?: string;
  };
  itemCount: number;
  totalWeight: number;
  itemDescription?: string;
  specialInstructions?: string;
  pickupType: 'vendor' | 'direct';
  carrier?: {
    id: string;
    name: string;
    price: number;
    estimatedPickup: string;
  };
  employee: {
    id: string;
    name: string;
    employeeId: string;
    department?: string;
  };
  pickupDate?: string;
  pickupTime?: string;
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

