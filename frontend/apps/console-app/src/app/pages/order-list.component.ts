import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Subscription } from 'rxjs';
import { OrderService, OrderRecord, OrderQueryParams } from '../../../../../libs/shared';

@Component({
  selector: 'app-order-list',
  standalone: true,
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatTooltipModule,
    MatCardModule,
    MatSelectModule,
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
                    <div class="text-lg font-bold text-blue-600">{{analytics?.totalOrders || 0}}</div>
                  </div>
                  <div class="bg-white rounded-lg px-3 py-2 shadow-sm">
                    <div class="text-xs text-slate-500">Pending</div>
                    <div class="text-lg font-bold text-yellow-600">{{analytics?.pendingOrders || 0}}</div>
                  </div>
                  <div class="bg-white rounded-lg px-3 py-2 shadow-sm">
                    <div class="text-xs text-slate-500">In Transit</div>
                    <div class="text-lg font-bold text-green-600">{{analytics?.inTransitOrders || 0}}</div>
                  </div>
                  <div class="bg-white rounded-lg px-3 py-2 shadow-sm">
                    <div class="text-xs text-slate-500">Delivered</div>
                    <div class="text-lg font-bold text-emerald-600">{{analytics?.deliveredOrders || 0}}</div>
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
                  <input matInput [(ngModel)]="filterValues.search" (input)="applyFilters()" placeholder="Search orders..." />
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>
                
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Status</mat-label>
                  <mat-select [(ngModel)]="filterValues.status" (selectionChange)="applyFilters()">
                    <mat-option value="">All Statuses</mat-option>
                    <mat-option value="pending">Pending</mat-option>
                    <mat-option value="confirmed">Confirmed</mat-option>
                    <mat-option value="picked-up">Picked Up</mat-option>
                    <mat-option value="in-transit">In Transit</mat-option>
                    <mat-option value="delivered">Delivered</mat-option>
                    <mat-option value="cancelled">Cancelled</mat-option>
                    <mat-option value="returned">Returned</mat-option>
                  </mat-select>
                  <mat-icon matSuffix>flag</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Service Type</mat-label>
                  <mat-select [(ngModel)]="filterValues.serviceType" (selectionChange)="applyFilters()">
                    <mat-option value="">All Services</mat-option>
                    <mat-option value="express">Express</mat-option>
                    <mat-option value="standard">Standard</mat-option>
                    <mat-option value="economy">Economy</mat-option>
                  </mat-select>
                  <mat-icon matSuffix>local_shipping</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>From Date</mat-label>
                  <input matInput [matDatepicker]="fromDatePicker" [(ngModel)]="filterValues.fromDate" (dateChange)="applyFilters()">
                  <mat-datepicker-toggle matSuffix [for]="fromDatePicker"></mat-datepicker-toggle>
                  <mat-datepicker #fromDatePicker></mat-datepicker>
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>To Date</mat-label>
                  <input matInput [matDatepicker]="toDatePicker" [(ngModel)]="filterValues.toDate" (dateChange)="applyFilters()">
                  <mat-datepicker-toggle matSuffix [for]="toDatePicker"></mat-datepicker-toggle>
                  <mat-datepicker #toDatePicker></mat-datepicker>
                </mat-form-field>
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
                                 'bg-yellow-400': order.status === 'pending',
                                 'bg-blue-400': order.status === 'confirmed',
                                 'bg-purple-400': order.status === 'picked-up',
                                 'bg-cyan-400': order.status === 'in-transit',
                                 'bg-green-400': order.status === 'delivered',
                                 'bg-red-400': order.status === 'cancelled',
                                 'bg-orange-400': order.status === 'returned'
                               }"></div>
                        </div>
                        <div>
                          <div class="font-medium text-slate-900">{{order.orderId}}</div>
                          <div class="text-sm text-slate-500">{{order.orderDate | date:'MMM dd, yyyy'}}</div>
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
                            <span class="text-sm font-medium text-blue-600">{{order.clientName.charAt(0)}}</span>
                          </div>
                        </div>
                        <div class="ml-3">
                          <div class="font-medium text-slate-900">{{order.clientName}}</div>
                          <div class="text-sm text-slate-500" *ngIf="order.clientCompany">{{order.clientCompany}}</div>
                          <div class="text-sm text-slate-500" *ngIf="order.contactNumber">{{order.contactNumber}}</div>
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
                          <span class="text-slate-600 truncate max-w-[200px]" matTooltip="{{order.senderAddress}}">
                            {{order.senderName}}
                          </span>
                        </div>
                        <div class="flex items-center text-sm">
                          <mat-icon class="text-red-600 text-base mr-1">location_on</mat-icon>
                          <span class="text-slate-600 truncate max-w-[200px]" matTooltip="{{order.receiverAddress}}">
                            {{order.receiverName}}, {{order.receiverCity}}
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
                        <mat-chip-listbox>
                          <mat-chip-option 
                            [ngClass]="{
                              'bg-red-100 text-red-800': order.serviceType === 'express',
                              'bg-blue-100 text-blue-800': order.serviceType === 'standard',
                              'bg-green-100 text-green-800': order.serviceType === 'economy'
                            }" 
                            class="text-xs font-medium">
                            {{order.serviceType | titlecase}}
                          </mat-chip-option>
                        </mat-chip-listbox>
                        <div class="text-sm text-slate-500 mt-1">{{order.carrierName}}</div>
                        <div class="text-xs text-slate-400" *ngIf="order.trackingNumber">{{order.trackingNumber}}</div>
                      </div>
                    </td>
                  </ng-container>

                  <!-- Status Column -->
                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header class="font-semibold text-slate-700">Status</th>
                    <td mat-cell *matCellDef="let order" class="py-4">
                      <mat-chip-listbox>
                        <mat-chip-option 
                          [ngClass]="{
                            'bg-yellow-100 text-yellow-800': order.status === 'pending',
                            'bg-blue-100 text-blue-800': order.status === 'confirmed',
                            'bg-purple-100 text-purple-800': order.status === 'picked-up',
                            'bg-cyan-100 text-cyan-800': order.status === 'in-transit',
                            'bg-green-100 text-green-800': order.status === 'delivered',
                            'bg-red-100 text-red-800': order.status === 'cancelled',
                            'bg-orange-100 text-orange-800': order.status === 'returned'
                          }" 
                          class="text-xs font-medium">
                          {{order.status | titlecase}}
                        </mat-chip-option>
                      </mat-chip-listbox>
                      <div class="text-xs text-slate-500 mt-1">{{order.statusUpdatedAt | date:'MMM dd, HH:mm'}}</div>
                    </td>
                  </ng-container>

                  <!-- Delivery Date Column -->
                  <ng-container matColumnDef="deliveryDate">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header class="font-semibold text-slate-700">Delivery</th>
                    <td mat-cell *matCellDef="let order" class="py-4">
                      <div>
                        <div class="flex items-center text-sm">
                          <mat-icon class="text-blue-600 text-base mr-1">schedule</mat-icon>
                          <span class="text-slate-900">{{order.estimatedDeliveryDate | date:'MMM dd'}}</span>
                        </div>
                        <div *ngIf="order.actualDeliveryDate" class="flex items-center text-sm mt-1">
                          <mat-icon class="text-green-600 text-base mr-1">check_circle</mat-icon>
                          <span class="text-green-600">{{order.actualDeliveryDate | date:'MMM dd'}}</span>
                        </div>
                        <div class="text-xs text-slate-500" *ngIf="order.deliveryTime">{{order.deliveryTime}}</div>
                      </div>
                    </td>
                  </ng-container>

                  <!-- Value Column -->
                  <ng-container matColumnDef="value">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header class="font-semibold text-slate-700">Value</th>
                    <td mat-cell *matCellDef="let order" class="py-4">
                      <div>
                        <div class="font-medium text-slate-900">₹{{order.estimatedCost}}</div>
                        <div class="text-sm text-slate-500" *ngIf="order.codAmount">COD: ₹{{order.codAmount}}</div>
                        <mat-chip-listbox class="mt-1">
                          <mat-chip-option 
                            [ngClass]="{
                              'bg-yellow-100 text-yellow-800': order.paymentStatus === 'pending',
                              'bg-green-100 text-green-800': order.paymentStatus === 'paid',
                              'bg-blue-100 text-blue-800': order.paymentStatus === 'cod',
                              'bg-red-100 text-red-800': order.paymentStatus === 'failed'
                            }" 
                            class="text-xs">
                            {{order.paymentStatus | titlecase}}
                          </mat-chip-option>
                        </mat-chip-listbox>
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
  autoRefresh = false;
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

  // Subscriptions
  private subscriptions: Subscription[] = [];
  private refreshInterval: any;

  constructor(
    private orderService: OrderService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadAnalytics();
    this.checkForHighlightedOrder();
  }

  ngAfterViewInit(): void {
    if (this.paginator && this.sort) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.loadOrders();
    } else {
      // Retry after a delay if elements aren't ready
      setTimeout(() => {
        if (this.paginator && this.sort) {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.loadOrders();
        }
      }, 100);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadOrders(): void {
    this.loading = true;
    
    const queryParams: OrderQueryParams = {
      search: this.filterValues.search || undefined,
      status: this.filterValues.status || undefined,
      serviceType: this.filterValues.serviceType || undefined,
      fromDate: this.filterValues.fromDate?.toISOString().split('T')[0] || undefined,
      toDate: this.filterValues.toDate?.toISOString().split('T')[0] || undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };

    const ordersSub = this.orderService.getOrders(queryParams).subscribe({
      next: (response) => {
        this.dataSource.data = response.content || [];
        
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
      },
      error: (error) => {
        this.loading = false;
      }
    });

    this.subscriptions.push(ordersSub);
  }

  loadAnalytics(): void {
    const analyticsSub = this.orderService.getOrderAnalytics().subscribe({
      next: (analytics) => {
        this.analytics = analytics;
      },
      error: (error) => {
        console.error('Error loading analytics:', error);
      }
    });

    this.subscriptions.push(analyticsSub);
  }

  applyFilters(): void {
    this.loadOrders();
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
  }

  refreshOrders(): void {
    this.loadOrders();
    this.loadAnalytics();
  }

  toggleAutoRefresh(): void {
    this.autoRefresh = !this.autoRefresh;
    
    if (this.autoRefresh) {
      this.refreshInterval = setInterval(() => {
        this.refreshOrders();
      }, 30000); // Refresh every 30 seconds
    } else {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
      }
    }
  }

  checkForHighlightedOrder(): void {
    this.route.queryParams.subscribe(params => {
      if (params['highlight']) {
        this.highlightedOrderId = params['highlight'];
        // Clear highlight after 5 seconds
        setTimeout(() => {
          this.highlightedOrderId = null;
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
    // TODO: Navigate to edit order page
  }

  trackOrder(order: OrderRecord): void {
    console.log('Track order:', order);
    // TODO: Open tracking interface
  }

  updateOrderStatus(order: OrderRecord): void {
    console.log('Update status for order:', order);
    // TODO: Open status update modal
  }

  printOrder(order: OrderRecord): void {
    console.log('Print order:', order);
    // TODO: Generate and print order document
  }

  cancelOrder(order: OrderRecord): void {
    // TODO: Confirm and cancel order
  }
}
