# 📦 Order Management Database Integration Plan

## 🎯 Objective
Integrate the existing Order Management frontend with a persistent backend database, following the same patterns established for Pickup Management. This includes REST API endpoints, database schema, service layer implementation, and real-time updates.

## 📋 Current Status
- ✅ **Frontend Components**: Order creation, order list UI components exist
- ✅ **Frontend Services**: Basic order service with demo data
- ❌ **Backend Integration**: No database schema or REST APIs
- ❌ **Real-time Updates**: No WebSocket/SSE implementation
- ❌ **Data Persistence**: Orders only exist in frontend memory

## 🏗️ Architecture Overview

### **Technology Stack**
- **Backend**: Spring Boot 3.3.5, Java 21
- **Database**: PostgreSQL 15.4 with PostGIS extensions
- **ORM**: Spring Data JPA with Hibernate
- **Migration**: Flyway for database versioning
- **Frontend**: Angular with RxJS for reactive programming
- **Real-time**: Server-Sent Events (SSE) for live updates

### **Integration Layers**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Angular)     │◄──►│   (Spring Boot) │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
│                      │                      │                 │
│ • Order Components   │ • REST Controllers   │ • Orders Table  │
│ • Order Service      │ • Service Layer     │ • Indexes       │
│ • HTTP Client        │ • JPA Repositories  │ • Constraints   │
│ • SSE Subscription   │ • SSE Endpoints     │ • Audit Logs    │
└─────────────────────┘└─────────────────────┘└─────────────────┘
```

---

## 🗄️ Database Schema Design

### **Orders Table Structure**
```sql
CREATE TABLE orders (
    -- Primary Key
    id BIGSERIAL PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL UNIQUE, -- ORD000001
    
    -- Client Information
    client_id BIGINT,
    client_name VARCHAR(255) NOT NULL,
    client_company VARCHAR(255),
    contact_number VARCHAR(20),
    
    -- Sender Information
    sender_name VARCHAR(255) NOT NULL,
    sender_address TEXT NOT NULL,
    sender_contact VARCHAR(20) NOT NULL,
    sender_email VARCHAR(255),
    sender_pincode VARCHAR(10),
    sender_city VARCHAR(100),
    sender_state VARCHAR(100),
    
    -- Receiver Information
    receiver_name VARCHAR(255) NOT NULL,
    receiver_address TEXT NOT NULL,
    receiver_contact VARCHAR(20) NOT NULL,
    receiver_email VARCHAR(255),
    receiver_pincode VARCHAR(10) NOT NULL,
    receiver_city VARCHAR(100) NOT NULL,
    receiver_state VARCHAR(100),
    
    -- Package Details
    item_count INT DEFAULT 1,
    total_weight DECIMAL(10,2) DEFAULT 0,
    length_cm DECIMAL(8,2),
    width_cm DECIMAL(8,2),
    height_cm DECIMAL(8,2),
    item_description TEXT,
    declared_value DECIMAL(12,2),
    
    -- Service Details
    service_type VARCHAR(32) NOT NULL, -- express, standard, economy
    carrier_name VARCHAR(100) NOT NULL,
    carrier_id VARCHAR(64),
    tracking_number VARCHAR(100),
    
    -- Status Management
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    status_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status_updated_by VARCHAR(255),
    
    -- Staff Assignment
    assigned_staff_id BIGINT,
    assigned_staff_name VARCHAR(255),
    staff_department VARCHAR(100),
    
    -- Delivery Information
    estimated_delivery_date DATE,
    actual_delivery_date DATE,
    delivery_time TIME,
    delivery_instructions TEXT,
    
    -- Financial Information
    cod_amount DECIMAL(12,2) DEFAULT 0,
    shipping_cost DECIMAL(10,2),
    tax_amount DECIMAL(10,2),
    total_amount DECIMAL(12,2),
    payment_status VARCHAR(32) DEFAULT 'pending', -- pending, paid, failed, refunded
    
    -- Additional Fields
    special_instructions TEXT,
    rating DECIMAL(2,1), -- 1.0 to 5.0
    customer_feedback TEXT,
    
    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    
    -- Metadata (JSONB for flexible fields)
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for Performance
CREATE INDEX idx_orders_order_id ON orders(order_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_client_id ON orders(client_id);
CREATE INDEX idx_orders_tracking_number ON orders(tracking_number);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_delivery_date ON orders(estimated_delivery_date);
CREATE INDEX idx_orders_assigned_staff ON orders(assigned_staff_id);

-- Full-text search index
CREATE INDEX idx_orders_search ON orders USING GIN (
    to_tsvector('english', 
        coalesce(client_name,'') || ' ' || 
        coalesce(sender_name,'') || ' ' || 
        coalesce(receiver_name,'') || ' ' || 
        coalesce(item_description,'')
    )
);

-- Partial indexes for common queries
CREATE INDEX idx_orders_active ON orders(created_at) WHERE status IN ('pending', 'confirmed', 'picked-up', 'in-transit');
CREATE INDEX idx_orders_delivered ON orders(actual_delivery_date) WHERE status = 'delivered';
```

### **Order Status History Table (Audit Trail)**
```sql
CREATE TABLE order_status_history (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    from_status VARCHAR(32),
    to_status VARCHAR(32) NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    changed_by VARCHAR(255),
    reason TEXT,
    notes TEXT,
    location_lat DECIMAL(10,8), -- Optional GPS tracking
    location_lng DECIMAL(11,8),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX idx_order_status_history_changed_at ON order_status_history(changed_at);
```

---

## 🔌 REST API Endpoints

### **Order Management API (v1)**

#### **1. Create Order**
```http
POST /api/v1/orders
Content-Type: application/json
Idempotency-Key: optional-unique-key

{
  "clientId": 12,
  "senderName": "FleetOps India Pvt Ltd",
  "senderAddress": "123 Business Park, Mumbai, Maharashtra",
  "senderContact": "+91-9876543210",
  "senderEmail": "sender@fleetops.com",
  "senderPincode": "400001",
  "receiverName": "Rajesh Gupta",
  "receiverAddress": "456 Residential Area, Bangalore, Karnataka",
  "receiverContact": "+91-9123456789",
  "receiverEmail": "receiver@example.com",
  "receiverPincode": "560001",
  "itemCount": 1,
  "totalWeight": 2.5,
  "dimensions": {
    "length": 30,
    "width": 20,
    "height": 15
  },
  "itemDescription": "Samsung Galaxy Smartphone",
  "declaredValue": 25000,
  "serviceType": "express",
  "carrierName": "Blue Dart",
  "carrierId": "BD001",
  "codAmount": 0,
  "specialInstructions": "Handle with care"
}

Response: 201 Created
Location: /api/v1/orders/123
{
  "id": 123,
  "orderId": "ORD000123",
  "status": "pending",
  "trackingNumber": "BD1234567890",
  "estimatedDeliveryDate": "2025-08-31",
  "totalAmount": 27150.00,
  "createdAt": "2025-08-29T16:30:00Z"
}
```

#### **2. List Orders (with filters & pagination)**
```http
GET /api/v1/orders?page=0&size=20&sort=createdAt,desc&status=pending&clientId=12&fromDate=2025-08-01&toDate=2025-08-31&q=Samsung

Response: 200 OK
{
  "content": [
    {
      "id": 123,
      "orderId": "ORD000123",
      "clientName": "FleetOps India Pvt Ltd",
      "senderName": "FleetOps India Pvt Ltd",
      "receiverName": "Rajesh Gupta",
      "receiverCity": "Bangalore",
      "serviceType": "express",
      "carrierName": "Blue Dart",
      "status": "pending",
      "trackingNumber": "BD1234567890",
      "totalWeight": 2.5,
      "declaredValue": 25000,
      "totalAmount": 27150.00,
      "estimatedDeliveryDate": "2025-08-31",
      "assignedStaffName": "Priya Sharma",
      "createdAt": "2025-08-29T16:30:00Z"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": {
      "sorted": true,
      "orders": [{"property": "createdAt", "direction": "DESC"}]
    }
  },
  "totalElements": 150,
  "totalPages": 8,
  "first": true,
  "last": false
}
```

#### **3. Get Single Order**
```http
GET /api/v1/orders/123

Response: 200 OK
{
  "id": 123,
  "orderId": "ORD000123",
  // ... full order details including all fields
  "statusHistory": [
    {
      "fromStatus": null,
      "toStatus": "pending",
      "changedAt": "2025-08-29T16:30:00Z",
      "changedBy": "System",
      "reason": "Order created"
    }
  ]
}
```

#### **4. Update Order Status**
```http
PATCH /api/v1/orders/123/status
Content-Type: application/json

{
  "status": "confirmed",
  "reason": "Payment verified",
  "notes": "Customer called to confirm delivery address",
  "updatedBy": "admin@fleetops.com"
}

Response: 200 OK
{
  "id": 123,
  "orderId": "ORD000123",
  "status": "confirmed",
  "statusUpdatedAt": "2025-08-29T17:15:00Z",
  "statusUpdatedBy": "admin@fleetops.com"
}
```

#### **5. Update Order Details**
```http
PUT /api/v1/orders/123
Content-Type: application/json

{
  // Updated order fields
  "assignedStaffId": 456,
  "specialInstructions": "Updated delivery instructions",
  "estimatedDeliveryDate": "2025-08-30"
}

Response: 200 OK
{
  // Updated order object
}
```

#### **6. Delete/Cancel Order**
```http
DELETE /api/v1/orders/123?reason=customer_request

Response: 200 OK
{
  "message": "Order cancelled successfully",
  "orderId": "ORD000123",
  "status": "cancelled"
}
```

#### **7. Order Analytics**
```http
GET /api/v1/orders/analytics?period=daily&fromDate=2025-08-01&toDate=2025-08-31

Response: 200 OK
{
  "summary": {
    "totalOrders": 1250,
    "pendingOrders": 45,
    "inTransitOrders": 78,
    "deliveredOrders": 1100,
    "cancelledOrders": 27,
    "totalRevenue": 2500000.00,
    "averageOrderValue": 2000.00
  },
  "statusDistribution": {
    "pending": 45,
    "confirmed": 32,
    "picked-up": 28,
    "in-transit": 78,
    "delivered": 1100,
    "cancelled": 27
  },
  "dailyStats": [
    {
      "date": "2025-08-29",
      "orders": 25,
      "revenue": 50000.00,
      "deliveries": 18
    }
  ],
  "carrierPerformance": [
    {
      "carrierName": "Blue Dart",
      "totalOrders": 450,
      "deliveredOnTime": 425,
      "averageDeliveryDays": 1.2,
      "performanceScore": 94.4
    }
  ]
}
```

#### **8. Real-time Updates (SSE)**
```http
GET /api/v1/orders/stream
Accept: text/event-stream

Response: 200 OK
Content-Type: text/event-stream

data: {"type":"order_created","orderId":"ORD000124","data":{...}}

data: {"type":"order_status_changed","orderId":"ORD000123","data":{"status":"in-transit","trackingNumber":"BD1234567890"}}

data: {"type":"order_assigned","orderId":"ORD000125","data":{"assignedStaffId":456,"assignedStaffName":"Priya Sharma"}}
```

---

## 🏗️ Backend Implementation

### **1. Database Migration (Flyway)**
```sql
-- File: V5__create_orders_table.sql
-- (Create orders table and indexes as shown above)

-- File: V6__create_order_status_history.sql  
-- (Create order status history table)

-- File: V7__add_order_indexes.sql
-- (Add performance indexes and constraints)
```

### **2. JPA Entity Classes**

#### **Order Entity**
```java
@Entity
@Table(name = "orders")
@EntityListeners(AuditingEntityListener.class)
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "order_id", unique = true, nullable = false)
    private String orderId;
    
    // Client Information
    @Column(name = "client_id")
    private Long clientId;
    
    @Column(name = "client_name", nullable = false)
    private String clientName;
    
    @Column(name = "client_company")
    private String clientCompany;
    
    // Sender Information
    @Column(name = "sender_name", nullable = false)
    private String senderName;
    
    @Column(name = "sender_address", nullable = false, columnDefinition = "TEXT")
    private String senderAddress;
    
    @Column(name = "sender_contact", nullable = false)
    private String senderContact;
    
    // Receiver Information
    @Column(name = "receiver_name", nullable = false)
    private String receiverName;
    
    @Column(name = "receiver_address", nullable = false, columnDefinition = "TEXT")
    private String receiverAddress;
    
    @Column(name = "receiver_contact", nullable = false)
    private String receiverContact;
    
    @Column(name = "receiver_pincode", nullable = false)
    private String receiverPincode;
    
    @Column(name = "receiver_city", nullable = false)
    private String receiverCity;
    
    // Package Details
    @Column(name = "item_count")
    private Integer itemCount = 1;
    
    @Column(name = "total_weight", precision = 10, scale = 2)
    private BigDecimal totalWeight;
    
    @Column(name = "length_cm", precision = 8, scale = 2)
    private BigDecimal lengthCm;
    
    @Column(name = "width_cm", precision = 8, scale = 2)
    private BigDecimal widthCm;
    
    @Column(name = "height_cm", precision = 8, scale = 2)
    private BigDecimal heightCm;
    
    @Column(name = "item_description", columnDefinition = "TEXT")
    private String itemDescription;
    
    @Column(name = "declared_value", precision = 12, scale = 2)
    private BigDecimal declaredValue;
    
    // Service Details
    @Enumerated(EnumType.STRING)
    @Column(name = "service_type", nullable = false)
    private ServiceType serviceType;
    
    @Column(name = "carrier_name", nullable = false)
    private String carrierName;
    
    @Column(name = "carrier_id")
    private String carrierId;
    
    @Column(name = "tracking_number")
    private String trackingNumber;
    
    // Status Management
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private OrderStatus status = OrderStatus.PENDING;
    
    @Column(name = "status_updated_at")
    private Instant statusUpdatedAt;
    
    @Column(name = "status_updated_by")
    private String statusUpdatedBy;
    
    // Staff Assignment
    @Column(name = "assigned_staff_id")
    private Long assignedStaffId;
    
    @Column(name = "assigned_staff_name")
    private String assignedStaffName;
    
    // Delivery Information
    @Column(name = "estimated_delivery_date")
    private LocalDate estimatedDeliveryDate;
    
    @Column(name = "actual_delivery_date")
    private LocalDate actualDeliveryDate;
    
    // Financial Information
    @Column(name = "cod_amount", precision = 12, scale = 2)
    private BigDecimal codAmount = BigDecimal.ZERO;
    
    @Column(name = "shipping_cost", precision = 10, scale = 2)
    private BigDecimal shippingCost;
    
    @Column(name = "total_amount", precision = 12, scale = 2)
    private BigDecimal totalAmount;
    
    // Audit Fields
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;
    
    @Column(name = "created_by")
    private String createdBy;
    
    @Column(name = "updated_by")
    private String updatedBy;
    
    // Metadata
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "jsonb")
    private Map<String, Object> metadata = new HashMap<>();
    
    // Relationships
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderStatusHistory> statusHistory = new ArrayList<>();
    
    // Enums
    public enum ServiceType {
        EXPRESS, STANDARD, ECONOMY
    }
    
    public enum OrderStatus {
        PENDING, CONFIRMED, PICKED_UP, IN_TRANSIT, DELIVERED, CANCELLED, RETURNED
    }
    
    // Constructors, getters, setters, toString, equals, hashCode
}
```

#### **OrderStatusHistory Entity**
```java
@Entity
@Table(name = "order_status_history")
public class OrderStatusHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "from_status")
    private Order.OrderStatus fromStatus;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "to_status", nullable = false)
    private Order.OrderStatus toStatus;
    
    @Column(name = "changed_at", nullable = false)
    private Instant changedAt = Instant.now();
    
    @Column(name = "changed_by")
    private String changedBy;
    
    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    // GPS tracking (optional)
    @Column(name = "location_lat", precision = 10, scale = 8)
    private BigDecimal locationLat;
    
    @Column(name = "location_lng", precision = 11, scale = 8)
    private BigDecimal locationLng;
    
    // Constructors, getters, setters
}
```

### **3. DTOs (Data Transfer Objects)**

#### **CreateOrderDto**
```java
public class CreateOrderDto {
    @NotNull
    private Long clientId;
    
