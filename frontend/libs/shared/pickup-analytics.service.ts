import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, from, of, combineLatest } from 'rxjs';
import { map, switchMap, shareReplay, catchError } from 'rxjs/operators';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { PickupRecord } from './pickup.interface';
import { PickupService } from './pickup.service';
import { 
  OverviewMetrics, 
  TrendDataPoint, 
  StaffPerformance, 
  HeatmapItem, 
  AnalyticsFilters,
  AggregatedData,
  CacheMetadata,
  WorkerMessage,
  WorkerResponse
} from './pickup-analytics.interface';

interface AnalyticsDB extends DBSchema {
  pickups: {
    key: string;
    value: PickupRecord;
    indexes: { 
      'by-date': string; 
      'by-staff': string; 
      'by-status': string;
    };
  };
  metadata: {
    key: string;
    value: CacheMetadata;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PickupAnalyticsService {
  private db: IDBPDatabase<AnalyticsDB> | null = null;
  private worker: Worker | null = null;
  private isInitialized = false;

  // Observables for reactive data
  private overviewSubject = new BehaviorSubject<OverviewMetrics | null>(null);
  private trendsSubject = new BehaviorSubject<TrendDataPoint[]>([]);
  private staffPerformanceSubject = new BehaviorSubject<StaffPerformance[]>([]);
  private heatmapSubject = new BehaviorSubject<HeatmapItem[]>([]);
  private filtersSubject = new BehaviorSubject<AnalyticsFilters>({});

  public overview$ = this.overviewSubject.asObservable();
  public trends$ = this.trendsSubject.asObservable();
  public staffPerformance$ = this.staffPerformanceSubject.asObservable();
  public heatmap$ = this.heatmapSubject.asObservable();
  public filters$ = this.filtersSubject.asObservable();

  constructor(private pickupService: PickupService) {
    this.initializeService();
  }

  private async initializeService(): Promise<void> {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
        console.log('Analytics service: Running in SSR mode, skipping IndexedDB initialization');
        this.isInitialized = false;
        // Still enable the service for fallback mode
        this.enableFallbackMode();
        return;
      }

      // Initialize IndexedDB
      this.db = await openDB<AnalyticsDB>('pickup-analytics', 1, {
        upgrade(db) {
          // Create pickups store with indices
          const pickupStore = db.createObjectStore('pickups', { keyPath: 'id' });
          pickupStore.createIndex('by-date', 'pickupDate');
          pickupStore.createIndex('by-staff', 'staffId');
          pickupStore.createIndex('by-status', 'status');

          // Create metadata store
          db.createObjectStore('metadata', { keyPath: 'key' });
        },
      });

      // Initialize WebWorker
      if (typeof Worker !== 'undefined') {
        this.worker = new Worker(new URL('./pickup-analytics.worker.ts', import.meta.url));
        this.setupWorkerMessageHandler();
      }

      this.isInitialized = true;
      
      // Load initial data
      await this.loadAndCachePickups();
      this.refreshAnalytics();
      
    } catch (error) {
      console.error('Failed to initialize analytics service:', error);
      this.isInitialized = false;
      
      // Try to load data anyway using fallback mode
      console.log('Analytics service: Attempting fallback initialization');
      this.refreshAnalytics();
    }
  }

  private setupWorkerMessageHandler(): void {
    if (!this.worker) return;

    this.worker.onmessage = ({ data }: { data: WorkerResponse }) => {
      switch (data.type) {
        case 'AGGREGATION_COMPLETE':
          this.overviewSubject.next(data.payload);
          break;
        case 'TRENDS_COMPLETE':
          this.trendsSubject.next(data.payload);
          break;
        case 'STAFF_PERFORMANCE_COMPLETE':
          this.staffPerformanceSubject.next(data.payload);
          break;
        case 'HEATMAP_COMPLETE':
          this.heatmapSubject.next(data.payload);
          break;
        case 'ERROR':
          console.error('Worker error:', data.error);
          break;
      }
    };
  }

