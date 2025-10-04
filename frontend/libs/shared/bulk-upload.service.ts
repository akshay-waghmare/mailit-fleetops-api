import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { ConfigService } from './config.service';
import {
  BulkUploadResponseDto,
  BatchSummaryDto,
  BulkUploadProgress
} from './bulk-upload.interface';

/**
 * Bulk Upload Service
 * Handles Excel file uploads for bulk order creation
 */
@Injectable({
  providedIn: 'root'
})
export class BulkUploadService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    // apiBaseUrl already includes /api prefix for Docker, so we append /v1/bulk/orders
    this.apiUrl = `${this.configService.apiBaseUrl}/v1/bulk/orders`;
  }

  /**
   * Upload Excel file for bulk order creation
   * @param file Excel file (.xlsx)
   * @returns Observable of upload response
   */
  uploadBulkOrders(file: File): Observable<BulkUploadResponseDto> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<BulkUploadResponseDto>(this.apiUrl, formData).pipe(
      tap(response => console.log('Bulk upload response:', response)),
      catchError(error => {
        console.error('Bulk upload failed:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Upload with progress tracking
   * @param file Excel file
   * @returns Observable of upload progress and response
   */
  uploadWithProgress(file: File): Observable<BulkUploadProgress | BulkUploadResponseDto> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<BulkUploadResponseDto>(this.apiUrl, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            if (event.total) {
              const progress: BulkUploadProgress = {
                loaded: event.loaded,
                total: event.total,
                percentage: Math.round((100 * event.loaded) / event.total)
              };
              return progress;
            }
            return { loaded: event.loaded, total: 0, percentage: 0 };
          
          case HttpEventType.Response:
            return event.body as BulkUploadResponseDto;
          
          default:
            return { loaded: 0, total: 0, percentage: 0 };
        }
      }),
      catchError(error => {
        console.error('Bulk upload with progress failed:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get list of bulk upload batches
   * @param page Page number (0-indexed)
   * @param size Page size
   * @returns Observable of batch list
   */
  listBatches(page: number = 0, size: number = 20): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/batches`, {
      params: { page: page.toString(), size: size.toString() }
    }).pipe(
      catchError(error => {
        console.error('Failed to fetch batches:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Download Excel template
   * @returns Observable of Blob
   */
  downloadTemplate(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/template`, {
      responseType: 'blob'
    }).pipe(
      catchError(error => {
        console.error('Failed to download template:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Validate file before upload
   * @param file File to validate
   * @returns Validation result
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      return { valid: false, error: 'Only .xlsx files are allowed' };
    }

    // Check file size (2 MB limit)
    const maxSize = 2 * 1024 * 1024; // 2 MB
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must not exceed 2 MB' };
    }

    return { valid: true };
  }
}