    @NotBlank
    private String senderName;
    
    @NotBlank
    private String senderAddress;
    
    @NotBlank
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$")
    private String senderContact;
    
    @Email
    private String senderEmail;
    
    @NotBlank
    private String receiverName;
    
    @NotBlank
    private String receiverAddress;
    
    @NotBlank
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$")
    private String receiverContact;
    
    @NotBlank
    @Pattern(regexp = "^[1-9][0-9]{5}$")
    private String receiverPincode;
    
    @NotBlank
    private String receiverCity;
    
    @Min(1)
    private Integer itemCount = 1;
    
    @DecimalMin("0.1")
    private BigDecimal totalWeight;
    
    @DecimalMin("1.0")
    private BigDecimal lengthCm;
    
    @DecimalMin("1.0")
    private BigDecimal widthCm;
    
    @DecimalMin("1.0")
    private BigDecimal heightCm;
    
    private String itemDescription;
    
    @DecimalMin("0.0")
    private BigDecimal declaredValue;
    
    @NotNull
    private Order.ServiceType serviceType;
    
    @NotBlank
    private String carrierName;
    
    private String carrierId;
    
    @DecimalMin("0.0")
    private BigDecimal codAmount = BigDecimal.ZERO;
    
    private String specialInstructions;
    
    // Constructors, getters, setters, validation
}
```

#### **OrderDto**
```java
public class OrderDto {
    private Long id;
    private String orderId;
    private String clientName;
    private String senderName;
    private String receiverName;
    private String receiverCity;
    private Order.ServiceType serviceType;
    private String carrierName;
    private Order.OrderStatus status;
    private String trackingNumber;
    private BigDecimal totalWeight;
    private BigDecimal declaredValue;
    private BigDecimal totalAmount;
    private LocalDate estimatedDeliveryDate;
    private LocalDate actualDeliveryDate;
    private String assignedStaffName;
    private Instant createdAt;
    private Instant updatedAt;
    
