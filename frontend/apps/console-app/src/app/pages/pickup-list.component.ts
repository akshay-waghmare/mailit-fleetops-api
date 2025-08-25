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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { Subscription } from 'rxjs';
import { PickupService } from '../../../../../libs/shared/pickup.service';
import { PickupRecord } from '../../../../../libs/shared/pickup.interface';

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
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatTooltipModule,
    MatCardModule
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
                  <input matInput (keyup)="applyFilter($event, 'status')" placeholder="Filter by status" />
                  <mat-icon matSuffix>flag</mat-icon>
                </mat-form-field>
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Type</mat-label>
                  <input matInput (keyup)="applyFilter($event, 'pickupType')" placeholder="Filter by type" />
                  <mat-icon matSuffix>category</mat-icon>
                </mat-form-field>
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
                      <button 
                        mat-stroked-button 
                        color="accent" 
                        *ngIf="row.status === 'scheduled'" 
                        (click)="editPickup(row)" 
                        matTooltip="Edit pickup"
                        class="rounded-lg text-sm">
                        <mat-icon style="font-size: 18px;">edit</mat-icon>
                        <span class="ml-1">Edit</span>
                      </button>
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
  
  // Real-time features
  autoRefresh = true;
  lastRefresh: Date = new Date();
  highlightedPickupId: string | null = null;
  private refreshInterval?: ReturnType<typeof setInterval>;
  private pickupSubscription?: Subscription;
  
  // Stats
  totalPickups = 0;
  scheduledCount = 0;
  inProgressCount = 0;

  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  @ViewChild(MatSort) sort: MatSort | null = null;

  constructor(
    private pickupService: PickupService,
    private route: ActivatedRoute,
    private router: Router
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
      },
      error: (error) => {
        console.error('Error loading pickups:', error);
      }
    });
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

  // Open details for a pickup (demo: route with view param)
  openDetails(row: PickupRecord) {
    // Navigate to same list with a view flag so UI can open a modal or scroll
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { highlight: row.id, view: 'true' },
      queryParamsHandling: 'merge'
    });
  }

  // Edit a scheduled pickup: navigate to schedule page with edit param
  editPickup(row: PickupRecord) {
    this.router.navigate(['/pickup'], { queryParams: { edit: row.id } });
  }

  applyFilter(event: Event, column: string) {
    const filterValue = (event.target as HTMLInputElement).value;
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
}
