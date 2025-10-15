/**
 * Delivery Sheet Models
 * Epic E10: Minimal RBAC (User Management)
 * Tasks T032-T035: Delivery sheet integration
 */

export type DeliverySheetStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED';

export interface DeliverySheetSummary {
  id: number;
  sheetNumber: string;
  title?: string;
  status: DeliverySheetStatus;
  assignedAgentId?: number;
  assignedAgentName?: string;
  totalOrders: number;
  totalCodAmount: number;
  scheduledDate?: string; // ISO date string (yyyy-MM-dd)
  deliveryDate?: string; // ISO date string
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface DeliverySheetListResponse {
  content: DeliverySheetSummary[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface DeliverySheetListParams {
  page?: number;
  size?: number;
  sort?: string;
  assignedAgentId?: number;
  status?: DeliverySheetStatus | 'ALL';
}

export interface CreateDeliverySheetRequest {
  title: string;
  assignedAgentId: number;
  scheduledDate?: string;
  orderIds?: number[];
  notes?: string;
}

export interface UpdateDeliverySheetRequest extends CreateDeliverySheetRequest {}

export interface CreateDeliverySheetResponse extends DeliverySheetSummary {}
