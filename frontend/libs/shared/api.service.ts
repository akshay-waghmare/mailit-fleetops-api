import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Organization, Place, Geofence, ApiResponse, PagedResponse } from './types';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.baseUrl = this.configService.apiBaseUrl;
  }

  // Organizations
  getOrganizations(page = 0, size = 20): Observable<PagedResponse<Organization>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<PagedResponse<Organization>>(`${this.baseUrl}/organizations`, { params });
  }

  getOrganization(id: string): Observable<ApiResponse<Organization>> {
    return this.http.get<ApiResponse<Organization>>(`${this.baseUrl}/organizations/${id}`);
  }

  createOrganization(organization: Partial<Organization>): Observable<ApiResponse<Organization>> {
    return this.http.post<ApiResponse<Organization>>(`${this.baseUrl}/organizations`, organization);
  }

  updateOrganization(id: string, organization: Partial<Organization>): Observable<ApiResponse<Organization>> {
    return this.http.put<ApiResponse<Organization>>(`${this.baseUrl}/organizations/${id}`, organization);
  }

  deleteOrganization(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/organizations/${id}`);
  }

  // Places
  getPlaces(
    organizationId?: string, 
    type?: string,
    search?: string,
    country?: string,
    city?: string,
    page = 0, 
    size = 20
  ): Observable<PagedResponse<Place>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (organizationId) {
      params = params.set('organizationId', organizationId);
    }
    if (type) {
      params = params.set('type', type);
    }
    if (search) {
      params = params.set('search', search);
    }
    if (country) {
      params = params.set('country', country);
    }
    if (city) {
      params = params.set('city', city);
    }
    
    return this.http.get<PagedResponse<Place>>(`${this.baseUrl}/places`, { params });
  }

  getPlace(id: string): Observable<Place> {
    return this.http.get<Place>(`${this.baseUrl}/places/${id}`);
  }

  createPlace(place: Partial<Place>): Observable<Place> {
    return this.http.post<Place>(`${this.baseUrl}/places`, place);
  }

  updatePlace(id: string, place: Partial<Place>): Observable<Place> {
    return this.http.put<Place>(`${this.baseUrl}/places/${id}`, place);
  }

  deletePlace(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/places/${id}`);
  }

  // Additional place-specific methods
  getNearbyPlaces(
    latitude: number,
    longitude: number,
    radiusKm: number = 10,
    organizationId?: string
  ): Observable<Place[]> {
    let params = new HttpParams()
      .set('latitude', latitude.toString())
      .set('longitude', longitude.toString())
      .set('radiusKm', radiusKm.toString());
    
    if (organizationId) {
      params = params.set('organizationId', organizationId);
    }
    
    return this.http.get<Place[]>(`${this.baseUrl}/places/nearby`, { params });
  }

  getPlacesByOrganization(organizationId: string): Observable<Place[]> {
    return this.http.get<Place[]>(`${this.baseUrl}/places/organization/${organizationId}`);
  }

  checkPlaceNameExists(organizationId: string, name: string): Observable<boolean> {
    const params = new HttpParams()
      .set('organizationId', organizationId)
      .set('name', name);
    
    return this.http.get<boolean>(`${this.baseUrl}/places/check-name`, { params });
  }

  // Geofences
  getGeofences(organizationId?: string, page = 0, size = 20): Observable<PagedResponse<Geofence>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (organizationId) {
      params = params.set('organizationId', organizationId);
    }
    
    return this.http.get<PagedResponse<Geofence>>(`${this.baseUrl}/geofences`, { params });
  }

  getGeofence(id: string): Observable<ApiResponse<Geofence>> {
    return this.http.get<ApiResponse<Geofence>>(`${this.baseUrl}/geofences/${id}`);
  }

  createGeofence(geofence: Partial<Geofence>): Observable<ApiResponse<Geofence>> {
    return this.http.post<ApiResponse<Geofence>>(`${this.baseUrl}/geofences`, geofence);
  }

  updateGeofence(id: string, geofence: Partial<Geofence>): Observable<ApiResponse<Geofence>> {
    return this.http.put<ApiResponse<Geofence>>(`${this.baseUrl}/geofences/${id}`, geofence);
  }

  deleteGeofence(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/geofences/${id}`);
  }
}