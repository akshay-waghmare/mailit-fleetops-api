import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PickupRecord } from '../../../../../../libs/shared/pickup.interface';

export interface PickupStatusDialogData {
  pickup: PickupRecord;
  action: 'start' | 'complete' | 'cancel' | 'delay';
}

export interface PickupStatusDialogResult {
  status: string;
  itemsReceived?: number;
  completionNotes?: string;
}

@Component({
  selector: 'app-pickup-status-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  template: `
    <div class="bg-white rounded-lg overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b" [ngClass]="getHeaderClass()">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center" [ngClass]="getIconBgClass()">
              <mat-icon [ngClass]="getIconClass()">{{ getActionIcon() }}</mat-icon>
            </div>
            <div>
              <h2 class="text-lg font-semibold m-0" [ngClass]="getTitleClass()">{{ getTitle() }}</h2>
              <p class="text-sm mt-1" [ngClass]="getSubtitleClass()">{{ data.pickup.pickupId }}</p>
            </div>
          </div>
          <button mat-icon-button (click)="onCancel()" class="text-gray-400 hover:text-gray-600">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6">
        <!-- Pickup Summary -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Client</p>
              <p class="text-sm font-semibold text-gray-900">{{ data.pickup.clientName }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Expected Items</p>
              <p class="text-sm font-semibold text-gray-900">{{ data.pickup.itemCount }} items</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Weight</p>
              <p class="text-sm font-semibold text-gray-900">{{ data.pickup.totalWeight }} kg</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Status</p>
              <p class="text-sm font-semibold text-gray-900 capitalize">{{ data.pickup.status }}</p>
            </div>
          </div>
        </div>

        <!-- Complete Pickup Form -->
        <div *ngIf="data.action === 'complete'" class="space-y-4">
          <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div class="flex items-start space-x-3">
              <mat-icon class="text-green-600 mt-0.5">info</mat-icon>
              <div>
                <p class="text-sm font-medium text-green-800">Complete Pickup</p>
                <p class="text-xs text-green-600 mt-1">
                  Enter the actual number of items received. This may differ from the expected count.
                </p>
              </div>
            </div>
          </div>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Items Received</mat-label>
            <input 
              matInput 
              type="number" 
              [(ngModel)]="itemsReceived" 
              [min]="0"
              [max]="data.pickup.itemCount * 2"
              required>
            <mat-hint>Expected: {{ data.pickup.itemCount }} items</mat-hint>
            <mat-icon matSuffix>inventory_2</mat-icon>
          </mat-form-field>

          <!-- Warning if items don't match -->
          <div *ngIf="itemsReceived !== null && itemsReceived !== data.pickup.itemCount" 
               class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div class="flex items-center space-x-2">
              <mat-icon class="text-yellow-600">warning</mat-icon>
              <p class="text-sm text-yellow-800">
                <span *ngIf="itemsReceived < data.pickup.itemCount">
                  {{ data.pickup.itemCount - itemsReceived }} item(s) fewer than expected
                </span>
                <span *ngIf="itemsReceived > data.pickup.itemCount">
                  {{ itemsReceived - data.pickup.itemCount }} item(s) more than expected
                </span>
              </p>
            </div>
          </div>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Completion Notes (Optional)</mat-label>
            <textarea 
              matInput 
              [(ngModel)]="completionNotes" 
              rows="3"
              placeholder="Add any notes about this pickup..."></textarea>
            <mat-icon matSuffix>notes</mat-icon>
          </mat-form-field>
        </div>

        <!-- Start Pickup Confirmation -->
        <div *ngIf="data.action === 'start'" class="text-center py-4">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <mat-icon class="text-blue-600" style="font-size: 32px; width: 32px; height: 32px;">play_arrow</mat-icon>
          </div>
          <p class="text-gray-600">
            Start this pickup? The status will be changed to <strong>In Progress</strong>.
          </p>
        </div>

        <!-- Cancel Pickup -->
        <div *ngIf="data.action === 'cancel'" class="space-y-4">
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex items-start space-x-3">
              <mat-icon class="text-red-600 mt-0.5">warning</mat-icon>
              <div>
                <p class="text-sm font-medium text-red-800">Cancel Pickup</p>
                <p class="text-xs text-red-600 mt-1">
                  This action cannot be undone. Please provide a reason for cancellation.
                </p>
              </div>
            </div>
          </div>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Cancellation Reason</mat-label>
            <textarea 
              matInput 
              [(ngModel)]="completionNotes" 
              rows="3"
              required
              placeholder="Reason for cancellation..."></textarea>
            <mat-icon matSuffix>notes</mat-icon>
          </mat-form-field>
        </div>

        <!-- Delay Pickup -->
        <div *ngIf="data.action === 'delay'" class="space-y-4">
          <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div class="flex items-start space-x-3">
              <mat-icon class="text-orange-600 mt-0.5">schedule</mat-icon>
              <div>
                <p class="text-sm font-medium text-orange-800">Mark as Delayed</p>
                <p class="text-xs text-orange-600 mt-1">
                  Please provide a reason for the delay.
                </p>
              </div>
            </div>
          </div>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Delay Reason</mat-label>
            <textarea 
              matInput 
              [(ngModel)]="completionNotes" 
              rows="3"
              required
              placeholder="Reason for delay..."></textarea>
            <mat-icon matSuffix>notes</mat-icon>
          </mat-form-field>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3">
        <button mat-stroked-button (click)="onCancel()">
          Cancel
        </button>
        <button 
          mat-raised-button 
          [color]="getButtonColor()"
          (click)="onConfirm()"
          [disabled]="!isValid()">
          <mat-icon class="mr-1">{{ getActionIcon() }}</mat-icon>
          {{ getButtonText() }}
        </button>
      </div>
    </div>
  `
})
export class PickupStatusDialogComponent {
  itemsReceived: number | null = null;
  completionNotes: string = '';

  constructor(
    public dialogRef: MatDialogRef<PickupStatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PickupStatusDialogData
  ) {
    // Default items received to expected count
    if (data.action === 'complete') {
      this.itemsReceived = data.pickup.itemCount;
    }
  }

  getHeaderClass(): string {
    switch (this.data.action) {
      case 'complete': return 'bg-green-50 border-green-200';
      case 'start': return 'bg-blue-50 border-blue-200';
      case 'cancel': return 'bg-red-50 border-red-200';
      case 'delay': return 'bg-orange-50 border-orange-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  }

  getIconBgClass(): string {
    switch (this.data.action) {
      case 'complete': return 'bg-green-100';
      case 'start': return 'bg-blue-100';
      case 'cancel': return 'bg-red-100';
      case 'delay': return 'bg-orange-100';
      default: return 'bg-gray-100';
    }
  }

  getIconClass(): string {
    switch (this.data.action) {
      case 'complete': return 'text-green-600';
      case 'start': return 'text-blue-600';
      case 'cancel': return 'text-red-600';
      case 'delay': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  }

  getTitleClass(): string {
    switch (this.data.action) {
      case 'complete': return 'text-green-900';
      case 'start': return 'text-blue-900';
      case 'cancel': return 'text-red-900';
      case 'delay': return 'text-orange-900';
      default: return 'text-gray-900';
    }
  }

  getSubtitleClass(): string {
    switch (this.data.action) {
      case 'complete': return 'text-green-600';
      case 'start': return 'text-blue-600';
      case 'cancel': return 'text-red-600';
      case 'delay': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  }

  getTitle(): string {
    switch (this.data.action) {
      case 'complete': return 'Complete Pickup';
      case 'start': return 'Start Pickup';
      case 'cancel': return 'Cancel Pickup';
      case 'delay': return 'Mark as Delayed';
      default: return 'Update Status';
    }
  }

  getActionIcon(): string {
    switch (this.data.action) {
      case 'complete': return 'check_circle';
      case 'start': return 'play_arrow';
      case 'cancel': return 'cancel';
      case 'delay': return 'schedule';
      default: return 'update';
    }
  }

  getButtonColor(): string {
    switch (this.data.action) {
      case 'complete': return 'primary';
      case 'start': return 'primary';
      case 'cancel': return 'warn';
      case 'delay': return 'accent';
      default: return 'primary';
    }
  }

  getButtonText(): string {
    switch (this.data.action) {
      case 'complete': return 'Complete Pickup';
      case 'start': return 'Start Pickup';
      case 'cancel': return 'Cancel Pickup';
      case 'delay': return 'Mark Delayed';
      default: return 'Update';
    }
  }

  isValid(): boolean {
    switch (this.data.action) {
      case 'complete':
        return this.itemsReceived !== null && this.itemsReceived >= 0;
      case 'cancel':
      case 'delay':
        return this.completionNotes.trim().length > 0;
      case 'start':
        return true;
      default:
        return true;
    }
  }

  getNewStatus(): string {
    switch (this.data.action) {
      case 'complete': return 'completed';
      case 'start': return 'in-progress';
      case 'cancel': return 'cancelled';
      case 'delay': return 'delayed';
      default: return this.data.pickup.status;
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    const result: PickupStatusDialogResult = {
      status: this.getNewStatus(),
      itemsReceived: this.data.action === 'complete' ? (this.itemsReceived ?? undefined) : undefined,
      completionNotes: this.completionNotes || undefined
    };
    this.dialogRef.close(result);
  }
}
