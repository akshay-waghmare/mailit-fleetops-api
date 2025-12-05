import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
import { ClientService, ClientImportResponse, UploadProgress } from '../../../services/client.service';

@Component({
  selector: 'app-client-bulk-import',
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
    <div class="min-h-screen bg-slate-50">
      <!-- Header -->
      <header class="bg-white border-b border-slate-200 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-6">
            <h1 class="text-3xl font-bold text-slate-900 flex items-center">
              <mat-icon class="mr-2 text-indigo-600">cloud_upload</mat-icon>
              <span>Import Clients</span>
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
                (click)="goBack()"
                class="border-slate-600 text-slate-600 hover:bg-slate-50">
                <mat-icon>arrow_back</mat-icon>
                Back to List
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <!-- Upload Section -->
        <mat-card class="mb-6" *ngIf="!importResponse && !isUploading">
          <mat-card-content class="p-8">
            <div class="text-center">
              <div 
                class="border-2 border-dashed rounded-lg p-12 transition-all cursor-pointer"
                [class.border-indigo-400]="isDragOver"
                [class.bg-indigo-50]="isDragOver"
                [class.border-indigo-600]="isDragOver"
                (dragover)="onDragOver($event)"
                (dragleave)="onDragLeave($event)"
                (drop)="onDrop($event)"
                (click)="fileInput.click()">
                
                <input 
                  #fileInput 
                  type="file" 
                  class="hidden" 
                  accept=".xlsx,.xls"
                  (change)="onFileSelected($event)">

                <mat-icon class="text-6xl mb-4" [class.text-slate-400]="!isDragOver" [class.text-indigo-600]="isDragOver">
                  cloud_upload
                </mat-icon>
                
                <h2 class="text-xl font-semibold text-slate-900 mb-2">
                  Drop Excel file here or click to browse
                </h2>
                
                <p class="text-slate-600 mb-6">
                  Supports .xlsx and .xls files
                </p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Loading State with Progress -->
        <div *ngIf="isUploading" class="flex flex-col items-center justify-center py-12">
          <div class="w-full max-w-md mb-4">
            <div class="flex justify-between mb-1">
              <span class="text-sm font-medium text-indigo-700">
                {{ uploadPercentage === 100 ? 'Processing...' : 'Uploading...' }}
              </span>
              <span class="text-sm font-medium text-indigo-700" *ngIf="uploadPercentage > 0">{{ uploadPercentage }}%</span>
            </div>
            <mat-progress-bar 
              [mode]="uploadPercentage === 0 ? 'indeterminate' : 'determinate'" 
              [value]="uploadPercentage">
            </mat-progress-bar>
          </div>
          
          <div *ngIf="uploadPercentage === 100" class="flex flex-col items-center mt-4">
            <mat-spinner diameter="40" class="mb-2"></mat-spinner>
            <h3 class="text-lg font-medium text-slate-900">Processing Data...</h3>
            <p class="text-slate-500">Validating and saving records. This may take a moment.</p>
          </div>
        </div>

        <!-- Results Section -->
        <div *ngIf="importResponse" class="space-y-6">
          <!-- Summary Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <mat-card class="bg-blue-50 border-l-4 border-blue-500">
              <mat-card-content class="p-6">
                <div class="text-blue-600 font-medium mb-1">Total Processed</div>
                <div class="text-3xl font-bold text-blue-900">{{ importResponse.totalProcessed }}</div>
              </mat-card-content>
            </mat-card>
            
            <mat-card class="bg-green-50 border-l-4 border-green-500">
              <mat-card-content class="p-6">
                <div class="text-green-600 font-medium mb-1">Successfully Imported</div>
                <div class="text-3xl font-bold text-green-900">{{ importResponse.successCount }}</div>
              </mat-card-content>
            </mat-card>
            
            <mat-card class="bg-red-50 border-l-4 border-red-500">
              <mat-card-content class="p-6">
                <div class="text-red-600 font-medium mb-1">Failed Rows</div>
                <div class="text-3xl font-bold text-red-900">{{ importResponse.failureCount }}</div>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- Error List -->
          <mat-card *ngIf="importResponse.errors && importResponse.errors.length > 0">
            <mat-card-header>
              <mat-card-title class="text-red-600 flex items-center pt-4">
                <mat-icon class="mr-2">error_outline</mat-icon>
                Import Errors
              </mat-card-title>
            </mat-card-header>
            <mat-card-content class="p-6">
              <div class="bg-red-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <div *ngFor="let error of importResponse.errors" class="flex items-start mb-2 last:mb-0 text-red-800">
                  <mat-icon class="text-sm mr-2 mt-1 h-4 w-4">fiber_manual_record</mat-icon>
                  <span>{{ error }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Actions -->
          <div class="flex justify-end gap-4">
            <button mat-stroked-button (click)="reset()" class="border-slate-300">
              Import Another File
            </button>
            <button mat-raised-button color="primary" (click)="goBack()">
              Done
            </button>
          </div>
        </div>

      </main>
    </div>
  `
})
export class ClientBulkImportComponent {
  isDragOver = false;
  isUploading = false;
  uploadPercentage = 0;
  importResponse: ClientImportResponse | null = null;

  constructor(
    private clientService: ClientService,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  handleFile(file: File) {
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      this.snackBar.open('Please upload a valid Excel file (.xlsx or .xls)', 'Close', { duration: 3000 });
      return;
    }

    this.isUploading = true;
    this.uploadPercentage = 0;
    
    this.clientService.importClientsWithProgress(file).subscribe({
      next: (event) => {
        if ('percentage' in event) {
          // Upload Progress
          this.uploadPercentage = event.percentage;
          this.cdr.detectChanges();
        } else {
          // Response
          this.uploadPercentage = 100;
          this.isUploading = false;
          this.importResponse = event as ClientImportResponse;
          this.cdr.detectChanges();
          
          if (this.importResponse.failureCount === 0) {
            this.snackBar.open('Import completed successfully!', 'Close', { duration: 3000 });
          } else {
            this.snackBar.open(`Import completed with ${this.importResponse.failureCount} errors`, 'Close', { duration: 5000 });
          }
        }
      },
      error: (err) => {
        this.isUploading = false;
        console.error('Import failed', err);
        this.snackBar.open('Import failed. Please try again.', 'Close', { duration: 3000 });
        this.cdr.detectChanges();
      }
    });
  }

  downloadTemplate() {
    this.clientService.downloadTemplate().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'client_import_template.xlsx';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Failed to download template', err);
        this.snackBar.open('Failed to download template', 'Close', { duration: 3000 });
      }
    });
  }

  reset() {
    this.importResponse = null;
    this.isUploading = false;
    this.uploadPercentage = 0;
  }

  goBack() {
    this.router.navigate(['/clients']);
  }
}