    // Status history for detailed view
    private List<OrderStatusHistoryDto> statusHistory;
    
    // Constructors, getters, setters
}
```

### **4. Repository Layer**
```java
@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {
    
    Optional<Order> findByOrderId(String orderId);
    
    Optional<Order> findByTrackingNumber(String trackingNumber);
    
    @Query("SELECT o FROM Order o WHERE o.status IN :statuses")
    Page<Order> findByStatusIn(List<Order.OrderStatus> statuses, Pageable pageable);
    
    @Query("SELECT o FROM Order o WHERE o.clientId = :clientId")
    Page<Order> findByClientId(Long clientId, Pageable pageable);
    
    @Query("SELECT o FROM Order o WHERE o.assignedStaffId = :staffId")
    Page<Order> findByAssignedStaffId(Long staffId, Pageable pageable);
    
    @Query("SELECT o FROM Order o WHERE o.createdAt BETWEEN :fromDate AND :toDate")
    Page<Order> findByCreatedAtBetween(Instant fromDate, Instant toDate, Pageable pageable);
    
    // Analytics queries
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    Long countByStatus(Order.OrderStatus status);
    
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = 'DELIVERED' AND o.createdAt BETWEEN :fromDate AND :toDate")
    BigDecimal sumRevenueByDateRange(Instant fromDate, Instant toDate);
    
    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> getStatusDistribution();
    
    @Query("SELECT o.carrierName, COUNT(o), AVG(CASE WHEN o.actualDeliveryDate <= o.estimatedDeliveryDate THEN 1.0 ELSE 0.0 END) FROM Order o WHERE o.status = 'DELIVERED' GROUP BY o.carrierName")
    List<Object[]> getCarrierPerformance();
}
```

### **5. Service Layer**
```java
@Service
@Transactional
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final OrderStatusHistoryRepository statusHistoryRepository;
    private final SseEventPublisher sseEventPublisher;
    private final OrderMapper orderMapper;
    
    public OrderService(OrderRepository orderRepository, 
                       OrderStatusHistoryRepository statusHistoryRepository,
                       SseEventPublisher sseEventPublisher,
                       OrderMapper orderMapper) {
        this.orderRepository = orderRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.sseEventPublisher = sseEventPublisher;
        this.orderMapper = orderMapper;
    }
    
    public OrderDto createOrder(CreateOrderDto createOrderDto, String idempotencyKey) {
        // Generate unique order ID
        String orderId = generateOrderId();
        
        // Generate tracking number
        String trackingNumber = generateTrackingNumber(createOrderDto.getCarrierName());
        
        // Create order entity
        Order order = orderMapper.toEntity(createOrderDto);
        order.setOrderId(orderId);
        order.setTrackingNumber(trackingNumber);
        order.setStatus(Order.OrderStatus.PENDING);
        order.setCreatedBy("system"); // or from security context
        
        // Calculate estimated delivery date
        order.setEstimatedDeliveryDate(calculateEstimatedDeliveryDate(
            createOrderDto.getServiceType(), createOrderDto.getReceiverPincode()));
        
        // Save order
        Order savedOrder = orderRepository.save(order);
        
        // Create status history entry
        createStatusHistoryEntry(savedOrder, null, Order.OrderStatus.PENDING, 
                               "Order created", "system");
        
        // Publish real-time event
        sseEventPublisher.publishOrderEvent("order_created", savedOrder);
        
        return orderMapper.toDto(savedOrder);
    }
    
    @Transactional(readOnly = true)
    public Page<OrderDto> getOrders(OrderQueryParams params, Pageable pageable) {
        Specification<Order> spec = OrderSpecifications.buildSpecification(params);
        Page<Order> orders = orderRepository.findAll(spec, pageable);
        return orders.map(orderMapper::toDto);
    }
    
    @Transactional(readOnly = true)
    public OrderDto getOrderById(Long id) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Order not found: " + id));
        
        OrderDto dto = orderMapper.toDto(order);
        // Include status history for detailed view
        dto.setStatusHistory(order.getStatusHistory().stream()
            .map(orderMapper::toStatusHistoryDto)
            .collect(Collectors.toList()));
        
        return dto;
    }
    
    public OrderDto updateOrderStatus(Long id, Order.OrderStatus newStatus, 
                                    String reason, String notes, String updatedBy) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Order not found: " + id));
        
        Order.OrderStatus oldStatus = order.getStatus();
        order.setStatus(newStatus);
        order.setStatusUpdatedAt(Instant.now());
        order.setStatusUpdatedBy(updatedBy);
        
        Order updatedOrder = orderRepository.save(order);
        
        // Create status history entry
        createStatusHistoryEntry(updatedOrder, oldStatus, newStatus, reason, updatedBy, notes);
        
        // Publish real-time event
        sseEventPublisher.publishOrderEvent("order_status_changed", updatedOrder);
        
        return orderMapper.toDto(updatedOrder);
    }
    
    public void deleteOrder(Long id, String reason) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Order not found: " + id));
        
        // Soft delete by setting status to cancelled
        order.setStatus(Order.OrderStatus.CANCELLED);
        order.setUpdatedAt(Instant.now());
        orderRepository.save(order);
        
        // Create status history entry
        createStatusHistoryEntry(order, order.getStatus(), Order.OrderStatus.CANCELLED, 
                               reason, "system");
        
        // Publish real-time event
        sseEventPublisher.publishOrderEvent("order_cancelled", order);
    }
    
    @Transactional(readOnly = true)
    public OrderAnalyticsDto getAnalytics(LocalDate fromDate, LocalDate toDate) {
        Instant fromInstant = fromDate.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant toInstant = toDate.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        
        OrderAnalyticsDto analytics = new OrderAnalyticsDto();
        
        // Summary statistics
        analytics.setTotalOrders(orderRepository.count());
        analytics.setPendingOrders(orderRepository.countByStatus(Order.OrderStatus.PENDING));
        analytics.setInTransitOrders(orderRepository.countByStatus(Order.OrderStatus.IN_TRANSIT));
        analytics.setDeliveredOrders(orderRepository.countByStatus(Order.OrderStatus.DELIVERED));
        analytics.setCancelledOrders(orderRepository.countByStatus(Order.OrderStatus.CANCELLED));
        
        // Revenue calculation
        BigDecimal totalRevenue = orderRepository.sumRevenueByDateRange(fromInstant, toInstant);
        analytics.setTotalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO);
        
        // Status distribution
        List<Object[]> statusDist = orderRepository.getStatusDistribution();
        Map<String, Long> statusDistribution = statusDist.stream()
            .collect(Collectors.toMap(
                row -> ((Order.OrderStatus) row[0]).name(),
                row -> (Long) row[1]
            ));
        analytics.setStatusDistribution(statusDistribution);
        
        // Carrier performance
        List<Object[]> carrierPerf = orderRepository.getCarrierPerformance();
        List<CarrierPerformanceDto> carrierPerformance = carrierPerf.stream()
            .map(row -> new CarrierPerformanceDto(
                (String) row[0],           // carrierName
                (Long) row[1],             // totalOrders
                (Double) row[2] * 100      // onTimePercentage
            ))
            .collect(Collectors.toList());
        analytics.setCarrierPerformance(carrierPerformance);
        
        return analytics;
    }
    
    private String generateOrderId() {
        // Implementation: ORD + 6-digit sequence
        return "ORD" + String.format("%06d", System.currentTimeMillis() % 1000000);
    }
    
    private String generateTrackingNumber(String carrierName) {
        // Implementation: Carrier prefix + timestamp + random
        String prefix = carrierName.substring(0, 2).toUpperCase();
        return prefix + System.currentTimeMillis();
    }
    
    private LocalDate calculateEstimatedDeliveryDate(Order.ServiceType serviceType, String pincode) {
        // Implementation: Calculate based on service type and destination
        int days = switch (serviceType) {
            case EXPRESS -> 1;
            case STANDARD -> 3;
            case ECONOMY -> 5;
        };
        return LocalDate.now().plusDays(days);
    }
    
    private void createStatusHistoryEntry(Order order, Order.OrderStatus fromStatus, 
                                        Order.OrderStatus toStatus, String reason, 
                                        String changedBy, String notes) {
        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(order);
        history.setFromStatus(fromStatus);
        history.setToStatus(toStatus);
        history.setReason(reason);
        history.setNotes(notes);
        history.setChangedBy(changedBy);
        history.setChangedAt(Instant.now());
        
        statusHistoryRepository.save(history);
    }
    
    private void createStatusHistoryEntry(Order order, Order.OrderStatus fromStatus, 
                                        Order.OrderStatus toStatus, String reason, String changedBy) {
        createStatusHistoryEntry(order, fromStatus, toStatus, reason, changedBy, null);
    }
}
```

### **6. Controller Layer**
```java
@RestController
@RequestMapping("/api/v1/orders")
@CrossOrigin(origins = "*")
@Validated
public class OrderController {
    
