/// <reference lib="webworker" />

import { PickupRecord } from './pickup.interface';
import { 
  WorkerMessage, 
  WorkerResponse, 
  OverviewMetrics, 
  TrendDataPoint, 
  StaffPerformance, 
  HeatmapItem,
  AnalyticsFilters 
} from './pickup-analytics.interface';

// WebWorker for pickup data aggregation
self.addEventListener('message', ({ data }: { data: WorkerMessage }) => {
  try {
    const response = processMessage(data);
    self.postMessage(response);
  } catch (error) {
    const errorResponse: WorkerResponse = {
      type: 'ERROR',
      payload: null,
      requestId: data.requestId,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    self.postMessage(errorResponse);
  }
});

function processMessage(message: WorkerMessage): WorkerResponse {
  const { type, payload, requestId } = message;

  switch (type) {
    case 'AGGREGATE_DATA':
      return {
        type: 'AGGREGATION_COMPLETE',
        payload: aggregatePickupData(payload.pickups, payload.filters),
        requestId
      };

    case 'GET_TRENDS':
      return {
        type: 'TRENDS_COMPLETE',
        payload: calculateTrends(payload.pickups, payload.metric, payload.interval, payload.filters),
        requestId
      };

    case 'GET_STAFF_PERFORMANCE':
      return {
        type: 'STAFF_PERFORMANCE_COMPLETE',
        payload: calculateStaffPerformance(payload.pickups, payload.filters),
        requestId
      };

    case 'GET_HEATMAP':
      return {
        type: 'HEATMAP_COMPLETE',
        payload: calculateHeatmap(payload.pickups, payload.filters),
        requestId
      };

    default:
      throw new Error(`Unknown message type: ${type}`);
  }
}

function aggregatePickupData(pickups: PickupRecord[], filters?: AnalyticsFilters): OverviewMetrics {
  const filteredPickups = applyFilters(pickups, filters);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const completedPickups = filteredPickups.filter(p => p.status === 'completed');
  const inProgressPickups = filteredPickups.filter(p => p.status === 'in-progress');
  const cancelledPickups = filteredPickups.filter(p => p.status === 'cancelled');

  // Calculate completion times for completed pickups
  const completionTimes = completedPickups
    .filter(p => p.statusUpdatedAt && p.createdAt)
    .map(p => {
      const created = new Date(p.createdAt!).getTime();
      const completed = new Date(p.statusUpdatedAt!).getTime();
      return (completed - created) / (1000 * 60 * 60); // hours
    });

  const avgCompletionTime = completionTimes.length > 0 
    ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length 
    : 0;

  return {
    totalPickups: filteredPickups.length,
    completedPickups: completedPickups.length,
    inProgressPickups: inProgressPickups.length,
    cancelledPickups: cancelledPickups.length,
    completionRate: filteredPickups.length > 0 ? (completedPickups.length / filteredPickups.length) * 100 : 0,
    avgCompletionTime: Math.round(avgCompletionTime * 100) / 100,
    todayPickups: filteredPickups.filter(p => new Date(p.pickupDate) >= todayStart).length,
    weeklyPickups: filteredPickups.filter(p => new Date(p.pickupDate) >= weekStart).length,
    monthlyPickups: filteredPickups.filter(p => new Date(p.pickupDate) >= monthStart).length
  };
}

function calculateTrends(
  pickups: PickupRecord[], 
  metric: 'total' | 'completed', 
  interval: 'day' | 'hour',
  filters?: AnalyticsFilters
): TrendDataPoint[] {
  const filteredPickups = applyFilters(pickups, filters);
  const dataMap = new Map<string, number>();

  filteredPickups.forEach(pickup => {
    if (metric === 'completed' && pickup.status !== 'completed') return;

    const date = new Date(pickup.pickupDate);
    let key: string;
    let timestamp: number;

    if (interval === 'day') {
      key = date.toISOString().split('T')[0]; // YYYY-MM-DD
      timestamp = new Date(key).getTime();
    } else {
      key = `${date.toISOString().split('T')[0]}T${date.getHours().toString().padStart(2, '0')}:00:00`;
      timestamp = new Date(key).getTime();
    }

    dataMap.set(key, (dataMap.get(key) || 0) + 1);
  });

  return Array.from(dataMap.entries())
    .map(([date, value]) => ({
      timestamp: new Date(date).getTime(),
      date,
      value
    }))
    .sort((a, b) => a.timestamp - b.timestamp);
}

function calculateStaffPerformance(pickups: PickupRecord[], filters?: AnalyticsFilters): StaffPerformance[] {
  const filteredPickups = applyFilters(pickups, filters);
  const staffMap = new Map<string, { 
    pickups: PickupRecord[], 
    staffName: string 
  }>();

  // Group pickups by staff
  filteredPickups.forEach(pickup => {
    const staffId = pickup.staffId;
    const staffName = pickup.assignedStaff;
    
    if (!staffMap.has(staffId)) {
      staffMap.set(staffId, { pickups: [], staffName });
    }
    staffMap.get(staffId)!.pickups.push(pickup);
  });

  return Array.from(staffMap.entries()).map(([staffId, { pickups: staffPickups, staffName }]) => {
    const completedPickups = staffPickups.filter(p => p.status === 'completed');
    
    // Calculate completion times
    const completionTimes = completedPickups
      .filter(p => p.statusUpdatedAt && p.createdAt)
      .map(p => {
        const created = new Date(p.createdAt!).getTime();
        const completed = new Date(p.statusUpdatedAt!).getTime();
        return (completed - created) / (1000 * 60 * 60); // hours
      });

    const avgCompletionTime = completionTimes.length > 0 
      ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length 
      : 0;

    // Calculate efficiency (pickups per day)
    const dateRange = getDateRange(staffPickups);
    const daysCovered = dateRange > 0 ? dateRange : 1;
    const efficiency = staffPickups.length / daysCovered;

    return {
      staffId,
      staffName,
      totalPickups: staffPickups.length,
      completedPickups: completedPickups.length,
      avgCompletionTime: Math.round(avgCompletionTime * 100) / 100,
      completionRate: staffPickups.length > 0 ? (completedPickups.length / staffPickups.length) * 100 : 0,
      efficiency: Math.round(efficiency * 100) / 100
    };
  }).sort((a, b) => b.totalPickups - a.totalPickups);
}

function calculateHeatmap(pickups: PickupRecord[], filters?: AnalyticsFilters): HeatmapItem[] {
  const filteredPickups = applyFilters(pickups, filters);
  const heatmapData = new Map<string, number>();

  filteredPickups.forEach(pickup => {
    const date = new Date(pickup.pickupDate);
    const dayOfWeek = date.getDay(); // 0-6 (Sunday-Saturday)
    const hour = date.getHours(); // 0-23
    const key = `${dayOfWeek}-${hour}`;
    
    heatmapData.set(key, (heatmapData.get(key) || 0) + 1);
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const result: HeatmapItem[] = [];

  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const key = `${day}-${hour}`;
      const value = heatmapData.get(key) || 0;
      const hourDisplay = hour === 0 ? '12AM' : hour < 12 ? `${hour}AM` : hour === 12 ? '12PM' : `${hour - 12}PM`;
      
      result.push({
        dayOfWeek: day,
        hour,
        value,
        label: `${dayNames[day]} ${hourDisplay}`
      });
    }
  }

  return result;
}

function applyFilters(pickups: PickupRecord[], filters?: AnalyticsFilters): PickupRecord[] {
  if (!filters) return pickups;

  return pickups.filter(pickup => {
    // Date range filter
    if (filters.dateRange) {
      const pickupDate = new Date(pickup.pickupDate);
      if (pickupDate < filters.dateRange.start || pickupDate > filters.dateRange.end) {
        return false;
      }
    }

    // Staff filter
    if (filters.staffIds && filters.staffIds.length > 0) {
      if (!filters.staffIds.includes(pickup.staffId)) {
        return false;
      }
    }

    // Status filter
    if (filters.statuses && filters.statuses.length > 0) {
      if (!filters.statuses.includes(pickup.status)) {
        return false;
      }
    }

    // Pickup type filter
    if (filters.pickupTypes && filters.pickupTypes.length > 0) {
      if (!filters.pickupTypes.includes(pickup.pickupType)) {
        return false;
      }
    }

    return true;
  });
}

function getDateRange(pickups: PickupRecord[]): number {
  if (pickups.length === 0) return 0;
  
  const dates = pickups.map(p => new Date(p.pickupDate).getTime());
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  
  return Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1; // days
}
