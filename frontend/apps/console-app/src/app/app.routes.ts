import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'organizations', loadComponent: () => import('./pages/organizations.component').then(m => m.OrganizationsComponent) },
  { path: 'places', loadComponent: () => import('./pages/places.component').then(m => m.PlacesComponent) },
  { path: 'geofences', loadComponent: () => import('./pages/geofences.component').then(m => m.GeofencesComponent) },
  { path: 'orders', loadComponent: () => import('./pages/orders.component').then(m => m.OrdersComponent) },
  { path: 'order-list', loadComponent: () => import('./pages/order-list.component').then(m => m.OrderListComponent) },
  // Order edit is now available via modal in order-list - remove route to prevent confusion
  // { path: 'order-edit/:id', loadComponent: () => import('./pages/order-edit.component').then(m => m.OrderEditComponent) },
  { path: 'order-analytics', loadComponent: () => import('./pages/order-analytics.component').then(m => m.OrderAnalyticsComponent) },
  { path: 'bulk-upload', loadComponent: () => import('./pages/bulk-upload.component').then(m => m.BulkUploadComponent) },
  { path: 'pickup', loadComponent: () => import('./pages/pickup.component').then(m => m.PickupComponent) },
  { path: 'pickup-list', loadComponent: () => import('./pages/pickup-list.component').then(m => m.PickupListComponent) },
  // If your file lives in a pickup-analytics folder, point to that file:
  { path: 'pickup-analytics', loadComponent: () => import('./pages/pickup-analytics.component').then(m => m.PickupAnalyticsComponent) },
  { path: 'billing', loadComponent: () => import('./pages/billing.component').then(m => m.BillingComponent) },
  { path: 'mis-reports', loadComponent: () => import('./pages/mis-reports.component').then(m => m.MisReportsComponent) },
  { path: 'settings', loadComponent: () => import('./pages/settings.component').then(m => m.SettingsComponent) },
  { path: '**', redirectTo: '' }
];
