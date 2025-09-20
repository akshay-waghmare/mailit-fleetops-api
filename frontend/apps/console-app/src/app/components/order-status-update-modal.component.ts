import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { OrderRecord, OrderService } from '../../../../../libs/shared';

@Component({
  selector: 'app-order-status-update-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatChipsModule
  ],
  template: `
    <!-- Modal Header -->
    <div mat-dialog-title class="flex items-center justify-between bg-gradient-to-r from-green-50 to-green-100 p-6 m-[-24px_-24px_0_-24px]">
      <div class="flex items-center gap-3">
        <mat-icon class="text-green-600">sync</mat-icon>
        <div>
          <h2 class="text-xl font-semibold text-slate-900 m-0">Update Order Status</h2>
          <p class="text-sm text-slate-600 m-0 mt-1">Change the current status of order {{order.order_id}}</p>
        </div>
      </div>
      <button mat-icon-button (click)="onCancel()" class="text-slate-500 hover:text-slate-700">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <!-- Modal Content -->
    <mat-dialog-content class="py-6">
      
      <!-- Current Status Display -->
      <div class="mb-6 p-4 bg-slate-50 rounded-lg">
        <h3 class="text-sm font-medium text-slate-700 mb-2">Current Status</h3>
        <div class="flex items-center gap-3">
          <mat-chip-set>
            <mat-chip [class]="getStatusChipClass(order.status)">
              <mat-icon matChipIcon>{{getStatusIcon(order.status)}}</mat-icon>
              {{getStatusDisplayName(order.status)}}
            </mat-chip>
          </mat-chip-set>
          <span class="text-sm text-slate-500">
            Last updated: {{order.updated_at | date:'medium'}}
          </span>
        </div>
      </div>

      <!-- Order Information -->
      <div class="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 class="text-sm font-medium text-slate-700 mb-2">Order Details</h3>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="font-medium text-slate-600">Order ID:</span>
            <span class="ml-2 text-slate-900">{{order.order_id}}</span>
          </div>
          <div>
            <span class="font-medium text-slate-600">Client:</span>
            <span class="ml-2 text-slate-900">{{order.client_name}}</span>
          </div>
          <div>
            <span class="font-medium text-slate-600">Receiver:</span>
            <span class="ml-2 text-slate-900">{{order.receiver_name}}</span>
          </div>
          <div>
            <span class="font-medium text-slate-600">Service:</span>
            <span class="ml-2 text-slate-900">{{order.service_type}}</span>
          </div>
        </div>
      </div>

      <!-- Status Update Form -->
      <form *ngIf="statusForm" [formGroup]="statusForm" class="space-y-4">
        
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>New Status</mat-label>
          <mat-select formControlName="newStatus" required>
            <mat-option value="PENDING">
              <div class="flex items-center gap-2">
                <mat-icon class="text-orange-500">schedule</mat-icon>
                <span>Pending</span>
              </div>
            </mat-option>
            <mat-option value="CONFIRMED">
              <div class="flex items-center gap-2">
                <mat-icon class="text-blue-500">check_circle</mat-icon>
                <span>Confirmed</span>
              </div>
            </mat-option>
            <mat-option value="PICKED_UP">
              <div class="flex items-center gap-2">
                <mat-icon class="text-purple-500">inbox</mat-icon>
                <span>Picked Up</span>
              </div>
            </mat-option>
            <mat-option value="IN_TRANSIT">
              <div class="flex items-center gap-2">
                <mat-icon class="text-yellow-500">local_shipping</mat-icon>
                <span>In Transit</span>
              </div>
            </mat-option>
            <mat-option value="DELIVERED">
              <div class="flex items-center gap-2">
                <mat-icon class="text-green-500">done_all</mat-icon>
                <span>Delivered</span>
              </div>
            </mat-option>
            <mat-option value="CANCELLED">
              <div class="flex items-center gap-2">
                <mat-icon class="text-red-500">cancel</mat-icon>
                <span>Cancelled</span>
              </div>
            </mat-option>
            <mat-option value="RETURNED">
              <div class="flex items-center gap-2">
                <mat-icon class="text-gray-500">keyboard_return</mat-icon>
                <span>Returned</span>
              </div>
            </mat-option>
          </mat-select>
          <mat-hint>Select the new status for this order</mat-hint>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Status Update Notes</mat-label>
          <textarea 
            matInput 
            formControlName="notes" 
            rows="3" 
            placeholder="Add any notes about this status change (optional)...">
          </textarea>
          <mat-hint>Provide additional context for this status change</mat-hint>
        </mat-form-field>

      </form>
    </mat-dialog-content>

    <!-- Modal Actions -->
    <mat-dialog-actions class="flex gap-3 justify-end p-6 bg-slate-50 border-t m-[0_-24px_-24px_-24px]">
      <button mat-stroked-button type="button" (click)="onCancel()" [disabled]="submitting">
        <mat-icon>close</mat-icon>
        Cancel
      </button>
      <button 
        mat-flat-button 
        color="primary" 
        (click)="onUpdateStatus()" 
        [disabled]="!isFormValid || submitting">
        <mat-spinner *ngIf="submitting" diameter="20" class="mr-2"></mat-spinner>
        <mat-icon *ngIf="!submitting">sync</mat-icon>
        <span class="ml-2">{{submitting ? 'Updating...' : 'Update Status'}}</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .mat-mdc-form-field {
      font-size: 14px;
    }
    
    ::ng-deep .mat-mdc-dialog-container {
      border-radius: 12px;
    }
    
    .mat-mdc-dialog-content {
      max-height: 70vh;
      overflow-y: auto;
    }

    // Status chip colors
    .status-pending {
      @apply bg-orange-100 text-orange-800;
    }
    .status-confirmed {
      @apply bg-blue-100 text-blue-800;
    }
    .status-picked-up {
      @apply bg-purple-100 text-purple-800;
    }
    .status-in-transit {
      @apply bg-yellow-100 text-yellow-800;
    }
    .status-delivered {
      @apply bg-green-100 text-green-800;
    }
    .status-cancelled {
      @apply bg-red-100 text-red-800;
    }
    .status-returned {
      @apply bg-gray-100 text-gray-800;
    }
  `]
})
export class OrderStatusUpdateModalComponent implements OnInit {
  statusForm: FormGroup | null = null;
  submitting = false;
  error: string | null = null;
  order: OrderRecord;

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    public dialogRef: MatDialogRef<OrderStatusUpdateModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { order: OrderRecord }
  ) {
    this.order = data.order;
  }

  get isFormValid(): boolean {
    return this.statusForm ? this.statusForm.valid : false;
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    console.log('🔧 Initializing status update form for order:', this.order);
    
    this.statusForm = this.fb.group({
      newStatus: [this.order.status, Validators.required],
      notes: ['']
    });
    
    console.log('✅ Status form initialized:', this.statusForm.value);
  }

  onUpdateStatus(): void {
    if (!this.statusForm || this.statusForm.invalid) {
      console.error('❌ Status form not valid');
      return;
    }

    const formValue = this.statusForm.value;
    const newStatus = formValue.newStatus;
    const notes = formValue.notes;

    // Check if status actually changed
    if (newStatus === this.order.status) {
      this.snackBar.open('Status is already set to ' + this.getStatusDisplayName(newStatus), 'Close', {
        duration: 3000,
        panelClass: ['info-snackbar']
      });
      return;
    }

    this.submitting = true;
    this.error = null;

    console.log('🚀 Updating order status:', {
      orderId: this.order.id,
      currentStatus: this.order.status,
      newStatus: newStatus,
      notes: notes
    });

    // Prepare update data - using the PATCH endpoint for status updates
    const updateData = {
      status: newStatus,
      // If notes are provided, we could add them to special_instructions or create a status_notes field
      ...(notes && notes.trim() && { special_instructions: notes.trim() })
    };

    this.orderService.patchOrder(this.order.id.toString(), updateData).subscribe({
      next: (updatedOrder: OrderRecord) => {
        this.submitting = false;
        console.log('✅ Order status updated successfully:', updatedOrder);
        
        this.snackBar.open(
          `Order status updated from ${this.getStatusDisplayName(this.order.status)} to ${this.getStatusDisplayName(newStatus)}`, 
          'Close', 
          {
            duration: 4000,
            panelClass: ['success-snackbar']
          }
        );
        
        // Return the updated order to the parent component
        this.dialogRef.close(updatedOrder);
      },
      error: (error: any) => {
        console.error('❌ Error updating order status:', error);
        this.submitting = false;
        this.error = 'Failed to update order status. Please try again.';
        this.snackBar.open('Failed to update order status. Please try again.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  // Helper methods for status display
  getStatusDisplayName(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Pending',
      'CONFIRMED': 'Confirmed',
      'PICKED_UP': 'Picked Up',
      'IN_TRANSIT': 'In Transit',
      'DELIVERED': 'Delivered',
      'CANCELLED': 'Cancelled',
      'RETURNED': 'Returned'
    };
    return statusMap[status] || status;
  }

  getStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      'PENDING': 'schedule',
      'CONFIRMED': 'check_circle',
      'PICKED_UP': 'inbox',
      'IN_TRANSIT': 'local_shipping',
      'DELIVERED': 'done_all',
      'CANCELLED': 'cancel',
      'RETURNED': 'keyboard_return'
    };
    return iconMap[status] || 'help';
  }

  getStatusChipClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'PENDING': 'status-pending',
      'CONFIRMED': 'status-confirmed',
      'PICKED_UP': 'status-picked-up',
      'IN_TRANSIT': 'status-in-transit',
      'DELIVERED': 'status-delivered',
      'CANCELLED': 'status-cancelled',
      'RETURNED': 'status-returned'
    };
    return classMap[status] || 'status-pending';
  }
}
