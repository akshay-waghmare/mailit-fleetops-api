import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard.component';
import { authGuard, adminGuard, agentGuard, staffGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Public routes
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'forbidden',
    loadComponent: () => import('./pages/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  {
    path: 'unauthorized',
    redirectTo: 'forbidden'
  },

  // Authenticated core route
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },

  // Operational modules (authenticated)
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
    canActivate: [authGuard, staffGuard]
  },
  {
    path: 'order-list',
    loadComponent: () => import('./pages/order-list.component').then(m => m.OrderListComponent),
    canActivate: [authGuard, staffGuard]
  },
  {
    path: 'clients/import',
    loadComponent: () => import('./pages/clients/client-bulk-import/client-bulk-import.component').then(m => m.ClientBulkImportComponent),
    canActivate: [authGuard]
  },
  {
    path: 'clients',
    loadComponent: () => import('./pages/clients/client-list/client-list.component').then(m => m.ClientListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'order-analytics',
    loadComponent: () => import('./pages/order-analytics.component').then(m => m.OrderAnalyticsComponent),
    canActivate: [authGuard, staffGuard]
  },
  {
    path: 'bulk-upload',
    loadComponent: () => import('./pages/bulk-upload.component').then(m => m.BulkUploadComponent),
    canActivate: [authGuard, staffGuard]
  },
  {
    path: 'bulk-upload-history',
    loadComponent: () => import('./pages/bulk-upload-history.component').then(m => m.BulkUploadHistoryComponent),
    canActivate: [authGuard, staffGuard]
  },
  {
    path: 'pickup',
    loadComponent: () => import('./pages/pickup.component').then(m => m.PickupComponent),
    canActivate: [authGuard, staffGuard]
  },
  {
    path: 'pickup-list',
    loadComponent: () => import('./pages/pickup-list.component').then(m => m.PickupListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'pickup-analytics',
    loadComponent: () => import('./pages/pickup-analytics.component').then(m => m.PickupAnalyticsComponent),
    canActivate: [authGuard, staffGuard]
  },
  {
    path: 'delivery-sheets',
    loadComponent: () => import('./pages/delivery-sheets/delivery-sheets.component').then(m => m.DeliverySheetsComponent),
    canActivate: [authGuard, staffGuard]
  },
  {
    path: 'billing',
    loadComponent: () => import('./pages/billing.component').then(m => m.BillingComponent),
    canActivate: [authGuard, staffGuard]
  },
  {
    path: 'mis-reports',
    loadComponent: () => import('./pages/mis-reports.component').then(m => m.MisReportsComponent),
    canActivate: [authGuard, staffGuard]
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings.component').then(m => m.SettingsComponent),
    canActivate: [authGuard]
  },

  // Role-scoped routes
  {
    path: 'admin/users',
    loadComponent: () => import('./pages/users/user-list.component').then(m => m.UserListComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'my-delivery-sheets',
    loadComponent: () => import('./pages/delivery-sheets/my-delivery-sheets.component').then(m => m.MyDeliverySheetsComponent),
    canActivate: [authGuard, agentGuard]
  },

  // Default & fallback
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' }
];
