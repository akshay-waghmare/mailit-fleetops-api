import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay } from 'rxjs';
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

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private ordersSubject = new BehaviorSubject<OrderRecord[]>([]);
  private lastUpdatedSubject = new BehaviorSubject<Date>(new Date());
  
  public orders$ = this.ordersSubject.asObservable();
  public lastUpdated$ = this.lastUpdatedSubject.asObservable();

  constructor() {
    this.initializeDemoData();
  }

  /**
   * Get paginated orders with filtering and sorting
   */
  getOrders(params: OrderQueryParams = {}): Observable<PaginatedResponse<OrderRecord>> {
    return this.orders$.pipe(
      map(orders => {
        let filteredOrders = [...orders];

        // Apply search filter
        if (params.search) {
          const searchTerm = params.search.toLowerCase();
          filteredOrders = filteredOrders.filter(order =>
            order.orderId.toLowerCase().includes(searchTerm) ||
            order.clientName.toLowerCase().includes(searchTerm) ||
            order.receiverName.toLowerCase().includes(searchTerm) ||
            order.receiverCity.toLowerCase().includes(searchTerm) ||
            order.trackingNumber?.toLowerCase().includes(searchTerm)
          );
        }

        // Apply status filter
        if (params.status) {
          filteredOrders = filteredOrders.filter(order => order.status === params.status);
        }

        // Apply service type filter
        if (params.serviceType) {
          filteredOrders = filteredOrders.filter(order => order.serviceType === params.serviceType);
        }

        // Apply carrier filter
        if (params.carrierId) {
          filteredOrders = filteredOrders.filter(order => order.carrierId === params.carrierId);
        }

        // Apply client filter
        if (params.clientId) {
          filteredOrders = filteredOrders.filter(order => order.clientId === params.clientId);
        }

        // Apply date range filter
        if (params.fromDate) {
          filteredOrders = filteredOrders.filter(order => 
            new Date(order.orderDate) >= new Date(params.fromDate!)
          );
        }
        if (params.toDate) {
          filteredOrders = filteredOrders.filter(order => 
            new Date(order.orderDate) <= new Date(params.toDate!)
          );
        }

        // Apply sorting
        if (params.sortBy) {
          filteredOrders.sort((a, b) => {
            const aValue = a[params.sortBy!];
            const bValue = b[params.sortBy!];
            const order = params.sortOrder === 'desc' ? -1 : 1;
            
            // Handle undefined values
            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return 1 * order;
            if (bValue == null) return -1 * order;
            
            if (aValue < bValue) return -1 * order;
            if (aValue > bValue) return 1 * order;
            return 0;
          });
        }

        const totalElements = filteredOrders.length;

        // For client-side pagination, return ALL filtered data
        // Material Table will handle pagination on the client side
        return {
          content: filteredOrders, // Return all data, not paginated
          totalElements: totalElements,
          page: 1,
          size: totalElements,
          totalPages: 1
        };
      })
    );
  }

  /**
   * Get order by ID
   */
  getOrderById(id: string): Observable<OrderRecord | null> {
    return this.orders$.pipe(
      map(orders => orders.find(order => order.id === id) || null)
    );
  }

  /**
   * Create new order
   */
  createOrder(orderData: CreateOrderData): Observable<OrderRecord> {
    const newOrder: OrderRecord = {
      id: `order_${Date.now()}`,
      orderId: this.generateOrderId(),
      orderDate: new Date().toISOString().split('T')[0],
      
      // Client Information
      clientId: orderData.client.id,
      clientName: orderData.client.clientName,
      clientCompany: orderData.client.clientCompany,
      contactNumber: orderData.client.contactNumber,
      
      // Shipping Information
      senderName: orderData.sender.name,
      senderAddress: orderData.sender.address,
      senderContact: orderData.sender.contact,
      
      receiverName: orderData.receiver.name,
      receiverAddress: orderData.receiver.address,
      receiverContact: orderData.receiver.contact,
      receiverPincode: orderData.receiver.pincode,
      receiverCity: orderData.receiver.city,
      
      // Package Details
      itemCount: orderData.package.itemCount,
      totalWeight: orderData.package.totalWeight,
      dimensions: orderData.package.dimensions,
      itemDescription: orderData.package.itemDescription,
      declaredValue: orderData.package.declaredValue,
      
      // Service Details
      serviceType: orderData.service.serviceType,
      carrierName: orderData.service.carrier.name,
      carrierId: orderData.service.carrier.id,
      trackingNumber: this.generateTrackingNumber(),
      
      // Status Management
      status: 'pending',
      statusUpdatedAt: new Date(),
      statusUpdatedBy: 'System',
      
      // Financial Information
      estimatedCost: orderData.service.carrier.price,
      actualCost: orderData.service.carrier.price,
      codAmount: orderData.codAmount,
      paymentStatus: orderData.codAmount ? 'cod' : 'pending',
      
      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'Current User', // Replace with actual user
      
      // Additional Information
      specialInstructions: orderData.specialInstructions
    };

    // Add to orders list
    const currentOrders = this.ordersSubject.value;
    this.ordersSubject.next([newOrder, ...currentOrders]);
    this.lastUpdatedSubject.next(new Date());

    return of(newOrder).pipe(delay(500));
  }

  /**
   * Update order status
   */
  updateOrderStatus(statusUpdate: OrderStatusUpdate): Observable<OrderRecord> {
    const currentOrders = this.ordersSubject.value;
    const orderIndex = currentOrders.findIndex(order => order.id === statusUpdate.orderId);
    
    if (orderIndex === -1) {
      throw new Error('Order not found');
    }

    const updatedOrder = {
      ...currentOrders[orderIndex],
      status: statusUpdate.newStatus,
      statusUpdatedAt: statusUpdate.timestamp,
      statusUpdatedBy: statusUpdate.updatedBy,
      updatedAt: new Date(),
      notes: statusUpdate.notes || currentOrders[orderIndex].notes
    };

    const updatedOrders = [...currentOrders];
    updatedOrders[orderIndex] = updatedOrder;
    
    this.ordersSubject.next(updatedOrders);
    this.lastUpdatedSubject.next(new Date());

    return of(updatedOrder).pipe(delay(300));
  }

  /**
   * Get order analytics
   */
  getOrderAnalytics(): Observable<OrderAnalytics> {
    return this.orders$.pipe(
      map(orders => {
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => o.status === 'pending').length;
        const confirmedOrders = orders.filter(o => o.status === 'confirmed').length;
        const inTransitOrders = orders.filter(o => o.status === 'in-transit').length;
        const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
        const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
        
        const totalRevenue = orders
          .filter(o => o.status === 'delivered')
          .reduce((sum, order) => sum + order.actualCost, 0);
        
        const deliveredOrdersWithDates = orders.filter(o => 
          o.status === 'delivered' && o.actualDeliveryDate && o.estimatedDeliveryDate
        );
        
        const onTimeDeliveries = deliveredOrdersWithDates.filter(o => 
          new Date(o.actualDeliveryDate!) <= new Date(o.estimatedDeliveryDate!)
        ).length;
        
        const onTimeDeliveryRate = deliveredOrdersWithDates.length > 0 
          ? (onTimeDeliveries / deliveredOrdersWithDates.length) * 100 
          : 0;

        const ratingsOrders = orders.filter(o => o.rating && o.rating > 0);
        const customerSatisfactionRate = ratingsOrders.length > 0
          ? (ratingsOrders.reduce((sum, o) => sum + (o.rating || 0), 0) / ratingsOrders.length) * 20 // Convert 5-star to percentage
          : 0;

        return {
          totalOrders,
          pendingOrders,
          confirmedOrders,
          inTransitOrders,
          deliveredOrders,
          cancelledOrders,
          totalRevenue,
          averageDeliveryTime: 2.5, // Mock average delivery time in days
          onTimeDeliveryRate,
          customerSatisfactionRate
        };
      })
    );
  }

  /**
   * Perform bulk operations on orders
   */
  performBulkOperation(operation: BulkOrderOperation): Observable<boolean> {
    const currentOrders = this.ordersSubject.value;
    
    switch (operation.operation) {
      case 'status-update':
        const updatedOrders = currentOrders.map(order => {
          if (operation.orderIds.includes(order.id)) {
            return {
              ...order,
              status: operation.data.status,
              statusUpdatedAt: new Date(),
              statusUpdatedBy: operation.data.updatedBy || 'System',
              updatedAt: new Date()
            };
          }
          return order;
        });
        this.ordersSubject.next(updatedOrders);
        break;
      
      case 'assign-staff':
        const staffAssignedOrders = currentOrders.map(order => {
          if (operation.orderIds.includes(order.id)) {
            return {
              ...order,
              assignedStaff: operation.data.staffName,
              staffId: operation.data.staffId,
              staffDepartment: operation.data.department,
              updatedAt: new Date()
            };
          }
          return order;
        });
        this.ordersSubject.next(staffAssignedOrders);
        break;
    }

    this.lastUpdatedSubject.next(new Date());
    return of(true).pipe(delay(500));
  }

  /**
   * Generate demo data for development
   */
  private initializeDemoData(): void {
    const demoOrders: OrderRecord[] = [
      {
        id: 'order_001',
        orderId: 'ORD001234',
        orderDate: '2025-08-25',
        clientId: 'client_001',
        clientName: 'TechCorp Solutions',
        clientCompany: 'TechCorp Pvt Ltd',
        contactNumber: '+91-9876543210',
        senderName: 'Rahul Sharma',
        senderAddress: 'Tech Park, Electronic City, Bangalore 560001',
        senderContact: '+91-9876543210',
        receiverName: 'Priya Patel',
        receiverAddress: 'MG Road, Fort, Mumbai 400001',
        receiverContact: '+91-9876543211',
        receiverPincode: '400001',
        receiverCity: 'Mumbai',
        itemCount: 3,
        totalWeight: 2.5,
        dimensions: { length: 30, width: 20, height: 15 },
        itemDescription: 'Electronic components',
        declaredValue: 15000,
        serviceType: 'express',
        carrierName: 'FleetOps Express',
        carrierId: 'carrier_001',
        trackingNumber: 'FL123456789',
        status: 'in-transit',
        statusUpdatedAt: new Date('2025-08-25T10:30:00'),
        statusUpdatedBy: 'System',
        assignedStaff: 'Amit Kumar',
        staffId: 'staff_001',
        staffDepartment: 'Delivery',
        estimatedDeliveryDate: '2025-08-26',
        deliveryTime: '2-4 PM',
        estimatedCost: 350,
        actualCost: 350,
        codAmount: 15000,
        paymentStatus: 'cod',
        createdAt: new Date('2025-08-25T09:00:00'),
        updatedAt: new Date('2025-08-25T10:30:00'),
        createdBy: 'admin@techcorp.com',
        specialInstructions: 'Handle with care - fragile electronics',
        rating: 4
      },
      {
        id: 'order_002',
        orderId: 'ORD001235',
        orderDate: '2025-08-25',
        clientId: 'client_002',
        clientName: 'Fashion Hub',
        clientCompany: 'Fashion Hub Retail',
        contactNumber: '+91-9876543212',
        senderName: 'Sneha Reddy',
        senderAddress: 'Commercial Street, Bangalore 560001',
        senderContact: '+91-9876543212',
        receiverName: 'Vikram Singh',
        receiverAddress: 'Connaught Place, New Delhi 110001',
        receiverContact: '+91-9876543213',
        receiverPincode: '110001',
        receiverCity: 'New Delhi',
        itemCount: 1,
        totalWeight: 0.8,
        itemDescription: 'Clothing package',
        serviceType: 'standard',
        carrierName: 'FleetOps Standard',
        carrierId: 'carrier_002',
        trackingNumber: 'FL123456790',
        status: 'delivered',
        statusUpdatedAt: new Date('2025-08-24T16:45:00'),
        statusUpdatedBy: 'Delivery Agent',
        assignedStaff: 'Ravi Gupta',
        staffId: 'staff_002',
        staffDepartment: 'Delivery',
        estimatedDeliveryDate: '2025-08-24',
        actualDeliveryDate: '2025-08-24',
        deliveryTime: '4-6 PM',
        estimatedCost: 180,
        actualCost: 180,
        paymentStatus: 'paid',
        createdAt: new Date('2025-08-22T11:15:00'),
        updatedAt: new Date('2025-08-24T16:45:00'),
        createdBy: 'manager@fashionhub.com',
        customerFeedback: 'Quick delivery, well packaged',
        rating: 5
      },
      {
        id: 'order_003',
        orderId: 'ORD001236',
        orderDate: '2025-08-25',
        clientId: 'client_003',
        clientName: 'BookStore Online',
        contactNumber: '+91-9876543214',
        senderName: 'Arjun Nair',
        senderAddress: 'Book Market, Pune 411001',
        senderContact: '+91-9876543214',
        receiverName: 'Meera Joshi',
        receiverAddress: 'FC Road, Pune 411004',
        receiverContact: '+91-9876543215',
        receiverPincode: '411004',
        receiverCity: 'Pune',
        itemCount: 5,
        totalWeight: 1.2,
        itemDescription: 'Educational books',
        serviceType: 'economy',
        carrierName: 'FleetOps Economy',
        carrierId: 'carrier_003',
        trackingNumber: 'FL123456791',
        status: 'pending',
        statusUpdatedAt: new Date('2025-08-25T08:00:00'),
        statusUpdatedBy: 'System',
        estimatedDeliveryDate: '2025-08-27',
        estimatedCost: 120,
        actualCost: 120,
        paymentStatus: 'pending',
        createdAt: new Date('2025-08-25T08:00:00'),
        updatedAt: new Date('2025-08-25T08:00:00'),
        createdBy: 'orders@bookstore.com'
      }
    ];

    // Generate more demo orders for better testing
    const additionalOrders = this.generateAdditionalDemoOrders();
    const allOrders = [...demoOrders, ...additionalOrders];
    this.ordersSubject.next(allOrders);
  }

  private generateAdditionalDemoOrders(): OrderRecord[] {
    const orders: OrderRecord[] = [];
    const statuses: OrderRecord['status'][] = ['pending', 'confirmed', 'picked-up', 'in-transit', 'delivered', 'cancelled'];
    const serviceTypes: OrderRecord['serviceType'][] = ['express', 'standard', 'economy'];
    const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'];
    const companies = ['TechCorp', 'Fashion Hub', 'BookStore', 'Electronics Plus', 'Furniture World', 'Mobile Mart'];

    for (let i = 4; i <= 50; i++) {
      const orderId = `ORD${String(i).padStart(6, '0')}`;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const serviceType = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      const company = companies[Math.floor(Math.random() * companies.length)];
      
      const baseDate = new Date();
      baseDate.setDate(baseDate.getDate() - Math.floor(Math.random() * 30));
      
      orders.push({
        id: `order_${String(i).padStart(3, '0')}`,
        orderId,
        orderDate: baseDate.toISOString().split('T')[0],
        clientId: `client_${String(i).padStart(3, '0')}`,
        clientName: `${company} Solutions`,
        clientCompany: `${company} Pvt Ltd`,
        contactNumber: `+91-98765${String(43210 + i).slice(-5)}`,
        senderName: `Sender ${i}`,
        senderAddress: `Address ${i}, ${city} ${560000 + i}`,
        senderContact: `+91-98765${String(43210 + i).slice(-5)}`,
        receiverName: `Receiver ${i}`,
        receiverAddress: `Delivery Address ${i}, ${city} ${400000 + i}`,
        receiverContact: `+91-98765${String(43220 + i).slice(-5)}`,
        receiverPincode: String(400000 + i),
        receiverCity: city,
        itemCount: Math.floor(Math.random() * 5) + 1,
        totalWeight: Math.round((Math.random() * 10 + 0.5) * 10) / 10,
        itemDescription: `Package ${i} contents`,
        serviceType,
        carrierName: `FleetOps ${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}`,
        carrierId: `carrier_${String(Math.floor(Math.random() * 3) + 1).padStart(3, '0')}`,
        trackingNumber: `FL${String(123456792 + i)}`,
        status,
        statusUpdatedAt: new Date(baseDate.getTime() + Math.random() * 86400000),
        statusUpdatedBy: status === 'pending' ? 'System' : 'Staff Member',
        estimatedDeliveryDate: new Date(baseDate.getTime() + (Math.random() * 5 + 1) * 86400000).toISOString().split('T')[0],
        actualDeliveryDate: status === 'delivered' ? new Date(baseDate.getTime() + (Math.random() * 4 + 1) * 86400000).toISOString().split('T')[0] : undefined,
        estimatedCost: Math.floor(Math.random() * 500 + 100),
        actualCost: Math.floor(Math.random() * 500 + 100),
        codAmount: Math.random() > 0.7 ? Math.floor(Math.random() * 20000 + 1000) : undefined,
        paymentStatus: Math.random() > 0.7 ? 'cod' : (Math.random() > 0.5 ? 'paid' : 'pending'),
        createdAt: baseDate,
        updatedAt: new Date(baseDate.getTime() + Math.random() * 86400000),
        createdBy: `user${i}@${company.toLowerCase()}.com`,
        rating: status === 'delivered' && Math.random() > 0.3 ? Math.floor(Math.random() * 5) + 1 : undefined
      });
    }

    return orders;
  }

  private generateOrderId(): string {
    const timestamp = Date.now().toString().slice(-6);
    return `ORD${timestamp}`;
  }

  private generateTrackingNumber(): string {
    const timestamp = Date.now().toString().slice(-9);
    return `FL${timestamp}`;
  }
}
