// Analytics interfaces for pickup analytics dashboard
import { PickupRecord } from './pickup.interface';

export interface OverviewMetrics {
  totalPickups: number;
  completedPickups: number;
  inProgressPickups: number;
  cancelledPickups: number;
  completionRate: number;
  avgCompletionTime: number; // in hours
  todayPickups: number;
  weeklyPickups: number;
  monthlyPickups: number;
}

export interface TrendDataPoint {
  timestamp: number;
  date: string;
  value: number;
  label?: string;
}

export interface StaffPerformance {
  staffId: string;
  staffName: string;
  totalPickups: number;
  completedPickups: number;
  avgCompletionTime: number;
  completionRate: number;
  efficiency: number; // pickups per day
}

export interface HeatmapItem {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  hour: number; // 0-23
  value: number; // pickup count
  label: string; // e.g., "Monday 9AM"
}

export interface AnalyticsFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  staffIds?: string[];
  statuses?: string[];
  pickupTypes?: string[];
}

export interface AggregatedData {
  overview: OverviewMetrics;
  trends: TrendDataPoint[];
  staffPerformance: StaffPerformance[];
  heatmap: HeatmapItem[];
  lastUpdated: Date;
}

export interface CacheMetadata {
  lastSyncedAt: Date;
  recordCount: number;
  dataVersion: number;
}

// WebWorker message types
export interface WorkerMessage {
  type: 'AGGREGATE_DATA' | 'GET_TRENDS' | 'GET_STAFF_PERFORMANCE' | 'GET_HEATMAP';
  payload: any;
  requestId: string;
}

export interface WorkerResponse {
  type: 'AGGREGATION_COMPLETE' | 'TRENDS_COMPLETE' | 'STAFF_PERFORMANCE_COMPLETE' | 'HEATMAP_COMPLETE' | 'ERROR';
  payload: any;
  requestId: string;
  error?: string;
}

// Chart data interfaces for ngx-charts
export interface ChartDataPoint {
  name: string;
  value: number;
  extra?: any;
}

export interface ChartSeries {
  name: string;
  series: ChartDataPoint[];
}

export interface LineChartData {
  name: string;
  series: Array<{
    name: string;
    value: number;
  }>;
}