    private final OrderService orderService;
    
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }
    
    @PostMapping
    public ResponseEntity<OrderDto> createOrder(
            @Valid @RequestBody CreateOrderDto createOrderDto,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey) {
        
        OrderDto order = orderService.createOrder(createOrderDto, idempotencyKey);
        
        return ResponseEntity.created(
            URI.create("/api/v1/orders/" + order.getId())
        ).body(order);
    }
    
    @GetMapping
    public ResponseEntity<Page<OrderDto>> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) Order.OrderStatus status,
            @RequestParam(required = false) Long clientId,
            @RequestParam(required = false) String carrierId,
            @RequestParam(required = false) Long assignedStaffId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String q) {
        
        Sort.Direction sortDirection = "desc".equalsIgnoreCase(direction) ? 
            Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));
        
        OrderQueryParams params = OrderQueryParams.builder()
            .status(status)
            .clientId(clientId)
            .carrierId(carrierId)
            .assignedStaffId(assignedStaffId)
            .fromDate(fromDate)
            .toDate(toDate)
            .searchQuery(q)
            .build();
        
        Page<OrderDto> orders = orderService.getOrders(params, pageable);
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<OrderDto> getOrder(@PathVariable Long id) {
        OrderDto order = orderService.getOrderById(id);
        return ResponseEntity.ok(order);
    }
    
    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderDto> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusDto updateStatusDto) {
        
        OrderDto order = orderService.updateOrderStatus(
            id, 
            updateStatusDto.getStatus(),
            updateStatusDto.getReason(),
            updateStatusDto.getNotes(),
            updateStatusDto.getUpdatedBy()
        );
        
        return ResponseEntity.ok(order);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<OrderDto> updateOrder(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderDto updateOrderDto) {
        
        OrderDto order = orderService.updateOrder(id, updateOrderDto);
        return ResponseEntity.ok(order);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteOrder(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "Manual deletion") String reason) {
        
        orderService.deleteOrder(id, reason);
        
        Map<String, String> response = Map.of(
            "message", "Order cancelled successfully",
            "orderId", "ORD" + String.format("%06d", id)
        );
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/analytics")
    public ResponseEntity<OrderAnalyticsDto> getAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        
        if (fromDate == null) fromDate = LocalDate.now().minusDays(30);
        if (toDate == null) toDate = LocalDate.now();
        
        OrderAnalyticsDto analytics = orderService.getAnalytics(fromDate, toDate);
        return ResponseEntity.ok(analytics);
    }
    
    @GetMapping("/stream")
    public SseEmitter streamOrders() {
        return sseEventPublisher.createOrderEventStream();
    }
}
```

---

## 🔄 Frontend Integration

### **1. Update Order Service**
```typescript
// File: frontend/libs/shared/order.service.ts
@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${this.config.apiUrl}/orders`;
  private ordersSubject = new BehaviorSubject<OrderRecord[]>([]);
  private eventSource?: EventSource;

  constructor(
    private http: HttpClient,
    private config: ConfigService
  ) {
    this.initializeSSE();
  }

  // Create order
  createOrder(orderData: CreateOrderData): Observable<OrderRecord> {
    return this.http.post<OrderRecord>(this.apiUrl, orderData).pipe(
      tap(order => {
        const currentOrders = this.ordersSubject.value;
        this.ordersSubject.next([order, ...currentOrders]);
      })
    );
  }

  // Get orders with filtering and pagination
  getOrders(params: OrderQueryParams = {}): Observable<PaginatedResponse<OrderRecord>> {
    const queryParams = new HttpParams({ fromObject: params as any });
    return this.http.get<PaginatedResponse<OrderRecord>>(`${this.apiUrl}?${queryParams}`);
  }

  // Get single order
  getOrderById(id: string): Observable<OrderRecord> {
    return this.http.get<OrderRecord>(`${this.apiUrl}/${id}`);
  }

  // Update order status
  updateOrderStatus(id: string, status: OrderStatus, reason?: string, notes?: string): Observable<OrderRecord> {
    const body = { status, reason, notes, updatedBy: 'current-user' };
    return this.http.patch<OrderRecord>(`${this.apiUrl}/${id}/status`, body).pipe(
      tap(updatedOrder => {
        const currentOrders = this.ordersSubject.value;
        const index = currentOrders.findIndex(o => o.id === id);
        if (index !== -1) {
          currentOrders[index] = updatedOrder;
          this.ordersSubject.next([...currentOrders]);
        }
      })
    );
  }

  // Get analytics
  getAnalytics(fromDate?: string, toDate?: string): Observable<OrderAnalytics> {
    const params: any = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    
    const queryParams = new HttpParams({ fromObject: params });
    return this.http.get<OrderAnalytics>(`${this.apiUrl}/analytics?${queryParams}`);
  }

  // Real-time updates via SSE
  private initializeSSE(): void {
    this.eventSource = new EventSource(`${this.apiUrl}/stream`);
    
    this.eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleSSEEvent(data);
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
    };
  }

  private handleSSEEvent(event: any): void {
    const currentOrders = this.ordersSubject.value;
    
    switch (event.type) {
      case 'order_created':
        this.ordersSubject.next([event.data, ...currentOrders]);
        break;
        
      case 'order_status_changed':
        const index = currentOrders.findIndex(o => o.id === event.data.id);
        if (index !== -1) {
          currentOrders[index] = { ...currentOrders[index], ...event.data };
          this.ordersSubject.next([...currentOrders]);
        }
        break;
        
      case 'order_assigned':
        const assignIndex = currentOrders.findIndex(o => o.id === event.data.id);
        if (assignIndex !== -1) {
          currentOrders[assignIndex] = { ...currentOrders[assignIndex], ...event.data };
          this.ordersSubject.next([...currentOrders]);
        }
        break;
    }
  }

  // Observable for components to subscribe to
  get orders$(): Observable<OrderRecord[]> {
    return this.ordersSubject.asObservable();
  }

  ngOnDestroy(): void {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }
}
```

