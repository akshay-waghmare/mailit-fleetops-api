/**
 * Authentication Service
 * Epic E10: Minimal RBAC (User Management)
 * Task T022: Create AuthService
 * 
 * Responsibilities:
 * - Login/logout
 * - Token management (localStorage)
 * - Current user state (BehaviorSubject)
 * - Role checking helpers
 */

import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { 
  LoginRequest, 
  LoginResponse, 
  RefreshTokenRequest, 
  RefreshTokenResponse, 
  UserInfo,
  JwtPayload 
} from '../models/auth.model';
import { ConfigService } from '../../../../../libs/shared';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl: string;
  private readonly ACCESS_TOKEN_KEY = 'fleetops_access_token';
  private readonly REFRESH_TOKEN_KEY = 'fleetops_refresh_token';
  private readonly USER_KEY = 'fleetops_user';

  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private configService = inject(ConfigService);

  // Current user state
  private currentUserSubject = new BehaviorSubject<UserInfo | null>(this.getUserFromStorage());
  public currentUser$: Observable<UserInfo | null> = this.currentUserSubject.asObservable();

  // Authentication state
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

  constructor() {
    // Check token validity on service initialization
    this.baseUrl = this.configService.apiBaseUrl;
    this.checkTokenValidity();
  }

  /**
   * Login with username and password
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/v1/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.setSession(response);
        })
      );
  }

  /**
   * Logout - clear tokens and redirect to login
   */
  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  /**
   * Refresh access token using refresh token
   */
  refreshAccessToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const request: RefreshTokenRequest = { refreshToken };
    return this.http.post<RefreshTokenResponse>(`${this.baseUrl}/v1/auth/refresh`, request)
      .pipe(
        tap(response => {
          this.setAccessToken(response.accessToken);
        })
      );
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.getStorage()?.getItem(this.ACCESS_TOKEN_KEY) ?? null;
  }

  /**
   * Get current refresh token
   */
  getRefreshToken(): string | null {
    return this.getStorage()?.getItem(this.REFRESH_TOKEN_KEY) ?? null;
  }

  /**
   * Get current user
   */
  getCurrentUser(): UserInfo | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.hasValidToken();
  }

  /**
   * Check if current user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles.includes(role) ?? false;
  }

  /**
   * Check if current user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return roles.some(role => user?.roles.includes(role)) ?? false;
  }

  /**
   * Check if current user is admin
   */
  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  /**
   * Check if current user is staff
   */
  isStaff(): boolean {
    return this.hasRole('STAFF');
  }

  /**
   * Check if current user is agent
   */
  isAgent(): boolean {
    return this.hasRole('AGENT');
  }

  /**
   * Set authentication session after successful login
   */
  private setSession(authResult: LoginResponse): void {
    const storage = this.getStorage();
    if (!storage) {
      return;
    }

    storage.setItem(this.ACCESS_TOKEN_KEY, authResult.accessToken);
    storage.setItem(this.REFRESH_TOKEN_KEY, authResult.refreshToken);
    storage.setItem(this.USER_KEY, JSON.stringify(authResult.user));
    
    this.currentUserSubject.next(authResult.user);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Set new access token (after refresh)
   */
  private setAccessToken(token: string): void {
    const storage = this.getStorage();
    if (!storage) {
      return;
    }
    storage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  /**
   * Clear authentication session
   */
  private clearSession(): void {
    const storage = this.getStorage();
    if (!storage) {
      return;
    }

    storage.removeItem(this.ACCESS_TOKEN_KEY);
    storage.removeItem(this.REFRESH_TOKEN_KEY);
    storage.removeItem(this.USER_KEY);
    
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Get user from localStorage
   */
  private getUserFromStorage(): UserInfo | null {
    const storage = this.getStorage();
    if (!storage) {
      return null;
    }

    const userJson = storage.getItem(this.USER_KEY);
    if (!userJson) return null;
    
    try {
      return JSON.parse(userJson);
    } catch (e) {
      console.error('Failed to parse user from storage', e);
      return null;
    }
  }

  /**
   * Check if current token is valid (not expired)
   */
  private hasValidToken(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const payload = this.decodeToken(token);
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch (e) {
      return false;
    }
  }

  /**
   * Check token validity and logout if expired
   */
  private checkTokenValidity(): void {
    if (!this.hasValidToken() && this.getRefreshToken()) {
      // Try to refresh token
      this.refreshAccessToken().subscribe({
        error: () => this.clearSession()
      });
    } else if (!this.hasValidToken()) {
      this.clearSession();
    }
  }

  /**
   * Decode JWT token (without verification - only for client-side use)
   * 
   * ⚠️ SECURITY WARNING: This method performs NO cryptographic verification.
   * It only parses the JWT payload for UI purposes (e.g., displaying username, roles).
   * NEVER trust this data for authorization decisions - always validate tokens on the server.
   * Backend APIs MUST verify JWT signatures before granting access to protected resources.
   */
  private decodeToken(token: string): JwtPayload {
    if (typeof atob === 'undefined') {
      throw new Error('Token decoding unavailable in this environment');
    }
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT token');
    }

    // Client-side parsing only - no signature verification
    const payload = parts[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  }

  private getStorage(): Storage | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    try {
      return window.localStorage;
    } catch {
      return null;
    }
  }
}