  async loadAndCachePickups(): Promise<void> {
    if (!this.db) {
      if (!this.isInitialized) {
        console.log('Analytics service: Not initialized, skipping cache operation');
        return;
      }
      throw new Error('Database not initialized');
    }

    try {
      // Get pickup data from existing service
      const pickups = await this.getPickupsFromService();
      
      // Clear existing data and store new data
      const tx = this.db.transaction(['pickups', 'metadata'], 'readwrite');
      await tx.objectStore('pickups').clear();
      
      // Batch insert pickups
      for (const pickup of pickups) {
        await tx.objectStore('pickups').add(pickup);
      }

      // Update metadata
      const metadata = {
        key: 'sync-info',
        lastSyncedAt: new Date(),
        recordCount: pickups.length,
        dataVersion: 1
      };
      await tx.objectStore('metadata').put(metadata);
      
      await tx.done;
      console.log(`Cached ${pickups.length} pickup records`);
      
    } catch (error) {
      console.error('Failed to cache pickups:', error);
      throw error;
    }
  }

  private async getPickupsFromService(): Promise<PickupRecord[]> {
    // Try to get data from the pickup service
    // Since the service has demo data, we'll use that
    return new Promise((resolve) => {
      this.pickupService.getPickups().subscribe({
        next: (response: any) => {
          console.log('Analytics Service: Received pickup data:', response);
          const pickups = response.content || response.data || [];
          
          // If we have data from service, use it
          if (pickups.length > 0) {
            console.log('Analytics Service: Using data from pickup service:', pickups.length, 'records');
            resolve(pickups);
          } else {
            console.log('Analytics Service: No data from service, generating fallback demo data');
            resolve(this.generateFallbackDemoData());
          }
        },
        error: (error) => {
          console.error('Analytics Service: Failed to load pickup data:', error);
          // Generate fallback demo data if service fails
          console.log('Analytics Service: Service failed, generating fallback demo data');
          resolve(this.generateFallbackDemoData());
        }
      });
    });
  }

