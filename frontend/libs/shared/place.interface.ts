import { Place } from './types';

export interface PlaceRecord extends Place {
  // Display-specific fields
  displayAddress: string;
  statusLabel: string;
  createdAtFormatted: string;
  coordinatesFormatted: string;
  
  // UI state fields
  isSelected?: boolean;
  isLoading?: boolean;
  hasValidationErrors?: boolean;
}

export interface PlaceFormData {
  // Basic Information
  name: string;
  description?: string;
  
  // Address Components - matching backend PlaceRequest
  address?: string;           // Combined address field
  addressLine1: string;       // Street 1
  addressLine2?: string;      // Street 2
  neighbourhood?: string;     // Neighbourhood
  building?: string;          // Building
  securityAccessCode?: string; // Security Access Code
  
  // Location Details
  city: string;
  state: string;
  postalCode: string;
  country: string;
  
  // Coordinates - matching backend structure
  latitude: number;
  longitude: number;
  
  // Contact Information
  phoneNumber?: string;       // Phone field with validation
  phoneCountryCode?: string;  // Country code for phone
  contactPerson?: string;
  avatar?: string;            // Avatar/map selection
  
  // Place type matching backend enum
  type: 'DEPOT' | 'WAREHOUSE' | 'CUSTOMER' | 'PICKUP_POINT' | 'DELIVERY_POINT' | 'SERVICE_CENTER' | 'RETAIL_STORE' | 'DISTRIBUTION_CENTER' | 'OFFICE' | 'OTHER';
  
  // Metadata
  organizationId: string;
  active?: boolean;         // Matching backend field name
}

export interface PlaceListFilters {
  searchTerm?: string;
  organizationId?: string;
  country?: string;
  state?: string;
  city?: string;
  active?: boolean;          // Changed from isActive to active to match backend
  createdDateFrom?: Date;
  createdDateTo?: Date;
}

export interface PlaceTableColumn {
  key: keyof PlaceRecord | 'actions' | 'select';
  label: string;
  sortable: boolean;
  visible: boolean;
  width?: string;
}

export interface PlaceStatusMetrics {
  total: number;
  active: number;
  countries: number;
  recentlyAdded: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string };
}
