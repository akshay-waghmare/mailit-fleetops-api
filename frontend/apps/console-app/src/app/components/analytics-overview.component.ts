import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';
import { PickupAnalyticsService, OverviewMetrics } from '../../../../../libs/shared';

@Component({
  selector: 'app-analytics-overview',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Total Pickups Card -->
      <mat-card class="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-600 text-sm font-medium">Total Pickups</p>
            <p class="text-3xl font-bold text-blue-900">{{ metrics?.totalPickups || 0 }}</p>
            <p class="text-xs text-blue-600 mt-1">
              <span class="inline-flex items-center">
                <mat-icon class="w-4 h-4 mr-1">today</mat-icon>
                {{ metrics?.todayPickups || 0 }} today
              </span>
            </p>
          </div>
          <mat-icon class="text-blue-500 text-4xl">local_shipping</mat-icon>
        </div>
      </mat-card>

      <!-- Completion Rate Card -->
      <mat-card class="p-6 bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-green-600 text-sm font-medium">Completion Rate</p>
            <p class="text-3xl font-bold text-green-900">{{ getCompletionRateDisplay() }}%</p>
            <p class="text-xs text-green-600 mt-1">
              <span class="inline-flex items-center">
                <mat-icon class="w-4 h-4 mr-1">check_circle</mat-icon>
                {{ metrics?.completedPickups || 0 }} completed
              </span>
            </p>
          </div>
          <mat-icon class="text-green-500 text-4xl">trending_up</mat-icon>
        </div>
      </mat-card>

      <!-- In Progress Card -->
      <mat-card class="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-orange-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-orange-600 text-sm font-medium">In Progress</p>
            <p class="text-3xl font-bold text-orange-900">{{ metrics?.inProgressPickups || 0 }}</p>
            <p class="text-xs text-orange-600 mt-1">
              <span class="inline-flex items-center">
                <mat-icon class="w-4 h-4 mr-1">access_time</mat-icon>
                Active operations
              </span>
            </p>
          </div>
          <mat-icon class="text-orange-500 text-4xl">hourglass_top</mat-icon>
        </div>
      </mat-card>

      <!-- Average Completion Time Card -->
      <mat-card class="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-purple-600 text-sm font-medium">Avg Completion</p>
            <p class="text-3xl font-bold text-purple-900">{{ getAvgCompletionDisplay() }}</p>
            <p class="text-xs text-purple-600 mt-1">
              <span class="inline-flex items-center">
                <mat-icon class="w-4 h-4 mr-1">schedule</mat-icon>
                Performance metric
              </span>
            </p>
          </div>
          <mat-icon class="text-purple-500 text-4xl">timer</mat-icon>
        </div>
      </mat-card>
    </div>

    <!-- Weekly/Monthly Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <mat-card class="p-4">
        <div class="text-center">
          <mat-icon class="text-gray-500 mb-2">view_week</mat-icon>
          <p class="text-sm text-gray-600">This Week</p>
          <p class="text-2xl font-bold text-gray-800">{{ metrics?.weeklyPickups || 0 }}</p>
        </div>
      </mat-card>

      <mat-card class="p-4">
        <div class="text-center">
          <mat-icon class="text-gray-500 mb-2">calendar_month</mat-icon>
          <p class="text-sm text-gray-600">This Month</p>
          <p class="text-2xl font-bold text-gray-800">{{ metrics?.monthlyPickups || 0 }}</p>
        </div>
      </mat-card>

      <mat-card class="p-4">
        <div class="text-center">
          <mat-icon class="text-gray-500 mb-2">cancel</mat-icon>
          <p class="text-sm text-gray-600">Cancelled</p>
          <p class="text-2xl font-bold text-gray-800">{{ metrics?.cancelledPickups || 0 }}</p>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    mat-card {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      border-radius: 12px;
      transition: all 0.3s ease;
    }

    mat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }

    mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .text-4xl mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }
  `]
})
export class AnalyticsOverviewComponent implements OnInit, OnDestroy {
  @Input() metrics: OverviewMetrics | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(private analyticsService: PickupAnalyticsService) {}

  ngOnInit(): void {
    console.log('AnalyticsOverview: Initializing with metrics:', this.metrics);
    
    if (!this.metrics) {
      this.analyticsService.overview$
        .pipe(takeUntil(this.destroy$))
        .subscribe(metrics => {
          console.log('AnalyticsOverview: Received metrics update:', metrics);
          this.metrics = metrics;
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getCompletionRateDisplay(): string {
    if (!this.metrics) return '0';
    return Math.round(this.metrics.completionRate).toString();
  }

  getAvgCompletionDisplay(): string {
    if (!this.metrics || this.metrics.avgCompletionTime === 0) return '0h';
    
    const hours = this.metrics.avgCompletionTime;
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    } else if (hours < 24) {
      const h = Math.floor(hours);
      const m = Math.round((hours - h) * 60);
      return m > 0 ? `${h}h ${m}m` : `${h}h`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = Math.round(hours % 24);
      return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    }
  }
}
