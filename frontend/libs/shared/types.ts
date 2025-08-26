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
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates: {
    longitude: number;
    latitude: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
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
  page: number;
  size: number;
}