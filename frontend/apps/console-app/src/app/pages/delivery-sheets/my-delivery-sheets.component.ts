import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { interval } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DeliverySheetService } from '../../services/delivery-sheet.service';
import { DeliverySheetListResponse, DeliverySheetSummary } from '../../models/delivery-sheet.model';

/**
 * My Delivery Sheets Component
 * Epic E10: Minimal RBAC (User Management)
 * Task T035: Agent view of assigned delivery sheets.
 */
@Component({
  selector: 'app-my-delivery-sheets',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatProgressSpinnerModule, MatChipsModule, MatButtonModule],
  template: `
    <section class="p-6 space-y-6">
      <header class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">My Delivery Sheets</h1>
          <p class="text-sm text-gray-600">
            These are the delivery sheets currently assigned to you. The list refreshes every 30 seconds.
          </p>
        </div>

        <button mat-stroked-button color="primary" (click)="loadSheets(true)" [disabled]="isLoading">
          Refresh
        </button>
      </header>

      <mat-progress-spinner
        *ngIf="isLoading && dataSource.length === 0"
        class="mx-auto"
        diameter="48"
        mode="indeterminate"></mat-progress-spinner>

      <div *ngIf="!isLoading && dataSource.length === 0" class="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-600">
        <p class="text-base font-medium">No delivery sheets assigned yet.</p>
        <p class="mt-2 text-sm">Once an administrator assigns a delivery sheet to you it will appear here automatically.</p>
      </div>

      <div *ngIf="dataSource.length > 0" class="overflow-x-auto rounded-lg border border-gray-200">
        <table mat-table [dataSource]="dataSource" class="min-w-full">
          <ng-container matColumnDef="sheetNumber">
            <th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Sheet</th>
            <td mat-cell *matCellDef="let sheet" class="px-4 py-3 text-sm font-medium text-gray-900">
              {{ sheet.sheetNumber }}
              <div class="text-xs text-gray-500" *ngIf="sheet.title">{{ sheet.title }}</div>
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

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns; trackBy: trackById"></tr>
        </table>
      </div>
    </section>
  `
})
export class MyDeliverySheetsComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private deliverySheetService = inject(DeliverySheetService);

  displayedColumns: Array<keyof DeliverySheetSummary | 'createdAt'> = [
    'sheetNumber',
    'status',
    'totalOrders',
    'scheduledDate',
    'createdAt'
  ];

  dataSource: DeliverySheetSummary[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.loadSheets(true);

    interval(30000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadSheets());
  }

  loadSheets(reset = false): void {
    if (this.isLoading) {
      return;
    }

    if (reset) {
      this.dataSource = [];
    }

    this.isLoading = true;
    this.deliverySheetService.getMyDeliverySheets({ sort: 'createdAt,desc' }).subscribe({
      next: (response: DeliverySheetListResponse) => {
        this.dataSource = response.content;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.dataSource = [];
      }
    });
  }

  trackById(_: number, item: DeliverySheetSummary): number {
    return item.id;
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
