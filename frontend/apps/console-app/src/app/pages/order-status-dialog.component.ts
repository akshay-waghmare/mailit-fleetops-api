import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { OrderRecord } from '../../../../../libs/shared/order.interface';

@Component({
  selector: 'app-order-status-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  template: `
    <div class="p-6">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <mat-icon class="text-blue-600">update</mat-icon>
        </div>
        <div>
          <h2 class="text-xl font-semibold text-slate-900">Update Order Status</h2>
          <p class="text-slate-600">Order ID: {{data.order_id}}</p>
        </div>
      </div>

      <form [formGroup]="statusForm" (ngSubmit)="onUpdate()" class="space-y-4">
        <div class="bg-slate-50 rounded-lg p-4 mb-4">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-sm font-medium text-slate-700">Current Status:</span>
              <div class="flex items-center gap-2 mt-1">
                <span [class]="getStatusChipClass(data.status)" class="px-3 py-1 rounded-full text-sm font-medium">
                  {{getStatusLabel(data.status)}}
                </span>
              </div>
            </div>
            <mat-icon class="text-slate-400">arrow_forward</mat-icon>
          </div>
        </div>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>New Status</mat-label>
          <mat-select formControlName="newStatus" required>
            <mat-option value="pending">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 bg-yellow-500 rounded-full"></span>
                Pending
              </div>
            </mat-option>
            <mat-option value="confirmed">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
                Confirmed
              </div>
            </mat-option>
            <mat-option value="picked-up">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 bg-purple-500 rounded-full"></span>
                Picked Up
              </div>
            </mat-option>
            <mat-option value="in-transit">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 bg-orange-500 rounded-full"></span>
                In Transit
              </div>
            </mat-option>
            <mat-option value="delivered">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                Delivered
              </div>
            </mat-option>
            <mat-option value="cancelled">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 bg-red-500 rounded-full"></span>
                Cancelled
              </div>
            </mat-option>
            <mat-option value="returned">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 bg-gray-500 rounded-full"></span>
                Returned
              </div>
            </mat-option>
          </mat-select>
        </mat-form-field>

        <div *ngIf="error" class="bg-red-50 border border-red-200 rounded-lg p-3">
          <div class="flex items-center gap-2 text-red-800">
            <mat-icon class="text-red-600 text-sm">error</mat-icon>
            <span class="text-sm">{{error}}</span>
          </div>
        </div>

        <div class="flex gap-3 justify-end pt-4">
          <button mat-stroked-button type="button" (click)="onCancel()" [disabled]="loading">
            Cancel
          </button>
          <button mat-flat-button color="primary" type="submit" [disabled]="statusForm.invalid || loading || statusForm.value.newStatus === data.status">
            <mat-spinner *ngIf="loading" diameter="16" class="mr-2"></mat-spinner>
            <mat-icon *ngIf="!loading">save</mat-icon>
            <span class="ml-2">{{loading ? 'Updating...' : 'Update Status'}}</span>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .mat-mdc-form-field {
      font-size: 14px;
    }
    
    ::ng-deep .mat-mdc-dialog-container {
      border-radius: 12px;
    }
  `]
})
export class OrderStatusDialogComponent {
  statusForm: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<OrderStatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: OrderRecord
  ) {
    this.statusForm = this.fb.group({
      newStatus: ['', Validators.required]
    });
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pending',
      'confirmed': 'Confirmed', 
      'picked-up': 'Picked Up',
      'in-transit': 'In Transit',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled',
      'returned': 'Returned'
    };
    return statusMap[status] || status;
  }

  getStatusChipClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'picked-up': 'bg-purple-100 text-purple-800',
      'in-transit': 'bg-orange-100 text-orange-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'returned': 'bg-gray-100 text-gray-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }

  onUpdate(): void {
    if (this.statusForm.invalid) return;
    
    const newStatus = this.statusForm.value.newStatus;
    if (newStatus === this.data.status) {
      this.error = 'Please select a different status';
      return;
    }

    this.loading = true;
    this.error = null;

    // Return the new status to the parent component
    this.dialogRef.close({
      orderId: this.data.id,
      newStatus: newStatus,
      previousStatus: this.data.status
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
