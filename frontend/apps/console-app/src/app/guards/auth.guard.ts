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
import { CanActivateFn, Router, ActivatedRouteSnapshot, UrlTree } from '@angular/router';
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
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
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
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
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
  return router.createUrlTree(['/forbidden']);
};

/**
 * Admin Guard - Shorthand for ADMIN role
 * Usage: canActivate: [adminGuard]
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  if (authService.isAdmin()) {
    return true;
  }

  return router.createUrlTree(['/forbidden']);
};

/**
 * Staff Guard - Allows ADMIN and STAFF
 * Usage: canActivate: [staffGuard]
 */
export const staffGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  if (authService.hasAnyRole(['ADMIN', 'STAFF'])) {
    return true;
  }

  return router.createUrlTree(['/forbidden']);
};

/**
 * Agent Guard - Allows only AGENT role
 * Usage: canActivate: [agentGuard]
 */
export const agentGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  if (authService.isAgent()) {
    return true;
  }

  return router.createUrlTree(['/forbidden']);
};
