# Copilot instructions — Order Management Dashboard Implementation
Purpose
-------
Implement a comprehensive Order Management system that mirrors the enhanced Pickup Management interface, providing consistent and professional user experience for managing delivery orders across the FleetOps platform.

Quick Demo / Current Status
---------------------------
**Current State** ✅ - Basic order creation exists:
- Order Creation: http://localhost:4200/orders (existing order scheduling component)

**Target Implementation** 🎯 - Complete Order Management system:
- Order Management List: http://localhost:4200/order-list (new management dashboard)
- Order Analytics: http://localhost:4200/order-analytics (new analytics dashboard)
- Order Detail Modal: Enhanced order viewing and editing capabilities

Quick run steps (from repo root):
```bash
cd frontend
npm install         # only if dependencies are missing
NG_CLI_ANALYTICS=0 npx ng serve console-app --port 4200
# Test existing: /orders (order creation)
# Target: /order-list (new order management dashboard)
```

High-level goal
---------------
Create a complete Order Management system by implementing:
1. **Order Management Dashboard**: Professional table with filtering, sorting, pagination
2. **Real-time Analytics**: Order metrics, status distribution, performance insights
3. **Enhanced Management**: Order detail modal, status updates, bulk operations
4. **Consistent Design**: Match pickup management interface for unified UX

Implementation roadmap (4-week plan)
-----------------------------------
**Week 1: Foundation & Order Interface**
- [ ] Create `order.interface.ts` with comprehensive OrderRecord interface
- [ ] Implement `order.service.ts` with demo data and CRUD operations
- [ ] Add real-time data management with BehaviorSubject
- [ ] Generate realistic demo order data (50+ records)
- [ ] Test order service with filtering and pagination

**Week 2: Order Management Dashboard**
- [ ] Create `order-list.component.ts` matching pickup-list design
- [ ] Implement Material table with proper columns and styling
- [ ] Add real-time status dashboard with order metrics
- [ ] Create advanced filtering system (status, service, date range)
- [ ] Add auto-refresh functionality and row highlighting

**Week 3: Analytics & Integration**
- [ ] Create `order-analytics.component.ts` with order insights
- [ ] Integrate order creation from existing `orders.component.ts`
- [ ] Add navigation flow: Order creation → Management list
- [ ] Implement order highlighting via query parameters
- [ ] Add success notifications with navigation options

**Week 4: Advanced Features & Polish**
- [ ] Create `order-detail-modal.component.ts` for detailed view
- [ ] Add bulk operations (status updates, assignments)
- [ ] Implement order status update workflow
- [ ] Add export functionality and performance optimization
- [ ] Complete testing and documentation

Core implementation points
--------------------------
- **Data structure**: `OrderRecord` interface with comprehensive order fields
- **Service architecture**: `OrderService` with real-time updates and demo data
- **Component design**: Match pickup-list visual style and functionality
- **Navigation integration**: Seamless flow from order creation to management
- **Status management**: Complete order lifecycle tracking

Quick validation steps
---------------------
1. **Test current order creation**:
```bash
cd frontend && NG_CLI_ANALYTICS=0 npx ng serve console-app --port 4200
```

2. **Verify existing order workflow**:
   - Visit http://localhost:4200/orders
   - Test order creation form functionality
   - Check form validation and submission

3. **Implementation validation**:
   - Create order management components
   - Test order data consistency
   - Verify responsive design on mobile devices

Technical implementation files
-----------------------------
**New files to create**:
- `frontend/libs/shared/order.interface.ts` - Order data types and interfaces
- `frontend/libs/shared/order.service.ts` - Order management service with demo data
- `frontend/apps/console-app/src/app/pages/order-list.component.ts` - Main management dashboard
- `frontend/apps/console-app/src/app/pages/order-analytics.component.ts` - Order analytics
- `frontend/apps/console-app/src/app/components/order-detail-modal.component.ts` - Order details

**Files to modify**:
- `frontend/libs/shared/index.ts` - Export order interfaces and services
- `frontend/apps/console-app/src/app/app.routes.ts` - Add order management routes
- `frontend/apps/console-app/src/app/pages/orders.component.ts` - Integration with management

Development guidelines
---------------------
- Follow existing Angular standalone components pattern
- Use Material Design + Tailwind CSS for consistency with pickup management
- Implement comprehensive demo data for offline development
- Add proper TypeScript interfaces for all order data
- Ensure mobile-responsive design with professional appearance
- Use existing color scheme and typography from pickup components

Architecture principles
-----------------------
- **Design Consistency**: Mirror pickup management interface exactly
- **Service-driven**: All data operations through OrderService
- **Real-time updates**: Auto-refresh with highlighting for new orders
- **Professional UI**: Material cards, proper status indicators, enhanced tables
- **Mobile-first**: Responsive design for field staff and management usage

Contact / Resources
------------------
- **Main Plan**: `ORDER-MANAGEMENT-IMPLEMENTATION-PLAN.md` (complete specification)
- **Reference Components**: `pickup-list.component.ts` (design pattern reference)
- **Existing Code**: `orders.component.ts` (current order creation flow)
- **Design System**: Follow FleetOps Material + Tailwind CSS patterns

Priority: **High** | Status: **Implementation Phase** | Target: **4 weeks**
