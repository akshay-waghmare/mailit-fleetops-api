import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { PickupRecord, PickupQueryParams, PaginatedResponse, SchedulePickupData } from './pickup.interface';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class PickupService {
  private readonly baseUrl: string;
  
  // Subject for real-time updates
  private pickupsUpdatedSubject = new BehaviorSubject<PickupRecord[]>([]);
  public pickupsUpdated$ = this.pickupsUpdatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.baseUrl = this.configService.apiBaseUrl;
  }

  getPickupById(id: string): Observable<PickupRecord> {
    return this.http.get<any>(`${this.baseUrl}/v1/pickups/${id}`, {
      headers: {
        'Authorization': 'Basic ' + btoa('admin:admin')
      }
    }).pipe(
      map(backendPickup => this.mapBackendPickupToFrontend(backendPickup))
    );
  }

  updatePickup(id: string, data: Partial<PickupRecord>): Observable<PickupRecord> {
    return this.http.put<PickupRecord>(`${this.baseUrl}/pickups/${id}`, data);
  }

  updatePickupStatus(id: string, status: string, notes?: string): Observable<PickupRecord> {
    return this.http.patch<any>(`${this.baseUrl}/v1/pickups/${id}/status`, { status }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa('admin:admin')
      }
    }).pipe(
      map(backendPickup => this.mapBackendPickupToFrontend(backendPickup))
    );
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

  // Create pickup via backend API
  createPickup(scheduleData: SchedulePickupData): Observable<PickupRecord> {
    // Map frontend SchedulePickupData to backend CreatePickupDto
    const createPickupDto = {
      clientId: parseInt(scheduleData.client.id) || 12, // Convert to number, fallback to 12
      pickupAddress: scheduleData.client.address,
      pickupDate: scheduleData.pickupDate || new Date().toISOString().split('T')[0],
      pickupTime: scheduleData.pickupTime || '10:00',
      pickupType: scheduleData.pickupType,
      itemCount: scheduleData.itemCount,
      totalWeight: scheduleData.totalWeight,
      itemsDescription: scheduleData.itemDescription || '',
      carrierId: scheduleData.carrier?.id || null,
  assignedStaffId: parseInt(scheduleData.employee.id) || null,
  assignedStaffName: scheduleData.employee.name
    };

    return this.http.post<any>(`${this.baseUrl}/v1/pickups`, createPickupDto, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa('admin:admin') // Basic auth for development
      }
    }).pipe(
      map(backendResponse => this.mapBackendToFrontend(backendResponse, scheduleData)),
      // After creating a pickup, refresh the list from backend and notify subscribers
      tap(created => {
        this.getPickups().subscribe({
          next: (page) => this.pickupsUpdatedSubject.next(page.content),
          error: (err) => console.error('Failed to refresh pickups after create:', err)
        });
      })
    );
  }

  // Get pickups from backend API
  getPickups(params: PickupQueryParams = {}): Observable<PaginatedResponse<PickupRecord>> {
    let httpParams = new HttpParams();
    if (params.page !== undefined) httpParams = httpParams.set('page', String(params.page));
    if (params.limit !== undefined) httpParams = httpParams.set('size', String(params.limit)); // Backend uses 'size' not 'limit'
    if (params.search) httpParams = httpParams.set('q', params.search); // Backend uses 'q' for search
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.pickupType) httpParams = httpParams.set('pickupType', params.pickupType);
    if (params.staffId) httpParams = httpParams.set('staffId', params.staffId);
    if (params.clientId) httpParams = httpParams.set('clientId', params.clientId);
    if (params.fromDate) httpParams = httpParams.set('pickupDate', params.fromDate);
    if (params.sortBy) httpParams = httpParams.set('sort', `${params.sortBy},${params.sortOrder || 'asc'}`);

    return this.http.get<any>(`${this.baseUrl}/v1/pickups`, { 
      params: httpParams,
      headers: {
        'Authorization': 'Basic ' + btoa('admin:admin') // Basic auth for development
      }
    }).pipe(
      map(backendResponse => this.mapBackendPageToFrontend(backendResponse))
    );
  }

  // Check if running in demo mode (frontend-only)
  private isDemoMode(): boolean {
    // Demo mode is now disabled - always use backend integration
    return false;
  }

  // Map backend PickupDto to frontend PickupRecord
  private mapBackendToFrontend(backendPickup: any, scheduleData: SchedulePickupData): PickupRecord {
    return {
      id: String(backendPickup.id),
      pickupId: backendPickup.pickupId,
      clientName: scheduleData.client.clientName,
      clientCompany: scheduleData.client.clientCompany || '',
      clientId: scheduleData.client.id,
      pickupAddress: backendPickup.pickupAddress,
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
      pickupDate: backendPickup.pickupDate,
      pickupTime: backendPickup.pickupTime || scheduleData.pickupTime || '10:00',
      estimatedDuration: 30,
      status: backendPickup.status,
      statusUpdatedAt: backendPickup.updatedAt,
      statusUpdatedBy: 'System',
      estimatedCost: backendPickup.estimatedCost || scheduleData.carrier?.price || 0,
      actualCost: 0,
      createdAt: backendPickup.createdAt,
      updatedAt: backendPickup.updatedAt,
      createdBy: 'Console User',
      notes: `Created via ${scheduleData.pickupType} pickup scheduling`,
    };
  }

  // Map backend paginated response to frontend format
  private mapBackendPageToFrontend(backendResponse: any): PaginatedResponse<PickupRecord> {
    const content = backendResponse.content || [];
    const totalElements = backendResponse.totalElements ?? backendResponse.totalElements ?? 0;
    const totalPages = backendResponse.totalPages ?? backendResponse.totalPages ?? Math.ceil((totalElements || 0) / (backendResponse.size || 10));
    const page = backendResponse.number ?? backendResponse.page ?? 0; // Spring Page uses 'number'
    const size = backendResponse.size ?? backendResponse.pageSize ?? 10;

    return {
      content: (content as any[]).map((pickup: any) => this.mapBackendPickupToFrontend(pickup)),
      totalElements: totalElements,
      totalPages: totalPages,
      page: page,
      size: size
    };
  }

  // Map a single backend pickup to frontend format (for list view)
  private mapBackendPickupToFrontend(backendPickup: any): PickupRecord {
    // Normalize assigned staff: backend may return a string or an object.
    const assignedStaffName = (() => {
      const s = backendPickup.assignedStaff;
      if (!s) {
        // Try common alternative fields that some APIs use
        return backendPickup.assignedStaffName || backendPickup.assignedStaffFullName || 'Unassigned';
      }
      if (typeof s === 'string') return s;
      if (typeof s === 'object') {
        return s.name || s.fullName || `${s.firstName || ''} ${s.lastName || ''}`.trim() || backendPickup.assignedStaffName || 'Unassigned';
      }
      return 'Unassigned';
    })();

    return {
      id: String(backendPickup.id),
      pickupId: backendPickup.pickupId,
      clientName: backendPickup.clientName || 'Unknown Client',
      clientCompany: backendPickup.clientName || '',
      clientId: String(backendPickup.clientId || ''),
      pickupAddress: backendPickup.pickupAddress,
      contactNumber: '',
      itemCount: 1, // Backend doesn't return this yet
      totalWeight: 0, // Backend doesn't return this yet
      itemDescription: '',
      specialInstructions: '',
      pickupType: backendPickup.pickupType || 'vendor',
      carrierName: '',
      carrierId: backendPickup.carrierId || '',
      assignedStaff: assignedStaffName,
      staffId: String(backendPickup.assignedStaffId || ''),
      staffDepartment: 'Operations',
      pickupDate: backendPickup.pickupDate,
      pickupTime: backendPickup.pickupTime || '10:00',
      estimatedDuration: 30,
      status: backendPickup.status,
      statusUpdatedAt: backendPickup.updatedAt,
      statusUpdatedBy: 'System',
      estimatedCost: backendPickup.estimatedCost || 0,
      actualCost: 0,
      createdAt: backendPickup.createdAt,
      updatedAt: backendPickup.updatedAt,
      createdBy: 'API User',
      notes: '',
    };
  }

}
