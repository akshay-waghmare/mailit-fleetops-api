import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'organizations', loadComponent: () => import('./pages/organizations.component').then(m => m.OrganizationsComponent) },
  { path: 'places', loadComponent: () => import('./pages/places.component').then(m => m.PlacesComponent) },
  { path: 'geofences', loadComponent: () => import('./pages/geofences.component').then(m => m.GeofencesComponent) },
  { path: 'orders', loadComponent: () => import('./pages/orders.component').then(m => m.OrdersComponent) },
  { path: 'pickup', loadComponent: () => import('./pages/pickup.component').then(m => m.PickupComponent) },
  { path: 'billing', loadComponent: () => import('./pages/billing.component').then(m => m.BillingComponent) },
  { path: 'mis-reports', loadComponent: () => import('./pages/mis-reports.component').then(m => m.MisReportsComponent) },
  { path: 'settings', loadComponent: () => import('./pages/settings.component').then(m => m.SettingsComponent) },
  { path: '**', redirectTo: '' }
];
