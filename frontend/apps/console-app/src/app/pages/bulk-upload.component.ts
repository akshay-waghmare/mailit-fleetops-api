import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';

// Services
import { BulkUploadService } from '../../../../../libs/shared';
import {
  BulkUploadResponseDto,
  RowOutcomeDto,
  BulkUploadProgress
} from '../../../../../libs/shared';

@Component({
  selector: 'app-bulk-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTableModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
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
              <mat-icon class="mr-2 text-indigo-600">cloud_upload</mat-icon>
              <span>Bulk Order Upload</span>
            </h1>
            <div class="flex gap-3">
              <button 
                mat-stroked-button 
                (click)="downloadTemplate()"
                [disabled]="isUploading"
                class="border-indigo-600 text-indigo-600 hover:bg-indigo-50">
                <mat-icon>download</mat-icon>
                Download Template
              </button>
              <button 
                mat-stroked-button 
                (click)="viewHistory()"
                [disabled]="isUploading"
                class="border-slate-600 text-slate-600 hover:bg-slate-50">
                <mat-icon>history</mat-icon>
                Upload History
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <!-- Upload Section -->
        <mat-card class="mb-6" *ngIf="!uploadResponse">
          <mat-card-content class="p-8">
            <div class="text-center">
              <!-- File Drop Zone -->
              <div 
                class="border-2 border-dashed rounded-lg p-12 transition-all"
                [class.border-indigo-400]="!isDragOver"
                [class.bg-indigo-50]="isDragOver"
                [class.border-indigo-600]="isDragOver"
                (dragover)="onDragOver($event)"
                (dragleave)="onDragLeave($event)"
                (drop)="onDrop($event)">
                
                <mat-icon class="text-6xl mb-4" [class.text-slate-400]="!isDragOver" [class.text-indigo-600]="isDragOver">
                  cloud_upload
                </mat-icon>
                
                <h2 class="text-xl font-semibold text-slate-900 mb-2">
                  Drop Excel file here or click to browse
                </h2>
                
                <p class="text-slate-600 mb-6">
                  Upload .xlsx files up to 2 MB (max 500 orders)
                </p>

                <!-- File Input -->
                <input 
                  type="file" 
                  #fileInput
                  accept=".xlsx"
                  (change)="onFileSelected($event)"
                  class="hidden">
                
                <button 
                  mat-raised-button 
                  color="primary"
                  (click)="fileInput.click()"
                  [disabled]="isUploading"
                  class="bg-indigo-600 hover:bg-indigo-700">
                  <mat-icon>folder_open</mat-icon>
                  Choose File
                </button>
              </div>

              <!-- Selected File Info -->
              <div *ngIf="selectedFile && !isUploading" class="mt-6 p-4 bg-slate-100 rounded-lg">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <mat-icon class="text-green-600">description</mat-icon>
                    <div class="text-left">
                      <p class="font-medium text-slate-900">{{ selectedFile.name }}</p>
                      <p class="text-sm text-slate-600">{{ getFileSize(selectedFile.size) }}</p>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <button mat-raised-button color="primary" (click)="uploadFile()">
                      <mat-icon>upload</mat-icon>
                      Upload
                    </button>
                    <button mat-button (click)="clearFile()">
                      <mat-icon>close</mat-icon>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>

              <!-- Upload Progress -->
              <div *ngIf="isUploading" class="mt-6">
                <div class="flex items-center justify-center gap-3 mb-4">
                  <mat-spinner diameter="24"></mat-spinner>
                  <span class="text-slate-900 font-medium">Uploading and processing...</span>
                </div>
                <mat-progress-bar 
                  mode="determinate" 
                  [value]="uploadProgress"
                  class="h-2 rounded-full">
                </mat-progress-bar>
                <p class="text-sm text-slate-600 mt-2">{{ uploadProgress }}% complete</p>
              </div>

              <!-- Quick Guide -->
              <div class="mt-8 text-left bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 class="font-semibold text-blue-900 mb-3 flex items-center">
                  <mat-icon class="mr-2">info</mat-icon>
                  Quick Guide
                </h3>
                <ul class="space-y-2 text-sm text-blue-800">
                  <li class="flex items-start">
                    <mat-icon class="text-base mr-2 mt-0.5">check_circle</mat-icon>
                    <span>Download the template to see required column format</span>
                  </li>
                  <li class="flex items-start">
                    <mat-icon class="text-base mr-2 mt-0.5">check_circle</mat-icon>
                    <span>Fill in your order data (max 500 rows per file)</span>
                  </li>
                  <li class="flex items-start">
                    <mat-icon class="text-base mr-2 mt-0.5">check_circle</mat-icon>
                    <span>Use Client Reference for idempotency (prevents duplicates)</span>
                  </li>
                  <li class="flex items-start">
                    <mat-icon class="text-base mr-2 mt-0.5">check_circle</mat-icon>
                    <span>Upload and wait for validation results</span>
                  </li>
                </ul>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Results Section -->
        <div *ngIf="uploadResponse">
          <!-- Summary Card -->
          <mat-card class="mb-6">
            <mat-card-content class="p-6">
              <div class="flex justify-between items-start mb-6">
                <div>
                  <h2 class="text-2xl font-bold text-slate-900 mb-2">Upload Complete</h2>
                  <p class="text-slate-600">Batch ID: <span class="font-mono font-medium">{{ uploadResponse.batchId }}</span></p>
                  <p class="text-sm text-slate-500 mt-1">Processing time: {{ uploadResponse.processingDurationMs }}ms</p>
                </div>
                <button mat-raised-button color="primary" (click)="resetUpload()">
                  <mat-icon>add</mat-icon>
                  Upload Another
                </button>
              </div>

              <!-- Stats Grid -->
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <!-- Total -->
                <div class="bg-slate-100 rounded-lg p-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm text-slate-600">Total Rows</p>
                      <p class="text-3xl font-bold text-slate-900">{{ uploadResponse.totalRows }}</p>
                    </div>
                    <mat-icon class="text-slate-400 text-4xl">article</mat-icon>
                  </div>
                </div>

                <!-- Created -->
                <div class="bg-green-100 rounded-lg p-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm text-green-700">Created</p>
                      <p class="text-3xl font-bold text-green-900">{{ uploadResponse.createdCount }}</p>
                    </div>
                    <mat-icon class="text-green-600 text-4xl">check_circle</mat-icon>
                  </div>
                </div>

                <!-- Skipped -->
                <div class="bg-yellow-100 rounded-lg p-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm text-yellow-700">Skipped</p>
                      <p class="text-3xl font-bold text-yellow-900">{{ uploadResponse.skippedDuplicateCount }}</p>
                    </div>
                    <mat-icon class="text-yellow-600 text-4xl">info</mat-icon>
                  </div>
                </div>

                <!-- Failed -->
                <div class="bg-red-100 rounded-lg p-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm text-red-700">Failed</p>
                      <p class="text-3xl font-bold text-red-900">{{ uploadResponse.failedCount }}</p>
                    </div>
                    <mat-icon class="text-red-600 text-4xl">error</mat-icon>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Row Details Table -->
          <mat-card>
            <mat-card-content class="p-6">
              <h3 class="text-xl font-bold text-slate-900 mb-4">Row Details</h3>

              <div class="overflow-x-auto">
                <table mat-table [dataSource]="uploadResponse.rows" class="w-full">
                  
                  <!-- Row Index Column -->
                  <ng-container matColumnDef="rowIndex">
                    <th mat-header-cell *matHeaderCellDef class="font-semibold">Row #</th>
                    <td mat-cell *matCellDef="let row">{{ row.rowIndex }}</td>
                  </ng-container>

                  <!-- Status Column -->
                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef class="font-semibold">Status</th>
                    <td mat-cell *matCellDef="let row">
                      <mat-chip 
                        [class.bg-green-100]="row.status === 'CREATED'"
                        [class.text-green-800]="row.status === 'CREATED'"
                        [class.bg-yellow-100]="row.status === 'SKIPPED_DUPLICATE'"
                        [class.text-yellow-800]="row.status === 'SKIPPED_DUPLICATE'"
                        [class.bg-red-100]="row.status === 'FAILED_VALIDATION'"
                        [class.text-red-800]="row.status === 'FAILED_VALIDATION'">
                        <mat-icon class="text-sm mr-1">
                          {{ getStatusIcon(row.status) }}
                        </mat-icon>
                        {{ getStatusLabel(row.status) }}
                      </mat-chip>
                    </td>
                  </ng-container>

                  <!-- Idempotency Column -->
                  <ng-container matColumnDef="idempotency">
                    <th mat-header-cell *matHeaderCellDef class="font-semibold">Idempotency</th>
                    <td mat-cell *matCellDef="let row">
                      <span class="text-sm text-slate-600">{{ row.idempotencyBasis }}</span>
                    </td>
                  </ng-container>

                  <!-- Order ID Column -->
                  <ng-container matColumnDef="orderId">
                    <th mat-header-cell *matHeaderCellDef class="font-semibold">Order ID</th>
                    <td mat-cell *matCellDef="let row">
                      <span class="font-mono text-sm" *ngIf="row.orderId">{{ row.orderId }}</span>
                      <span class="text-slate-400" *ngIf="!row.orderId">—</span>
                    </td>
                  </ng-container>

                  <!-- Errors Column -->
                  <ng-container matColumnDef="errors">
                    <th mat-header-cell *matHeaderCellDef class="font-semibold">Errors</th>
                    <td mat-cell *matCellDef="let row">
                      <div *ngIf="row.errorMessages && row.errorMessages.length > 0">
                        <button 
                          mat-button 
                          color="warn"
                          (click)="showErrors(row)"
                          class="text-xs">
                          <mat-icon class="text-sm">error_outline</mat-icon>
                          {{ row.errorMessages.length }} error(s)
                        </button>
                      </div>
                      <span class="text-slate-400" *ngIf="!row.errorMessages || row.errorMessages.length === 0">—</span>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                </table>
              </div>

              <!-- Error Details (Expandable) -->
              <div *ngIf="selectedRowForErrors" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div class="flex justify-between items-start mb-3">
                  <h4 class="font-semibold text-red-900">Row {{ selectedRowForErrors.rowIndex }} Errors</h4>
                  <button mat-icon-button (click)="selectedRowForErrors = null">
                    <mat-icon>close</mat-icon>
                  </button>
                </div>
                <div class="space-y-2">
                  <div 
                    *ngFor="let error of selectedRowForErrors.errorMessages"
                    class="bg-white p-3 rounded border border-red-300">
                    <p class="font-medium text-red-900">{{ error.code }}</p>
                    <p class="text-sm text-red-700">Field: {{ error.field }}</p>
                    <p class="text-sm text-red-600">{{ error.message }}</p>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .mat-mdc-table {
      background: transparent;
    }

    .mat-mdc-header-cell {
      font-weight: 600;
      color: #1e293b;
    }

    .mat-mdc-chip {
      font-size: 12px;
      height: 28px;
    }
  `]
})
export class BulkUploadComponent implements OnInit {
  selectedFile: File | null = null;
  isUploading = false;
  uploadProgress = 0;
  isDragOver = false;
  uploadResponse: BulkUploadResponseDto | null = null;
  selectedRowForErrors: RowOutcomeDto | null = null;

  displayedColumns: string[] = ['rowIndex', 'status', 'idempotency', 'orderId', 'errors'];

  constructor(
    private bulkUploadService: BulkUploadService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Component initialization
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  handleFile(file: File): void {
    const validation = this.bulkUploadService.validateFile(file);
    if (!validation.valid) {
      this.snackBar.open(validation.error || 'Invalid file', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.selectedFile = file;
  }

  clearFile(): void {
    this.selectedFile = null;
    this.uploadProgress = 0;
  }

  uploadFile(): void {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.uploadProgress = 0;

    this.bulkUploadService.uploadWithProgress(this.selectedFile).subscribe({
      next: (event) => {
        if ('percentage' in event) {
          // Progress event
          this.uploadProgress = event.percentage;
        } else {
          // Response event
          this.uploadResponse = event as BulkUploadResponseDto;
          this.isUploading = false;
          this.showSuccessMessage();
        }
      },
      error: (error) => {
        this.isUploading = false;
        this.uploadProgress = 0;
        this.handleError(error);
      }
    });
  }

  downloadTemplate(): void {
    this.bulkUploadService.downloadTemplate().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'bulk_upload_template.xlsx';
        link.click();
        window.URL.revokeObjectURL(url);
        
        this.snackBar.open('Template downloaded successfully', 'Close', {
          duration: 3000
        });
      },
      error: (error) => {
        this.snackBar.open('Failed to download template', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  viewHistory(): void {
    this.router.navigate(['/bulk-upload-history']);
  }

  resetUpload(): void {
    this.selectedFile = null;
    this.uploadResponse = null;
    this.uploadProgress = 0;
    this.selectedRowForErrors = null;
  }

  showErrors(row: RowOutcomeDto): void {
    this.selectedRowForErrors = row;
  }

  getFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'CREATED': return 'check_circle';
      case 'SKIPPED_DUPLICATE': return 'info';
      case 'FAILED_VALIDATION': return 'error';
      default: return 'help';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'CREATED': return 'Created';
      case 'SKIPPED_DUPLICATE': return 'Skipped (Duplicate)';
      case 'FAILED_VALIDATION': return 'Failed';
      default: return status;
    }
  }

  private showSuccessMessage(): void {
    const { createdCount, failedCount, skippedDuplicateCount } = this.uploadResponse!;
    let message = `Upload complete: ${createdCount} created`;
    if (skippedDuplicateCount > 0) message += `, ${skippedDuplicateCount} skipped`;
    if (failedCount > 0) message += `, ${failedCount} failed`;

    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: failedCount > 0 ? ['warning-snackbar'] : ['success-snackbar']
    });
  }

  private handleError(error: any): void {
    let errorMessage = 'Upload failed. Please try again.';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 413) {
      errorMessage = 'File is too large. Maximum size is 2 MB.';
    } else if (error.status === 400) {
      errorMessage = 'Invalid file format or content.';
    }

    this.snackBar.open(errorMessage, 'Close', {
      duration: 7000,
      panelClass: ['error-snackbar']
    });
  }
}