  private generateFallbackDemoData(): PickupRecord[] {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    
    return [
      {
        id: 'analytics_demo_1',
        pickupId: 'PU000001',
        clientName: 'TechCorp Industries',
        clientCompany: 'TechCorp Industries Pvt Ltd',
        clientId: 'client_1',
        pickupAddress: 'Plot 123, Tech Park, Bangalore 560001',
        contactNumber: '+91 9876543210',
        itemCount: 3,
        totalWeight: 15.5,
        itemDescription: 'Electronic components, laptops',
        specialInstructions: 'Handle with care - fragile items',
        pickupType: 'vendor',
        carrierName: 'FleetOps Express',
        carrierId: 'carrier_1',
        assignedStaff: 'Rajesh Kumar',
        staffId: 'EMP001',
        staffDepartment: 'Operations',
        pickupDate: yesterday,
        pickupTime: '2:30 PM',
        estimatedDuration: 45,
        status: 'completed',
        statusUpdatedAt: yesterday,
        statusUpdatedBy: 'Rajesh Kumar',
        estimatedCost: 250,
        actualCost: 250,
        createdAt: yesterday,
        updatedAt: yesterday,
        createdBy: 'Analytics Demo',
        notes: 'Pickup completed successfully',
        customerFeedback: 'Excellent service',
        rating: 5
      },
      {
        id: 'analytics_demo_2',
        pickupId: 'PU000002',
        clientName: 'Fashion Hub',
        clientCompany: 'Fashion Hub Retail',
        clientId: 'client_2',
        pickupAddress: 'Shop 45, Commercial Street, Mumbai 400001',
        contactNumber: '+91 9876543211',
        itemCount: 8,
        totalWeight: 32.0,
        itemDescription: 'Clothing items, accessories',
        specialInstructions: 'Multiple packages - count carefully',
        pickupType: 'direct',
        carrierName: 'Standard Delivery',
        carrierId: 'carrier_2',
        assignedStaff: 'Priya Sharma',
        staffId: 'EMP002',
        staffDepartment: 'Logistics',
        pickupDate: now,
        pickupTime: '11:00 AM',
        estimatedDuration: 30,
        status: 'in-progress',
        statusUpdatedAt: now,
        statusUpdatedBy: 'Priya Sharma',
        estimatedCost: 180,
        actualCost: 0,
        createdAt: now,
        updatedAt: now,
        createdBy: 'Analytics Demo',
        notes: 'Pickup in progress'
      },
      {
        id: 'analytics_demo_3',
        pickupId: 'PU000003',
        clientName: 'MedSupply Co',
        clientCompany: 'MedSupply Corporation',
        clientId: 'client_3',
        pickupAddress: 'Building A1, Medical District, Delhi 110001',
        contactNumber: '+91 9876543212',
        itemCount: 5,
        totalWeight: 8.2,
        itemDescription: 'Medical supplies, equipment',
        specialInstructions: 'Temperature sensitive - keep cool',
        pickupType: 'vendor',
        carrierName: 'Priority Express',
        carrierId: 'carrier_3',
        assignedStaff: 'Amit Patel',
        staffId: 'EMP003',
        staffDepartment: 'Special Handling',
        pickupDate: now,
        pickupTime: '3:00 PM',
        estimatedDuration: 60,
        status: 'scheduled',
        statusUpdatedAt: now,
        statusUpdatedBy: 'System',
        estimatedCost: 320,
        actualCost: 0,
        createdAt: now,
        updatedAt: now,
        createdBy: 'Analytics Demo',
        notes: 'Scheduled for today afternoon'
      },
      {
        id: 'analytics_demo_4',
        pickupId: 'PU000004',
        clientName: 'AutoParts Ltd',
        clientCompany: 'AutoParts Limited',
        clientId: 'client_4',
        pickupAddress: 'Industrial Area, Pune 411001',
        contactNumber: '+91 9876543213',
        itemCount: 12,
        totalWeight: 45.0,
        itemDescription: 'Automotive parts, tools',
        specialInstructions: 'Heavy items - use proper equipment',
        pickupType: 'vendor',
        carrierName: 'Heavy Duty Transport',
        carrierId: 'carrier_4',
        assignedStaff: 'Suresh Reddy',
        staffId: 'EMP004',
        staffDepartment: 'Heavy Handling',
        pickupDate: twoDaysAgo,
        pickupTime: '10:00 AM',
        estimatedDuration: 90,
        status: 'completed',
        statusUpdatedAt: twoDaysAgo,
        statusUpdatedBy: 'Suresh Reddy',
        estimatedCost: 450,
        actualCost: 450,
        createdAt: twoDaysAgo,
        updatedAt: twoDaysAgo,
        createdBy: 'Analytics Demo',
        notes: 'Heavy duty pickup completed'
      },
      {
        id: 'analytics_demo_5',
        pickupId: 'PU000005',
        clientName: 'FreshMart Groceries',
        clientCompany: 'FreshMart Chain',
        clientId: 'client_5',
        pickupAddress: 'Market Square, Chennai 600001',
        contactNumber: '+91 9876543214',
        itemCount: 20,
        totalWeight: 75.0,
        itemDescription: 'Grocery items, perishables',
        specialInstructions: 'Keep refrigerated items cold',
        pickupType: 'direct',
        carrierName: 'Cold Chain Logistics',
        carrierId: 'carrier_5',
        assignedStaff: 'Lakshmi Naidu',
        staffId: 'EMP005',
        staffDepartment: 'Cold Chain',
        pickupDate: yesterday,
        pickupTime: '8:00 AM',
        estimatedDuration: 45,
        status: 'completed',
        statusUpdatedAt: yesterday,
        statusUpdatedBy: 'Lakshmi Naidu',
        estimatedCost: 200,
        actualCost: 200,
        createdAt: yesterday,
        updatedAt: yesterday,
        createdBy: 'Analytics Demo',
        notes: 'Early morning pickup completed'
      }
    ];
  }

  private async getCachedPickups(): Promise<PickupRecord[]> {
    if (!this.db) return [];
    
    try {
      return await this.db.getAll('pickups');
    } catch (error) {
      console.error('Failed to get cached pickups:', error);
      return [];
    }
  }

