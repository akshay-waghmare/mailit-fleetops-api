// Shared type definitions for FleetOps application
export interface Organization {
  id: string;
  name: string;
  contactEmail: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Place {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  
  // Address fields matching backend PlaceResponse
  address?: string;           // Combined address for display
  addressLine1: string;
  addressLine2?: string;
  neighbourhood?: string;     // Backend uses 'neighbourhood'
  building?: string;
  securityAccessCode?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  
  // Location using backend structure
  location: {
    latitude: number;
    longitude: number;
  };
  
  // Contact information
  phoneNumber?: string;
  phoneCountryCode?: string;
  contactPerson?: string;
  avatar?: string;
  
  // Place type from backend enum  
  type: 'DEPOT' | 'WAREHOUSE' | 'CUSTOMER' | 'PICKUP_POINT' | 'DELIVERY_POINT' | 'SERVICE_CENTER' | 'RETAIL_STORE' | 'DISTRIBUTION_CENTER' | 'OFFICE' | 'OTHER';
  
  // Status - matching backend field name
  active?: boolean;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Additional display fields that backend provides
  formattedAddress?: string;
  displayId?: string;
}

// Custom circle geometry for geofences
export interface CircleGeometry {
  type: 'Circle';
  coordinates: [number, number]; // [longitude, latitude]
  radius: number; // radius in meters
}

// Utility type guards
export const isCircleGeometry = (geometry: any): geometry is CircleGeometry => {
  return geometry && geometry.type === 'Circle';
};

export const isPointGeometry = (geometry: any): geometry is GeoJSON.Point => {
  return geometry && geometry.type === 'Point';
};

export const isPolygonGeometry = (geometry: any): geometry is GeoJSON.Polygon => {
  return geometry && geometry.type === 'Polygon';
};

// Helper to convert circle to polygon approximation
export const circleToPolygon = (center: [number, number], radiusInMeters: number, sides: number = 32): GeoJSON.Polygon => {
  const coords: [number, number][] = [];
  const earthRadius = 6371000; // Earth's radius in meters
  
  for (let i = 0; i <= sides; i++) {
    const angle = (i * 2 * Math.PI) / sides;
    const lat = center[1] + (radiusInMeters / earthRadius) * (180 / Math.PI) * Math.cos(angle);
    const lng = center[0] + (radiusInMeters / earthRadius) * (180 / Math.PI) * Math.sin(angle) / Math.cos(center[1] * Math.PI / 180);
    coords.push([lng, lat]);
  }
  
  return {
    type: 'Polygon',
    coordinates: [coords]
  };
};

export interface Geofence {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  geometry: GeoJSON.Polygon | GeoJSON.Point | CircleGeometry;
  // For circular geofences when geometry is Point
  radius?: number; // radius in meters
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;        // Spring uses 'number' not 'page'
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
}