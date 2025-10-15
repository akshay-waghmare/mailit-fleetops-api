/**
 * User Service
 * Epic E10: Minimal RBAC (User Management)
 * Task T027: Create UserService
 * 
 * Responsibilities:
 * - CRUD operations for users
 * - Fetch active agents for delivery sheets
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../../../../../libs/shared';
import {
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  ResetPasswordRequest,
  UserListParams,
  UserListResponse
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly baseUrl = inject(ConfigService).apiBaseUrl;
  private readonly API_URL = `${this.baseUrl}/v1/users`;
  private http = inject(HttpClient);

  /**
   * Get paginated list of users
   */
  getAllUsers(params?: UserListParams): Observable<UserListResponse> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
      if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
      if (params.sort) httpParams = httpParams.set('sort', params.sort);
      if (params.direction) httpParams = httpParams.set('direction', params.direction);
      if (params.search) httpParams = httpParams.set('search', params.search);
    }

    return this.http.get<UserListResponse>(this.API_URL, { params: httpParams });
  }

  /**
   * Get single user by ID
   */
  getUserById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.API_URL}/${id}`);
  }

  /**
   * Create new user (ADMIN only)
   */
  createUser(request: CreateUserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.API_URL, request);
  }

  /**
   * Update existing user (ADMIN only)
   */
  updateUser(id: number, request: UpdateUserRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.API_URL}/${id}`, request);
  }

  /**
   * Reset user password (ADMIN only)
   */
  resetPassword(id: number, newPassword: string): Observable<void> {
    const request: ResetPasswordRequest = { newPassword: newPassword };
    return this.http.patch<void>(`${this.API_URL}/${id}/password`, request);
  }

  /**
   * Delete user (soft delete - ADMIN only)
   */
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  /**
   * Get list of active agents (for delivery sheet assignment)
   * Available to ADMIN and STAFF
   */
  getActiveAgents(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.API_URL}/agents`);
  }
}