### **2. Update Order List Component**
```typescript
// File: frontend/apps/console-app/src/app/pages/order-list.component.ts
@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, /* ... other imports */],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'orderId', 'clientName', 'route', 'service', 'status', 
    'deliveryDate', 'amount', 'actions'
  ];
  
  dataSource = new MatTableDataSource<OrderRecord>([]);
  totalElements = 0;
  pageSize = 20;
  currentPage = 0;
  
  // Filters
  filterForm = this.fb.group({
    status: [''],
    carrierName: [''],
    fromDate: [''],
    toDate: [''],
    searchQuery: ['']
  });

  constructor(
    private orderService: OrderService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadOrders();
    this.setupRealTimeUpdates();
    this.setupFilterSubscription();
  }

  loadOrders(): void {
    const filters = this.filterForm.value;
    const params: OrderQueryParams = {
      page: this.currentPage,
      size: this.pageSize,
      ...filters
    };

    this.orderService.getOrders(params).subscribe({
      next: (response) => {
        this.dataSource.data = response.content;
        this.totalElements = response.totalElements;
      },
      error: (error) => {
        console.error('Failed to load orders:', error);
        this.snackBar.open('Failed to load orders', 'Close', { duration: 3000 });
      }
    });
  }

  setupRealTimeUpdates(): void {
    this.orderService.orders$.subscribe(orders => {
      // Update table with real-time changes
      this.dataSource.data = orders;
    });
  }

  setupFilterSubscription(): void {
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 0;
      this.loadOrders();
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadOrders();
  }

  updateOrderStatus(order: OrderRecord, newStatus: OrderStatus): void {
    this.orderService.updateOrderStatus(order.id, newStatus, 'Manual status update').subscribe({
      next: () => {
        this.snackBar.open(`Order ${order.orderId} status updated to ${newStatus}`, 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Failed to update order status:', error);
        this.snackBar.open('Failed to update order status', 'Close', { duration: 3000 });
      }
    });
  }

  ngOnDestroy(): void {
    // Component cleanup handled by service
  }
}
```

