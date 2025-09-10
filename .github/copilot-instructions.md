# Copilot Instructions — Places Backend Implementation

## Current Analysis
**Backend Status**: 
- ✅ Place entity exists: `backend/src/main/java/com/fleetops/geo/entity/Place.java`
- ✅ Database schema exists: places table with PostGIS spatial support  
- ✅ Frontend API service exists: `frontend/libs/shared/api.service.ts` has place methods
- ❌ **Missing**: Repository, Service, Controller, DTOs for Places backend

**Goal**: Complete the backend implementation for Places CRUD operations with spatial support.

## Implementation Plan

### Phase 1: Core Backend Components (Day 1)
**Repository Layer**
- Create `PlaceRepository` with JpaRepository + spatial queries
- Add custom methods: `findByOrganizationId`, `findNearby`, `findByType`

**Service Layer** 
- Create `PlaceService` interface and implementation
- Handle CRUD operations + coordinate conversion (lat/lng ↔ JTS Point)
- Add validation and business logic

**DTO Layer**
- Create `PlaceRequest` DTO for create/update operations
- Create `PlaceResponse` DTO for API responses  
- Handle coordinate serialization (JTS Point → lat/lng JSON)

### Phase 2: REST Controller (Day 2)
**PlaceController**
- Implement REST endpoints: GET, POST, PUT, DELETE
- Add pagination, filtering (by organizationId, type)
- Add spatial endpoint: GET `/places/nearby`
- Handle proper HTTP status codes and error responses

### Phase 3: Testing & Validation (Day 3)
**Unit Tests**
- Repository tests with spatial data
- Service tests with coordinate conversion
- Controller tests with MockMvc

**Integration Testing**  
- End-to-end API tests with real PostGIS data
- Validate frontend integration

## Technical Specifications

### Coordinate Handling Strategy
**API Format**: Use simple lat/lng JSON for frontend compatibility
```json
{
  "latitude": 37.7749,
  "longitude": -122.4194
}
```

**Backend Conversion**: Service layer converts between:
- API: `{ latitude, longitude }` 
- Entity: `org.locationtech.jts.geom.Point` with SRID 4326

### File Structure
```
backend/src/main/java/com/fleetops/geo/
├── entity/Place.java                    # ✅ Exists
├── repository/PlaceRepository.java      # ❌ Create
├── service/PlaceService.java           # ❌ Create  
├── service/PlaceServiceImpl.java       # ❌ Create
├── controller/PlaceController.java     # ❌ Create
├── dto/PlaceRequest.java              # ❌ Create
├── dto/PlaceResponse.java             # ❌ Create
└── mapper/PlaceMapper.java            # ❌ Create (optional)
```

### Dependencies Required
- ✅ JTS Spatial (already configured)
- ✅ PostGIS (already configured)  
- ✅ Spring Data JPA (already configured)
- ✅ Jackson (already configured)

### API Endpoints Design
```
GET    /api/v1/places                    # List with pagination
GET    /api/v1/places/{id}              # Get by ID
POST   /api/v1/places                   # Create new place
PUT    /api/v1/places/{id}              # Update existing
DELETE /api/v1/places/{id}              # Delete place
GET    /api/v1/places/nearby            # Spatial query
```

### Priority Tasks
1. **PlaceRepository** - Enable data access with spatial queries
2. **PlaceService** - Handle coordinate conversion and business logic  
3. **PlaceController** - Expose REST endpoints
4. **DTOs** - Clean API contracts with lat/lng format
5. **Testing** - Validate spatial functionality

### Success Criteria
- [ ] All CRUD operations working via REST API
- [ ] Coordinate conversion (JTS Point ↔ lat/lng) working
- [ ] Pagination and filtering by organizationId working
- [ ] Spatial nearby query working (within radius)
- [ ] Frontend integration successful
- [ ] Unit and integration tests passing

**Status**: Ready for implementation | **Target**: 3 days
