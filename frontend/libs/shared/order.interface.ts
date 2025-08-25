/**
 * Order Management Interfaces for FleetOps
 * Comprehensive order data types and query parameters
 */

export interface OrderRecord {
  // Core Order Information
  id: string;
  orderId: string;
  orderDate: string;
  
  // Client Information
  clientId: string;
  clientName: string;
  clientCompany?: string;
  contactNumber?: string;
  
  // Shipping Information
  senderName: string;
  senderAddress: string;
  senderContact: string;
  
  receiverName: string;
  receiverAddress: string;
  receiverContact: string;
  receiverPincode: string;
  receiverCity: string;
  
  // Package Details
  itemCount: number;
  totalWeight: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  itemDescription?: string;
  declaredValue?: number;
  
  // Service Details
  serviceType: 'express' | 'standard' | 'economy';
  carrierName: string;
  carrierId: string;
  trackingNumber?: string;
  
  // Status Management
  status: 'pending' | 'confirmed' | 'picked-up' | 'in-transit' | 'delivered' | 'cancelled' | 'returned';
  statusUpdatedAt: Date;
  statusUpdatedBy: string;
  
  // Staff Assignment
  assignedStaff?: string;
  staffId?: string;
  staffDepartment?: string;
  
  // Delivery Information
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  deliveryTime?: string;
  
  // Financial Information
  estimatedCost: number;
  actualCost: number;
  codAmount?: number;
  paymentStatus: 'pending' | 'paid' | 'cod' | 'failed';
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  
  // Additional Information
  specialInstructions?: string;
  notes?: string;
  customerFeedback?: string;
  rating?: number;
}

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  serviceType?: string;
  carrierId?: string;
  clientId?: string;
  staffId?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: keyof OrderRecord;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateOrderData {
  client: {
    id: string;
    clientName: string;
    clientCompany?: string;
    contactNumber?: string;
  };
  
  sender: {
    name: string;
    address: string;
    contact: string;
  };
  
  receiver: {
    name: string;
    address: string;
    contact: string;
    pincode: string;
    city: string;
  };
  
  package: {
    itemCount: number;
    totalWeight: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    itemDescription?: string;
    declaredValue?: number;
  };
  
  service: {
    serviceType: 'express' | 'standard' | 'economy';
    carrier: {
      id: string;
      name: string;
      price: number;
    };
  };
  
  specialInstructions?: string;
  codAmount?: number;
}

export interface OrderAnalytics {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  inTransitOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageDeliveryTime: number;
  onTimeDeliveryRate: number;
  customerSatisfactionRate: number;
}

export interface OrderStatusUpdate {
  orderId: string;
  newStatus: OrderRecord['status'];
  updatedBy: string;
  notes?: string;
  timestamp: Date;
}

export interface BulkOrderOperation {
  orderIds: string[];
  operation: 'status-update' | 'assign-staff' | 'export' | 'delete';
  data?: any;
}
