import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { Subscription, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { OrderService, OrderRecord, OrderQueryParams } from '../../../../../libs/shared';
import { OrderEditModalComponent } from '../components/order-edit-modal.component';
import { OrderStatusUpdateModalComponent } from '../components/order-status-update-modal.component';

@Component({
  selector: 'app-order-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
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
    MatTooltipModule,
    MatCardModule,
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <!-- Modern Layout with Tailwind + Material matching pickup management -->
    <div class="min-h-screen bg-slate-50">
      
      <!-- Header Section -->
      <header class="bg-white border-b border-slate-200 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-6">
            <div>
              <h1 class="text-3xl font-bold text-slate-900 flex items-center">
                📦 <span class="ml-2">Order Management</span>
              </h1>
              <p class="text-slate-600 mt-1">Real-time order tracking and delivery management dashboard</p>
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
                (click)="refreshOrders()" 
                matTooltip="Refresh now"
                class="rounded-lg border-slate-300 text-slate-700 hover:bg-slate-50">
                <mat-icon>refresh</mat-icon>
                <span class="ml-1">Refresh</span>
              </button>
              <button 
                mat-raised-button 
                color="primary" 
                (click)="navigateToCreateOrder()" 
                matTooltip="Create new order"
                class="bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <mat-icon>add</mat-icon>
                <span class="ml-1">Create Order</span>
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
                    <div class="text-lg font-bold text-blue-600">{{statusCounts.total}}</div>
                  </div>
                  <div class="bg-white rounded-lg px-3 py-2 shadow-sm">
                    <div class="text-xs text-slate-500">Pending</div>
                    <div class="text-lg font-bold text-yellow-600">{{statusCounts.pending}}</div>
                  </div>
                  <div class="bg-white rounded-lg px-3 py-2 shadow-sm">
                    <div class="text-xs text-slate-500">In Transit</div>
                    <div class="text-lg font-bold text-orange-600">{{statusCounts.inTransit}}</div>
                  </div>
                  <div class="bg-white rounded-lg px-3 py-2 shadow-sm">
                    <div class="text-xs text-slate-500">Delivered</div>
                    <div class="text-lg font-bold text-green-600">{{statusCounts.delivered}}</div>
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
                Filter orders by ID, client, status, service type, or delivery location
              </mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Order ID</mat-label>
                  <input matInput [(ngModel)]="filterValues.search" (input)="onSearchChange($event)" placeholder="Search orders..." />
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>
                
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Status</mat-label>
                  <mat-select [(ngModel)]="filterValues.status" (selectionChange)="onStatusChange($event)">
                    <mat-option value="">All Statuses</mat-option>
                    <mat-option value="PENDING">Pending</mat-option>
                    <mat-option value="CONFIRMED">Confirmed</mat-option>
                    <mat-option value="PICKED_UP">Picked Up</mat-option>
                    <mat-option value="IN_TRANSIT">In Transit</mat-option>
                    <mat-option value="DELIVERED">Delivered</mat-option>
                    <mat-option value="CANCELLED">Cancelled</mat-option>
                    <mat-option value="RETURNED">Returned</mat-option>
                  </mat-select>
                  <mat-icon matSuffix>flag</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Service Type</mat-label>
                  <mat-select [(ngModel)]="filterValues.serviceType" (selectionChange)="onServiceTypeChange($event)">
                    <mat-option value="">All Services</mat-option>
                    <mat-option value="EXPRESS">Express</mat-option>
                    <mat-option value="STANDARD">Standard</mat-option>
                    <mat-option value="ECONOMY">Economy</mat-option>
                  </mat-select>
                  <mat-icon matSuffix>local_shipping</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>From Date</mat-label>
                  <input matInput [matDatepicker]="fromDatePicker" [(ngModel)]="filterValues.fromDate" (dateChange)="onDateChange()">
                  <mat-datepicker-toggle matSuffix [for]="fromDatePicker"></mat-datepicker-toggle>
                  <mat-datepicker #fromDatePicker></mat-datepicker>
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>To Date</mat-label>
                  <input matInput [matDatepicker]="toDatePicker" [(ngModel)]="filterValues.toDate" (dateChange)="onDateChange()">
                  <mat-datepicker-toggle matSuffix [for]="toDatePicker"></mat-datepicker-toggle>
                  <mat-datepicker #toDatePicker></mat-datepicker>
                </mat-form-field>
              </div>
              
              <!-- Quick Date Range Buttons -->
              <div class="mt-4 flex flex-wrap gap-2">
                <button mat-button (click)="setDateRange('today')" class="text-sm">
                  <mat-icon class="text-base mr-1">today</mat-icon>
                  Today
                </button>
                <button mat-button (click)="setDateRange('yesterday')" class="text-sm">
                  <mat-icon class="text-base mr-1">calendar_today</mat-icon>
                  Yesterday  
                </button>
                <button mat-button (click)="setDateRange('thisWeek')" class="text-sm">
                  <mat-icon class="text-base mr-1">date_range</mat-icon>
                  This Week
                </button>
                <button mat-button (click)="setDateRange('lastWeek')" class="text-sm">
                  <mat-icon class="text-base mr-1">date_range</mat-icon>
                  Last Week
                </button>
                <button mat-button (click)="setDateRange('thisMonth')" class="text-sm">
                  <mat-icon class="text-base mr-1">calendar_month</mat-icon>
                  This Month
                </button>
                <button mat-button (click)="setDateRange('sep18')" class="text-sm bg-blue-50 text-blue-600">
                  <mat-icon class="text-base mr-1">event</mat-icon>
                  Sep 18 (Test Data)
                </button>
              </div>
              
              <!-- Clear Filters Button -->
              <div class="mt-4 flex justify-end">
                <button mat-stroked-button (click)="clearFilters()" class="rounded-lg">
                  <mat-icon>clear</mat-icon>
                  <span class="ml-1">Clear Filters</span>
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Order List Table -->
        <div class="mb-6">
          <mat-card class="border-0 shadow-md">
            <mat-card-header class="pb-4">
              <mat-card-title class="text-xl font-semibold text-slate-900 flex items-center">
                📋 <span class="ml-2">Orders ({{dataSource.data.length}})</span>
              </mat-card-title>
              <mat-card-subtitle class="text-slate-600">
                Manage and track all delivery orders
              </mat-card-subtitle>
            </mat-card-header>
            <mat-card-content class="p-0">
              
              <!-- Loading State -->
              <div *ngIf="loading" class="flex justify-center items-center py-12">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span class="ml-3 text-slate-600">Loading orders...</span>
              </div>

              <!-- Empty State -->
              <div *ngIf="!loading && dataSource.data.length === 0" class="text-center py-12">
                <mat-icon class="text-6xl text-slate-400 mb-4">inbox</mat-icon>
                <h3 class="text-lg font-medium text-slate-900 mb-2">No orders found</h3>
                <p class="text-slate-600 mb-4">Get started by creating your first order</p>
                <button mat-raised-button color="primary" (click)="navigateToCreateOrder()" class="rounded-lg">
                  <mat-icon>add</mat-icon>
                  <span class="ml-1">Create Order</span>
                </button>
              </div>

              <!-- Orders Table -->
              <div *ngIf="!loading && dataSource.data.length > 0" class="overflow-x-auto">
                <table mat-table [dataSource]="dataSource" matSort class="w-full">
                  
                  <!-- Order ID Column -->
                  <ng-container matColumnDef="orderId">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header class="font-semibold text-slate-700">Order ID</th>
                    <td mat-cell *matCellDef="let order" class="py-4">
                      <div class="flex items-center">
                        <div class="flex-shrink-0">
                          <div class="w-3 h-3 rounded-full mr-2" 
                               [ngClass]="{
                                 'bg-yellow-400': order.status === 'PENDING',
                                 'bg-blue-400': order.status === 'CONFIRMED',
                                 'bg-purple-400': order.status === 'PICKED_UP',
                                 'bg-cyan-400': order.status === 'IN_TRANSIT',
                                 'bg-green-400': order.status === 'DELIVERED',
                                 'bg-red-400': order.status === 'CANCELLED',
                                 'bg-orange-400': order.status === 'RETURNED'
                               }"></div>
                        </div>
                        <div>
                          <div class="font-medium text-slate-900">{{order.order_id}}</div>
                          <div class="text-sm text-slate-500">{{order.created_at | date:'MMM dd, yyyy'}}</div>
                        </div>
                      </div>
                    </td>
                  </ng-container>

                  <!-- Client Information Column -->
                  <ng-container matColumnDef="client">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header class="font-semibold text-slate-700">Client</th>
                    <td mat-cell *matCellDef="let order" class="py-4">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                          <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span class="text-sm font-medium text-blue-600">{{order.client_name?.charAt(0) || 'C'}}</span>
                          </div>
                        </div>
                        <div class="ml-3">
                          <div class="font-medium text-slate-900">{{order.client_name}}</div>
                          <div class="text-sm text-slate-500" *ngIf="order.client_company">{{order.client_company}}</div>
                          <div class="text-sm text-slate-500" *ngIf="order.contact_number">{{order.contact_number}}</div>
                        </div>
                      </div>
                    </td>
                  </ng-container>

                  <!-- Route Column -->
                  <ng-container matColumnDef="route">
                    <th mat-header-cell *matHeaderCellDef class="font-semibold text-slate-700">Route</th>
                    <td mat-cell *matCellDef="let order" class="py-4">
                      <div class="space-y-1">
                        <div class="flex items-center text-sm">
                          <mat-icon class="text-green-600 text-base mr-1">radio_button_checked</mat-icon>
                          <span class="text-slate-600 truncate max-w-[200px]" matTooltip="{{order.sender_address}}">
                            {{order.sender_name}}
                          </span>
                        </div>
                        <div class="flex items-center text-sm">
                          <mat-icon class="text-red-600 text-base mr-1">location_on</mat-icon>
                          <span class="text-slate-600 truncate max-w-[200px]" matTooltip="{{order.receiver_address}}">
                            {{order.receiver_name}}, {{order.receiver_city}}
                          </span>
                        </div>
                      </div>
                    </td>
                  </ng-container>

                  <!-- Service Column -->
                  <ng-container matColumnDef="service">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header class="font-semibold text-slate-700">Service</th>
                    <td mat-cell *matCellDef="let order" class="py-4">
                      <div>
                        <span class="inline-flex items-center px-3 py-1 text-sm rounded-full font-medium" 
                              [ngClass]="getServiceClass(order.service_type)">
                          <mat-icon class="mr-1" style="font-size: 16px;">{{getServiceIcon(order.service_type)}}</mat-icon>
                          {{order.service_type | titlecase}}
                        </span>
                        <div class="text-sm text-slate-500 mt-1">{{order.carrier_name}}</div>
                        <div class="text-xs text-slate-400" *ngIf="order.tracking_number">{{order.tracking_number}}</div>
                      </div>
                    </td>
                  </ng-container>

                  <!-- Status Column -->
                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header class="font-semibold text-slate-700">Status</th>
                    <td mat-cell *matCellDef="let order" class="py-4">
                      <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                            [ngClass]="getStatusClass(order.status)">
                        <span class="w-2 h-2 rounded-full mr-2" [ngClass]="getStatusDotClass(order.status)"></span>
                        {{order.status | titlecase}}
                      </span>
                      <div class="text-xs text-slate-500 mt-1">{{order.statusUpdatedAt | date:'MMM dd, HH:mm'}}</div>
                    </td>
                  </ng-container>

                  <!-- Delivery Date Column -->
                  <ng-container matColumnDef="deliveryDate">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header class="font-semibold text-slate-700">Delivery</th>
                    <td mat-cell *matCellDef="let order" class="py-4">
                      <div>
                        <div class="flex items-center text-sm" *ngIf="order.estimated_delivery_date; else noEstimatedDate">
                          <mat-icon class="text-blue-600 text-base mr-1">schedule</mat-icon>
                          <span class="text-slate-900">{{order.estimated_delivery_date | date:'MMM dd, yyyy'}}</span>
                        </div>
                        <ng-template #noEstimatedDate>
                          <div class="flex items-center text-sm">
                            <mat-icon class="text-slate-400 text-base mr-1">schedule</mat-icon>
                            <span class="text-slate-400">Not set</span>
                          </div>
                        </ng-template>
                        <div *ngIf="order.actual_delivery_date" class="flex items-center text-sm mt-1">
                          <mat-icon class="text-green-600 text-base mr-1">check_circle</mat-icon>
                          <span class="text-green-600">{{order.actual_delivery_date | date:'MMM dd, yyyy'}}</span>
                        </div>
                        <div class="text-xs text-slate-500" *ngIf="order.delivery_time">{{order.delivery_time}}</div>
                      </div>
                    </td>
                  </ng-container>

                  <!-- Value Column -->
                  <ng-container matColumnDef="value">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header class="font-semibold text-slate-700">Value</th>
                    <td mat-cell *matCellDef="let order" class="py-4">
                      <div>
                        <div class="font-medium text-slate-900">
                          <span *ngIf="order.total_amount && order.total_amount > 0; else showDeclaredValue">
                            ₹{{order.total_amount}}
                          </span>
                          <ng-template #showDeclaredValue>
                            <span *ngIf="order.declared_value && order.declared_value > 0; else showNA">
                              ₹{{order.declared_value}}
                            </span>
                            <ng-template #showNA>
                              <span class="text-slate-400">-</span>
                            </ng-template>
                          </ng-template>
                        </div>
                        <div class="text-sm text-slate-500" *ngIf="order.cod_amount && order.cod_amount > 0">
                          COD: ₹{{order.cod_amount}}
                        </div>
                        <span class="inline-flex items-center px-2 py-1 text-xs rounded-full font-medium mt-1" 
                              [ngClass]="getPaymentStatusClass(order.payment_status)">
                          {{order.payment_status | titlecase}}
                        </span>
                      </div>
                    </td>
                  </ng-container>

                  <!-- Actions Column -->
                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef class="font-semibold text-slate-700">Actions</th>
                    <td mat-cell *matCellDef="let order" class="py-4">
                      <div class="flex items-center gap-2">
                        <button mat-icon-button 
                                matTooltip="View Details" 
                                (click)="viewOrderDetails(order)"
                                class="text-blue-600 hover:bg-blue-50">
                          <mat-icon>visibility</mat-icon>
                        </button>
                        <button mat-icon-button 
                                matTooltip="Track Order" 
                                (click)="trackOrder(order)"
                                *ngIf="order.trackingNumber"
                                class="text-green-600 hover:bg-green-50">
                          <mat-icon>my_location</mat-icon>
                        </button>
                        <button mat-icon-button 
                                [matMenuTriggerFor]="orderMenu" 
                                matTooltip="More Actions"
                                class="text-slate-600 hover:bg-slate-50">
                          <mat-icon>more_vert</mat-icon>
                        </button>
                        <mat-menu #orderMenu="matMenu">
                          <button mat-menu-item (click)="editOrder(order)">
                            <mat-icon>edit</mat-icon>
                            <span>Edit Order</span>
                          </button>
                          <button mat-menu-item (click)="updateOrderStatus(order)">
                            <mat-icon>update</mat-icon>
                            <span>Update Status</span>
                          </button>
                          <button mat-menu-item (click)="printOrder(order)">
                            <mat-icon>print</mat-icon>
                            <span>Print</span>
                          </button>
                          <mat-divider></mat-divider>
                          <button mat-menu-item (click)="cancelOrder(order)" class="text-red-600">
                            <mat-icon>cancel</mat-icon>
                            <span>Cancel Order</span>
                          </button>
                        </mat-menu>
                      </div>
                    </td>
                  </ng-container>

                  <!-- Table Header and Rows -->
                  <tr mat-header-row *matHeaderRowDef="displayedColumns" class="bg-slate-50"></tr>
                  <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                      class="hover:bg-slate-50 cursor-pointer transition-colors duration-200"
                      [class.bg-blue-50]="highlightedOrderId === row.id"
                      (click)="viewOrderDetails(row)"></tr>
                </table>

                <!-- Paginator -->
                <mat-paginator 
                  #paginator
                  [pageSizeOptions]="[10, 25, 50, 100]" 
                  [pageSize]="10"
                  [showFirstLastButtons]="true"
                  class="border-t border-slate-200">
                </mat-paginator>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

      </main>
    </div>
  `,
  styles: [`
    .mat-mdc-table {
      background: transparent;
    }
    
    .mat-mdc-header-row {
      background-color: rgb(248 250 252);
    }
    
    .mat-mdc-row:hover {
      background-color: rgb(248 250 252);
    }
    
    .mat-mdc-chip {
      min-height: 24px;
      padding: 0 8px;
      font-size: 12px;
    }
    
    .mat-mdc-form-field {
      font-size: 14px;
    }
  `]
})
export class OrderListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['orderId', 'client', 'route', 'service', 'status', 'deliveryDate', 'value', 'actions'];
  dataSource = new MatTableDataSource<OrderRecord>([]);
  
  loading = false;
  autoRefresh = true; // Enable auto-refresh by default like pickup-list
  lastRefresh = new Date();
  highlightedOrderId: string | null = null;
  
  // Filter values
  filterValues = {
    search: '',
    status: '',
    serviceType: '',
    fromDate: null as Date | null,
    toDate: null as Date | null
  };

  // Analytics data
  analytics: any = null;

  // Live status counters
  statusCounts = {
    pending: 0,
    inTransit: 0,
    delivered: 0,
    total: 0
  };

  // Subscriptions
  private subscriptions: Subscription[] = [];
  private refreshInterval?: ReturnType<typeof setInterval>;
  private searchSubject = new Subject<string>();

  constructor(
    private orderService: OrderService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Set up search debouncing
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.loadOrders();
    });
    
    // Use setTimeout to defer initial loading to avoid change detection issues
    setTimeout(() => {
      this.loadOrders();
      this.loadAnalytics();
    });
    this.setupAutoRefresh();
    this.checkForHighlightedOrder();
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
    
    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      if (this.dataSource.data.length === 0) {
        this.loadOrders();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.searchSubject.complete();
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = undefined;
    }
  }

  loadOrders(): void {
    this.loading = true;
    
    console.log('🔍 Current filterValues in loadOrders:', JSON.stringify(this.filterValues));
    console.log('🔍 Individual filter values:');
    console.log('  - search:', `"${this.filterValues.search}"`);
    console.log('  - status:', `"${this.filterValues.status}"`);
    console.log('  - serviceType:', `"${this.filterValues.serviceType}"`);
    console.log('  - fromDate:', this.filterValues.fromDate);
    console.log('  - toDate:', this.filterValues.toDate);
    
    const queryParams: OrderQueryParams = {
      search: this.filterValues.search && this.filterValues.search.trim() ? this.filterValues.search.trim() : undefined,
      status: this.filterValues.status && this.filterValues.status !== '' ? this.filterValues.status : undefined,
      service_type: this.filterValues.serviceType && this.filterValues.serviceType !== '' ? this.filterValues.serviceType : undefined,
      from_date: this.filterValues.fromDate ? this.formatDateRangeForAPI(this.filterValues.fromDate, false) : undefined,
      to_date: this.filterValues.toDate ? this.formatDateRangeForAPI(this.filterValues.toDate, true) : undefined,
      sort_by: 'created_at',
      sort_order: 'desc'
    };

    console.log('🔍 Sending filter parameters:', queryParams);

    const ordersSub = this.orderService.getOrders(queryParams).subscribe({
      next: (response) => {
        this.dataSource.data = response.content || [];
        
        // Debug: Check value-related fields in the first order
        if (response.content && response.content.length > 0) {
          const firstOrder = response.content[0];
          console.log('🔍 First order value fields:', {
            total_amount: firstOrder.total_amount,
            declared_value: firstOrder.declared_value,
            cod_amount: firstOrder.cod_amount,
            payment_status: firstOrder.payment_status
          });
        }
        
        // Calculate live status counts
        this.calculateStatusCounts(response.content || []);
        
        // Ensure paginator is connected after data update
        if (this.paginator && !this.dataSource.paginator) {
          this.dataSource.paginator = this.paginator;
        }
        
        // Force update paginator
        if (this.paginator) {
          this.paginator._changePageSize(this.paginator.pageSize);
        }
        
        this.loading = false;
        this.lastRefresh = new Date();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });

    this.subscriptions.push(ordersSub);
  }

  loadAnalytics(): void {
    const analyticsSub = this.orderService.getOrderAnalytics().subscribe({
      next: (analytics) => {
        this.analytics = analytics;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading analytics:', error);
        this.cdr.detectChanges();
      }
    });

    this.subscriptions.push(analyticsSub);
  }

  applyFilters(): void {
    this.loadOrders();
    this.cdr.detectChanges();
  }

  onSearchChange(event: any): void {
    this.filterValues.search = event.target.value;
    this.searchSubject.next(this.filterValues.search);
  }

  onStatusChange(event: any): void {
    console.log('🔽 Status dropdown changed:', event.value);
    console.log('📋 filterValues before update:', JSON.stringify(this.filterValues));
    
    // Ensure the value is properly set
    this.filterValues.status = event.value || '';
    
    console.log('📋 filterValues after update:', JSON.stringify(this.filterValues));
    console.log('✅ About to apply filters with status:', this.filterValues.status);
    
    // Force change detection and apply filters
    this.cdr.detectChanges();
    this.applyFilters();
  }

  onServiceTypeChange(event: any): void {
    console.log('🚚 Service type dropdown changed:', event.value);
    console.log('📋 filterValues before update:', JSON.stringify(this.filterValues));
    
    // Ensure the value is properly set
    this.filterValues.serviceType = event.value || '';
    
    console.log('📋 filterValues after update:', JSON.stringify(this.filterValues));
    console.log('✅ About to apply filters with serviceType:', this.filterValues.serviceType);
    
    // Force change detection and apply filters
    this.cdr.detectChanges();
    this.applyFilters();
  }

  onDateChange(): void {
    console.log('📅 Date filter changed:', {
      fromDate: this.filterValues.fromDate,
      toDate: this.filterValues.toDate
    });
    
    // Validate date range
    if (this.filterValues.fromDate && this.filterValues.toDate) {
      if (this.filterValues.fromDate > this.filterValues.toDate) {
        console.warn('⚠️ From date is after to date, swapping them');
        const temp = this.filterValues.fromDate;
        this.filterValues.fromDate = this.filterValues.toDate;
        this.filterValues.toDate = temp;
      }
    }
    
    // Force change detection and apply filters
    this.cdr.detectChanges();
    this.applyFilters();
  }

  formatDateForAPI(date: Date): string {
    if (!date) return '';
    // Format as full ISO datetime for the backend API (Instant format)
    return date.toISOString();
  }

  formatDateRangeForAPI(date: Date, isEndDate: boolean = false): string {
    if (!date) return '';
    
    const adjustedDate = new Date(date);
    if (isEndDate) {
      // Set to end of day (23:59:59.999) for end date
      adjustedDate.setHours(23, 59, 59, 999);
    } else {
      // Set to start of day (00:00:00.000) for start date
      adjustedDate.setHours(0, 0, 0, 0);
    }
    
    const isoString = adjustedDate.toISOString();
    console.log(`📅 Formatted ${isEndDate ? 'end' : 'start'} date:`, date, '→', isoString);
    return isoString;
  }

  clearFilters(): void {
    this.filterValues = {
      search: '',
      status: '',
      serviceType: '',
      fromDate: null,
      toDate: null
    };
    this.loadOrders();
    this.cdr.detectChanges();
  }

  setDateRange(range: string): void {
    const today = new Date();
    let fromDate: Date | null = null;
    let toDate: Date | null = null;

    switch (range) {
      case 'today':
        fromDate = new Date(today);
        toDate = new Date(today);
        break;
      
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        fromDate = new Date(yesterday);
        toDate = new Date(yesterday);
        break;
      
      case 'thisWeek':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        fromDate = new Date(startOfWeek);
        toDate = new Date(today);
        break;
      
      case 'lastWeek':
        const startOfLastWeek = new Date(today);
        startOfLastWeek.setDate(today.getDate() - today.getDay() - 7);
        const endOfLastWeek = new Date(startOfLastWeek);
        endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
        fromDate = new Date(startOfLastWeek);
        toDate = new Date(endOfLastWeek);
        break;
      
      case 'thisMonth':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        fromDate = new Date(startOfMonth);
        toDate = new Date(today);
        break;
      
      case 'sep18':
        // Special test case for September 18, 2025 (where our test data is)
        const sep18 = new Date(2025, 8, 18); // Month is 0-based, so 8 = September
        fromDate = new Date(sep18);
        toDate = new Date(sep18);
        break;
    }

    this.filterValues.fromDate = fromDate;
    this.filterValues.toDate = toDate;
    
    console.log(`📅 Set date range for "${range}":`, {
      fromDate: fromDate,
      toDate: toDate
    });
    
    this.cdr.detectChanges();
    this.applyFilters();
  }

  calculateStatusCounts(orders: OrderRecord[]): void {
    this.statusCounts = {
      pending: orders.filter(order => order.status === 'PENDING').length,
      inTransit: orders.filter(order => order.status === 'IN_TRANSIT').length,
      delivered: orders.filter(order => order.status === 'DELIVERED').length,
      total: orders.length
    };
    console.log('📊 Status counts updated:', this.statusCounts);
  }

  refreshOrders(): void {
    this.loadOrders();
    this.loadAnalytics();
  }

  // Setup auto-refresh timer
  private setupAutoRefresh(): void {
    if (this.autoRefresh) {
      this.refreshInterval = setInterval(() => {
        this.refreshOrders();
      }, 30000); // Refresh every 30 seconds
    }
  }

  toggleAutoRefresh(): void {
    this.autoRefresh = !this.autoRefresh;
    
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = undefined;
    }
    
    if (this.autoRefresh) {
      this.setupAutoRefresh();
    }
    
    this.cdr.detectChanges();
  }

  checkForHighlightedOrder(): void {
    this.route.queryParams.subscribe(params => {
      if (params['highlight']) {
        this.highlightedOrderId = params['highlight'];
        this.cdr.detectChanges();
        // Clear highlight after 5 seconds
        setTimeout(() => {
          this.highlightedOrderId = null;
          this.cdr.detectChanges();
        }, 5000);
      }
    });
  }

  // Navigation methods
  navigateToCreateOrder(): void {
    this.router.navigate(['/orders']);
  }

  viewOrderDetails(order: OrderRecord): void {
    console.log('View order details:', order);
    // TODO: Open order detail modal
  }

  editOrder(order: OrderRecord): void {
    console.log('Edit order:', order);
    
    const dialogRef = this.dialog.open(OrderEditModalComponent, {
      data: { order },
      width: '800px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Order updated:', result);
        // Refresh the orders list to show updated data
        this.refreshOrders();
      }
    });
  }

  trackOrder(order: OrderRecord): void {
    console.log('Track order:', order);
    // TODO: Open tracking interface
  }

  updateOrderStatus(order: OrderRecord): void {
    console.log('Update status for order:', order);
    
    const dialogRef = this.dialog.open(OrderStatusUpdateModalComponent, {
      data: { order },
      width: '600px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Order status updated:', result);
        // Refresh the orders list to show updated data
        this.refreshOrders();
      }
    });
  }

  printOrder(order: OrderRecord): void {
    console.log('Print order:', order);
    // TODO: Generate and print order document
  }

  cancelOrder(order: OrderRecord): void {
    // TODO: Confirm and cancel order
  }

  // Helper methods for chip styling
  getStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'picked-up': return 'bg-purple-100 text-purple-800';
      case 'in-transit': return 'bg-cyan-100 text-cyan-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'returned': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusDotClass(status: string): string {
    switch (status) {
      case 'pending': return 'bg-yellow-400';
      case 'confirmed': return 'bg-blue-400';
      case 'picked-up': return 'bg-purple-400';
      case 'in-transit': return 'bg-cyan-400';
      case 'delivered': return 'bg-green-400';
      case 'cancelled': return 'bg-red-400';
      case 'returned': return 'bg-orange-400';
      default: return 'bg-gray-400';
    }
  }

  getServiceClass(serviceType: string): string {
    switch (serviceType?.toLowerCase()) {
      case 'express': return 'bg-red-100 text-red-800';
      case 'standard': return 'bg-blue-100 text-blue-800';
      case 'economy': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getServiceIcon(serviceType: string): string {
    switch (serviceType?.toLowerCase()) {
      case 'express': return 'flash_on';
      case 'standard': return 'local_shipping';
      case 'economy': return 'eco';
      default: return 'local_shipping';
    }
  }

  getPaymentStatusClass(paymentStatus: string): string {
    const status = paymentStatus?.toLowerCase() || '';
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'cod': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
