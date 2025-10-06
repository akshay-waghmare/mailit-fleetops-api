import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// Angular Material imports
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

import { 
  PlaceService, 
  PlaceRecord, 
  PlaceListFilters, 
  PlaceTableColumn, 
  PlaceStatusMetrics,
  CountriesService,
  Country
} from '../../../../../libs/shared';

import { PlaceFormModalComponent } from '../components/place-form-modal.component';

@Component({
  selector: 'app-places',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatDividerModule,
    PlaceFormModalComponent
  ],
  template: `
    <div class="places-page">
      <!-- Header Section -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">
            <mat-icon>place</mat-icon>
            Places
          </h1>
          <div class="header-actions">
            <mat-form-field class="search-field" appearance="outline">
              <mat-label>Search Places</mat-label>
              <input matInput [(ngModel)]="searchTerm" (input)="onSearch()"
                     placeholder="Search by name, address, or ID...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
            
            <button mat-stroked-button (click)="refreshData()" class="action-btn"
                    matTooltip="Refresh data">
              <mat-icon>refresh</mat-icon>
              Refresh
            </button>
            
            <button mat-stroked-button (click)="showFilters = !showFilters" class="action-btn"
                    [class.active]="showFilters" matTooltip="Toggle filters">
              <mat-icon>filter_list</mat-icon>
              Filter
            </button>
            
            <button mat-stroked-button [matMenuTriggerFor]="columnsMenu" class="action-btn"
                    matTooltip="Customize columns">
              <mat-icon>view_column</mat-icon>
              Columns
            </button>
            
            <button mat-raised-button color="primary" (click)="openCreateModal()" class="primary-action"
                    matTooltip="Create new place">
              <mat-icon>add</mat-icon>
              New
            </button>
            
            <button mat-stroked-button (click)="openImportDialog()" class="action-btn"
                    matTooltip="Import places">
              <mat-icon>upload</mat-icon>
              Import
            </button>
            
            <button mat-stroked-button (click)="exportPlaces()" class="action-btn"
                    matTooltip="Export places">
              <mat-icon>download</mat-icon>
              Export
            </button>
          </div>
        </div>
      </div>

      <!-- Status Overview Cards -->
      <div class="status-overview" *ngIf="statusMetrics">
        <mat-card class="metric-card total">
          <mat-card-content>
            <div class="metric-value">{{ statusMetrics.total }}</div>
            <div class="metric-label">Total Places</div>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="metric-card active">
          <mat-card-content>
            <div class="metric-value">{{ statusMetrics.active }}</div>
            <div class="metric-label">Active</div>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="metric-card countries">
          <mat-card-content>
            <div class="metric-value">{{ statusMetrics.countries }}</div>
            <div class="metric-label">Countries</div>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="metric-card recent">
          <mat-card-content>
            <div class="metric-value">{{ statusMetrics.recentlyAdded }}</div>
            <div class="metric-label">Added This Week</div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Filter Panel -->
      <mat-card class="filter-panel" *ngIf="showFilters">
        <mat-card-content>
          <div class="filter-grid">
            <mat-form-field appearance="outline">
              <mat-label>Country</mat-label>
              <input matInput 
                     [formControl]="countryFilterControl"
                     [matAutocomplete]="countryFilterAuto"
                     placeholder="Search and select country">
              <mat-icon matSuffix>search</mat-icon>
              <button matSuffix mat-icon-button *ngIf="selectedCountryForFilter" 
                      (click)="clearCountryFilter()" matTooltip="Clear selection">
                <mat-icon>clear</mat-icon>
              </button>
              
              <mat-autocomplete #countryFilterAuto="matAutocomplete" 
                               [displayWith]="displayCountryForFilter">
                
                <!-- Show "All Countries" option when not searching -->
                <mat-optgroup *ngIf="!isSearchingCountryFilter()" label="Quick Selection">
                  <mat-option (click)="clearCountryFilter()">
                    🌍 All Countries
                  </mat-option>
                </mat-optgroup>
                
                <!-- Filtered Countries Section -->
                <mat-optgroup [label]="isSearchingCountryFilter() ? 'Search Results (' + filteredCountriesForFilter.length + ')' : 'All Countries (' + filteredCountriesForFilter.length + ')'">
                  <mat-option *ngFor="let country of filteredCountriesForFilter" [value]="country">
                    {{country.flag}} {{country.name}}
                  </mat-option>
                </mat-optgroup>
                
                <!-- No Results -->
                <mat-option *ngIf="filteredCountriesForFilter.length === 0 && isSearchingCountryFilter()" disabled>
                  No countries found
                </mat-option>
              </mat-autocomplete>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>State</mat-label>
              <input matInput [(ngModel)]="filters.state" (input)="applyFilters()"
                     placeholder="Enter state">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>City</mat-label>
              <input matInput [(ngModel)]="filters.city" (input)="applyFilters()"
                     placeholder="Enter city">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select [(ngModel)]="statusFilterValue" (selectionChange)="onStatusFilterChange($event)" 
                         placeholder="All Status">
                <mat-option value="all">All Status</mat-option>
                <mat-option [value]="true">Active</mat-option>
                <mat-option [value]="false">Inactive</mat-option>
              </mat-select>
            </mat-form-field>

            <div class="filter-actions">
              <button mat-stroked-button (click)="clearFilters()">
                <mat-icon>clear</mat-icon>
                Clear
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Main Data Table -->
      <mat-card class="data-table-card">
        <mat-card-content>
          <!-- Loading Spinner -->
          <div *ngIf="loading" class="loading-container">
            <mat-spinner diameter="40"></mat-spinner>
            <p>Loading places...</p>
          </div>

          <!-- Data Table -->
          <div *ngIf="!loading" class="table-container">
            <table mat-table [dataSource]="dataSource" matSort class="places-table">
              
              <!-- Selection Column -->
              <ng-container matColumnDef="select">
                <th mat-header-cell *matHeaderCellDef>
                  <mat-checkbox (change)="toggleAllSelection($event)"
                               [checked]="isAllSelected()"
                               [indeterminate]="isPartiallySelected()">
                  </mat-checkbox>
                </th>
                <td mat-cell *matCellDef="let place">
                  <mat-checkbox (change)="toggleSelection(place, $event)"
                               [checked]="isSelected(place)">
                  </mat-checkbox>
                </td>
              </ng-container>

              <!-- Address Column -->
              <ng-container matColumnDef="displayAddress">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Address</th>
                <td mat-cell *matCellDef="let place">
                  <div class="address-cell">
                    <div class="primary-address">{{ place.addressLine1 }}</div>
                    <div class="secondary-address" *ngIf="place.addressLine2">
                      {{ place.addressLine2 }}
                    </div>
                    <div class="location-info">
                      {{ place.city }}, {{ place.state }}
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- ID Column -->
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
                <td mat-cell *matCellDef="let place">
                  <span class="place-id">{{ place.id }}</span>
                </td>
              </ng-container>

              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
                <td mat-cell *matCellDef="let place">
                  <div class="name-cell">
                    <span class="place-name">{{ place.name }}</span>
                    <small *ngIf="place.description" class="place-description">
                      {{ place.description }}
                    </small>
                  </div>
                </td>
              </ng-container>

              <!-- Postal Code Column -->
              <ng-container matColumnDef="postalCode">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Postal Code</th>
                <td mat-cell *matCellDef="let place">{{ place.postalCode }}</td>
              </ng-container>

              <!-- Country Column -->
              <ng-container matColumnDef="country">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Country</th>
                <td mat-cell *matCellDef="let place">{{ place.country }}</td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="statusLabel">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                <td mat-cell *matCellDef="let place">
                  <span class="status-badge" [class.active]="place.active" 
                        [class.inactive]="!place.active">
                    {{ place.statusLabel }}
                  </span>
                </td>
              </ng-container>

              <!-- Created At Column -->
              <ng-container matColumnDef="createdAtFormatted">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Created At</th>
                <td mat-cell *matCellDef="let place">{{ place.createdAtFormatted }}</td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let place" (click)="$event.stopPropagation()">
                  <button mat-icon-button [matMenuTriggerFor]="actionMenu" (click)="$event.stopPropagation()">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #actionMenu="matMenu">
                    <button mat-menu-item (click)="editPlace(place)">
                      <mat-icon>edit</mat-icon>
                      Edit
                    </button>
                    <button mat-menu-item (click)="viewPlace(place)">
                      <mat-icon>visibility</mat-icon>
                      View
                    </button>
                    <button mat-menu-item (click)="duplicatePlace(place)">
                      <mat-icon>content_copy</mat-icon>
                      Duplicate
                    </button>
                    <mat-divider></mat-divider>
                    <button mat-menu-item (click)="deletePlace(place)" class="delete-action">
                      <mat-icon>delete</mat-icon>
                      Delete
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="getDisplayedColumns()"></tr>
              <tr mat-row *matRowDef="let row; columns: getDisplayedColumns();"
                  [class.selected]="isSelected(row)"
                  (click)="selectPlace(row)"></tr>
            </table>

            <!-- Pagination -->
            <mat-paginator #paginator
                           [length]="totalPlaces"
                           [pageSize]="pageSize"
                           [pageSizeOptions]="[10, 20, 50, 100]"
                           [showFirstLastButtons]="true"
                           (page)="onPageChange($event)">
            </mat-paginator>

            <!-- Empty State -->
            <div class="empty-state" *ngIf="filteredPlaces.length === 0 && !loading">
              <mat-icon class="empty-icon">place</mat-icon>
              <h3>No places found</h3>
              <p *ngIf="!hasActiveFilters()">Start by creating your first place location.</p>
              <p *ngIf="hasActiveFilters()">Try adjusting your search or filter criteria.</p>
              <div class="empty-actions">
                <button mat-raised-button color="primary" (click)="openCreateModal()" 
                        *ngIf="!hasActiveFilters()">
                  <mat-icon>add</mat-icon>
                  Create Place
                </button>
                <button mat-stroked-button (click)="clearFilters()" 
                        *ngIf="hasActiveFilters()">
                  <mat-icon>clear</mat-icon>
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          <!-- Selection Actions -->
          <div class="selection-actions" *ngIf="selectedPlaces.length > 0">
            <div class="selection-info">
              {{ selectedPlaces.length }} place(s) selected
            </div>
            <div class="bulk-actions">
              <button mat-stroked-button (click)="bulkExport()">
                <mat-icon>download</mat-icon>
                Export Selected
              </button>
              <button mat-stroked-button (click)="bulkDelete()" class="delete-action">
                <mat-icon>delete</mat-icon>
                Delete Selected
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>

    <!-- Columns Menu -->
    <mat-menu #columnsMenu="matMenu" class="columns-menu">
      <div mat-menu-item *ngFor="let column of displayedColumns" 
           (click)="$event.stopPropagation()">
        <mat-checkbox [(ngModel)]="column.visible" 
                     (change)="updateDisplayedColumns()">
          {{ column.label }}
        </mat-checkbox>
      </div>
    </mat-menu>

    <!-- Create/Edit Place Modal -->
    <app-place-form-modal
      [isOpen]="showCreateModal"
      [placeData]="selectedPlaceForEdit"
      [isEditMode]="isEditMode"
      (closeModal)="onModalClose()"
      (placeCreated)="onPlaceCreated($event)"
      (placeUpdated)="onPlaceUpdated($event)">
    </app-place-form-modal>

    <!-- View Place Modal -->
    <div class="modal-overlay" *ngIf="showViewModal" (click)="closeViewModal()">
      <div class="view-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="header-content">
            <div class="header-title">
              <mat-icon>visibility</mat-icon>
              <h2>{{ selectedPlaceForView?.name || 'Place Details' }}</h2>
            </div>
            <button mat-icon-button (click)="closeViewModal()" class="close-button">
              <mat-icon>close</mat-icon>
            </button>
          </div>
        </div>

        <div class="modal-body" *ngIf="selectedPlaceForView">
          <div class="details-grid">
            <!-- Basic Information -->
            <div class="detail-section">
              <h3>Basic Information</h3>
              <div class="detail-item">
                <label>ID</label>
                <span>{{ selectedPlaceForView.id }}</span>
              </div>
              <div class="detail-item">
                <label>Name</label>
                <span>{{ selectedPlaceForView.name }}</span>
              </div>
              <div class="detail-item" *ngIf="selectedPlaceForView.description">
                <label>Description</label>
                <span>{{ selectedPlaceForView.description }}</span>
              </div>
              <div class="detail-item">
                <label>Type</label>
                <span>{{ selectedPlaceForView.type }}</span>
              </div>
              <div class="detail-item">
                <label>Status</label>
                <span class="status-badge" [class.active]="selectedPlaceForView.active" 
                      [class.inactive]="!selectedPlaceForView.active">
                  {{ selectedPlaceForView.statusLabel }}
                </span>
              </div>
            </div>

            <!-- Address Information -->
            <div class="detail-section">
              <h3>Address Information</h3>
              <div class="detail-item">
                <label>Address Line 1</label>
                <span>{{ selectedPlaceForView.addressLine1 }}</span>
              </div>
              <div class="detail-item" *ngIf="selectedPlaceForView.addressLine2">
                <label>Address Line 2</label>
                <span>{{ selectedPlaceForView.addressLine2 }}</span>
              </div>
              <div class="detail-item">
                <label>City</label>
                <span>{{ selectedPlaceForView.city }}</span>
              </div>
              <div class="detail-item">
                <label>State</label>
                <span>{{ selectedPlaceForView.state }}</span>
              </div>
              <div class="detail-item">
                <label>Postal Code</label>
                <span>{{ selectedPlaceForView.postalCode }}</span>
              </div>
              <div class="detail-item">
                <label>Country</label>
                <span>{{ selectedPlaceForView.country }}</span>
              </div>
            </div>

            <!-- Location Information -->
            <div class="detail-section">
              <h3>Location Information</h3>
              <div class="detail-item">
                <label>Coordinates</label>
                <span>{{ selectedPlaceForView.coordinatesFormatted }}</span>
              </div>
              <div class="detail-item">
                <label>Latitude</label>
                <span>{{ selectedPlaceForView.location.latitude }}</span>
              </div>
              <div class="detail-item">
                <label>Longitude</label>
                <span>{{ selectedPlaceForView.location.longitude }}</span>
              </div>
            </div>

            <!-- Contact Information -->
            <div class="detail-section" *ngIf="selectedPlaceForView.phoneNumber">
              <h3>Contact Information</h3>
              <div class="detail-item">
                <label>Phone Number</label>
                <span>{{ selectedPlaceForView.phoneNumber }}</span>
              </div>
            </div>

            <!-- Metadata -->
            <div class="detail-section">
              <h3>Metadata</h3>
              <div class="detail-item">
                <label>Created At</label>
                <span>{{ selectedPlaceForView.createdAtFormatted }}</span>
              </div>
              <div class="detail-item">
                <label>Display Address</label>
                <span>{{ selectedPlaceForView.displayAddress }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button mat-stroked-button (click)="closeViewModal()">
            Close
          </button>
          <button mat-raised-button color="primary" (click)="editPlaceFromView()">
            <mat-icon>edit</mat-icon>
            Edit Place
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .places-page {
      padding: 24px;
      background: #f8fafc;
      min-height: 100vh;
    }

    .page-header {
      margin-bottom: 24px;
      
      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;
        
        .page-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 2rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
          
          mat-icon {
            font-size: 2rem;
            width: 2rem;
            height: 2rem;
            color: #2563eb;
          }
        }
        
        .header-actions {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
          
          .search-field {
            width: 320px;
            height: 56px;
            
            ::ng-deep .mat-mdc-form-field-infix {
              padding-top: 14px;
              padding-bottom: 14px;
            }
          }
          
          .action-btn {
            height: 40px;
            border-color: #e2e8f0;
            
            &:hover {
              background: #f1f5f9;
            }
            
            &.active {
              background: #eff6ff;
              border-color: #2563eb;
              color: #2563eb;
            }
          }
          
          .primary-action {
            height: 40px;
            background: #2563eb;
            
            &:hover {
              background: #1d4ed8;
            }
          }
        }
      }
    }

    .status-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
      
      .metric-card {
        text-align: center;
        transition: transform 0.2s ease;
        
        &:hover {
          transform: translateY(-2px);
        }
        
        mat-card-content {
          padding: 24px 16px;
        }
        
        .metric-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1e293b;
          line-height: 1;
          margin-bottom: 8px;
        }
        
        .metric-label {
          font-size: 0.875rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 500;
        }
        
        &.total { border-top: 4px solid #2563eb; }
        &.active { border-top: 4px solid #059669; }
        &.countries { border-top: 4px solid #7c3aed; }
        &.recent { border-top: 4px solid #dc2626; }
      }
    }

    .filter-panel {
      margin-bottom: 24px;
      
      .filter-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        align-items: end;
        
        .filter-actions {
          display: flex;
          justify-content: flex-end;
          align-items: center;
        }
      }
    }

    .data-table-card {
      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 48px;
        
        p {
          margin-top: 16px;
          color: #64748b;
        }
      }
      
      .table-container {
        overflow-x: auto;
      }
      
      .places-table {
        width: 100%;
        
        .address-cell {
          .primary-address {
            font-weight: 500;
            color: #1e293b;
            margin-bottom: 4px;
          }
          
          .secondary-address {
            font-size: 0.875rem;
            color: #64748b;
            margin-bottom: 4px;
          }
          
          .location-info {
            font-size: 0.875rem;
            color: #94a3b8;
          }
        }
        
        .name-cell {
          .place-name {
            display: block;
            font-weight: 500;
            color: #1e293b;
            margin-bottom: 4px;
          }
          
          .place-description {
            display: block;
            color: #64748b;
            font-size: 0.875rem;
          }
        }
        
        .place-id {
          font-family: monospace;
          font-size: 0.875rem;
          color: #6366f1;
          background: #f0f0ff;
          padding: 2px 6px;
          border-radius: 4px;
        }
        
        .status-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          
          &.active {
            background: #dcfce7;
            color: #166534;
          }
          
          &.inactive {
            background: #fee2e2;
            color: #991b1b;
          }
        }
        
        .mat-row:hover {
          background: #f8fafc;
        }
        
        .selected {
          background: #eff6ff !important;
          border-left: 4px solid #2563eb;
        }
        
        .delete-action {
          color: #dc2626;
        }
      }
      
      .empty-state {
        text-align: center;
        padding: 64px 24px;
        
        .empty-icon {
          font-size: 4rem;
          width: 4rem;
          height: 4rem;
          color: #cbd5e1;
          margin-bottom: 16px;
        }
        
        h3 {
          color: #475569;
          margin-bottom: 8px;
          font-size: 1.25rem;
        }
        
        p {
          color: #94a3b8;
          margin-bottom: 24px;
        }
        
        .empty-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }
      }
      
      .selection-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 0;
        border-top: 1px solid #e2e8f0;
        margin-top: 16px;
        
        .selection-info {
          font-weight: 500;
          color: #374151;
        }
        
        .bulk-actions {
          display: flex;
          gap: 12px;
          
          .delete-action {
            color: #dc2626;
            border-color: #dc2626;
            
            &:hover {
              background: #fef2f2;
            }
          }
        }
      }
    }

    ::ng-deep .columns-menu {
      .mat-menu-content {
        padding: 8px 0;
        
        .mat-menu-item {
          height: auto;
          line-height: normal;
          padding: 8px 16px;
          
          mat-checkbox {
            margin-right: 8px;
          }
        }
      }
    }

    // View Modal Styles
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      animation: fadeIn 0.3s ease;
      padding: 20px;
    }

    .view-modal {
      width: 800px;
      max-width: 90vw;
      max-height: 90vh;
      background: white;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      animation: slideInCenter 0.3s ease;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      overflow: hidden;
    }

    .modal-header {
      padding: 24px 24px 0;
      border-bottom: 1px solid #e2e8f0;
      
      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 16px;
      }
      
      .header-title {
        display: flex;
        align-items: center;
        gap: 12px;
        
        mat-icon {
          color: #2563eb;
          font-size: 28px;
          width: 28px;
          height: 28px;
        }
        
        h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
        }
      }
      
      .close-button {
        color: #64748b;
        
        &:hover {
          color: #334155;
        }
      }
    }

    .modal-body {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 24px;
    }

    .detail-section {
      h3 {
        margin: 0 0 16px 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: #1e293b;
        padding-bottom: 8px;
        border-bottom: 2px solid #f1f5f9;
      }
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      margin-bottom: 16px;
      
      label {
        font-size: 0.75rem;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 4px;
      }
      
      span {
        font-size: 0.9rem;
        color: #1e293b;
        word-break: break-word;
        
        &.status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
          
          &.active {
            background: #dcfce7;
            color: #166534;
          }
          
          &.inactive {
            background: #fee2e2;
            color: #991b1b;
          }
        }
      }
    }

    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    @keyframes slideInCenter {
      from { 
        opacity: 0;
        transform: scale(0.9) translateY(-20px);
      }
      to { 
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    // Responsive design
    @media (max-width: 768px) {
      .places-page {
        padding: 16px;
      }
      
      .header-content {
        flex-direction: column;
        align-items: stretch;
        
        .header-actions {
          justify-content: center;
          
          .search-field {
            width: 100%;
            order: -1;
          }
        }
      }
      
      .status-overview {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .filter-grid {
        grid-template-columns: 1fr;
        
        .filter-actions {
          justify-content: stretch;
          
          button {
            width: 100%;
          }
        }
      }
      
      .selection-actions {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
        
        .bulk-actions {
          justify-content: center;
        }
      }
    }
  `]
})
export class PlacesComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Data properties
  places: PlaceRecord[] = [];
  filteredPlaces: PlaceRecord[] = [];
  selectedPlaces: PlaceRecord[] = [];
  dataSource = new MatTableDataSource<PlaceRecord>([]);
  
  // UI state
  loading = false;
  showCreateModal = false;
  showViewModal = false;
  showFilters = false;
  isEditMode = false;
  selectedPlaceForEdit?: PlaceRecord;
  selectedPlaceForView?: PlaceRecord;
  
  // Pagination
  currentPage = 0;
  pageSize = 20;
  totalPlaces = 0;
  
  // Filter state
  searchTerm = '';
  filters: PlaceListFilters = {};
  statusFilterValue: string | boolean = 'all'; // Separate UI state for mat-select
  
  // Status metrics
  statusMetrics?: PlaceStatusMetrics;
  
  // Table configuration
  displayedColumns: PlaceTableColumn[] = [
    { key: 'select', label: 'Select', sortable: false, visible: true, width: '60px' },
    { key: 'displayAddress', label: 'Address', sortable: true, visible: true },
    { key: 'name', label: 'Name', sortable: true, visible: true },
    { key: 'id', label: 'ID', sortable: true, visible: false },
    { key: 'postalCode', label: 'Postal Code', sortable: true, visible: true },
    { key: 'country', label: 'Country', sortable: true, visible: true },
    { key: 'statusLabel', label: 'Status', sortable: true, visible: true },
    { key: 'createdAtFormatted', label: 'Created At', sortable: true, visible: true },
    { key: 'actions', label: 'Actions', sortable: false, visible: true, width: '80px' }
  ];
  
  // Countries for filter dropdown
  countries: Country[] = [];
  filteredCountriesForFilter: Country[] = [];
  countryFilterControl = new FormControl('');
  selectedCountryForFilter: Country | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private placeService: PlaceService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private countriesService: CountriesService
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
    this.loadCountries();
    this.loadPlaces();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Data loading methods
  loadPlaces(): void {
    this.loading = true;
    this.placeService.loadPlaces(this.filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (places) => {
          this.places = places;
          this.applyFilters();
          this.updateStatusMetrics();
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading places:', error);
          this.snackBar.open('Error loading places', 'Close', { duration: 3000 });
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  refreshData(): void {
    this.loadPlaces();
    this.snackBar.open('Data refreshed', 'Close', { duration: 2000 });
  }

  // Search and filter methods
  onSearch(): void {
    this.filters.searchTerm = this.searchTerm;
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredPlaces = this.places.filter(place => {
      if (this.filters.searchTerm) {
        const searchTerm = this.filters.searchTerm.toLowerCase();
        const searchText = `${place.name} ${place.displayAddress} ${place.id}`.toLowerCase();
        if (!searchText.includes(searchTerm)) return false;
      }

      if (this.filters.country && place.country !== this.filters.country) return false;
      if (this.filters.state && !place.state.toLowerCase().includes(this.filters.state.toLowerCase())) return false;
      if (this.filters.city && !place.city.toLowerCase().includes(this.filters.city.toLowerCase())) return false;
      
      // Handle active filter: only apply if a specific true/false value is selected (not undefined)
      if (this.filters.active !== undefined) {
        if (place.active !== this.filters.active) return false;
      }

      return true;
    });

    this.updateDataSource();
    this.updateStatusMetrics();
  }

  onStatusFilterChange(event: any): void {
    this.statusFilterValue = event.value;
    
    // Update the actual filter
    if (event.value === true || event.value === 'true') {
      this.filters.active = true;
    } else if (event.value === false || event.value === 'false') {
      this.filters.active = false;
    } else {
      this.filters.active = undefined; // 'all' means show all
    }
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filters = {};
    this.statusFilterValue = 'all'; // Reset UI state
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.filters.country || this.filters.state || 
              this.filters.city || this.filters.active !== undefined);
  }

  // Table methods
  getDisplayedColumns(): string[] {
    return this.displayedColumns
      .filter(col => col.visible)
      .map(col => col.key);
  }

  updateDisplayedColumns(): void {
    // Trigger change detection for table columns
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
  }

  // Selection methods
  toggleSelection(place: PlaceRecord, event: any): void {
    if (event.checked) {
      this.selectedPlaces = [...this.selectedPlaces, place];
    } else {
      this.selectedPlaces = this.selectedPlaces.filter(p => p.id !== place.id);
    }
    this.placeService.updateSelectedPlaces(this.selectedPlaces);
  }

  toggleAllSelection(event: any): void {
    if (event.checked) {
      this.selectedPlaces = [...this.filteredPlaces];
    } else {
      this.selectedPlaces = [];
    }
    this.placeService.updateSelectedPlaces(this.selectedPlaces);
  }

  isSelected(place: PlaceRecord): boolean {
    return this.selectedPlaces.some(p => p.id === place.id);
  }

  isAllSelected(): boolean {
    return this.filteredPlaces.length > 0 && 
           this.selectedPlaces.length === this.filteredPlaces.length;
  }

  isPartiallySelected(): boolean {
    return this.selectedPlaces.length > 0 && 
           this.selectedPlaces.length < this.filteredPlaces.length;
  }

  selectPlace(place: PlaceRecord): void {
    // Single selection for viewing details
    console.log('Selected place:', place);
  }

  // CRUD operations
  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedPlaceForEdit = undefined;
    this.showCreateModal = true;
    this.cdr.detectChanges();
  }

  editPlace(place: PlaceRecord): void {
    this.isEditMode = true;
    this.selectedPlaceForEdit = { ...place }; // Create a new object to ensure change detection
    this.showCreateModal = true;
    this.cdr.detectChanges();
  }

  editPlaceFromView(): void {
    if (!this.selectedPlaceForView) {
      return;
    }

    // Capture the data BEFORE clearing view state
    const placeToEdit: PlaceRecord = { ...this.selectedPlaceForView };

    // Close view modal (tears down *ngIf)
    this.showViewModal = false;
    this.selectedPlaceForView = undefined;

    // Defer to next tick so Angular completes DOM removal cleanly
    setTimeout(() => {
      // Set edit state in a clean frame
      this.isEditMode = true;
      this.selectedPlaceForEdit = placeToEdit;
      this.showCreateModal = true;
      this.cdr.detectChanges();
    }, 0);
  }

  viewPlace(place: PlaceRecord): void {
    this.selectedPlaceForView = place;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedPlaceForView = undefined;
  }

  duplicatePlace(place: PlaceRecord): void {
    const duplicatedPlace = {
      ...place,
      name: `${place.name} (Copy)`,
      id: '', // Will be generated by backend
    };
    this.selectedPlaceForEdit = duplicatedPlace;
    this.isEditMode = false;
    this.showCreateModal = true;
  }

  deletePlace(place: PlaceRecord): void {
    if (confirm(`Are you sure you want to delete "${place.name}"?`)) {
      this.placeService.deletePlace(place.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('Place deleted successfully', 'Close', { duration: 3000 });
            this.loadPlaces();
          },
          error: (error) => {
            console.error('Error deleting place:', error);
            this.snackBar.open('Error deleting place', 'Close', { duration: 3000 });
          }
        });
    }
  }

  // Modal event handlers
  onModalClose(): void {
    this.showCreateModal = false;
    this.selectedPlaceForEdit = undefined;
    this.isEditMode = false;
    this.cdr.detectChanges();
  }

  onPlaceCreated(place: PlaceRecord): void {
    this.loadPlaces();
  }

  onPlaceUpdated(place: PlaceRecord): void {
    this.loadPlaces();
  }

  // Bulk operations
  bulkExport(): void {
    console.log('Bulk export:', this.selectedPlaces);
    this.snackBar.open('Export functionality coming soon', 'Close', { duration: 2000 });
  }

  bulkDelete(): void {
    if (confirm(`Are you sure you want to delete ${this.selectedPlaces.length} selected places?`)) {
      console.log('Bulk delete:', this.selectedPlaces);
      this.snackBar.open('Bulk delete functionality coming soon', 'Close', { duration: 2000 });
    }
  }

  // Import/Export
  openImportDialog(): void {
    this.snackBar.open('Import functionality coming soon', 'Close', { duration: 2000 });
  }

  exportPlaces(): void {
    this.snackBar.open('Export functionality coming soon', 'Close', { duration: 2000 });
  }

  // Private methods
  private initializeComponent(): void {
    // Subscribe to service observables
    this.placeService.places$
      .pipe(takeUntil(this.destroy$))
      .subscribe(places => {
        this.places = places;
        this.applyFilters();
      });

    this.placeService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.loading = loading;
      });

    this.placeService.selectedPlaces$
      .pipe(takeUntil(this.destroy$))
      .subscribe(selectedPlaces => {
        this.selectedPlaces = selectedPlaces;
      });
  }

  private updateDataSource(): void {
    this.dataSource.data = this.filteredPlaces;
    this.totalPlaces = this.filteredPlaces.length;
    
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  private updateStatusMetrics(): void {
    this.statusMetrics = this.placeService.getStatusMetrics(this.filteredPlaces);
  }

  private loadCountries(): void {
    this.countries = this.countriesService.sortCountriesAlphabetically();
    this.filteredCountriesForFilter = this.countries;
    this.setupCountryFilterSearch();
  }

  private setupCountryFilterSearch(): void {
    this.countryFilterControl.valueChanges.subscribe((value: any) => {
      if (typeof value === 'string') {
        // User is typing - filter countries
        this.filterCountriesForFilter(value);
      } else if (value && typeof value === 'object') {
        // Country was selected - update the actual filter
        this.selectedCountryForFilter = value as Country;
        this.filters.country = (value as Country).code;
        this.applyFilters();
        // Reset the display to show all countries for next search
        this.filteredCountriesForFilter = this.countries;
      } else if (value === null || value === undefined || value === '') {
        // Value was cleared - clear the filter
        this.selectedCountryForFilter = null;
        this.filters.country = '';
        this.applyFilters();
        this.filteredCountriesForFilter = this.countries;
      }
    });
  }

  private filterCountriesForFilter(searchTerm: string): void {
    if (!searchTerm || searchTerm.trim() === '') {
      this.filteredCountriesForFilter = this.countries;
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    this.filteredCountriesForFilter = this.countries.filter(country =>
      country.name.toLowerCase().includes(term) ||
      country.code.toLowerCase().includes(term)
    );
  }

  displayCountryForFilter(country: Country): string {
    return country ? `${country.flag} ${country.name}` : '';
  }

  isSearchingCountryFilter(): boolean {
    const value = this.countryFilterControl.value;
    return typeof value === 'string' && value.trim().length > 0;
  }

  clearCountryFilter(): void {
    this.countryFilterControl.setValue('');
  }
}