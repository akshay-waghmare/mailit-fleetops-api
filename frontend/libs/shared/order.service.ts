import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
import { 
  OrderRecord, 
  OrderQueryParams, 
  CreateOrderData, 
  OrderAnalytics,
  OrderStatusUpdate,
  BulkOrderOperation
} from './order.interface';
import { PaginatedResponse } from './pickup.interface';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  
  // Subject for real-time updates
  private ordersUpdatedSubject = new BehaviorSubject<OrderRecord[]>([]);
  public ordersUpdated$ = this.ordersUpdatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    // Don't set baseUrl in constructor - use getBaseUrl() method that waits for config
  }

  /**
   * Get the current API base URL, waiting for config to load if needed
   */
  private async getBaseUrl(): Promise<string> {
    // Wait for config to load in Docker environment
    await this.configService.loadConfig();
    return this.configService.apiBaseUrl;
  }

  /**
   * Get paginated orders with filtering and sorting
   */
  getOrders(params: OrderQueryParams = {}): Observable<PaginatedResponse<OrderRecord>> {
    let httpParams = new HttpParams();
    if (params.page !== undefined) httpParams = httpParams.set('page', String(params.page));
    if (params.size !== undefined) httpParams = httpParams.set('size', String(params.size));
    if (params.search) httpParams = httpParams.set('q', params.search); // Backend uses 'q' for search
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.service_type) httpParams = httpParams.set('serviceType', params.service_type);
    if (params.client_id) httpParams = httpParams.set('clientId', String(params.client_id));
    if (params.assigned_staff_id) httpParams = httpParams.set('staffId', String(params.assigned_staff_id));
    if (params.from_date) httpParams = httpParams.set('fromDate', params.from_date);
    if (params.to_date) httpParams = httpParams.set('toDate', params.to_date);
    if (params.sort_by) httpParams = httpParams.set('sort', `${params.sort_by},${params.sort_order || 'desc'}`);

    console.log('🔧 OrderService sending parameters to backend:', httpParams.toString());

    // Use switchMap to wait for baseUrl to load
    return new Observable(observer => {
      console.log('🔧 OrderService.getOrders() - Starting...');
      this.getBaseUrl().then(baseUrl => {
        console.log('🌐 OrderService Base URL resolved to:', baseUrl);
        console.log('🌐 Full URL will be:', `${baseUrl}/v1/orders`);
        console.log('🌐 HTTP params:', httpParams.toString());
        
        this.http.get<any>(`${baseUrl}/v1/orders`, { 
          params: httpParams,
          headers: {
            'Authorization': 'Basic ' + btoa('admin:admin') // Basic auth for development (matching PickupService)
          }
        }).pipe(
          map(backendResponse => {
            console.log('✅ OrderService received backend response:', backendResponse);
            return this.mapBackendPageToFrontend(backendResponse);
          })
        ).subscribe({
          next: result => {
            console.log('✅ OrderService returning mapped result:', result);
            observer.next(result);
          },
          error: err => {
            console.error('❌ OrderService HTTP error:', err);
            observer.error(err);
          },
          complete: () => {
            console.log('✅ OrderService HTTP request completed');
            observer.complete();
          }
        });
      }).catch(error => {
        console.error('❌ OrderService failed to get baseUrl:', error);
        observer.error(error);
      });
    });
  }

  /**
   * Get order by ID
   */
  getOrderById(id: string): Observable<OrderRecord> {
    return new Observable(observer => {
      this.getBaseUrl().then(baseUrl => {
        this.http.get<any>(`${baseUrl}/v1/orders/${id}`, {
          headers: {
            'Authorization': 'Basic ' + btoa('admin:admin')
          }
        }).pipe(
          map(backendOrder => this.mapBackendOrderToFrontend(backendOrder))
        ).subscribe({
          next: result => observer.next(result),
          error: err => observer.error(err),
          complete: () => observer.complete()
        });
      }).catch(error => observer.error(error));
    });
  }

  /**
   * Create new order
   */
  createOrder(orderData: CreateOrderData): Observable<OrderRecord> {
    return new Observable(observer => {
      this.getBaseUrl().then(baseUrl => {
        this.http.post<any>(`${baseUrl}/v1/orders`, orderData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa('admin:admin')
          }
        }).pipe(
          map(backendOrder => this.mapBackendOrderToFrontend(backendOrder)),
          tap(order => {
            const currentOrders = this.ordersUpdatedSubject.value;
            this.ordersUpdatedSubject.next([order, ...currentOrders]);
          })
        ).subscribe({
          next: result => observer.next(result),
          error: err => observer.error(err),
          complete: () => observer.complete()
        });
      }).catch(error => observer.error(error));
    });
  }

  /**
   * Update order status
   */
  updateOrderStatus(statusUpdate: OrderStatusUpdate): Observable<OrderRecord> {
    return new Observable(observer => {
      this.getBaseUrl().then(baseUrl => {
        this.http.patch<any>(`${baseUrl}/v1/orders/${statusUpdate.order_id}/status`, {
          status: statusUpdate.status,
          updated_by: statusUpdate.updated_by,
          notes: statusUpdate.notes
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa('admin:admin')
          }
        }).pipe(
          map(backendOrder => this.mapBackendOrderToFrontend(backendOrder))
        ).subscribe({
          next: result => observer.next(result),
          error: err => observer.error(err),
          complete: () => observer.complete()
        });
      }).catch(error => observer.error(error));
    });
  }

  /**
   * Get order analytics
   */
  getOrderAnalytics(): Observable<OrderAnalytics> {
    return new Observable(observer => {
      this.getBaseUrl().then(baseUrl => {
        this.http.get<any>(`${baseUrl}/v1/orders/analytics`, {
          headers: {
            'Authorization': 'Basic ' + btoa('admin:admin')
          }
        }).pipe(
          map(response => response.data || response)
        ).subscribe({
          next: result => observer.next(result),
          error: err => observer.error(err),
          complete: () => observer.complete()
        });
      }).catch(error => observer.error(error));
    });
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
   * Helper method to map backend paginated response to frontend format
   */
  private mapBackendPageToFrontend(backendResponse: any): PaginatedResponse<OrderRecord> {
    return {
      content: (backendResponse.content || []).map((order: any) => this.mapBackendOrderToFrontend(order)),
      totalElements: backendResponse.totalElements || 0,
      page: backendResponse.page || 0,
      size: backendResponse.size || 20,
      totalPages: backendResponse.totalPages || 0
    };
  }

  /**
   * Helper method to map a single backend order to frontend format
   */
  private mapBackendOrderToFrontend(backendOrder: any): OrderRecord {
    return {
      id: backendOrder.id,
      order_id: backendOrder.orderId || backendOrder.order_id,
      created_at: backendOrder.createdAt || backendOrder.created_at,
      updated_at: backendOrder.updatedAt || backendOrder.updated_at,
      client_id: backendOrder.clientId || backendOrder.client_id,
      client_name: backendOrder.clientName || backendOrder.client_name,
      client_company: backendOrder.clientCompany || backendOrder.client_company,
      contact_number: backendOrder.contactNumber || backendOrder.contact_number,
      sender_name: backendOrder.senderName || backendOrder.sender_name,
      sender_address: backendOrder.senderAddress || backendOrder.sender_address,
      sender_contact: backendOrder.senderContact || backendOrder.sender_contact,
      sender_email: backendOrder.senderEmail || backendOrder.sender_email,
      sender_pincode: backendOrder.senderPincode || backendOrder.sender_pincode,
      sender_city: backendOrder.senderCity || backendOrder.sender_city,
      sender_state: backendOrder.senderState || backendOrder.sender_state,
      receiver_name: backendOrder.receiverName || backendOrder.receiver_name,
      receiver_address: backendOrder.receiverAddress || backendOrder.receiver_address,
      receiver_contact: backendOrder.receiverContact || backendOrder.receiver_contact,
      receiver_email: backendOrder.receiverEmail || backendOrder.receiver_email,
      receiver_pincode: backendOrder.receiverPincode || backendOrder.receiver_pincode,
      receiver_city: backendOrder.receiverCity || backendOrder.receiver_city,
      receiver_state: backendOrder.receiverState || backendOrder.receiver_state,
      item_count: backendOrder.itemCount || backendOrder.item_count || 1,
      total_weight: backendOrder.totalWeight || backendOrder.total_weight || 0,
      length_cm: backendOrder.lengthCm || backendOrder.length_cm,
      width_cm: backendOrder.widthCm || backendOrder.width_cm,
      height_cm: backendOrder.heightCm || backendOrder.height_cm,
      item_description: backendOrder.itemDescription || backendOrder.item_description,
      declared_value: backendOrder.declaredValue || backendOrder.declared_value,
      service_type: backendOrder.serviceType || backendOrder.service_type,
      carrier_name: backendOrder.carrierName || backendOrder.carrier_name,
      carrier_id: backendOrder.carrierId || backendOrder.carrier_id,
      tracking_number: backendOrder.trackingNumber || backendOrder.tracking_number,
      status: backendOrder.status,
      status_updated_at: backendOrder.statusUpdatedAt || backendOrder.status_updated_at,
      status_updated_by: backendOrder.statusUpdatedBy || backendOrder.status_updated_by,
      assigned_staff_name: backendOrder.assignedStaffName || backendOrder.assigned_staff_name,
      assigned_staff_id: backendOrder.assignedStaffId || backendOrder.assigned_staff_id,
      staff_department: backendOrder.staffDepartment || backendOrder.staff_department,
      estimated_delivery_date: backendOrder.estimatedDeliveryDate || backendOrder.estimated_delivery_date,
      actual_delivery_date: backendOrder.actualDeliveryDate || backendOrder.actual_delivery_date,
      delivery_time: backendOrder.deliveryTime || backendOrder.delivery_time,
      delivery_instructions: backendOrder.deliveryInstructions || backendOrder.delivery_instructions,
      shipping_cost: backendOrder.shippingCost || backendOrder.shipping_cost,
      tax_amount: backendOrder.taxAmount || backendOrder.tax_amount,
      total_amount: backendOrder.totalAmount || backendOrder.total_amount || 0,
      cod_amount: backendOrder.codAmount || backendOrder.cod_amount,
      payment_status: backendOrder.paymentStatus || backendOrder.payment_status || 'PENDING',
      created_by: backendOrder.createdBy || backendOrder.created_by,
      updated_by: backendOrder.updatedBy || backendOrder.updated_by,
      special_instructions: backendOrder.specialInstructions || backendOrder.special_instructions,
      customer_feedback: backendOrder.customerFeedback || backendOrder.customer_feedback,
      rating: backendOrder.rating,
      metadata: backendOrder.metadata
    };
  }
}