### **3. Update Order Creation Component**
```typescript
// File: frontend/apps/console-app/src/app/pages/orders.component.ts
// (Update existing component to use backend API)

onSubmit(): void {
  if (this.orderForm.valid) {
    const orderData: CreateOrderData = this.orderForm.value;
    
    this.orderService.createOrder(orderData).subscribe({
      next: (order) => {
        this.snackBar.open(`Order ${order.orderId} created successfully!`, 'View Details', {
          duration: 5000
        }).onAction().subscribe(() => {
          this.router.navigate(['/order-list'], { 
            queryParams: { highlight: order.id } 
          });
        });
        
        this.orderForm.reset();
      },
      error: (error) => {
        console.error('Failed to create order:', error);
        this.snackBar.open('Failed to create order. Please try again.', 'Close', { 
          duration: 3000 
        });
      }
    });
  }
}
```

---

## 🚀 Implementation Phases

### **Phase 1: Database & Backend Foundation (Week 1)**
1. **Database Setup**
   - [ ] Create Flyway migration V5__create_orders_table.sql
   - [ ] Create Flyway migration V6__create_order_status_history.sql
   - [ ] Run migrations and verify schema
   - [ ] Add sample data seeder for development

2. **Backend Core**
   - [ ] Create Order and OrderStatusHistory entities
   - [ ] Implement OrderRepository with custom queries
   - [ ] Create DTOs (CreateOrderDto, OrderDto, UpdateOrderStatusDto)
   - [ ] Implement OrderMapper using MapStruct

