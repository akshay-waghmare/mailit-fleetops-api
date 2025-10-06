/**
 * Authentication Guards
 * Epic E10: Minimal RBAC (User Management)
 * Tasks T024-T025: Create auth guard and role guard
 * 
 * Guards:
 * - authGuard: Checks if user is authenticated
 * - roleGuard: Checks if user has required role(s)
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Auth Guard - Protects routes that require authentication
 * Usage: canActivate: [authGuard]
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirect to login with return URL
  router.navigate(['/login'], { 
    queryParams: { returnUrl: state.url } 
  });
  return false;
};

/**
 * Role Guard - Protects routes that require specific role(s)
 * Usage: canActivate: [roleGuard], data: { roles: ['ADMIN'] }
 * Usage: canActivate: [roleGuard], data: { roles: ['ADMIN', 'STAFF'] }
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // First check authentication
  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], { 
      queryParams: { returnUrl: state.url } 
    });
    return false;
  }

  // Get required roles from route data
  const requiredRoles = route.data['roles'] as string[];
  
  if (!requiredRoles || requiredRoles.length === 0) {
    // No specific roles required, just authentication
    return true;
  }

  // Check if user has any of the required roles
  if (authService.hasAnyRole(requiredRoles)) {
    return true;
  }

  // User doesn't have required role, redirect to unauthorized page
  router.navigate(['/unauthorized']);
  return false;
};

/**
 * Admin Guard - Shorthand for ADMIN role
 * Usage: canActivate: [adminGuard]
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], { 
      queryParams: { returnUrl: state.url } 
    });
    return false;
  }

  if (authService.isAdmin()) {
    return true;
  }

  router.navigate(['/unauthorized']);
  return false;
};

/**
 * Staff Guard - Allows ADMIN and STAFF
 * Usage: canActivate: [staffGuard]
 */
export const staffGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], { 
      queryParams: { returnUrl: state.url } 
    });
    return false;
  }

  if (authService.hasAnyRole(['ADMIN', 'STAFF'])) {
    return true;
  }

  router.navigate(['/unauthorized']);
  return false;
};
