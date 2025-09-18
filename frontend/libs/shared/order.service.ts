import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { 
  OrderRecord, 
  OrderQueryParams, 
  CreateOrderData, 
  OrderAnalytics,
  OrderStatusUpdate,
  BulkOrderOperation
} from './order.interface';
import { PaginatedResponse } from './pickup.interface';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private api: ApiService) {}

  /**
   * Get paginated orders with filtering and sorting
   */
  getOrders(params: OrderQueryParams = {}): Observable<PaginatedResponse<OrderRecord>> {
    // Convert OrderQueryParams to backend query params format
    const queryParams: any = {
      page: params.page ?? 0,
      size: params.size ?? 20
    };

    // Add filter parameters if provided
    if (params.search) queryParams.search = params.search;
    if (params.status) queryParams.status = params.status;
    if (params.service_type) queryParams.service_type = params.service_type;
    if (params.client_id) queryParams.client_id = params.client_id;
    if (params.assigned_staff_id) queryParams.assigned_staff_id = params.assigned_staff_id;
    if (params.from_date) queryParams.from_date = params.from_date;
    if (params.to_date) queryParams.to_date = params.to_date;
    if (params.sort_by) queryParams.sort_by = params.sort_by;
    if (params.sort_order) queryParams.sort_order = params.sort_order;

    console.log('🔧 OrderService sending parameters to API:', queryParams);

    return this.api.getOrders(queryParams).pipe(
      map(resp => {
        return {
          content: resp.content as unknown as OrderRecord[],
          totalElements: resp.totalElements,
          page: resp.page,
          size: resp.size,
          totalPages: resp.totalPages
        } as PaginatedResponse<OrderRecord>;
      })
    );
  }

  /**
   * Get order by ID
   */
  getOrderById(id: string): Observable<OrderRecord> {
    return this.api.getOrder(id).pipe(
      map((response: any) => {
        console.log('🔍 Raw API response:', response);
        // If the response is already the order object, return it directly
        // If it's wrapped in ApiResponse, extract the data
        return response.data || response;
      })
    );
  }

  /**
   * Create new order
   */
  createOrder(orderData: CreateOrderData): Observable<OrderRecord> {
  // Map CreateOrderData to backend payload shape as required
  return this.api.createOrder(orderData as any) as unknown as Observable<OrderRecord>;
  }

  /**
   * Update order status
   */
  updateOrderStatus(statusUpdate: OrderStatusUpdate): Observable<OrderRecord> {
    // Delegate to backend endpoint for status update
    return this.api.updateOrderStatus(statusUpdate.order_id, {
      updated_by: statusUpdate.updated_by,
      status: statusUpdate.status,
      notes: statusUpdate.notes
    } as any) as unknown as Observable<OrderRecord>;
  }

  /**
   * Update order details (full update)
   */
  updateOrder(orderId: string, orderData: Partial<OrderRecord>): Observable<OrderRecord> {
    // Map order data to backend format
    return this.api.updateOrder(orderId, orderData as any) as unknown as Observable<OrderRecord>;
  }

  /**
   * Partially update order details (patch)
   */
  patchOrder(orderId: string, orderData: Partial<OrderRecord>): Observable<OrderRecord> {
    console.log('🔧 OrderService.patchOrder - orderId:', orderId, 'data:', orderData);
    return this.api.patchOrder(orderId, orderData).pipe(
      map((response: any) => {
        console.log('🔍 Raw PATCH API response:', response);
        // If the response is already the order object, return it directly
        // If it's wrapped in ApiResponse, extract the data
        return response.data || response;
      })
    );
  }

  /**
   * Get order analytics
   */
  getOrderAnalytics(): Observable<OrderAnalytics> {
  return this.api.getOrderAnalytics() as unknown as Observable<OrderAnalytics>;
  }

  /**
   * Perform bulk operations on orders
   */
  performBulkOperation(operation: BulkOrderOperation): Observable<boolean> {
    // Forward to backend or implement client-side if backend not available
    return new Observable<boolean>(subscriber => {
      // TODO: implement backend bulk API
      subscriber.next(true);
      subscriber.complete();
    });
  }

  /**
   * Generate demo data for development
   */
  // Demo data and generators removed. Live data comes from backend API via ApiService.
}
