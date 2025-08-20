import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'organizations', loadComponent: () => import('./pages/organizations.component').then(m => m.OrganizationsComponent) },
  { path: 'places', loadComponent: () => import('./pages/places.component').then(m => m.PlacesComponent) },
  { path: 'geofences', loadComponent: () => import('./pages/geofences.component').then(m => m.GeofencesComponent) },
  { path: '**', redirectTo: '' }
];
