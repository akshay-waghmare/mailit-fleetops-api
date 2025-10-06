import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';
import { PickupAnalyticsService, OverviewMetrics } from '../../../../../libs/shared';
import { AnalyticsOverviewComponent } from '../components/analytics-overview.component';
import { TrendChartComponent } from '../components/trend-chart.component';

@Component({
  selector: 'app-pickup-analytics',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatProgressSpinnerModule,
    AnalyticsOverviewComponent,
    TrendChartComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Pickup Analytics</h1>
            <p class="text-gray-600 mt-2">Real-time insights into pickup operations and performance</p>
          </div>
          
          <div class="flex items-center space-x-4">
            <button 
              mat-raised-button 
              color="primary" 
              (click)="refreshData()"
              [disabled]="isLoading">
              <mat-icon>refresh</mat-icon>
              Refresh
            </button>
            
            <button 
              mat-stroked-button 
              (click)="exportData()"
              [disabled]="isLoading">
              <mat-icon>download</mat-icon>
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="flex justify-center items-center py-12">
        <mat-spinner diameter="40"></mat-spinner>
        <span class="ml-4 text-gray-600">Loading analytics data...</span>
      </div>

      <!-- Analytics Content -->
      <div *ngIf="!isLoading">
        <!-- KPI Overview Cards -->
        <app-analytics-overview [metrics]="overviewMetrics"></app-analytics-overview>

        <!-- Trend Chart -->
        <app-trend-chart></app-trend-chart>

        <!-- Additional Info Cards -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <!-- Quick Stats -->
          <mat-card class="p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Active Staff Members</span>
                <span class="font-semibold">{{ getActiveStaffCount() }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Average Daily Volume</span>
                <span class="font-semibold">{{ getDailyAverage() }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Peak Hour</span>
                <span class="font-semibold">{{ getPeakHour() }}</span>
              </div>
            </div>
          </mat-card>

          <!-- System Status -->
          <mat-card class="p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">System Status</h3>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Cache Status</span>
                <span class="font-semibold text-green-600">{{ cacheStatus }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Last Updated</span>
                <span class="font-semibold">{{ getLastUpdateTime() }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Data Version</span>
                <span class="font-semibold">{{ dataVersion }}</span>
              </div>
            </div>
          </mat-card>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="text-center py-12">
        <mat-icon class="text-red-500 text-6xl">error_outline</mat-icon>
        <h3 class="text-xl font-semibold text-gray-800 mt-4">Failed to Load Analytics</h3>
        <p class="text-gray-600 mt-2">{{ error }}</p>
        <button mat-raised-button color="primary" (click)="refreshData()" class="mt-4">
          Try Again
        </button>
      </div>
    </div>
  `,
  styles: [`
    .min-h-screen {
      min-height: calc(100vh - 64px); /* Account for navbar */
    }

    mat-card {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      border-radius: 12px;
      transition: all 0.3s ease;
    }

    mat-card:hover {
      box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }

    .text-6xl mat-icon {
      font-size: 72px;
      width: 72px;
      height: 72px;
    }
  `]
})
export class PickupAnalyticsComponent implements OnInit, OnDestroy {
  overviewMetrics: OverviewMetrics | null = null;
  isLoading = true;
  error: string | null = null;
  cacheStatus = 'Active';
  dataVersion = 'v1.0';
  
  private destroy$ = new Subject<void>();

  constructor(private analyticsService: PickupAnalyticsService) {}

  async ngOnInit(): Promise<void> {
    try {
      // Subscribe to overview metrics
      this.analyticsService.overview$
        .pipe(takeUntil(this.destroy$))
        .subscribe(metrics => {
          console.log('PickupAnalytics: Received overview metrics:', metrics);
          this.overviewMetrics = metrics;
          if (metrics) {
            this.isLoading = false; // Turn off loading when we get data
          }
        });

      // Check if we already have metrics (in case they were emitted before subscription)
      const currentMetrics = this.analyticsService.getCurrentOverviewMetrics();
      if (currentMetrics) {
        console.log('PickupAnalytics: Found existing metrics:', currentMetrics);
        this.overviewMetrics = currentMetrics;
        this.isLoading = false;
      }

      // Force client-side initialization if we're in browser
      if (typeof window !== 'undefined') {
        // Add a small delay to ensure the component is fully initialized
        setTimeout(async () => {
          await this.analyticsService.forceClientInitialization();
          await this.loadInitialData();
        }, 100);
      } else {
        // Load initial data immediately for SSR
        await this.loadInitialData();
      }
      
    } catch (error) {
      this.handleError(error);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadInitialData(): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;
      
      console.log('Loading analytics data...');
      
      // Load and cache pickup data (this will also trigger analytics calculation)
      await this.analyticsService.loadAndCachePickups();
      
      // Refresh analytics calculations
      await this.analyticsService.refreshAnalytics();
      
      // Update cache metadata
      const metadata = await this.analyticsService.getCacheMetadata();
      if (metadata) {
        this.cacheStatus = 'Active';
        this.dataVersion = `v${metadata.dataVersion}`;
      } else {
        this.cacheStatus = 'Fallback Mode';
        this.dataVersion = 'v1.0';
      }
      
      console.log('Analytics data loaded successfully');
      
      // Ensure loading is turned off even if metrics didn't emit
      if (this.isLoading) {
        setTimeout(() => {
          this.isLoading = false;
        }, 100);
      }
      
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      this.handleError(error);
    } finally {
      this.isLoading = false;
    }
  }

  async refreshData(): Promise<void> {
    await this.loadInitialData();
  }

  async exportData(): Promise<void> {
    try {
      const blob = await this.analyticsService.exportCsv();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pickup-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }

  getActiveStaffCount(): number {
    // This would be calculated from staff performance data
    return 12; // Placeholder
  }

  getDailyAverage(): string {
    if (!this.overviewMetrics) return '0';
    const weeklyAvg = this.overviewMetrics.weeklyPickups / 7;
    return Math.round(weeklyAvg).toString();
  }

  getPeakHour(): string {
    // This would be calculated from heatmap data
    return '10:00 AM'; // Placeholder
  }

  getLastUpdateTime(): string {
    return new Date().toLocaleTimeString();
  }

  private handleError(error: any): void {
    console.error('Analytics error:', error);
    this.error = error instanceof Error ? error.message : 'An unexpected error occurred';
    this.isLoading = false;
  }
}