  getCurrentOverviewMetrics(): OverviewMetrics | null {
    return this.overviewSubject.value;
  }

  private enableFallbackMode(): void {
    console.log('Analytics service: Enabling fallback mode for SSR environment');
    // Force the service to work without IndexedDB/WebWorker
    this.isInitialized = false;
  }

  async forceClientInitialization(): Promise<void> {
    if (typeof window !== 'undefined' && !this.isInitialized) {
      console.log('Analytics service: Force client-side initialization');
      await this.initializeService();
    }
  }

  async refreshAnalytics(filters?: AnalyticsFilters): Promise<void> {
    const currentFilters = filters || this.filtersSubject.value;

    // If IndexedDB/Worker is available, use it
    if (this.worker && this.isInitialized) {
      const pickups = await this.getCachedPickups();
      this.sendWorkerMessage('AGGREGATE_DATA', { pickups, filters: currentFilters });
      this.sendWorkerMessage('GET_TRENDS', { 
        pickups, 
        metric: 'total', 
        interval: 'day', 
        filters: currentFilters 
      });
      this.sendWorkerMessage('GET_STAFF_PERFORMANCE', { pickups, filters: currentFilters });
      this.sendWorkerMessage('GET_HEATMAP', { pickups, filters: currentFilters });
    } else {
      // Fallback: do analytics calculations directly in main thread
      console.log('Analytics Service: Using fallback mode (no WebWorker)');
      const pickups = await this.getPickupsFromService();
      this.calculateAnalyticsDirectly(pickups, currentFilters);
    }
  }

  private calculateAnalyticsDirectly(pickups: PickupRecord[], filters?: AnalyticsFilters): void {
    // Simple analytics calculation without WebWorker
    const filteredPickups = this.applyFiltersSync(pickups, filters);
    
    // Calculate overview metrics
    const completedPickups = filteredPickups.filter(p => p.status === 'completed');
    const inProgressPickups = filteredPickups.filter(p => p.status === 'in-progress');
    const cancelledPickups = filteredPickups.filter(p => p.status === 'cancelled');
    
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const overview: OverviewMetrics = {
      totalPickups: filteredPickups.length,
      completedPickups: completedPickups.length,
      inProgressPickups: inProgressPickups.length,
      cancelledPickups: cancelledPickups.length,
      completionRate: filteredPickups.length > 0 ? (completedPickups.length / filteredPickups.length) * 100 : 0,
      avgCompletionTime: 2.5, // Placeholder
      todayPickups: filteredPickups.filter(p => new Date(p.pickupDate) >= todayStart).length,
      weeklyPickups: filteredPickups.filter(p => new Date(p.pickupDate) >= weekStart).length,
      monthlyPickups: filteredPickups.filter(p => new Date(p.pickupDate) >= monthStart).length
    };

    // Update observables
    this.overviewSubject.next(overview);
    
    // Simple trends (last 7 days)
    const trends: TrendDataPoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const dayPickups = filteredPickups.filter(p => {
        const pickupDate = new Date(p.pickupDate);
        return pickupDate >= dayStart && pickupDate < dayEnd;
      });
      
      trends.push({
        timestamp: dayStart.getTime(),
        date: dayStart.toISOString().split('T')[0],
        value: dayPickups.length
      });
    }
    this.trendsSubject.next(trends);

