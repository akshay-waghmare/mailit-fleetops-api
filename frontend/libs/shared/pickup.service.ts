import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { PickupRecord, PickupQueryParams, PaginatedResponse, SchedulePickupData } from './pickup.interface';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class PickupService {
  private readonly baseUrl: string;
  
  // Demo data storage for frontend-only testing
  private demoPickups: PickupRecord[] = [];
  private pickupCounter = 1;
  
  // Subject for real-time updates
  private pickupsUpdatedSubject = new BehaviorSubject<PickupRecord[]>([]);
  public pickupsUpdated$ = this.pickupsUpdatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.baseUrl = this.configService.apiBaseUrl;
    this.initializeDemoData();
  }

  getPickupById(id: string): Observable<PickupRecord> {
    return this.http.get<PickupRecord>(`${this.baseUrl}/pickups/${id}`);
  }

  updatePickup(id: string, data: Partial<PickupRecord>): Observable<PickupRecord> {
    return this.http.put<PickupRecord>(`${this.baseUrl}/pickups/${id}`, data);
  }

  updatePickupStatus(id: string, status: string, notes?: string): Observable<PickupRecord> {
    return this.http.post<PickupRecord>(`${this.baseUrl}/pickups/${id}/status`, { status, notes });
  }

  cancelPickup(id: string, reason: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/pickups/${id}`, { params: new HttpParams().set('reason', reason) });
  }

  getAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/pickups/analytics`);
  }

  exportPickups(params: PickupQueryParams = {}): Observable<Blob> {
    let httpParams = new HttpParams();
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.status) httpParams = httpParams.set('status', params.status);
    // other params as needed
    return this.http.get(`${this.baseUrl}/pickups/export`, { params: httpParams, responseType: 'blob' });
  }

  // Frontend-only method for creating pickups with demo data
  createPickup(scheduleData: SchedulePickupData): Observable<PickupRecord> {
    const now = new Date();
    const pickupId = `PU${String(this.pickupCounter).padStart(6, '0')}`;
    
    const newPickup: PickupRecord = {
      id: `pickup_${Date.now()}_${this.pickupCounter}`,
      pickupId: pickupId,
      clientName: scheduleData.client.clientName,
      clientCompany: scheduleData.client.clientCompany || '',
      clientId: scheduleData.client.id,
      pickupAddress: scheduleData.client.address,
      contactNumber: scheduleData.client.contactNumber || '',
      itemCount: scheduleData.itemCount,
      totalWeight: scheduleData.totalWeight,
      itemDescription: scheduleData.itemDescription || '',
      specialInstructions: scheduleData.specialInstructions || '',
      pickupType: scheduleData.pickupType,
      carrierName: scheduleData.carrier?.name || '',
      carrierId: scheduleData.carrier?.id || '',
      assignedStaff: scheduleData.employee.name,
      staffId: scheduleData.employee.employeeId,
      staffDepartment: scheduleData.employee.department || 'Operations',
      pickupDate: scheduleData.pickupDate || now.toISOString().split('T')[0],
      pickupTime: scheduleData.pickupTime || '10:00 AM',
      estimatedDuration: 30,
      status: 'scheduled',
      statusUpdatedAt: now,
      statusUpdatedBy: 'System',
      estimatedCost: scheduleData.carrier?.price || 0,
      actualCost: 0,
      createdAt: now,
      updatedAt: now,
      createdBy: 'Console User',
      notes: `Created via ${scheduleData.pickupType} pickup scheduling`,
    };

    this.demoPickups.push(newPickup);
    this.pickupCounter++;
    
    // Emit updated pickups for real-time updates
    this.pickupsUpdatedSubject.next([...this.demoPickups]);
    
    // Return as Observable to match API interface
    return of(newPickup);
  }

  // Override getPickups to use demo data in frontend-only mode
  getPickups(params: PickupQueryParams = {}): Observable<PaginatedResponse<PickupRecord>> {
    // Use demo data for frontend-only testing
    if (this.isDemoMode()) {
      let filteredPickups = [...this.demoPickups];
      
      // Apply filters
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredPickups = filteredPickups.filter(pickup => 
          pickup.clientName.toLowerCase().includes(searchLower) ||
          pickup.pickupId.toLowerCase().includes(searchLower) ||
          pickup.pickupAddress.toLowerCase().includes(searchLower)
        );
      }
      
      if (params.status) {
        filteredPickups = filteredPickups.filter(pickup => pickup.status === params.status);
      }
      
      if (params.pickupType) {
        filteredPickups = filteredPickups.filter(pickup => pickup.pickupType === params.pickupType);
      }
      
      // Apply sorting
      if (params.sortBy) {
        filteredPickups.sort((a, b) => {
          const aVal = (a as any)[params.sortBy!];
          const bVal = (b as any)[params.sortBy!];
          const order = params.sortOrder === 'desc' ? -1 : 1;
          return aVal < bVal ? -order : aVal > bVal ? order : 0;
        });
      }
      
      // Apply pagination
      const page = params.page || 0;
      const limit = params.limit || 10;
      const startIndex = page * limit;
      const paginatedPickups = filteredPickups.slice(startIndex, startIndex + limit);
      
      const response: PaginatedResponse<PickupRecord> = {
        content: paginatedPickups,
        totalElements: filteredPickups.length,
        totalPages: Math.ceil(filteredPickups.length / limit),
        page: page,
        size: limit
      };
      
      return of(response);
    }
    
    // Original HTTP call for production
    let httpParams = new HttpParams();
    if (params.page !== undefined) httpParams = httpParams.set('page', String(params.page));
    if (params.limit !== undefined) httpParams = httpParams.set('limit', String(params.limit));
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.pickupType) httpParams = httpParams.set('pickupType', params.pickupType);
    if (params.staffId) httpParams = httpParams.set('staffId', params.staffId);
    if (params.clientId) httpParams = httpParams.set('clientId', params.clientId);
    if (params.fromDate) httpParams = httpParams.set('fromDate', params.fromDate);
    if (params.toDate) httpParams = httpParams.set('toDate', params.toDate);
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder);

    return this.http.get<PaginatedResponse<PickupRecord>>(`${this.baseUrl}/pickups`, { params: httpParams });
  }

  // Initialize demo data for testing
  private initializeDemoData(): void {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    this.demoPickups = [
      {
        id: 'demo_pickup_1',
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
        pickupDate: yesterday.toISOString().split('T')[0],
        pickupTime: '2:30 PM',
        estimatedDuration: 45,
        status: 'completed',
        statusUpdatedAt: yesterday,
        statusUpdatedBy: 'Rajesh Kumar',
        estimatedCost: 250,
        actualCost: 250,
        createdAt: yesterday,
        updatedAt: yesterday,
        createdBy: 'Demo User',
        notes: 'Pickup completed successfully',
        customerFeedback: 'Excellent service',
        rating: 5
      },
      {
        id: 'demo_pickup_2',
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
        pickupDate: now.toISOString().split('T')[0],
        pickupTime: '11:00 AM',
        estimatedDuration: 30,
        status: 'in-progress',
        statusUpdatedAt: now,
        statusUpdatedBy: 'Priya Sharma',
        estimatedCost: 180,
        actualCost: 0,
        createdAt: now,
        updatedAt: now,
        createdBy: 'Demo User',
        notes: 'Pickup in progress'
      },
      {
        id: 'demo_pickup_3',
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
        pickupDate: now.toISOString().split('T')[0],
        pickupTime: '3:00 PM',
        estimatedDuration: 60,
        status: 'scheduled',
        statusUpdatedAt: now,
        statusUpdatedBy: 'System',
        estimatedCost: 320,
        actualCost: 0,
        createdAt: now,
        updatedAt: now,
        createdBy: 'Demo User',
        notes: 'Scheduled for today afternoon'
      }
    ];
    
    this.pickupCounter = 4; // Next pickup will be PU000004
    this.pickupsUpdatedSubject.next([...this.demoPickups]);
  }

  // Check if running in demo mode (frontend-only)
  private isDemoMode(): boolean {
    // Check if we're in development or if API is not available
    return true; // Always use demo mode for frontend-only testing
  }

}
