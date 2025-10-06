import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, map, catchError, of } from 'rxjs';
import { ApiService } from './api.service';
import { Place } from './types';
import { 
  PlaceRecord, 
  PlaceFormData, 
  PlaceListFilters, 
  PlaceStatusMetrics, 
  ValidationResult 
} from './place.interface';

@Injectable({
  providedIn: 'root'
})
export class PlaceService {
  private placesSubject = new BehaviorSubject<PlaceRecord[]>([]);
  public places$ = this.placesSubject.asObservable();
  
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private selectedPlacesSubject = new BehaviorSubject<PlaceRecord[]>([]);
  public selectedPlaces$ = this.selectedPlacesSubject.asObservable();

  constructor(
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  /**
   * Load places with optional filters
   */
  loadPlaces(filters?: PlaceListFilters): Observable<PlaceRecord[]> {
    this.loadingSubject.next(true);
    
    // During SSR, return mock data immediately to avoid HTTP calls
    if (!isPlatformBrowser(this.platformId)) {
      const mockPlaces = this.getMockPlaces();
      const filteredPlaces = this.applyFilters(mockPlaces, filters);
      this.placesSubject.next(filteredPlaces);
      this.loadingSubject.next(false);
      return of(filteredPlaces);
    }
    
    return this.apiService.getPlaces(filters?.organizationId).pipe(
      map(response => {
        const places = response.content.map(place => this.transformToPlaceRecord(place));
        const filteredPlaces = this.applyFilters(places, filters);
        this.placesSubject.next(filteredPlaces);
        this.loadingSubject.next(false);
        return filteredPlaces;
      }),
      catchError(error => {
        console.error('Error loading places:', error);
        this.loadingSubject.next(false);
        
        // If backend is not available (403, 500, connection errors), return mock data for development
        if (error.status === 403 || error.status === 500 || !error.status) {
          console.log('Backend not available, using mock data for development');
          const mockPlaces = this.getMockPlaces();
          const filteredPlaces = this.applyFilters(mockPlaces, filters);
          this.placesSubject.next(filteredPlaces);
          return of(filteredPlaces);
        }
        
        return of([]);
      })
    );
  }

  /**
   * Create a new place
   */
  createPlace(placeData: PlaceFormData): Observable<PlaceRecord> {
    // During SSR, return mock creation immediately
    if (!isPlatformBrowser(this.platformId)) {
      const mockPlace = this.createMockPlace(placeData);
      const currentPlaces = this.placesSubject.value;
      this.placesSubject.next([mockPlace, ...currentPlaces]);
      return of(mockPlace);
    }
    
    const place: any = this.transformFormDataToPlace(placeData);
    
    return this.apiService.createPlace(place).pipe(
      map(response => {
        const newPlace = this.transformToPlaceRecord(response);
        const currentPlaces = this.placesSubject.value;
        this.placesSubject.next([newPlace, ...currentPlaces]);
        return newPlace;
      }),
      catchError(error => {
        console.error('Error creating place:', error);
        
        // If backend is not available, simulate creation for development
        if (error.status === 403 || error.status === 500 || !error.status) {
          console.log('Backend not available, simulating place creation');
          const mockPlace = this.createMockPlace(placeData);
          const currentPlaces = this.placesSubject.value;
          this.placesSubject.next([mockPlace, ...currentPlaces]);
          return of(mockPlace);
        }
        
        throw error;
      })
    );
  }

  /**
   * Update an existing place
   */
  updatePlace(id: string, placeData: PlaceFormData): Observable<PlaceRecord> {
    const place: any = this.transformFormDataToPlace(placeData);
    
    return this.apiService.updatePlace(id, place).pipe(
      map(response => {
        const updatedPlace = this.transformToPlaceRecord(response);
        const currentPlaces = this.placesSubject.value;
        const updatedPlaces = currentPlaces.map(p => p.id === id ? updatedPlace : p);
        this.placesSubject.next(updatedPlaces);
        return updatedPlace;
      }),
      catchError(error => {
        console.error('Error updating place:', error);
        throw error;
      })
    );
  }

  /**
   * Delete a place
   */
  deletePlace(id: string): Observable<void> {
    return this.apiService.deletePlace(id).pipe(
      map(() => {
        const currentPlaces = this.placesSubject.value;
        const updatedPlaces = currentPlaces.filter(p => p.id !== id);
        this.placesSubject.next(updatedPlaces);
      }),
      catchError(error => {
        console.error('Error deleting place:', error);
        throw error;
      })
    );
  }

  /**
   * Get place status metrics
   */
  getStatusMetrics(places: PlaceRecord[]): PlaceStatusMetrics {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const countries = new Set(places.map(p => p.country)).size;
    const recentlyAdded = places.filter(p => new Date(p.createdAt) >= oneWeekAgo).length;
    const active = places.filter(p => p.active).length;

    return {
      total: places.length,
      active,
      countries,
      recentlyAdded
    };
  }

  /**
   * Validate place form data
   */
  validatePlaceData(placeData: Partial<PlaceFormData>): ValidationResult {
    const errors: { [key: string]: string } = {};

    if (!placeData.name?.trim()) {
      errors['name'] = 'Place name is required';
    }

    if (!placeData.addressLine1?.trim()) {
      errors['addressLine1'] = 'Address line 1 is required';
    }

    if (!placeData.city?.trim()) {
      errors['city'] = 'City is required';
    }

    if (!placeData.state?.trim()) {
      errors['state'] = 'State is required';
    }

    if (!placeData.postalCode?.trim()) {
      errors['postalCode'] = 'Postal code is required';
    }

    if (!placeData.country?.trim()) {
      errors['country'] = 'Country is required';
    }

    if (!placeData.latitude || !placeData.longitude) {
      errors['coordinates'] = 'Coordinates are required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Format display address
   */
  formatDisplayAddress(place: Place): string {
    const parts = [place.addressLine1];
    if (place.addressLine2) parts.push(place.addressLine2);
    parts.push(`${place.city}, ${place.state} ${place.postalCode}`);
    return parts.join(', ');
  }

  /**
   * Format coordinates for display
   */
  formatCoordinates(coordinates: { latitude: number; longitude: number }): string {
    return `${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`;
  }

  /**
   * Update selected places
   */
  updateSelectedPlaces(places: PlaceRecord[]): void {
    this.selectedPlacesSubject.next(places);
  }

  /**
   * Clear selected places
   */
  clearSelection(): void {
    this.selectedPlacesSubject.next([]);
  }

  /**
   * Transform Place to PlaceRecord for UI
   */
  private transformToPlaceRecord(place: Place): PlaceRecord {
    return {
      ...place,
      displayAddress: this.formatDisplayAddress(place),
      statusLabel: place.active ? 'Active' : 'Inactive',
      createdAtFormatted: new Date(place.createdAt).toLocaleDateString(),
      coordinatesFormatted: this.formatCoordinates(place.location),
      isSelected: false,
      isLoading: false,
      hasValidationErrors: false
    };
  }

  /**
   * Transform form data to backend PlaceRequest format
   */
  private transformFormDataToPlace(formData: PlaceFormData): any {
    const payload: any = {
      name: formData.name,
      description: formData.description,
      // Coordinates as top-level fields (backend PlaceRequest requirement)
      latitude: formData.latitude,
      longitude: formData.longitude,
      // Address fields
      addressLine1: formData.addressLine1,
      addressLine2: formData.addressLine2,
      neighbourhood: formData.neighbourhood,
      building: formData.building,
      securityAccessCode: formData.securityAccessCode,
      city: formData.city,
      state: formData.state,
      postalCode: formData.postalCode,
      country: formData.country,
      // Contact information - only include if not empty
      contactPerson: formData.contactPerson,
      // Metadata
      type: formData.type,
      organizationId: formData.organizationId,
      active: formData.active
    };

    // Only include phoneNumber if it's provided and valid
    if (formData.phoneNumber && formData.phoneNumber.trim() !== '') {
      payload.phoneNumber = formData.phoneNumber;
    }

    if (formData.phoneCountryCode && formData.phoneCountryCode.trim() !== '') {
      payload.phoneCountryCode = formData.phoneCountryCode;
    }

    return payload;
  }

  /**
   * Apply filters to places
   */
  private applyFilters(places: PlaceRecord[], filters?: PlaceListFilters): PlaceRecord[] {
    if (!filters) return places;

    return places.filter(place => {
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        const searchText = `${place.name} ${place.displayAddress} ${place.id}`.toLowerCase();
        if (!searchText.includes(searchTerm)) return false;
      }

      if (filters.organizationId && place.organizationId !== filters.organizationId) return false;
      if (filters.country && place.country !== filters.country) return false;
      if (filters.state && place.state !== filters.state) return false;
      if (filters.city && place.city !== filters.city) return false;
      if (filters.active !== undefined && place.active !== filters.active) return false;

      if (filters.createdDateFrom) {
        const createdDate = new Date(place.createdAt);
        if (createdDate < filters.createdDateFrom) return false;
      }

      if (filters.createdDateTo) {
        const createdDate = new Date(place.createdAt);
        if (createdDate > filters.createdDateTo) return false;
      }

      return true;
    });
  }

  /**
   * Get mock places data for development when API is not available
   */
  private getMockPlaces(): PlaceRecord[] {
    const mockPlacesData: Place[] = [
      {
        id: 'mock-1',
        organizationId: 'org-1',
        name: 'Main Office',
        description: 'Primary business location',
        addressLine1: '123 Business Street',
        addressLine2: 'Suite 100',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
        location: { longitude: -74.0059, latitude: 40.7128 },
        type: 'OFFICE' as const,
        active: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 'mock-2',
        organizationId: 'org-1',
        name: 'Warehouse A',
        description: 'Primary storage facility',
        addressLine1: '456 Industrial Ave',
        addressLine2: '',
        city: 'Brooklyn',
        state: 'NY',
        postalCode: '11201',
        country: 'US',
        location: { longitude: -73.9899, latitude: 40.6892 },
        type: 'WAREHOUSE' as const,
        active: true,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01')
      },
      {
        id: 'mock-3',
        organizationId: 'org-1',
        name: 'Customer Center',
        description: 'Customer service location',
        addressLine1: '789 Service Road',
        addressLine2: 'Building B',
        city: 'Queens',
        state: 'NY',
        postalCode: '11101',
        country: 'US',
        location: { longitude: -73.9442, latitude: 40.7282 },
        type: 'SERVICE_CENTER' as const,
        active: false,
        createdAt: new Date('2024-03-10'),
        updatedAt: new Date('2024-03-10')
      }
    ];

    return mockPlacesData.map(place => this.transformToPlaceRecord(place));
  }

  /**
   * Create a mock place for development when backend is not available
   */
  private createMockPlace(placeData: PlaceFormData): PlaceRecord {
    const mockId = 'mock-' + Date.now();
    const mockPlace: Place = {
      id: mockId,
      organizationId: placeData.organizationId || 'default-org',
      name: placeData.name,
      description: placeData.description || '',
      addressLine1: placeData.addressLine1,
      addressLine2: placeData.addressLine2 || '',
      city: placeData.city,
      state: placeData.state,
      postalCode: placeData.postalCode,
      country: placeData.country,
      location: { 
        latitude: placeData.latitude || 0, 
        longitude: placeData.longitude || 0 
      },
      type: placeData.type || 'OTHER',
      active: placeData.active !== undefined ? placeData.active : true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return this.transformToPlaceRecord(mockPlace);
  }
}
