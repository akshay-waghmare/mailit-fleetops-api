import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PickupRecord, PickupQueryParams, PaginatedResponse } from './pickup.interface';

@Injectable({
  providedIn: 'root'
})
export class PickupService {
  private readonly baseUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}

  getPickups(params: PickupQueryParams = {}): Observable<PaginatedResponse<PickupRecord>> {
    let httpParams = new HttpParams();
    if (params.page !== undefined) httpParams = httpParams.set('page', String(params.page));
    if (params.limit !== undefined) httpParams = httpParams.set('limit', String(params.limit));
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.pickupType) httpParams = httpParams.set('pickupType', params.pickupType);
    if (params.staffId) httpParams = httpParams.set('staffId', params.staffId);
    if (params.clientId) httpParams = httpParams.set('clientId', params.clientId);
    if (params.fromDate) httpParams = httpParams.set('fromDate', params.fromDate);
    if (params.toDate) httpParams = httpParams.set('toDate', params.toDate);
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder);

    return this.http.get<PaginatedResponse<PickupRecord>>(`${this.baseUrl}/pickups`, { params: httpParams });
  }

  getPickupById(id: string): Observable<PickupRecord> {
    return this.http.get<PickupRecord>(`${this.baseUrl}/pickups/${id}`);
  }

  updatePickup(id: string, data: Partial<PickupRecord>): Observable<PickupRecord> {
    return this.http.put<PickupRecord>(`${this.baseUrl}/pickups/${id}`, data);
  }

  updatePickupStatus(id: string, status: string, notes?: string): Observable<PickupRecord> {
    return this.http.post<PickupRecord>(`${this.baseUrl}/pickups/${id}/status`, { status, notes });
  }

  cancelPickup(id: string, reason: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/pickups/${id}`, { params: new HttpParams().set('reason', reason) });
  }

  getAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/pickups/analytics`);
  }

  exportPickups(params: PickupQueryParams = {}): Observable<Blob> {
    let httpParams = new HttpParams();
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.status) httpParams = httpParams.set('status', params.status);
    // other params as needed
    return this.http.get(`${this.baseUrl}/pickups/export`, { params: httpParams, responseType: 'blob' });
  }

}
