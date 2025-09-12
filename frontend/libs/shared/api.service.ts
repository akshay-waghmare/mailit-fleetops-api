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
  // Basic auth for development/docker parity with PickupService
  // TODO: replace with real auth when security is wired
  private readonly devAuthHeader = {
    'Authorization': 'Basic ' + (typeof btoa !== 'undefined' ? btoa('admin:admin') : '')
  } as const;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.baseUrl = this.configService.apiBaseUrl;
    console.log('🔧 ApiService initialized with baseUrl:', this.baseUrl);
    console.log('🌍 Current environment:', this.configService.environment);
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
  getPlaces(organizationId?: string, page = 0, size = 20): Observable<PagedResponse<Place>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (organizationId) {
      params = params.set('organizationId', organizationId);
    }
    
    return this.http.get<PagedResponse<Place>>(`${this.baseUrl}/places`, { params });
  }

  getPlace(id: string): Observable<ApiResponse<Place>> {
    return this.http.get<ApiResponse<Place>>(`${this.baseUrl}/places/${id}`);
  }

  createPlace(place: Partial<Place>): Observable<ApiResponse<Place>> {
    return this.http.post<ApiResponse<Place>>(`${this.baseUrl}/places`, place);
  }

  updatePlace(id: string, place: Partial<Place>): Observable<ApiResponse<Place>> {
    return this.http.put<ApiResponse<Place>>(`${this.baseUrl}/places/${id}`, place);
  }

  deletePlace(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/places/${id}`);
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

  // Orders
  getOrders(filterParams: any = {}): Observable<PagedResponse<any>> {
    let params = new HttpParams();
    
    // Add all provided filter parameters to the HTTP params
    Object.keys(filterParams).forEach(key => {
      const value = filterParams[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });
    
    // Set default pagination if not provided
    if (!filterParams.page) {
      params = params.set('page', '0');
    }
    if (!filterParams.size) {
      params = params.set('size', '20');
    }
    
    const fullUrl = `${this.baseUrl}/v1/orders`;
    console.log('🌐 ApiService HTTP params:', params.toString());
    console.log('🌐 ApiService making request to:', fullUrl);
    
    return this.http.get<PagedResponse<any>>(fullUrl, { params, headers: this.devAuthHeader as any });
  }

  getOrder(id: string): Observable<ApiResponse<any>> {
  return this.http.get<ApiResponse<any>>(`${this.baseUrl}/v1/orders/${id}`, { headers: this.devAuthHeader as any });
  }

  createOrder(payload: any): Observable<ApiResponse<any>> {
  return this.http.post<ApiResponse<any>>(`${this.baseUrl}/v1/orders`, payload, { headers: this.devAuthHeader as any });
  }

  updateOrder(id: string, payload: any): Observable<ApiResponse<any>> {
  return this.http.put<ApiResponse<any>>(`${this.baseUrl}/v1/orders/${id}`, payload, { headers: this.devAuthHeader as any });
  }

  updateOrderStatus(id: string, payload: any): Observable<ApiResponse<any>> {
  return this.http.patch<ApiResponse<any>>(`${this.baseUrl}/v1/orders/${id}/status`, payload, { headers: this.devAuthHeader as any });
  }

  deleteOrder(id: string): Observable<ApiResponse<void>> {
  return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/v1/orders/${id}`, { headers: this.devAuthHeader as any });
  }

  // Orders analytics
  getOrderAnalytics(startDate?: string, endDate?: string): Observable<ApiResponse<any>> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
  return this.http.get<ApiResponse<any>>(`${this.baseUrl}/v1/orders/analytics`, { params, headers: this.devAuthHeader as any });
  }
}