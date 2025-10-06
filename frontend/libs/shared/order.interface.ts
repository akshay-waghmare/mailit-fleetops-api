/**
 * Order Management Interfaces for FleetOps
 * Comprehensive order data types and query parameters
 */

export interface OrderRecord {
  // Core Order Information
  id: number;
  order_id: string;
  created_at: string;
  updated_at: string;
  
  // Client Information
  client_id: number;
  client_name: string;
  client_company?: string;
  contact_number?: string;
  
  // Shipping Information
  sender_name: string;
  sender_address: string;
  sender_contact: string;
  sender_email?: string;
  sender_pincode?: string;
  sender_city?: string;
  sender_state?: string;
  
  receiver_name: string;
  receiver_address: string;
  receiver_contact: string;
  receiver_email?: string;
  receiver_pincode: string;
  receiver_city: string;
  receiver_state?: string;
  
  // Package Details
  item_count: number;
  total_weight: number;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
  item_description?: string;
  declared_value?: number;
  
  // Service Details
  service_type: 'EXPRESS' | 'STANDARD' | 'ECONOMY';
  carrier_name: string;
  carrier_id?: string;
  tracking_number?: string;
  
  // Status Management
  status: 'PENDING' | 'CONFIRMED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  status_updated_at: string;
  status_updated_by?: string;
  
  // Staff Assignment
  assigned_staff_name?: string;
  assigned_staff_id?: number;
  staff_department?: string;
  
  // Delivery Information
  estimated_delivery_date?: string;
  actual_delivery_date?: string;
  delivery_time?: string;
  delivery_instructions?: string;
  
  // Financial Information
  shipping_cost?: number;
  tax_amount?: number;
  total_amount: number;
  cod_amount?: number;
  payment_status: 'PENDING' | 'PAID' | 'COD' | 'FAILED';
  
  // Timestamps and Audit
  created_by?: string;
  updated_by?: string;
  
  // Additional Information
  special_instructions?: string;
  customer_feedback?: string;
  rating?: number;
  metadata?: any;
}

export interface OrderQueryParams {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
  service_type?: string;
  carrier_id?: string;
  client_id?: number;
  assigned_staff_id?: number;
  from_date?: string;
  to_date?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface CreateOrderData {
  client_id: number;
  client_name: string;
  client_company?: string;
  contact_number?: string;
  
  sender_name: string;
  sender_address: string;
  sender_contact: string;
  sender_email?: string;
  sender_pincode?: string;
  sender_city?: string;
  sender_state?: string;
  
  receiver_name: string;
  receiver_address: string;
  receiver_contact: string;
  receiver_email?: string;
  receiver_pincode: string;
  receiver_city: string;
  receiver_state?: string;
  
  item_count: number;
  total_weight: number;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
  item_description?: string;
  declared_value?: number;
  
  service_type: 'EXPRESS' | 'STANDARD' | 'ECONOMY';
  carrier_name: string;
  carrier_id?: string;
  
  special_instructions?: string;
  cod_amount?: number;
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
  order_id: string;
  status: OrderRecord['status'];
  updated_by?: string;
  notes?: string;
}

export interface BulkOrderOperation {
  orderIds: string[];
  operation: 'status-update' | 'assign-staff' | 'export' | 'delete';
  data?: any;
}