3. **Testing Foundation**
   - [ ] Unit tests for repository layer
   - [ ] Integration tests with TestContainers
   - [ ] API documentation with OpenAPI/Swagger

### **Phase 2: Service Layer & REST APIs (Week 2)**
1. **Service Implementation**
   - [ ] Implement OrderService with all CRUD operations
   - [ ] Add order ID and tracking number generation
   - [ ] Implement status history tracking
   - [ ] Add analytics calculations

2. **REST Controller**
   - [ ] Implement OrderController with all endpoints
   - [ ] Add proper validation and error handling
   - [ ] Implement filtering and pagination
   - [ ] Add analytics endpoint

3. **Testing & Documentation**
   - [ ] Unit tests for service layer
   - [ ] Integration tests for controllers
   - [ ] Postman collection for API testing

### **Phase 3: Real-time Updates & Frontend Integration (Week 3)**
1. **Real-time Features**
   - [ ] Implement SSE for order updates
   - [ ] Add event publishing on order changes
   - [ ] Test real-time functionality

2. **Frontend Integration**
   - [ ] Update OrderService to use backend APIs
   - [ ] Implement SSE subscription in frontend
   - [ ] Update order-list component for backend data
   - [ ] Update order creation component

3. **Error Handling & UX**
   - [ ] Add proper error handling in frontend
   - [ ] Implement loading states and user feedback
   - [ ] Add offline/retry mechanisms

### **Phase 4: Advanced Features & Polish (Week 4)**
1. **Enhanced Features**
   - [ ] Bulk operations (status updates, assignments)
   - [ ] Advanced filtering and search
   - [ ] Export functionality (PDF, Excel)
   - [ ] Order detail modal with timeline

2. **Performance & Security**
   - [ ] Implement caching for frequently accessed data
   - [ ] Add API rate limiting
   - [ ] Security audit and authentication integration
   - [ ] Performance optimization and monitoring

3. **Production Readiness**
   - [ ] Environment configuration
   - [ ] Logging and monitoring setup
   - [ ] Data backup and recovery procedures
   - [ ] Deployment scripts and documentation

---

## 🧪 Testing Strategy

### **Backend Testing**
```java
@SpringBootTest
@Testcontainers
class OrderServiceIntegrationTest {
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("fleetops_test")
            .withUsername("test")
            .withPassword("test");
    
    @Autowired
    private OrderService orderService;
    
    @Test
    void shouldCreateOrderWithGeneratedId() {
        CreateOrderDto dto = createSampleOrderDto();
        
        OrderDto result = orderService.createOrder(dto, null);
        
        assertThat(result.getOrderId()).startsWith("ORD");
        assertThat(result.getStatus()).isEqualTo(Order.OrderStatus.PENDING);
        assertThat(result.getTrackingNumber()).isNotBlank();
    }
    
    @Test
    void shouldUpdateOrderStatusAndCreateHistory() {
        // Test status updates and history tracking
    }
    
    @Test
    void shouldCalculateAnalyticsCorrectly() {
        // Test analytics calculations
    }
}
```

