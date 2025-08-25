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

export interface Geofence {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  geometry: GeoJSON.Polygon;
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