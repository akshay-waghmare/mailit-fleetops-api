import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard.component';
import { authGuard, adminGuard, staffGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Public routes
  { 
    path: 'login', 
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) 
  },
  { 
    path: 'unauthorized', 
    loadComponent: () => import('./pages/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent) 
  },

  // Protected routes (require authentication)
  { 
    path: '', 
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'organizations', 
    loadComponent: () => import('./pages/organizations.component').then(m => m.OrganizationsComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'places', 
    loadComponent: () => import('./pages/places.component').then(m => m.PlacesComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'geofences', 
    loadComponent: () => import('./pages/geofences.component').then(m => m.GeofencesComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'orders', 
    loadComponent: () => import('./pages/orders.component').then(m => m.OrdersComponent),
    canActivate: [staffGuard] // ADMIN or STAFF only
  },
  { 
    path: 'order-list', 
    loadComponent: () => import('./pages/order-list.component').then(m => m.OrderListComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'order-analytics', 
    loadComponent: () => import('./pages/order-analytics.component').then(m => m.OrderAnalyticsComponent),
    canActivate: [staffGuard] // ADMIN or STAFF only
  },
  { 
    path: 'bulk-upload', 
    loadComponent: () => import('./pages/bulk-upload.component').then(m => m.BulkUploadComponent),
    canActivate: [staffGuard] // ADMIN or STAFF only
  },
  { 
    path: 'bulk-upload-history', 
    loadComponent: () => import('./pages/bulk-upload-history.component').then(m => m.BulkUploadHistoryComponent),
    canActivate: [staffGuard] // ADMIN or STAFF only
  },
  { 
    path: 'pickup', 
    loadComponent: () => import('./pages/pickup.component').then(m => m.PickupComponent),
    canActivate: [staffGuard] // ADMIN or STAFF only
  },
  { 
    path: 'pickup-list', 
    loadComponent: () => import('./pages/pickup-list.component').then(m => m.PickupListComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'pickup-analytics', 
    loadComponent: () => import('./pages/pickup-analytics.component').then(m => m.PickupAnalyticsComponent),
    canActivate: [staffGuard] // ADMIN or STAFF only
  },
  { 
    path: 'billing', 
    loadComponent: () => import('./pages/billing.component').then(m => m.BillingComponent),
    canActivate: [staffGuard] // ADMIN or STAFF only
  },
  { 
    path: 'mis-reports', 
    loadComponent: () => import('./pages/mis-reports.component').then(m => m.MisReportsComponent),
    canActivate: [staffGuard] // ADMIN or STAFF only
  },
  { 
    path: 'settings', 
    loadComponent: () => import('./pages/settings.component').then(m => m.SettingsComponent),
    canActivate: [authGuard]
  },

  // User management routes (ADMIN only)
  { 
    path: 'users', 
    loadComponent: () => import('./pages/users/user-list.component').then(m => m.UserListComponent),
    canActivate: [adminGuard]
  },

  // Fallback
  { path: '**', redirectTo: '' }
];
