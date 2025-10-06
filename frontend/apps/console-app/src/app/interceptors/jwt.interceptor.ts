/**
 * JWT HTTP Interceptor
 * Epic E10: Minimal RBAC (User Management)
 * Task T023: Create HTTP interceptor for JWT
 * 
 * Responsibilities:
 * - Attach Authorization header with Bearer token to all requests
 * - Handle 401 responses (try refresh token, then logout)
 */

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Skip interceptor for auth endpoints
  if (req.url.includes('/auth/login') || req.url.includes('/auth/refresh')) {
    return next(req);
  }

  // Add Authorization header if token exists
  const token = authService.getAccessToken();
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Handle response
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // If 401 and we have a refresh token, try refreshing
      if (error.status === 401 && authService.getRefreshToken()) {
        return authService.refreshAccessToken().pipe(
          switchMap(() => {
            // Retry original request with new token
            const newToken = authService.getAccessToken();
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            // Refresh failed, logout
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }

      // For other errors or if refresh failed, pass through
      return throwError(() => error);
    })
  );
};
