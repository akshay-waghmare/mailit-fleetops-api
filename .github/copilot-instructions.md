# Copilot Instructions — Places Frontend Implementation

## Current Analysis
**Frontend Status**: 
- ✅ Backend API exists: Places CRUD endpoints with spatial support  
- ✅ API Service exists: `frontend/libs/shared/api.service.ts` has place methods
- ✅ Place types exist: `frontend/libs/shared/types.ts` has Place interface
- ❌ **Missing**: Full Places component implementation

**Goal**: Complete the frontend implementation for Places management with modern UI/UX.

## Implementation Context

**Backend Integration**: 
- Backend is already complete with spatial PostGIS support
- API endpoints available: GET, POST, PUT, DELETE `/api/v1/places`
- Coordinate handling: lat/lng JSON ↔ backend spatial types
- No backend changes required

**Frontend Pattern**: 
- Follow order management component structure and design
- Maintain consistency with existing FleetOps UI patterns
- Use Angular Material components with custom styling

## Priority Tasks

### Phase 1: Core Component Architecture
1. **Places Component** - Main places management interface
2. **Place Form** - Create/edit place modal with map integration
3. **Places Service** - Enhanced data management and state
4. **Place Types** - Extended interfaces for UI requirements

### Phase 2: UI Implementation  
1. **Data Table** - Places list with search, filter, pagination
2. **Map Integration** - Coordinate selection and visualization
3. **Form Validation** - Address validation and coordinate handling
4. **Responsive Design** - Mobile-first approach

### Phase 3: Features & Polish
1. **Import/Export** - Bulk place management
2. **Advanced Filters** - Organization, status, location-based
3. **Error Handling** - User-friendly error states
4. **Performance** - Lazy loading and optimization

## Success Criteria
- [ ] Full Places CRUD operations via modern UI
- [ ] Map integration for coordinate selection
- [ ] Search and filtering functionality
- [ ] Import/Export capabilities
- [ ] Responsive design working
- [ ] Error handling and validation complete

**Status**: Ready for frontend implementation | **Target**: 2-3 days
