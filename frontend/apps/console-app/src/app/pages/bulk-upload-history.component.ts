import { Component, OnInit, ViewChild, ChangeDetectorRef, PLATFORM_ID, Inject, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';

// Services and interfaces
import { BulkUploadService } from '../../../../../libs/shared';
import { BatchSummaryDto } from '../../../../../libs/shared';

@Component({
  selector: 'app-bulk-upload-history',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatExpansionModule
  ],
  template: `
    <!-- Modern Layout with Tailwind + Material -->
    <div class="min-h-screen bg-slate-50">
      
      <!-- Header Section -->
      <header class="bg-white border-b border-slate-200 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-6">
            <h1 class="text-3xl font-bold text-slate-900 flex items-center">
              <mat-icon class="mr-2 text-indigo-600">history</mat-icon>
              <span>Upload History</span>
            </h1>
            <div class="flex gap-3">
              <button 
                mat-stroked-button 
                (click)="backToUpload()"
                class="border-slate-600 text-slate-600 hover:bg-slate-50">
                <mat-icon>arrow_back</mat-icon>
                Back to Upload
              </button>
              <button 
                mat-raised-button 
                color="primary"
                (click)="refreshData()">
                <mat-icon>refresh</mat-icon>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <!-- Loading State -->
        <div *ngIf="isLoading" class="flex justify-center items-center py-20">
          <mat-spinner diameter="50"></mat-spinner>
        </div>

        <!-- Empty State -->
        <mat-card *ngIf="!isLoading && batches.length === 0" class="text-center py-12">
          <mat-icon class="text-6xl text-slate-400 mb-4">inbox</mat-icon>
          <h2 class="text-xl font-semibold text-slate-900 mb-2">No Upload History</h2>
          <p class="text-slate-600 mb-6">You haven't uploaded any bulk order files yet.</p>
          <button mat-raised-button color="primary" (click)="backToUpload()">
            <mat-icon>cloud_upload</mat-icon>
            Start New Upload
          </button>
        </mat-card>

        <!-- Batches Table -->
        <mat-card *ngIf="!isLoading && batches.length > 0">
          <mat-card-content class="p-0">
            <div class="overflow-x-auto">
              <table mat-table [dataSource]="dataSource" class="w-full">
                
                <!-- Batch ID Column -->
                <ng-container matColumnDef="batchId">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold text-slate-900">Batch ID</th>
                  <td mat-cell *matCellDef="let batch">
                    <span class="font-mono text-sm text-indigo-600">{{ batch.batchId }}</span>
                  </td>
                </ng-container>

                <!-- Status Column -->
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold text-slate-900">Status</th>
                  <td mat-cell *matCellDef="let batch">
                    <mat-chip [class]="getStatusClass(batch.status)">
                      <mat-icon class="mr-1" [style.font-size]="'16px'">{{ getStatusIcon(batch.status) }}</mat-icon>
                      {{ batch.status }}
                    </mat-chip>
                  </td>
                </ng-container>

                <!-- File Name Column -->
                <ng-container matColumnDef="fileName">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold text-slate-900">File Name</th>
                  <td mat-cell *matCellDef="let batch">
                    <span class="text-sm text-slate-700">{{ batch.fileName || 'N/A' }}</span>
                  </td>
                </ng-container>

                <!-- Total Rows Column -->
                <ng-container matColumnDef="totalRows">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold text-slate-900">Total Rows</th>
                  <td mat-cell *matCellDef="let batch">
                    <span class="text-sm font-medium">{{ batch.totalRows }}</span>
                  </td>
                </ng-container>

                <!-- Created Column -->
                <ng-container matColumnDef="createdCount">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold text-slate-900">Created</th>
                  <td mat-cell *matCellDef="let batch">
                    <span class="text-sm text-green-600 font-medium">{{ batch.createdCount }}</span>
                  </td>
                </ng-container>

                <!-- Failed Column -->
                <ng-container matColumnDef="failedCount">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold text-slate-900">Failed</th>
                  <td mat-cell *matCellDef="let batch">
                    <span class="text-sm text-red-600 font-medium">{{ batch.failedCount }}</span>
                  </td>
                </ng-container>

                <!-- Skipped Column -->
                <ng-container matColumnDef="skippedDuplicateCount">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold text-slate-900">Skipped</th>
                  <td mat-cell *matCellDef="let batch">
                    <span class="text-sm text-orange-600 font-medium">{{ batch.skippedDuplicateCount }}</span>
                  </td>
                </ng-container>

                <!-- Uploaded At Column -->
                <ng-container matColumnDef="uploadedAt">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold text-slate-900">Uploaded At</th>
                  <td mat-cell *matCellDef="let batch">
                    <span class="text-sm text-slate-600">{{ formatDate(batch.uploadedAt) }}</span>
                  </td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold text-slate-900">Actions</th>
                  <td mat-cell *matCellDef="let batch">
                    <button 
                      mat-icon-button 
                      matTooltip="View Details"
                      (click)="viewBatchDetails(batch)"
                      class="text-indigo-600">
                      <mat-icon>visibility</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns" class="bg-slate-50"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                    class="hover:bg-slate-50 transition-colors"></tr>
              </table>
            </div>

            <!-- Pagination -->
            <mat-paginator 
              [length]="totalElements"
              [pageSize]="pageSize"
              [pageIndex]="pageIndex"
              [pageSizeOptions]="[10, 20, 50, 100]"
              (page)="onPageChange($event)"
              class="border-t border-slate-200">
            </mat-paginator>
          </mat-card-content>
        </mat-card>

        <!-- Batch Details Expansion Panel (shown when a batch is selected) -->
        <mat-expansion-panel *ngIf="selectedBatch" class="mt-6">
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon class="mr-2 text-indigo-600">info</mat-icon>
              <span class="font-semibold">Batch Details: {{ selectedBatch.batchId }}</span>
            </mat-panel-title>
          </mat-expansion-panel-header>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
            <!-- Summary Stats -->
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-green-700 font-medium">Created Orders</p>
                  <p class="text-3xl font-bold text-green-600">{{ selectedBatch.createdCount }}</p>
                </div>
                <mat-icon class="text-4xl text-green-600">check_circle</mat-icon>
              </div>
            </div>

            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-red-700 font-medium">Failed Rows</p>
                  <p class="text-3xl font-bold text-red-600">{{ selectedBatch.failedCount }}</p>
                </div>
                <mat-icon class="text-4xl text-red-600">error</mat-icon>
              </div>
            </div>

            <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-orange-700 font-medium">Skipped Duplicates</p>
                  <p class="text-3xl font-bold text-orange-600">{{ selectedBatch.skippedDuplicateCount }}</p>
                </div>
                <mat-icon class="text-4xl text-orange-600">content_copy</mat-icon>
              </div>
            </div>
          </div>

          <!-- Additional Details -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg mt-4">
            <div>
              <p class="text-sm text-slate-600">Total Rows Processed</p>
              <p class="text-lg font-semibold text-slate-900">{{ selectedBatch.totalRows }}</p>
            </div>
            <div>
              <p class="text-sm text-slate-600">Upload Status</p>
              <p class="text-lg font-semibold" [class]="getStatusTextColor(selectedBatch.status)">
                {{ selectedBatch.status }}
              </p>
            </div>
            <div>
              <p class="text-sm text-slate-600">Uploaded At</p>
              <p class="text-lg font-semibold text-slate-900">{{ formatDate(selectedBatch.uploadedAt) }}</p>
            </div>
            <div *ngIf="selectedBatch.fileSizeBytes">
              <p class="text-sm text-slate-600">File Size</p>
              <p class="text-lg font-semibold text-slate-900">{{ formatFileSize(selectedBatch.fileSizeBytes) }}</p>
            </div>
          </div>
        </mat-expansion-panel>

      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .mat-mdc-header-cell {
      font-weight: 600 !important;
    }

    .mat-mdc-cell {
      padding: 16px 8px !important;
    }
  `]
})
export class BulkUploadHistoryComponent implements OnInit {
  displayedColumns: string[] = [
    'batchId',
    'status',
    'fileName',
    'totalRows',
    'createdCount',
    'failedCount',
    'skippedDuplicateCount',
    'uploadedAt',
    'actions'
  ];