### **Frontend Testing**
```typescript
describe('OrderService', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OrderService, ConfigService]
    });
    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should create order and update local state', () => {
    const mockOrder: OrderRecord = { /* mock data */ };
    const createData: CreateOrderData = { /* create data */ };

    service.createOrder(createData).subscribe(order => {
      expect(order).toEqual(mockOrder);
    });

    const req = httpMock.expectOne(`${service.apiUrl}`);
    expect(req.request.method).toBe('POST');
    req.flush(mockOrder);
  });

  it('should handle SSE events correctly', () => {
    // Test real-time event handling
  });
});
```

---

## 📊 Performance Considerations

### **Database Optimization**
- **Indexes**: Strategic indexes on frequently queried columns
- **Partitioning**: Consider partitioning orders table by date for large datasets
- **Query Optimization**: Use query analysis and optimization
- **Connection Pooling**: Proper HikariCP configuration

### **API Performance**
- **Pagination**: Efficient offset/cursor-based pagination
- **Caching**: Redis caching for frequently accessed data
- **Async Processing**: Use @Async for non-critical operations
- **Rate Limiting**: Implement API rate limiting

### **Frontend Optimization**
- **Virtual Scrolling**: For large order lists
- **Lazy Loading**: Load order details on demand
- **Debouncing**: Debounce search and filter inputs
- **Memoization**: Cache computed values and API responses

---

## 🔒 Security Considerations

### **API Security**
- **Authentication**: JWT-based authentication
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: Comprehensive validation on all inputs
- **SQL Injection Prevention**: Use parameterized queries

### **Data Protection**
- **Encryption**: Encrypt sensitive data at rest
- **HTTPS**: Enforce HTTPS for all communications
- **Audit Logging**: Log all order modifications
- **Data Masking**: Mask sensitive information in logs

---

## 🚀 Deployment & DevOps

### **Environment Configuration**
```yaml
# application-prod.yml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:fleetops_prod}
    username: ${DB_USERNAME:fleetops}
    password: ${DB_PASSWORD}
  
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
  
  flyway:
    validate-on-migrate: true
    clean-disabled: true

logging:
  level:
    com.fleetops: INFO
    org.springframework.security: WARN
  
server:
  port: ${SERVER_PORT:8080}
```

### **Docker Configuration**
```dockerfile
# Multi-stage build for backend
FROM amazoncorretto:21-alpine AS build
WORKDIR /app
COPY . .
RUN ./gradlew build -x test

FROM amazoncorretto:21-alpine
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### **CI/CD Pipeline**
```yaml
# .github/workflows/order-management.yml
name: Order Management CI/CD
on:
  push:
    paths:
      - 'backend/src/main/java/com/fleetops/order/**'
      - 'frontend/libs/shared/order*'
      - 'frontend/apps/console-app/src/app/pages/order*'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          java-version: '21'
      - name: Run Backend Tests
        run: ./gradlew test
      - name: Run Frontend Tests
        run: npm test -- --project=console-app
  
  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Staging
        run: # deployment steps
```

---

## 📈 Monitoring & Analytics

### **Application Monitoring**
- **Health Checks**: Spring Actuator endpoints
- **Metrics**: Micrometer with Prometheus
- **Distributed Tracing**: Zipkin/Jaeger integration
- **Log Aggregation**: ELK stack or similar

### **Business Metrics**
- **Order Volume**: Track daily/weekly/monthly order counts
- **Delivery Performance**: Monitor on-time delivery rates
- **Revenue Tracking**: Real-time revenue calculations
- **Customer Satisfaction**: Track ratings and feedback

---

## 🎯 Success Metrics

### **Technical KPIs**
- **API Response Time**: < 200ms for 95% of requests
- **Database Query Performance**: < 100ms for complex queries
- **Frontend Load Time**: < 2 seconds for order list
- **Real-time Update Latency**: < 1 second

### **Business KPIs**
- **Order Processing Time**: Reduce by 50%
- **Data Accuracy**: 99.9% accuracy in order tracking
- **User Satisfaction**: > 90% positive feedback
- **System Uptime**: 99.9% availability

---

## 📚 Documentation & Training

### **Technical Documentation**
- [ ] API documentation with OpenAPI/Swagger
- [ ] Database schema documentation
- [ ] Deployment and configuration guides
- [ ] Troubleshooting and FAQ

### **User Documentation**
- [ ] Order management user guide
- [ ] Training materials for staff
- [ ] Video tutorials for common tasks
- [ ] Best practices guide

---

## ✅ Acceptance Criteria

### **Functional Requirements**
- [ ] All CRUD operations work correctly
- [ ] Real-time updates function properly
- [ ] Filtering and search work as expected
- [ ] Analytics provide accurate insights
- [ ] Status tracking is reliable

### **Performance Requirements**
- [ ] API endpoints respond within SLA
- [ ] Frontend loads quickly on all devices
- [ ] Database queries are optimized
- [ ] Real-time updates have minimal latency

### **Security Requirements**
- [ ] All endpoints are properly secured
- [ ] Data validation prevents injection attacks
- [ ] Audit logging captures all changes
- [ ] Sensitive data is properly protected

---

## 🔄 Migration Strategy

### **Data Migration**
- [ ] Export existing demo data
- [ ] Transform data to new schema format
- [ ] Import data with proper validation
- [ ] Verify data integrity

### **Zero-Downtime Deployment**
- [ ] Blue-green deployment strategy
- [ ] Database migration rollback plan
- [ ] API versioning for backward compatibility
- [ ] Gradual feature rollout with feature flags

---

**Document Version**: 1.0  
**Created**: August 29, 2025  
**Status**: Ready for Implementation  
**Priority**: High  

**Estimated Timeline**: 4 weeks  
**Team Required**: 1 Full-stack Developer  
**Dependencies**: Pickup Management completion, PostgreSQL setup  

This comprehensive plan provides a complete roadmap for integrating Order Management with the database, following the same successful patterns established for Pickup Management while adding order-specific features and optimizations.