    console.log('Analytics Service: Direct calculation complete', { overview, trends });
  }

  private sendWorkerMessage(type: string, payload: any): void {
    if (!this.worker) return;

    const message: WorkerMessage = {
      type: type as any,
      payload,
      requestId: crypto.randomUUID()
    };

    this.worker.postMessage(message);
  }

  // Public API methods
  getOverview(filters?: AnalyticsFilters): Observable<OverviewMetrics | null> {
    if (filters) {
      this.filtersSubject.next(filters);
      this.refreshAnalytics(filters);
    }
    return this.overview$;
  }

  getTrends(
    metric: 'total' | 'completed' = 'total', 
    interval: 'day' | 'hour' = 'day',
    filters?: AnalyticsFilters
  ): Observable<TrendDataPoint[]> {
    if (this.worker && this.isInitialized) {
      const pickups$ = from(this.getCachedPickups());
      return pickups$.pipe(
        switchMap(pickups => {
          return new Observable<TrendDataPoint[]>(observer => {
            const requestId = crypto.randomUUID();
            
            const messageHandler = (event: MessageEvent<WorkerResponse>) => {
              if (event.data.requestId === requestId && event.data.type === 'TRENDS_COMPLETE') {
                observer.next(event.data.payload);
                observer.complete();
                this.worker!.removeEventListener('message', messageHandler);
              }
            };

            this.worker!.addEventListener('message', messageHandler);
            this.sendWorkerMessage('GET_TRENDS', { pickups, metric, interval, filters });
          });
        })
      );
    }
    return of([]);
  }

  getStaffPerformance(filters?: AnalyticsFilters): Observable<StaffPerformance[]> {
    if (filters) {
      this.filtersSubject.next(filters);
      this.refreshAnalytics(filters);
    }
    return this.staffPerformance$;
  }

  getHeatmap(filters?: AnalyticsFilters): Observable<HeatmapItem[]> {
    if (filters) {
      this.filtersSubject.next(filters);
      this.refreshAnalytics(filters);
    }
    return this.heatmap$;
  }

  updateFilters(filters: AnalyticsFilters): void {
    this.filtersSubject.next(filters);
    this.refreshAnalytics(filters);
  }

  async exportCsv(filters?: AnalyticsFilters): Promise<Blob> {
    const pickups = await this.getCachedPickups();
    const filteredPickups = this.applyFiltersSync(pickups, filters);

    const headers = [
      'Pickup ID', 'Client Name', 'Staff', 'Status', 'Pickup Date', 
      'Created At', 'Item Count', 'Total Weight', 'Estimated Cost'
    ];

    const rows = filteredPickups.map(pickup => [
      pickup.pickupId,
      pickup.clientName,
      pickup.assignedStaff,
      pickup.status,
      new Date(pickup.pickupDate).toLocaleDateString(),
      new Date(pickup.createdAt).toLocaleDateString(),
      pickup.itemCount.toString(),
      pickup.totalWeight.toString(),
      (pickup.estimatedCost || 0).toString()
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  async exportJson(filters?: AnalyticsFilters): Promise<Blob> {
    const pickups = await this.getCachedPickups();
    const filteredPickups = this.applyFiltersSync(pickups, filters);

    const exportData = {
      exportedAt: new Date().toISOString(),
      totalRecords: filteredPickups.length,
      filters: filters || {},
      data: filteredPickups
    };

    return new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json;charset=utf-8;' 
    });
  }

  private applyFiltersSync(pickups: PickupRecord[], filters?: AnalyticsFilters): PickupRecord[] {
    if (!filters) return pickups;

    return pickups.filter(pickup => {
      if (filters.dateRange) {
        const pickupDate = new Date(pickup.pickupDate);
        if (pickupDate < filters.dateRange.start || pickupDate > filters.dateRange.end) {
          return false;
        }
      }

      if (filters.staffIds && filters.staffIds.length > 0) {
        if (!filters.staffIds.includes(pickup.staffId)) return false;
      }

      if (filters.statuses && filters.statuses.length > 0) {
        if (!filters.statuses.includes(pickup.status)) return false;
      }

      if (filters.pickupTypes && filters.pickupTypes.length > 0) {
        if (!filters.pickupTypes.includes(pickup.pickupType)) return false;
      }

      return true;
    });
  }

  async getCacheMetadata(): Promise<CacheMetadata | null> {
    if (!this.db) return null;
    
    try {
      const metadata = await this.db.get('metadata', 'sync-info');
      return metadata || null;
    } catch (error) {
      console.error('Failed to get cache metadata:', error);
      return null;
    }
  }

  ngOnDestroy(): void {
    if (this.worker) {
      this.worker.terminate();
    }
    if (this.db) {
      this.db.close();
    }
  }
}
