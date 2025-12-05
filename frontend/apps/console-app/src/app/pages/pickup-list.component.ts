import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription, forkJoin } from 'rxjs';
import { PickupService } from '../../../../../libs/shared/pickup.service';
import { OrderService } from '../../../../../libs/shared/order.service';
import { PickupRecord } from '../../../../../libs/shared/pickup.interface';
import { CreateOrderData } from '../../../../../libs/shared/order.interface';
import { PickupViewModalComponent } from './pickup-view-modal.component';
import { PickupEditModalComponent } from '../components/pickup-edit-modal/pickup-edit-modal.component';
import { PickupStatusDialogComponent, PickupStatusDialogResult } from '../components/pickup-status-dialog/pickup-status-dialog.component';
import { CreateBookingsDialogComponent, CreateBookingsResult, BookingItem } from '../components/create-bookings-dialog/create-bookings-dialog.component';
import { ViewBookingsDialogComponent } from '../components/view-bookings-dialog/view-bookings-dialog.component';

@Component({
  selector: 'app-pickup-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatTooltipModule,
    MatCardModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <!-- Modern Layout with Tailwind + Material matching other pages -->
    <div class="min-h-screen bg-slate-50">
      
      <!-- Header Section -->
      <header class="bg-white border-b border-slate-200 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-6">
            <div>
              <h1 class="text-3xl font-bold text-slate-900 flex items-center">
                📋 <span class="ml-2">Pickup Management</span>
              </h1>
              <p class="text-slate-600 mt-1">Real-time pickup tracking and management dashboard</p>
            </div>
            <div class="flex items-center gap-3">
              <button 
                mat-button 
                [color]="autoRefresh ? 'accent' : 'primary'" 
                (click)="toggleAutoRefresh()" 
                matTooltip="Toggle auto-refresh every 30 seconds"
                class="rounded-lg">
                <mat-icon>{{autoRefresh ? 'pause' : 'play_arrow'}}</mat-icon>
                <span class="ml-1">Auto-refresh {{autoRefresh ? 'ON' : 'OFF'}}</span>
              </button>
              <button 
                mat-stroked-button 
                color="primary" 
                (click)="refreshPickups()" 
                matTooltip="Refresh now"
                class="rounded-lg border-slate-300 text-slate-700 hover:bg-slate-50">
                <mat-icon>refresh</mat-icon>
                <span class="ml-1">Refresh</span>
              </button>
              <button 
                mat-raised-button 
                color="primary" 
                (click)="navigateToSchedule()" 
                matTooltip="Create new pickup"
                class="bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <mat-icon>add</mat-icon>
                <span class="ml-1">Schedule Pickup</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <!-- Real-time Status Card -->
        <div class="mb-6">
          <mat-card class="border-0 shadow-md overflow-hidden">
            <div class="bg-gradient-to-r from-blue-50 to-green-50 p-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                  <div>
                    <span class="text-sm font-medium text-slate-700">
                      Live updates {{autoRefresh ? 'enabled' : 'disabled'}}
                    </span>
                    <div class="text-xs text-slate-500">
                      Last refreshed: {{lastRefresh | date:'HH:mm:ss'}}
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <div class="bg-white rounded-lg px-3 py-2 shadow-sm">
                    <div class="text-xs text-slate-500">Total</div>
                    <div class="text-lg font-bold text-blue-600">{{totalPickups}}</div>
                  </div>
                  <div class="bg-white rounded-lg px-3 py-2 shadow-sm">
                    <div class="text-xs text-slate-500">Scheduled</div>
                    <div class="text-lg font-bold text-yellow-600">{{scheduledCount}}</div>
                  </div>
                  <div class="bg-white rounded-lg px-3 py-2 shadow-sm">
                    <div class="text-xs text-slate-500">In Progress</div>
                    <div class="text-lg font-bold text-green-600">{{inProgressCount}}</div>
                  </div>
                </div>
              </div>
            </div>
          </mat-card>
        </div>

        <!-- Filters Section -->
        <div class="mb-6">
          <mat-card class="border-0 shadow-md">
            <mat-card-header class="pb-4">
              <mat-card-title class="text-xl font-semibold text-slate-900 flex items-center">
                🔍 <span class="ml-2">Search & Filter</span>
              </mat-card-title>
              <mat-card-subtitle class="text-slate-600">
                Filter pickups by ID, client, status, or type
              </mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Pickup ID</mat-label>
                  <input matInput (keyup)="applyFilter($event, 'pickupId')" placeholder="Filter by pickup ID" />
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Client</mat-label>
                  <input matInput (keyup)="applyFilter($event, 'clientName')" placeholder="Filter by client name" />
                  <mat-icon matSuffix>business</mat-icon>
                </mat-form-field>
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Status</mat-label>
                  <mat-select (selectionChange)="onStatusFilterChange($event.value)" [value]="selectedStatusFilter">
                    <mat-option value="">All Statuses</mat-option>
                    <mat-option value="scheduled">Scheduled</mat-option>
                    <mat-option value="in-progress">In Progress</mat-option>
                    <mat-option value="completed">Completed</mat-option>
                    <mat-option value="cancelled">Cancelled</mat-option>
                    <mat-option value="delayed">Delayed</mat-option>
                  </mat-select>
                  <mat-icon matSuffix>flag</mat-icon>
                </mat-form-field>
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Type</mat-label>
                  <mat-select (selectionChange)="onTypeFilterChange($event.value)" [value]="selectedTypeFilter">
                    <mat-option value="">All Types</mat-option>
                    <mat-option value="vendor">Vendor</mat-option>
                    <mat-option value="direct">Direct</mat-option>
                  </mat-select>
                  <mat-icon matSuffix>category</mat-icon>
                </mat-form-field>
              </div>
              
              <!-- Clear Filters Button -->
              <div class="mt-4 flex justify-end">
                <button mat-stroked-button (click)="clearAllFilters()" class="rounded-lg">
                  <mat-icon>clear</mat-icon>
                  <span class="ml-1">Clear Filters</span>
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Pickup List Table -->
        <div class="mb-6">
          <mat-card class="border-0 shadow-md overflow-hidden">
            <mat-card-header class="pb-4">
              <mat-card-title class="text-xl font-semibold text-slate-900 flex items-center">
                📦 <span class="ml-2">Pickup List</span>
              </mat-card-title>
              <mat-card-subtitle class="text-slate-600">
                Manage and track all pickup requests
              </mat-card-subtitle>
            </mat-card-header>
            
            <div class="overflow-x-auto">
              <table mat-table [dataSource]="dataSource" matSort class="w-full"> 
                <ng-container matColumnDef="pickupId">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header class="font-semibold">Pickup ID</th>
                  <td mat-cell *matCellDef="let row" class="py-4">
                    <div class="flex items-center">
                      <div class="bg-blue-50 rounded-lg px-3 py-1">
                        <span class="font-mono text-sm font-medium text-blue-700">{{row.pickupId}}</span>
                      </div>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="client">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header class="font-semibold">Client Information</th>
                  <td mat-cell *matCellDef="let row" class="py-4">
                    <div class="flex items-center space-x-3">
                      <div class="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                        <mat-icon class="text-slate-500">business</mat-icon>
                      </div>
                      <div>
                        <div class="font-medium text-slate-900">{{row.clientName}}</div>
                        <div class="text-sm text-slate-500">{{row.clientCompany}}</div>
                      </div>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="schedule">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header class="font-semibold">Schedule</th>
                  <td mat-cell *matCellDef="let row" class="py-4">
                    <div class="flex items-center space-x-2">
                      <mat-icon class="text-slate-400">schedule</mat-icon>
                      <div>
                        <div class="font-medium text-slate-900">{{row.pickupDate | date:'MMM d, y'}}</div>
                        <div class="text-sm text-slate-500">{{row.pickupTime}}</div>
                      </div>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header class="font-semibold">Status</th>
                  <td mat-cell *matCellDef="let row" class="py-4">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                          [ngClass]="getStatusClass(row.status)">
                      <span class="w-2 h-2 rounded-full mr-2" [ngClass]="getStatusDotClass(row.status)"></span>
                      {{row.status | titlecase}}
                    </span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="type">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header class="font-semibold">Type</th>
                  <td mat-cell *matCellDef="let row" class="py-4">
                    <span class="inline-flex items-center px-3 py-1 text-sm rounded-full font-medium" 
                          [class]="row.pickupType === 'vendor' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'">
                      <mat-icon class="mr-1" style="font-size: 16px;">{{row.pickupType === 'vendor' ? 'store' : 'local_shipping'}}</mat-icon>
                      {{row.pickupType | titlecase}}
                    </span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="staff">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header class="font-semibold">Assigned Staff</th>
                  <td mat-cell *matCellDef="let row" class="py-4">
                    <div class="flex items-center space-x-3">
                      <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <mat-icon class="text-green-600">person</mat-icon>
                      </div>
                      <div>
                        <div class="font-medium text-slate-900">{{row.assignedStaff}}</div>
                        <div class="text-sm text-slate-500">{{row.staffDepartment}}</div>
                      </div>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold">Actions</th>
                  <td mat-cell *matCellDef="let row" class="py-4">
                    <div class="flex items-center gap-2">
                      <button 
                        mat-stroked-button 
                        color="primary" 
                        (click)="openDetails(row)" 
                        matTooltip="View pickup details"
                        class="rounded-lg text-sm">
                        <mat-icon style="font-size: 18px;">visibility</mat-icon>
                        <span class="ml-1">View</span>
                      </button>
                      
                      <!-- Create/View Bookings Button (only for completed pickups) -->
                      <button 
                        mat-raised-button 
                        [color]="hasBookings(row) ? 'primary' : 'accent'"
                        *ngIf="row.status === 'completed'"
                        (click)="handleBookingsAction(row)" 
                        [matTooltip]="hasBookings(row) ? 'View orders created from this pickup' : 'Create bookings from received items'"
                        class="rounded-lg text-sm">
                        <mat-icon style="font-size: 18px;">{{ hasBookings(row) ? 'visibility' : 'add_shopping_cart' }}</mat-icon>
                        <span class="ml-1">{{ hasBookings(row) ? 'View Bookings' : 'Book (' + (row.itemsReceived || row.itemCount) + ')' }}</span>
                      </button>
                      
                      <!-- Status Action Menu -->
                      <button 
                        mat-stroked-button 
                        [matMenuTriggerFor]="statusMenu"
                        matTooltip="Update status"
                        class="rounded-lg text-sm">
                        <mat-icon style="font-size: 18px;">more_vert</mat-icon>
                      </button>
                      <mat-menu #statusMenu="matMenu">
                        <!-- Start Pickup (only for scheduled) -->
                        <button mat-menu-item 
                                *ngIf="row.status === 'scheduled'"
                                (click)="openStatusDialog(row, 'start')">
                          <mat-icon class="text-blue-600">play_arrow</mat-icon>
                          <span>Start Pickup</span>
                        </button>
                        
                        <!-- Complete Pickup (only for in-progress) -->
                        <button mat-menu-item 
                                *ngIf="row.status === 'in-progress'"
                                (click)="openStatusDialog(row, 'complete')">
                          <mat-icon class="text-green-600">check_circle</mat-icon>
                          <span>Complete Pickup</span>
                        </button>
                        
                        <!-- Create/View Bookings (only for completed) -->
                        <button mat-menu-item 
                                *ngIf="row.status === 'completed'"
                                (click)="handleBookingsAction(row)">
                          <mat-icon [class]="hasBookings(row) ? 'text-green-600' : 'text-blue-600'">
                            {{ hasBookings(row) ? 'visibility' : 'add_shopping_cart' }}
                          </mat-icon>
                          <span>{{ hasBookings(row) ? 'View Bookings' : 'Create Bookings' }}</span>
                        </button>
                        
                        <!-- Mark as Delayed (for scheduled or in-progress) -->
                        <button mat-menu-item 
                                *ngIf="row.status === 'scheduled' || row.status === 'in-progress'"
                                (click)="openStatusDialog(row, 'delay')">
                          <mat-icon class="text-orange-600">schedule</mat-icon>
                          <span>Mark Delayed</span>
                        </button>
                        
                        <!-- Edit (only for scheduled) -->
                        <button mat-menu-item 
                                *ngIf="row.status === 'scheduled'"
                                (click)="editPickup(row)">
                          <mat-icon class="text-purple-600">edit</mat-icon>
                          <span>Edit Pickup</span>
                        </button>
                        
                        <!-- Cancel Pickup (for scheduled, in-progress, delayed) -->
                        <button mat-menu-item 
                                *ngIf="row.status !== 'completed' && row.status !== 'cancelled'"
                                (click)="openStatusDialog(row, 'cancel')">
                          <mat-icon class="text-red-600">cancel</mat-icon>
                          <span>Cancel Pickup</span>
                        </button>
                      </mat-menu>
                    </div>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns" class="bg-slate-50"></tr>
                <!-- Enhanced row highlighting for newly created pickups -->
                <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                    class="hover:bg-slate-50 transition-colors"
                    [class.bg-green-50]="highlightedPickupId === row.id"
                    [class.border-l-4]="highlightedPickupId === row.id"
                    [class.border-green-400]="highlightedPickupId === row.id"
                    [class.shadow-sm]="highlightedPickupId === row.id"></tr>
              </table>
            </div>

            <!-- Pagination -->
            <div class="border-t border-slate-200">
              <mat-paginator 
                [pageSizeOptions]="[5, 10, 20, 50]" 
                showFirstLastButtons
                class="border-0">
              </mat-paginator>
            </div>
          </mat-card>
        </div>

        <!-- Empty State (when no pickups) -->
        <div *ngIf="totalPickups === 0" class="text-center py-12">
          <mat-card class="border-0 shadow-md">
            <mat-card-content class="py-12">
              <div class="text-slate-400 mb-4">
                <mat-icon style="font-size: 72px; width: 72px; height: 72px;">inbox</mat-icon>
              </div>
              <h3 class="text-xl font-medium text-slate-900 mb-2">No pickups found</h3>
              <p class="text-slate-600 mb-6">Get started by scheduling your first pickup</p>
              <button 
                mat-raised-button 
                color="primary" 
                (click)="navigateToSchedule()"
                class="bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <mat-icon>add</mat-icon>
                <span class="ml-1">Schedule First Pickup</span>
              </button>
            </mat-card-content>
          </mat-card>
        </div>

      </main>
    </div>
  `,
})
export class PickupListComponent implements OnInit, AfterViewInit, OnDestroy {
  dataSource = new MatTableDataSource<PickupRecord>([]);
  displayedColumns = ['pickupId', 'client', 'schedule', 'status', 'type', 'staff', 'actions'];
  
  // Filter properties
  selectedStatusFilter = '';
  selectedTypeFilter = '';
  
  // Real-time features
  autoRefresh = true;
  lastRefresh: Date = new Date();
  highlightedPickupId: string | null = null;
  private refreshInterval?: ReturnType<typeof setInterval>;
  private pickupSubscription?: Subscription;
  
  // Track which pickups have bookings created
  pickupsWithBookings: Set<string> = new Set();
  
  // Stats
  totalPickups = 0;
  scheduledCount = 0;
  inProgressCount = 0;

  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  @ViewChild(MatSort) sort: MatSort | null = null;

  constructor(
    private pickupService: PickupService,
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadPickups();
    this.setupAutoRefresh();
    this.subscribeToPickupUpdates();
    this.checkForHighlight();
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.pickupSubscription) {
      this.pickupSubscription.unsubscribe();
    }
  }

  // Check for highlight parameter from navigation
  private checkForHighlight() {
    this.route.queryParams.subscribe(params => {
      if (params['highlight']) {
        this.highlightedPickupId = params['highlight'];
        // Remove highlight after 5 seconds
        setTimeout(() => {
          this.highlightedPickupId = null;
          // Remove query param
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { highlight: null },
            queryParamsHandling: 'merge'
          });
        }, 5000);
      }
    });
  }

  // Subscribe to real-time pickup updates
  private subscribeToPickupUpdates() {
    this.pickupSubscription = this.pickupService.pickupsUpdated$.subscribe(pickups => {
      this.updateDataSource(pickups);
      this.updateStats();
      this.lastRefresh = new Date();
    });
  }

  // Setup auto-refresh timer
  private setupAutoRefresh() {
    if (this.autoRefresh) {
      this.refreshInterval = setInterval(() => {
        this.refreshPickups();
      }, 30000); // Refresh every 30 seconds
    }
  }

  toggleAutoRefresh() {
    this.autoRefresh = !this.autoRefresh;
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = undefined;
    }
    if (this.autoRefresh) {
      this.setupAutoRefresh();
    }
  }

  refreshPickups() {
    this.loadPickups();
  }

  loadPickups() {
    this.pickupService.getPickups().subscribe({
      next: (response) => {
        this.updateDataSource(response.content);
        this.updateStats();
        this.lastRefresh = new Date();
        // Check which completed pickups have bookings
        this.checkPickupsForBookings(response.content);
      },
      error: (error) => {
        console.error('Error loading pickups:', error);
      }
    });
  }

  // Check if completed pickups have orders created from them
  private checkPickupsForBookings(pickups: PickupRecord[]) {
    const completedPickups = pickups.filter(p => p.status === 'completed');
    completedPickups.forEach(pickup => {
      this.orderService.getOrdersByPickupId(pickup.pickupId).subscribe({
        next: (orders) => {
          if (orders.length > 0) {
            this.pickupsWithBookings.add(pickup.pickupId);
          } else {
            this.pickupsWithBookings.delete(pickup.pickupId);
          }
        },
        error: () => {
          // Ignore errors - assume no bookings
        }
      });
    });
  }

  // Check if a pickup has bookings
  hasBookings(pickup: PickupRecord): boolean {
    return this.pickupsWithBookings.has(pickup.pickupId);
  }

  private updateDataSource(pickups: PickupRecord[]) {
    this.dataSource.data = pickups;
    this.totalPickups = pickups.length;
  }

  private updateStats() {
    const data = this.dataSource.data;
    this.scheduledCount = data.filter(p => p.status === 'scheduled').length;
    this.inProgressCount = data.filter(p => p.status === 'in-progress').length;
  }

  navigateToSchedule() {
    this.router.navigate(['/pickup']);
  }

  // Open status change dialog
  openStatusDialog(row: PickupRecord, action: 'start' | 'complete' | 'cancel' | 'delay') {
    const dialogRef = this.dialog.open(PickupStatusDialogComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: { pickup: row, action },
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe((result: PickupStatusDialogResult | undefined) => {
      if (result) {
        this.updatePickupStatus(row, result);
      }
    });
  }

  // Update pickup status via API
  private updatePickupStatus(pickup: PickupRecord, result: PickupStatusDialogResult) {
    const completionData = result.status === 'completed' ? {
      itemsReceived: result.itemsReceived,
      completionNotes: result.completionNotes,
      completedBy: 'Console User'
    } : {
      completionNotes: result.completionNotes
    };

    this.pickupService.updatePickupStatus(pickup.id, result.status, completionData).subscribe({
      next: (updatedPickup) => {
        // Show success message
        const actionLabel = this.getStatusActionLabel(result.status);
        let message = `Pickup ${pickup.pickupId} ${actionLabel}`;
        
        // Add items received info for completed pickups
        if (result.status === 'completed' && result.itemsReceived !== undefined) {
          message += ` (${result.itemsReceived}/${pickup.itemCount} items received)`;
        }
        
        this.snackBar.open(message, 'Close', {
          duration: 4000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: this.getSnackBarClass(result.status)
        });
        
        // Refresh the list
        this.loadPickups();
      },
      error: (error) => {
        console.error('Error updating pickup status:', error);
        this.snackBar.open('Failed to update pickup status. Please try again.', 'Close', {
          duration: 4000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['snackbar-error']
        });
      }
    });
  }

  private getStatusActionLabel(status: string): string {
    switch (status) {
      case 'in-progress': return 'started';
      case 'completed': return 'completed';
      case 'cancelled': return 'cancelled';
      case 'delayed': return 'marked as delayed';
      default: return 'updated';
    }
  }

  private getSnackBarClass(status: string): string[] {
    switch (status) {
      case 'completed': return ['snackbar-success'];
      case 'cancelled': return ['snackbar-error'];
      case 'delayed': return ['snackbar-warning'];
      default: return ['snackbar-info'];
    }
  }

  // Open create bookings dialog for completed pickups (no bookings yet)
  openCreateBookingsDialog(row: PickupRecord) {
    const dialogRef = this.dialog.open(CreateBookingsDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { pickup: row },
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe((result: CreateBookingsResult | undefined) => {
      if (result && result.bookings.length > 0) {
        this.createBookingsFromPickup(row, result.bookings);
      }
    });
  }

  // Open view bookings dialog for completed pickups with existing bookings
  openViewBookingsDialog(row: PickupRecord) {
    this.dialog.open(ViewBookingsDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { pickup: row },
      panelClass: 'custom-dialog-container'
    });
  }

  // Smart action: create or view bookings based on whether bookings exist
  handleBookingsAction(row: PickupRecord) {
    if (this.hasBookings(row)) {
      this.openViewBookingsDialog(row);
    } else {
      this.openCreateBookingsDialog(row);
    }
  }

  // Create orders from booking items
  private createBookingsFromPickup(pickup: PickupRecord, bookings: BookingItem[]) {
    const orderRequests = bookings.map(booking => {
      const orderData: CreateOrderData = {
        // Client info from pickup
        client_id: parseInt(pickup.clientId) || 0,
        client_name: pickup.clientName,
        client_company: pickup.clientCompany,
        contact_number: pickup.contactNumber,
        
        // Sender info (from booking, editable by user)
        sender_name: booking.senderName,
        sender_address: booking.senderAddress,
        sender_contact: booking.senderContact,
        sender_city: '', // Could extract from address
        
        // Receiver info (from booking item)
        receiver_name: booking.receiverName,
        receiver_address: booking.receiverAddress,
        receiver_contact: booking.receiverContact,
        receiver_pincode: booking.receiverPincode,
        receiver_city: booking.receiverCity,
        receiver_state: booking.receiverState,
        
        // Package details
        item_count: 1,
        total_weight: booking.weight,
        item_description: booking.description,
        declared_value: booking.declaredValue,
        
        // Service details
        service_type: booking.serviceType,
        carrier_name: pickup.carrierName || 'Default Carrier',
        carrier_id: pickup.carrierId,
        
        // Source tracking - link order to pickup
        source_pickup_id: pickup.pickupId,
        
        // Additional
        special_instructions: booking.specialInstructions,
        cod_amount: booking.codAmount
      };
      
      return this.orderService.createOrder(orderData);
    });

    // Create all orders
    forkJoin(orderRequests).subscribe({
      next: (createdOrders) => {
        // Mark this pickup as having bookings
        this.pickupsWithBookings.add(pickup.pickupId);
        
        this.snackBar.open(
          `Successfully created ${createdOrders.length} booking(s) from pickup ${pickup.pickupId}`,
          'View Orders',
          {
            duration: 6000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['snackbar-success']
          }
        ).onAction().subscribe(() => {
          this.router.navigate(['/order-list']);
        });
      },
      error: (error) => {
        console.error('Error creating bookings:', error);
        this.snackBar.open(
          'Failed to create some bookings. Please try again.',
          'Close',
          {
            duration: 4000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
          }
        );
      }
    });
  }

  // Open details for a pickup in modal
  openDetails(row: PickupRecord) {
    const dialogRef = this.dialog.open(PickupViewModalComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: { pickup: row },
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'edit') {
        this.editPickup(result.pickup);
      }
    });
  }

  // Edit a scheduled pickup in modal
  editPickup(row: PickupRecord) {
    const dialogRef = this.dialog.open(PickupEditModalComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: { pickup: row },
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'updated') {
        // Refresh the pickup list to show updated data
        this.loadPickups();
      }
    });
  }

  applyFilter(event: Event, column: string) {
    const filterValue = (event.target as HTMLInputElement).value;
    
    // Enhanced filtering to work with dropdown filters
    this.dataSource.filterPredicate = (data: PickupRecord) => {
      const statusMatch = !this.selectedStatusFilter || data.status === this.selectedStatusFilter;
      const typeMatch = !this.selectedTypeFilter || data.pickupType === this.selectedTypeFilter;
      
      // Text-based filtering
      let textMatch = true;
      if (filterValue) {
        const searchText = filterValue.trim().toLowerCase();
        if (column === 'pickupId') {
          textMatch = data.pickupId.toLowerCase().includes(searchText);
        } else if (column === 'clientName') {
          textMatch = data.clientName.toLowerCase().includes(searchText);
        }
      }
      
      return statusMatch && typeMatch && textMatch;
    };
    
    // Trigger filtering
    this.dataSource.filter = filterValue.trim().toLowerCase();
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'delayed': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusDotClass(status: string): string {
    switch (status) {
      case 'scheduled': return 'bg-yellow-400';
      case 'in-progress': return 'bg-blue-400';
      case 'completed': return 'bg-green-400';
      case 'cancelled': return 'bg-red-400';
      case 'delayed': return 'bg-orange-400';
      default: return 'bg-gray-400';
    }
  }

  // Enhanced filter methods for dropdown selections
  onStatusFilterChange(status: string) {
    this.selectedStatusFilter = status;
    this.applyMultipleFilters();
  }

  onTypeFilterChange(type: string) {
    this.selectedTypeFilter = type;
    this.applyMultipleFilters();
  }

  // Apply multiple filters simultaneously
  private applyMultipleFilters() {
    this.dataSource.filterPredicate = (data: PickupRecord, filter: string) => {
      // Parse filter string as JSON
      let filterObj: { status: string; type: string };
      try {
        filterObj = JSON.parse(filter);
      } catch {
        filterObj = { status: '', type: '' };
      }
      const statusMatch = !filterObj.status || data.status === filterObj.status;
      const typeMatch = !filterObj.type || data.pickupType === filterObj.type;
      return statusMatch && typeMatch;
    };
    
    // Set filter to a string representing the current filter state
    this.dataSource.filter = JSON.stringify({
      status: this.selectedStatusFilter,
      type: this.selectedTypeFilter
    });
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Clear all filters
  clearAllFilters() {
    this.selectedStatusFilter = '';
    this.selectedTypeFilter = '';
    this.dataSource.filter = '';
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      return JSON.stringify(data).toLowerCase().includes(filter);
    };
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
