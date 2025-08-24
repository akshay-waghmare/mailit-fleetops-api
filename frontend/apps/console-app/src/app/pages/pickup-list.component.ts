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
    MatTooltipModule
  ],
  template: `
    <div class="p-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-2xl font-semibold">Pickup Management</h2>
          <p class="text-sm text-gray-600 mt-1">Real-time pickup tracking and management</p>
        </div>
        <div class="flex items-center gap-2">
          <button mat-button [color]="autoRefresh ? 'accent' : 'primary'" 
                  (click)="toggleAutoRefresh()" 
                  matTooltip="Toggle auto-refresh every 30 seconds">
            <mat-icon>{{autoRefresh ? 'pause' : 'play_arrow'}}</mat-icon>
            Auto-refresh {{autoRefresh ? 'ON' : 'OFF'}}
          </button>
          <button mat-raised-button color="primary" (click)="refreshPickups()" matTooltip="Refresh now">
            Refresh
          </button>
          <button mat-raised-button color="accent" (click)="navigateToSchedule()" matTooltip="Create new pickup">
            Schedule Pickup
          </button>
        </div>
      </div>

      <!-- Real-time status indicator -->
      <div class="mb-4 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span class="text-sm font-medium text-gray-700">
              Live updates {{autoRefresh ? 'enabled' : 'disabled'}} | Last refreshed: {{lastRefresh | date:'HH:mm:ss'}}
            </span>
          </div>
          <div class="flex items-center gap-4 text-sm">
            <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded">Total: {{totalPickups}}</span>
            <span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Scheduled: {{scheduledCount}}</span>
            <span class="px-2 py-1 bg-green-100 text-green-800 rounded">In Progress: {{inProgressCount}}</span>
          </div>
        </div>
      </div>

      <div class="mb-4 grid grid-cols-4 gap-4">
        <mat-form-field appearance="outline">
          <mat-label>Pickup ID</mat-label>
          <input matInput (keyup)="applyFilter($event, 'pickupId')" placeholder="Filter pickup id" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Client</mat-label>
          <input matInput (keyup)="applyFilter($event, 'clientName')" placeholder="Filter client" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <input matInput (keyup)="applyFilter($event, 'status')" placeholder="Filter status" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Type</mat-label>
          <input matInput (keyup)="applyFilter($event, 'pickupType')" placeholder="Filter type" />
        </mat-form-field>
      </div>

      <table mat-table [dataSource]="dataSource" matSort class="w-full shadow-sm rounded-lg overflow-hidden"> 
        <ng-container matColumnDef="pickupId">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Pickup ID</th>
          <td mat-cell *matCellDef="let row">
            <span class="font-mono text-sm">{{row.pickupId}}</span>
          </td>
        </ng-container>

        <ng-container matColumnDef="client">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Client</th>
          <td mat-cell *matCellDef="let row">
            <div>
              <div class="font-medium">{{row.clientName}}</div>
              <div class="text-sm text-gray-500">{{row.clientCompany}}</div>
            </div>
          </td>
        </ng-container>

        <ng-container matColumnDef="schedule">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Schedule</th>
          <td mat-cell *matCellDef="let row">
            <div>
              <div class="text-sm">{{row.pickupDate | date:'MMM d, y'}}</div>
              <div class="text-xs text-gray-500">{{row.pickupTime}}</div>
            </div>
          </td>
        </ng-container>

        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
          <td mat-cell *matCellDef="let row">
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  [ngClass]="getStatusClass(row.status)">
              {{row.status | titlecase}}
            </span>
          </td>
        </ng-container>

        <ng-container matColumnDef="type">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
          <td mat-cell *matCellDef="let row">
            <span class="px-2 py-1 text-xs rounded-full" 
                  [class]="row.pickupType === 'vendor' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'">
              {{row.pickupType | titlecase}}
            </span>
          </td>
        </ng-container>

        <ng-container matColumnDef="staff">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Staff</th>
          <td mat-cell *matCellDef="let row">
            <div>
              <div class="text-sm">{{row.assignedStaff}}</div>
              <div class="text-xs text-gray-500">{{row.staffDepartment}}</div>
            </div>
          </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let row" class="flex items-center gap-2">
            <button mat-flat-button color="primary" (click)="openDetails(row)" aria-label="View details" matTooltip="View Details">
              <span class="ml-2 text-sm">View</span>
            </button>
            <button mat-stroked-button color="accent" *ngIf="row.status === 'scheduled'" (click)="editPickup(row)" aria-label="Edit pickup" matTooltip="Edit pickup">
              <span class="ml-2 text-sm">Edit</span>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <!-- Highlight row if it's the newly created pickup -->
        <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
            [class.bg-green-50]="highlightedPickupId === row.id"
            [class.border-l-4]="highlightedPickupId === row.id"
            [class.border-green-400]="highlightedPickupId === row.id"
            [class.animate-pulse]="highlightedPickupId === row.id"></tr>
      </table>

      <mat-paginator [pageSizeOptions]="[5, 10, 20]" showFirstLastButtons></mat-paginator>
    </div>
  `
})
export class PickupListComponent implements OnInit, AfterViewInit, OnDestroy {
  dataSource = new MatTableDataSource<PickupRecord>([]);
  displayedColumns = ['pickupId', 'client', 'schedule', 'status', 'type', 'staff', 'actions'];
  
  // Real-time features
  autoRefresh = true;
  lastRefresh: Date = new Date();
  highlightedPickupId: string | null = null;
  private refreshInterval?: number | undefined;
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
      this.refreshInterval = (setInterval(() => {
        this.refreshPickups();
      }, 30000) as unknown) as number; // Refresh every 30 seconds
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
}