  batches: BatchSummaryDto[] = [];
  dataSource = new MatTableDataSource<BatchSummaryDto>([]);
  selectedBatch: BatchSummaryDto | null = null;

  isLoading = false;
  totalElements = 0;
  pageIndex = 0;
  pageSize = 20;
  isBrowser = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private bulkUploadService: BulkUploadService,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // Only load data in browser context
    if (this.isBrowser) {
      this.loadBatches();
    }
  }

  loadBatches(): void {
    this.isLoading = true;
    console.log('Loading batches...', { pageIndex: this.pageIndex, pageSize: this.pageSize });
    
    this.bulkUploadService.listBatches(this.pageIndex, this.pageSize).subscribe({
      next: (response) => {
        console.log('Batches loaded successfully:', response);
        
        // Handle both paginated and array responses
        if (response && response.content) {
          // Paginated response (Spring Page)
          this.batches = response.content;
          this.totalElements = response.totalElements || 0;
          console.log('Parsed Spring Page response:', { batches: this.batches.length, total: this.totalElements });
        } else if (Array.isArray(response)) {
          // Array response
          this.batches = response;
          this.totalElements = response.length;
          console.log('Parsed array response:', { batches: this.batches.length });
        } else {
          console.warn('Unexpected response format:', response);
          this.batches = [];
          this.totalElements = 0;
        }
        
        this.dataSource.data = this.batches;
        
        // Update UI state with NgZone to ensure change detection runs
        console.log('DataSource updated:', { rows: this.dataSource.data.length });
        this.ngZone.run(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
          console.log('Change detection triggered, isLoading:', this.isLoading);
        });
      },
      error: (error) => {
        console.error('Failed to load batches:', error);
        this.snackBar.open('Failed to load upload history', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.ngZone.run(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  refreshData(): void {
    this.selectedBatch = null;
    this.loadBatches();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadBatches();
  }

  viewBatchDetails(batch: BatchSummaryDto): void {
    this.selectedBatch = batch;
  }

  backToUpload(): void {
    this.router.navigate(['/bulk-upload']);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'check_circle';
      case 'PROCESSING':
        return 'pending';
      case 'FAILED':
        return 'error';
      default:
        return 'help';
    }
  }

  getStatusTextColor(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600';
      case 'PROCESSING':
        return 'text-blue-600';
      case 'FAILED':
        return 'text-red-600';
      default:
        return 'text-slate-600';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatFileSize(bytes: number): string {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}
