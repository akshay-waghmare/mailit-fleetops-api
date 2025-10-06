/**
 * Delivery Sheet Service
 * Epic E10: Minimal RBAC (User Management)
 * Task T032: Provide client for delivery sheet APIs
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../../../../../libs/shared';
import {
  CreateDeliverySheetRequest,
  CreateDeliverySheetResponse,
  DeliverySheetListParams,
  DeliverySheetListResponse
} from '../models/delivery-sheet.model';

@Injectable({
  providedIn: 'root'
})
export class DeliverySheetService {
  private readonly baseUrl = inject(ConfigService).apiBaseUrl;
  private readonly API_URL = `${this.baseUrl}/v1/delivery-sheets`;
  private http = inject(HttpClient);

  /**
   * Create a new delivery sheet (ADMIN/STAFF)
   */
  createDeliverySheet(request: CreateDeliverySheetRequest): Observable<CreateDeliverySheetResponse> {
    return this.http.post<CreateDeliverySheetResponse>(this.API_URL, request);
  }

  /**
   * Fetch delivery sheets for admin/staff with optional filters
   */
  getDeliverySheets(params?: DeliverySheetListParams): Observable<DeliverySheetListResponse> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
      if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
      if (params.sort) httpParams = httpParams.set('sort', params.sort);
      if (params.assignedAgentId !== undefined) {
        httpParams = httpParams.set('assignedAgentId', params.assignedAgentId.toString());
      }
      if (params.status && params.status !== 'ALL') {
        httpParams = httpParams.set('status', params.status);
      }
    }

    return this.http.get<DeliverySheetListResponse>(this.API_URL, { params: httpParams });
  }

  /**
   * Fetch delivery sheets scoped to authenticated agent
   */
  getMyDeliverySheets(params?: DeliverySheetListParams): Observable<DeliverySheetListResponse> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
      if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
      if (params.sort) httpParams = httpParams.set('sort', params.sort);
      if (params.status && params.status !== 'ALL') {
        httpParams = httpParams.set('status', params.status);
      }
    }

    return this.http.get<DeliverySheetListResponse>(`${this.API_URL}/my`, { params: httpParams });
  }
}
