import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { OrderService, OrderAnalytics, LoggingService } from '../../../../../libs/shared';

@Component({
  selector: 'app-order-analytics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="min-h-screen bg-slate-50">
      
      <!-- Header Section -->
      <header class="bg-white border-b border-slate-200 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-6">
            <div>
              <h1 class="text-3xl font-bold text-slate-900 flex items-center">
                📊 <span class="ml-2">Order Analytics</span>
              </h1>
              <p class="text-slate-600 mt-1">Comprehensive insights and performance metrics for order management</p>
            </div>
            <div class="flex items-center gap-3">
              <button 
                mat-stroked-button 
                color="primary" 
                (click)="refreshAnalytics()" 
                matTooltip="Refresh analytics"
                class="rounded-lg border-slate-300 text-slate-700 hover:bg-slate-50">
                <mat-icon>refresh</mat-icon>
                <span class="ml-1">Refresh</span>
              </button>
              <button 
                mat-raised-button 
                color="primary" 
                (click)="navigateToOrderList()" 
                matTooltip="View order list"
                class="bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <mat-icon>list</mat-icon>
                <span class="ml-1">Order List</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <!-- Date Range Filter -->
        <div class="mb-6">
          <mat-card class="border-0 shadow-md">
            <mat-card-header class="pb-4">
              <mat-card-title class="text-xl font-semibold text-slate-900 flex items-center">
                📅 <span class="ml-2">Date Range</span>
              </mat-card-title>
              <mat-card-subtitle class="text-slate-600">
                Select date range for analytics
              </mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>From Date</mat-label>
                  <input matInput [matDatepicker]="fromDatePicker" [(ngModel)]="dateRange.fromDate" (dateChange)="refreshAnalytics()">
                  <mat-datepicker-toggle matSuffix [for]="fromDatePicker"></mat-datepicker-toggle>
                  <mat-datepicker #fromDatePicker></mat-datepicker>
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>To Date</mat-label>
                  <input matInput [matDatepicker]="toDatePicker" [(ngModel)]="dateRange.toDate" (dateChange)="refreshAnalytics()">
                  <mat-datepicker-toggle matSuffix [for]="toDatePicker"></mat-datepicker-toggle>
                  <mat-datepicker #toDatePicker></mat-datepicker>
                </mat-form-field>

                <div class="flex items-end">
                  <button mat-stroked-button (click)="setQuickDateRange('today')" class="mr-2 rounded-lg">Today</button>
                  <button mat-stroked-button (click)="setQuickDateRange('week')" class="mr-2 rounded-lg">This Week</button>
                  <button mat-stroked-button (click)="setQuickDateRange('month')" class="rounded-lg">This Month</button>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Analytics Overview Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          <!-- Total Orders -->
          <mat-card class="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
            <mat-card-content class="p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-slate-600">Total Orders</p>
                  <p class="text-3xl font-bold text-slate-900">{{analytics?.totalOrders || 0}}</p>
                  <p class="text-sm text-green-600 mt-1">
                    <mat-icon class="text-sm">trending_up</mat-icon>
                    +12% from last period
                  </p>
                </div>
                <div class="bg-blue-100 p-3 rounded-full">
                  <mat-icon class="text-blue-600 text-2xl">shopping_cart</mat-icon>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Total Revenue -->
          <mat-card class="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
            <mat-card-content class="p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-slate-600">Total Revenue</p>
                  <p class="text-3xl font-bold text-slate-900">₹{{analytics?.totalRevenue || 0 | number:'1.0-0'}}</p>
                  <p class="text-sm text-green-600 mt-1">
                    <mat-icon class="text-sm">trending_up</mat-icon>
                    +8% from last period
                  </p>
                </div>
                <div class="bg-green-100 p-3 rounded-full">
                  <mat-icon class="text-green-600 text-2xl">currency_rupee</mat-icon>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Delivery Rate -->
          <mat-card class="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
            <mat-card-content class="p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-slate-600">On-Time Delivery</p>
                  <p class="text-3xl font-bold text-slate-900">{{analytics?.onTimeDeliveryRate || 0 | number:'1.1-1'}}%</p>
                  <p class="text-sm text-green-600 mt-1">
                    <mat-icon class="text-sm">trending_up</mat-icon>
                    +3% from last period
                  </p>
                </div>
                <div class="bg-emerald-100 p-3 rounded-full">
                  <mat-icon class="text-emerald-600 text-2xl">schedule</mat-icon>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Customer Satisfaction -->
          <mat-card class="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
            <mat-card-content class="p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-slate-600">Customer Satisfaction</p>
                  <p class="text-3xl font-bold text-slate-900">{{analytics?.customerSatisfactionRate || 0 | number:'1.1-1'}}%</p>
                  <p class="text-sm text-green-600 mt-1">
                    <mat-icon class="text-sm">trending_up</mat-icon>
                    +5% from last period
                  </p>
                </div>
                <div class="bg-purple-100 p-3 rounded-full">
                  <mat-icon class="text-purple-600 text-2xl">star</mat-icon>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

        </div>

        <!-- Status Distribution -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          <!-- Order Status Distribution -->
          <mat-card class="border-0 shadow-md">
            <mat-card-header class="pb-4">
              <mat-card-title class="text-xl font-semibold text-slate-900 flex items-center">
                📈 <span class="ml-2">Order Status Distribution</span>
              </mat-card-title>
              <mat-card-subtitle class="text-slate-600">
                Current distribution of orders by status
              </mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="space-y-4">
                
                <div class="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div class="flex items-center">
                    <div class="w-4 h-4 bg-yellow-400 rounded-full mr-3"></div>
                    <span class="text-sm font-medium text-slate-700">Pending</span>
                  </div>
                  <div class="text-right">
                    <div class="text-lg font-bold text-slate-900">{{analytics?.pendingOrders || 0}}</div>
                    <div class="text-xs text-slate-500">{{getPercentage(analytics?.pendingOrders, analytics?.totalOrders)}}%</div>
                  </div>
                </div>

                <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div class="flex items-center">
                    <div class="w-4 h-4 bg-blue-400 rounded-full mr-3"></div>
                    <span class="text-sm font-medium text-slate-700">Confirmed</span>
                  </div>
                  <div class="text-right">
                    <div class="text-lg font-bold text-slate-900">{{analytics?.confirmedOrders || 0}}</div>
                    <div class="text-xs text-slate-500">{{getPercentage(analytics?.confirmedOrders, analytics?.totalOrders)}}%</div>
                  </div>
                </div>

                <div class="flex items-center justify-between p-3 bg-cyan-50 rounded-lg">
                  <div class="flex items-center">
                    <div class="w-4 h-4 bg-cyan-400 rounded-full mr-3"></div>
                    <span class="text-sm font-medium text-slate-700">In Transit</span>
                  </div>
                  <div class="text-right">
                    <div class="text-lg font-bold text-slate-900">{{analytics?.inTransitOrders || 0}}</div>
                    <div class="text-xs text-slate-500">{{getPercentage(analytics?.inTransitOrders, analytics?.totalOrders)}}%</div>
                  </div>
                </div>

                <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div class="flex items-center">
                    <div class="w-4 h-4 bg-green-400 rounded-full mr-3"></div>
                    <span class="text-sm font-medium text-slate-700">Delivered</span>
                  </div>
                  <div class="text-right">
                    <div class="text-lg font-bold text-slate-900">{{analytics?.deliveredOrders || 0}}</div>
                    <div class="text-xs text-slate-500">{{getPercentage(analytics?.deliveredOrders, analytics?.totalOrders)}}%</div>
                  </div>
                </div>

                <div class="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div class="flex items-center">
                    <div class="w-4 h-4 bg-red-400 rounded-full mr-3"></div>
                    <span class="text-sm font-medium text-slate-700">Cancelled</span>
                  </div>
                  <div class="text-right">
                    <div class="text-lg font-bold text-slate-900">{{analytics?.cancelledOrders || 0}}</div>
                    <div class="text-xs text-slate-500">{{getPercentage(analytics?.cancelledOrders, analytics?.totalOrders)}}%</div>
                  </div>
                </div>

              </div>
            </mat-card-content>
          </mat-card>

          <!-- Performance Metrics -->
          <mat-card class="border-0 shadow-md">
            <mat-card-header class="pb-4">
              <mat-card-title class="text-xl font-semibold text-slate-900 flex items-center">
                🎯 <span class="ml-2">Performance Metrics</span>
              </mat-card-title>
              <mat-card-subtitle class="text-slate-600">
                Key performance indicators
              </mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="space-y-6">
                
                <!-- Average Delivery Time -->
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-medium text-slate-700">Average Delivery Time</span>
                    <span class="text-sm font-bold text-slate-900">{{analytics?.averageDeliveryTime || 0}} days</span>
                  </div>
                  <div class="w-full bg-slate-200 rounded-full h-2">
                    <div class="bg-blue-600 h-2 rounded-full" [style.width.%]="(analytics?.averageDeliveryTime || 0) / 5 * 100"></div>
                  </div>
                  <div class="text-xs text-slate-500 mt-1">Target: 3 days</div>
                </div>

                <!-- On-Time Delivery Rate -->
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-medium text-slate-700">On-Time Delivery Rate</span>
                    <span class="text-sm font-bold text-slate-900">{{analytics?.onTimeDeliveryRate || 0 | number:'1.1-1'}}%</span>
                  </div>
                  <div class="w-full bg-slate-200 rounded-full h-2">
                    <div class="bg-green-600 h-2 rounded-full" [style.width.%]="analytics?.onTimeDeliveryRate || 0"></div>
                  </div>
                  <div class="text-xs text-slate-500 mt-1">Target: 95%</div>
                </div>

                <!-- Customer Satisfaction -->
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-medium text-slate-700">Customer Satisfaction</span>
                    <span class="text-sm font-bold text-slate-900">{{analytics?.customerSatisfactionRate || 0 | number:'1.1-1'}}%</span>
                  </div>
                  <div class="w-full bg-slate-200 rounded-full h-2">
                    <div class="bg-purple-600 h-2 rounded-full" [style.width.%]="analytics?.customerSatisfactionRate || 0"></div>
                  </div>
                  <div class="text-xs text-slate-500 mt-1">Target: 90%</div>
                </div>

                <!-- Revenue Growth -->
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-medium text-slate-700">Revenue Growth</span>
                    <span class="text-sm font-bold text-green-600">+8.2%</span>
                  </div>
                  <div class="w-full bg-slate-200 rounded-full h-2">
                    <div class="bg-green-600 h-2 rounded-full w-[82%]"></div>
                  </div>
                  <div class="text-xs text-slate-500 mt-1">vs. Previous Period</div>
                </div>

              </div>
            </mat-card-content>
          </mat-card>

        </div>

        <!-- Recent Activity -->
        <div class="mb-6">
          <mat-card class="border-0 shadow-md">
            <mat-card-header class="pb-4">
              <mat-card-title class="text-xl font-semibold text-slate-900 flex items-center">
                🕒 <span class="ml-2">Recent Activity</span>
              </mat-card-title>
              <mat-card-subtitle class="text-slate-600">
                Latest order updates and milestones
              </mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="space-y-3">
                
                <div class="flex items-center p-3 bg-green-50 rounded-lg">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <mat-icon class="text-green-600 text-sm">check_circle</mat-icon>
                    </div>
                  </div>
                  <div class="ml-3 flex-1">
                    <p class="text-sm font-medium text-slate-900">Order ORD001234 delivered successfully</p>
                    <p class="text-xs text-slate-500">2 minutes ago</p>
                  </div>
                </div>

                <div class="flex items-center p-3 bg-blue-50 rounded-lg">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <mat-icon class="text-blue-600 text-sm">local_shipping</mat-icon>
                    </div>
                  </div>
                  <div class="ml-3 flex-1">
                    <p class="text-sm font-medium text-slate-900">Order ORD001235 picked up for delivery</p>
                    <p class="text-xs text-slate-500">15 minutes ago</p>
                  </div>
                </div>

                <div class="flex items-center p-3 bg-yellow-50 rounded-lg">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <mat-icon class="text-yellow-600 text-sm">add</mat-icon>
                    </div>
                  </div>
                  <div class="ml-3 flex-1">
                    <p class="text-sm font-medium text-slate-900">New order ORD001236 created</p>
                    <p class="text-xs text-slate-500">1 hour ago</p>
                  </div>
                </div>

              </div>
            </mat-card-content>
          </mat-card>
        </div>

      </main>
    </div>
  `,
  styles: [`
    .mat-mdc-progress-bar {
      border-radius: 4px;
    }
    
    .mat-mdc-form-field {
      font-size: 14px;
    }
  `]
})
export class OrderAnalyticsComponent implements OnInit, OnDestroy {
  analytics: OrderAnalytics | null = null;
  
  dateRange = {
    fromDate: null as Date | null,
    toDate: null as Date | null
  };

  private subscriptions: Subscription[] = [];

  constructor(
    private orderService: OrderService,
    private router: Router,
    private logger: LoggingService
  ) {}

  ngOnInit(): void {
  // Defer default date range setup to avoid ExpressionChangedAfterItHasBeenCheckedError
  setTimeout(() => this.setQuickDateRange('month'));
  this.loadAnalytics();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadAnalytics(): void {
    const analyticsSub = this.orderService.getOrderAnalytics().subscribe({
      next: (analytics) => {
        this.analytics = analytics;
      },
      error: (error) => {
        this.logger.error('Error loading analytics', error);
      }
    });

    this.subscriptions.push(analyticsSub);
  }

  refreshAnalytics(): void {
    this.loadAnalytics();
  }

  setQuickDateRange(period: 'today' | 'week' | 'month'): void {
    const today = new Date();
    
    switch (period) {
      case 'today':
        this.dateRange.fromDate = new Date(today);
        this.dateRange.toDate = new Date(today);
        break;
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        this.dateRange.fromDate = weekStart;
        this.dateRange.toDate = new Date(today);
        break;
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        this.dateRange.fromDate = monthStart;
        this.dateRange.toDate = new Date(today);
        break;
    }
    
    this.refreshAnalytics();
  }

  getPercentage(value: number | undefined, total: number | undefined): string {
    if (!value || !total || total === 0) return '0';
    return ((value / total) * 100).toFixed(1);
  }

  navigateToOrderList(): void {
    this.router.navigate(['/order-list']);
  }
}
