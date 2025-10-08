/**
 * Delivery Sheets Management Component
 * Epic E10: Minimal RBAC (User Management)
 * Task T032: Surface agent assignment in creation flow
 */

import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DeliverySheetService } from '../../services/delivery-sheet.service';
import { DeliverySheetListResponse, DeliverySheetSummary } from '../../models/delivery-sheet.model';
import { DeliverySheetFormComponent, DeliverySheetFormResult } from './delivery-sheet-form.component';

@Component({
  selector: 'app-delivery-sheets',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatPaginatorModule,
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
    <section class="p-6 space-y-6">
      <header class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">Delivery Sheets</h1>
          <p class="text-sm text-gray-600">
            Create and manage delivery sheets. Assign an agent to ensure scoped access for field operations.
          </p>
        </div>

        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon class="mr-2">add</mat-icon>
          Create Delivery Sheet
        </button>
      </header>

      <mat-progress-spinner
        *ngIf="isLoading"
        class="mx-auto"
        diameter="48"
        mode="indeterminate"></mat-progress-spinner>

      <div *ngIf="!isLoading && errorMessage" class="rounded-lg bg-red-50 p-4 text-sm text-red-700">
        {{ errorMessage }}
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && !errorMessage && dataSource.length === 0" class="text-center py-12 bg-white rounded-lg border border-gray-200">
        <mat-icon class="text-6xl text-gray-400 mb-4">description</mat-icon>
        <h3 class="text-xl font-semibold text-gray-800 mb-2">No Delivery Sheets Yet</h3>
        <p class="text-gray-600 mb-6">Create your first delivery sheet to get started</p>
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon class="mr-2">add</mat-icon>
          Create Delivery Sheet
        </button>
      </div>

      <div *ngIf="!isLoading && dataSource.length > 0" class="overflow-x-auto rounded-lg border border-gray-200">
        <table mat-table [dataSource]="dataSource" class="min-w-full">
          <ng-container matColumnDef="sheetNumber">
            <th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Sheet</th>
            <td mat-cell *matCellDef="let sheet" class="px-4 py-3 text-sm font-medium text-gray-900">
              {{ sheet.sheetNumber }}
              <div class="text-xs text-gray-500" *ngIf="sheet.title">{{ sheet.title }}</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="assignedAgentName">
            <th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Assigned Agent</th>
            <td mat-cell *matCellDef="let sheet" class="px-4 py-3 text-sm text-gray-900">
              {{ sheet.assignedAgentName || 'Unassigned' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
            <td mat-cell *matCellDef="let sheet" class="px-4 py-3 text-sm">
              <mat-chip-set>
                <mat-chip [color]="statusColor(sheet.status)" selected>{{ sheet.status }}</mat-chip>
              </mat-chip-set>
            </td>
          </ng-container>

          <ng-container matColumnDef="totalOrders">
            <th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Orders</th>
            <td mat-cell *matCellDef="let sheet" class="px-4 py-3 text-sm text-gray-900">{{ sheet.totalOrders }}</td>
          </ng-container>

          <ng-container matColumnDef="scheduledDate">
            <th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Scheduled</th>
            <td mat-cell *matCellDef="let sheet" class="px-4 py-3 text-sm text-gray-900">
              {{ sheet.scheduledDate ? (sheet.scheduledDate | date: 'mediumDate') : '—' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="createdAt">
            <th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Created</th>
            <td mat-cell *matCellDef="let sheet" class="px-4 py-3 text-sm text-gray-500">
              {{ sheet.createdAt | date: 'medium' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
            <td mat-cell *matCellDef="let sheet" class="px-4 py-3 text-sm">
              <button mat-icon-button [matTooltip]="'Edit delivery sheet'" (click)="openEditDialog(sheet)">
                <mat-icon>edit</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>
      </div>

      <mat-paginator
        [length]="totalElements"
        [pageSize]="pageSize"
        [pageIndex]="pageIndex"
        [pageSizeOptions]="[5, 10, 20]"
        (page)="onPageChange($event)"
        *ngIf="totalElements > pageSize">
      </mat-paginator>
    </section>
  `
})
export class DeliverySheetsComponent implements OnInit {
  private deliverySheetService = inject(DeliverySheetService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  displayedColumns: Array<keyof DeliverySheetSummary | 'createdAt' | 'actions'> = [
    'sheetNumber',
    'assignedAgentName',
    'status',
    'totalOrders',
    'scheduledDate',
    'createdAt',
    'actions'
  ];

  dataSource: DeliverySheetSummary[] = [];
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadSheets();
  }

  openCreateDialog(): void {
    console.log('=== OPENING CREATE DELIVERY SHEET DIALOG ===');
    console.log('MatDialog instance:', this.dialog);
    
    try {
      const dialogRef = this.dialog.open<DeliverySheetFormComponent, undefined, DeliverySheetFormResult>(
        DeliverySheetFormComponent,
        {
          width: '600px',
          disableClose: true
        }
      );

      console.log('Dialog opened successfully:', dialogRef);

      dialogRef.afterClosed().subscribe(result => {
        console.log('Dialog closed with result:', result);
        if (result?.created) {
          this.snackBar.open('Delivery sheet created successfully', 'Close', { duration: 3000 });
          this.loadSheets(true);
        }
      });
    } catch (error) {
      console.error('❌ Failed to open dialog:', error);
    }
  }

  openEditDialog(sheet: DeliverySheetSummary): void {
    console.log('=== OPENING EDIT DELIVERY SHEET DIALOG ===');
    console.log('Editing sheet:', sheet);
    
    try {
      const dialogRef = this.dialog.open<DeliverySheetFormComponent, DeliverySheetSummary, DeliverySheetFormResult>(
        DeliverySheetFormComponent,
        {
          width: '600px',
          disableClose: true,
          data: sheet
        }
      );

      console.log('Edit dialog opened successfully:', dialogRef);

      dialogRef.afterClosed().subscribe(result => {
        console.log('Dialog closed with result:', result);
        if (result?.created) {
          this.snackBar.open('Delivery sheet updated successfully', 'Close', { duration: 3000 });
          this.loadSheets();
        }
      });
    } catch (error) {
      console.error('❌ Failed to open edit dialog:', error);
    }
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadSheets();
  }

  private loadSheets(resetPage = false): void {
    if (resetPage) {
      this.pageIndex = 0;
    }

    console.log('[DeliverySheets] Starting to load sheets...');
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.deliverySheetService.getDeliverySheets({
      page: this.pageIndex,
      size: this.pageSize,
      sort: 'createdAt,desc'
    }).subscribe({
      next: (response: DeliverySheetListResponse) => {
        console.log('[DeliverySheets] Received response:', response);
        this.dataSource = response.content;
        this.totalElements = response.totalElements;
        this.isLoading = false;
        this.cdr.markForCheck();
        console.log('[DeliverySheets] isLoading set to false, dataSource length:', this.dataSource.length);
      },
      error: (err) => {
        console.error('[DeliverySheets] Error loading sheets:', err);
        this.errorMessage = 'Unable to load delivery sheets. Please try again later.';
        this.dataSource = [];
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  statusColor(status: string): 'primary' | 'accent' | 'warn' {
    switch (status) {
      case 'OPEN':
        return 'primary';
      case 'IN_PROGRESS':
        return 'accent';
      case 'COMPLETED':
      case 'CLOSED':
        return 'warn';
      default:
        return 'primary';
    }
  }
}
