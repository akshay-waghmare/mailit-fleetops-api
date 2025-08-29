import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { Subject, takeUntil } from 'rxjs';
import { PickupAnalyticsService, TrendDataPoint, LineChartData } from '../../../../../libs/shared';

@Component({
  selector: 'app-trend-chart',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonToggleModule, NgxChartsModule],
  template: `
    <mat-card class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-semibold text-gray-800">Pickup Trends</h3>
        <mat-button-toggle-group [(value)]="selectedMetric" (change)="onMetricChange($event)">
          <mat-button-toggle value="total">Total</mat-button-toggle>
          <mat-button-toggle value="completed">Completed</mat-button-toggle>
        </mat-button-toggle-group>
      </div>

      <div class="h-80" *ngIf="chartData && chartData.length > 0; else noData">
        <ngx-charts-line-chart
          [results]="chartData"
          [view]="view"
          [scheme]="colorScheme"
          [legend]="false"
          [showXAxisLabel]="true"
          [showYAxisLabel]="true"
          [xAxis]="true"
          [yAxis]="true"
          [xAxisLabel]="'Date'"
          [yAxisLabel]="'Number of Pickups'"
          [autoScale]="true"
          [showGridLines]="true"
          [animations]="true">
        </ngx-charts-line-chart>
      </div>

      <ng-template #noData>
        <div class="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
          <div class="text-center">
            <div class="text-gray-400 mb-2">📊</div>
            <p class="text-gray-500">No trend data available</p>
            <p class="text-sm text-gray-400">Data will appear once pickups are processed</p>
          </div>
        </div>
      </ng-template>
    </mat-card>
  `,
  styles: [`
    mat-card {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border-radius: 12px;
    }

    mat-button-toggle-group {
      border-radius: 8px;
    }

    mat-button-toggle {
      border-radius: 6px !important;
    }

    .chart-container {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border-radius: 8px;
    }
  `]
})
export class TrendChartComponent implements OnInit, OnDestroy {
  @Input() trends: TrendDataPoint[] = [];
  
  selectedMetric: 'total' | 'completed' = 'total';
  chartData: LineChartData[] = [];
  view: [number, number] = [700, 300];
  
  // Chart styling
  colorScheme: any = {
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5']
  };
  
  private destroy$ = new Subject<void>();

  constructor(private analyticsService: PickupAnalyticsService) {}

  ngOnInit(): void {
    // Subscribe to trends updates first
    this.analyticsService.trends$
      .pipe(takeUntil(this.destroy$))
      .subscribe((trends: TrendDataPoint[]) => {
        console.log('TrendChart: Received trends data:', trends);
        this.trends = trends;
        this.processChartData();
      });

    // Load initial trends if we're in browser environment
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        if (this.trends.length === 0) {
          this.loadTrendData();
        } else {
          this.processChartData();
        }
      }, 300);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onMetricChange(event: any): void {
    this.selectedMetric = event.value;
    this.loadTrendData();
  }

  private loadTrendData(): void {
    this.analyticsService.getTrends(this.selectedMetric, 'day')
      .pipe(takeUntil(this.destroy$))
      .subscribe((trends: TrendDataPoint[]) => {
        this.trends = trends;
        this.processChartData();
      });
  }

  private processChartData(): void {
    if (!this.trends || this.trends.length === 0) {
      this.chartData = [];
      return;
    }

    // Sort trends by timestamp
    const sortedTrends = [...this.trends].sort((a, b) => a.timestamp - b.timestamp);

    // Convert to chart format
    const series = sortedTrends.map(trend => ({
      name: this.formatDate(trend.timestamp),
      value: trend.value
    }));

    this.chartData = [{
      name: this.selectedMetric === 'total' ? 'Total Pickups' : 'Completed Pickups',
      series: series
    }];
  }

  private formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) {
      // Show day name for recent dates
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } else if (diffDays <= 30) {
      // Show month/day for dates within a month
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      // Show month/day/year for older dates
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
    }
  }
}
