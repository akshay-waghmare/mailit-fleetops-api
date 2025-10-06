import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PickupRecord } from '../../../../../libs/shared/pickup.interface';

@Component({
  selector: 'app-pickup-view-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule
  ],
  template: `
    <div class="pickup-view-modal bg-white">
      <!-- Clean Header with light green background -->
      <div mat-dialog-title class="flex items-center justify-between p-6 border-b border-green-200 bg-green-50">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <mat-icon class="text-green-600">local_shipping</mat-icon>
          </div>
          <div>
            <h2 class="text-lg font-semibold text-green-900 m-0">Pickup Details</h2>
            <p class="text-sm text-green-600 mt-1">{{ pickup.pickupId }}</p>
          </div>
        </div>
        <button 
          mat-icon-button 
          (click)="onClose()" 
          class="text-green-400 hover:text-green-600">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Content Container -->
      <div class="p-6">
        <!-- Quick Overview Cards (matching the order modal style) -->
        <div class="grid grid-cols-3 gap-4 mb-6">
          <!-- Status Card -->
          <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <div class="flex items-center space-x-2">
              <mat-icon class="text-green-600">{{ getStatusIcon() }}</mat-icon>
              <div>
                <p class="text-xs text-green-600 font-medium uppercase tracking-wide">Status</p>
                <p class="text-sm font-semibold text-green-800 capitalize">{{ pickup.status }}</p>
              </div>
            </div>
          </div>

          <!-- Type Card -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-center space-x-2">
              <mat-icon class="text-blue-600">{{ getTypeIcon() }}</mat-icon>
              <div>
                <p class="text-xs text-blue-600 font-medium uppercase tracking-wide">Total Amount</p>
                <p class="text-sm font-semibold text-blue-800">₹{{ pickup.estimatedCost || '0.00' }}</p>
              </div>
            </div>
          </div>

          <!-- Weight Card -->
          <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div class="flex items-center space-x-2">
              <mat-icon class="text-purple-600">scale</mat-icon>
              <div>
                <p class="text-xs text-purple-600 font-medium uppercase tracking-wide">Weight</p>
                <p class="text-sm font-semibold text-purple-800">{{ pickup.totalWeight || '0' }}kg</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Customer Information Section -->
        <div class="border border-gray-200 rounded-lg overflow-hidden mb-6">
          <div class="bg-orange-50 px-4 py-3 border-b border-orange-200">
            <div class="flex items-center space-x-2">
              <mat-icon class="text-orange-600">person</mat-icon>
              <h3 class="text-sm font-medium text-orange-800">Customer Information</h3>
            </div>
          </div>
          <div class="p-4 bg-white">
            <div class="grid grid-cols-3 gap-4">
              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Name</p>
                <p class="text-sm font-semibold text-gray-900">{{ pickup.clientName }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Company</p>
                <p class="text-sm font-semibold text-gray-900">{{ pickup.clientCompany || 'N/A' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Contact</p>
                <p class="text-sm font-semibold text-gray-900">{{ pickup.contactNumber || 'N/A' }}</p>
              </div>
              <div class="col-span-3">
                <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Address</p>
                <p class="text-sm text-gray-700">{{ pickup.pickupAddress }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Pickup Information Section -->
        <div class="border border-gray-200 rounded-lg overflow-hidden mb-6">
          <div class="bg-green-50 px-4 py-3 border-b border-green-200">
            <div class="flex items-center space-x-2">
              <mat-icon class="text-green-600">location_on</mat-icon>
              <h3 class="text-sm font-medium text-green-800">Pickup Information</h3>
            </div>
          </div>
          <div class="p-4 bg-white">
            <div class="grid grid-cols-3 gap-4">
              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Service Type</p>
                <p class="text-sm font-semibold text-gray-900 capitalize">{{ pickup.pickupType || 'Standard' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Pickup Date</p>
                <p class="text-sm font-semibold text-gray-900">{{ pickup.pickupDate | date:'MMM dd, yyyy' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Pickup Time</p>
                <p class="text-sm font-semibold text-gray-900">{{ pickup.pickupTime || 'Flexible' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Assigned Staff</p>
                <p class="text-sm font-semibold text-gray-900">{{ pickup.assignedStaff || 'Not assigned' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Staff Department</p>
                <p class="text-sm font-semibold text-gray-900">{{ pickup.staffDepartment || 'N/A' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Estimated Duration</p>
                <p class="text-sm font-semibold text-gray-900">{{ pickup.estimatedDuration || 'N/A' }} mins</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Item Count</p>
                <p class="text-sm font-semibold text-gray-900">{{ pickup.itemCount || 'N/A' }} items</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Weight</p>
                <p class="text-sm font-semibold text-gray-900">{{ pickup.totalWeight || '0' }} kg</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Status Updated By</p>
                <p class="text-sm font-semibold text-gray-900">{{ pickup.statusUpdatedBy || 'System' }}</p>
              </div>
              <div class="col-span-3" *ngIf="pickup.itemDescription">
                <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Item Description</p>
                <p class="text-sm text-gray-700">{{ pickup.itemDescription }}</p>
              </div>
              <div class="col-span-3" *ngIf="pickup.specialInstructions">
                <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Special Instructions</p>
                <p class="text-sm text-gray-700">{{ pickup.specialInstructions }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Cost & Tracking Details Section -->
        <div class="border border-gray-200 rounded-lg overflow-hidden mb-6">
          <div class="bg-blue-50 px-4 py-3 border-b border-blue-200">
            <div class="flex items-center space-x-2">
              <mat-icon class="text-blue-600">receipt</mat-icon>
              <h3 class="text-sm font-medium text-blue-800">Cost & Tracking Details</h3>
            </div>
          </div>
          <div class="p-4 bg-white">
            <div class="grid grid-cols-3 gap-4">
              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Estimated Cost</p>
                <p class="text-sm font-semibold text-gray-900">₹{{ pickup.estimatedCost || '0.00' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Actual Cost</p>
                <p class="text-sm font-semibold text-gray-900">₹{{ pickup.actualCost || 'Pending' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Tracking ID</p>
                <p class="text-sm font-semibold text-gray-900">{{ pickup.pickupId }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Carrier</p>
                <p class="text-sm font-semibold text-gray-900">{{ pickup.carrierName || pickup.carrierId || 'Internal' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Created By</p>
                <p class="text-sm font-semibold text-gray-900">{{ pickup.createdBy || 'System' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Created At</p>
                <p class="text-sm font-semibold text-gray-900">{{ pickup.createdAt | date:'MMM dd, yyyy HH:mm' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Last Updated</p>
                <p class="text-sm font-semibold text-gray-900">{{ pickup.updatedAt | date:'MMM dd, yyyy HH:mm' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Status Updated At</p>
                <p class="text-sm font-semibold text-gray-900">{{ pickup.statusUpdatedAt | date:'MMM dd, yyyy HH:mm' }}</p>
              </div>
              <div *ngIf="pickup.rating">
                <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Customer Rating</p>
                <p class="text-sm font-semibold text-gray-900">{{ pickup.rating }}/5 ⭐</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Additional Information Section -->
        <div class="border border-gray-200 rounded-lg overflow-hidden" *ngIf="pickup.notes || pickup.customerFeedback">
          <div class="bg-purple-50 px-4 py-3 border-b border-purple-200">
            <div class="flex items-center space-x-2">
              <mat-icon class="text-purple-600">note</mat-icon>
              <h3 class="text-sm font-medium text-purple-800">Additional Information</h3>
            </div>
          </div>
          <div class="p-4 bg-white">
            <div class="grid grid-cols-1 gap-4">
              <div *ngIf="pickup.notes">
                <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Notes</p>
                <p class="text-sm text-gray-700">{{ pickup.notes }}</p>
              </div>
              <div *ngIf="pickup.customerFeedback">
                <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Customer Feedback</p>
                <p class="text-sm text-gray-700">{{ pickup.customerFeedback }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="p-6 border-t border-gray-200 bg-gray-50">
        <div class="flex justify-between items-center">
          <button mat-stroked-button color="primary" class="flex items-center space-x-2">
            <mat-icon>track_changes</mat-icon>
            <span>Track Pickup</span>
          </button>
          <button mat-flat-button color="primary" (click)="onClose()" class="px-6">
            Close
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pickup-view-modal {
      min-width: 700px;
      max-width: 900px;
      max-height: 90vh;
      overflow: hidden;
      background: white;
      border-radius: 8px;
    }
    
    .mat-mdc-dialog-title {
      padding: 0 !important;
      margin: 0 !important;
    }

    /* Clean button styles */
    .mat-mdc-button {
      border-radius: 6px;
    }

    .mat-mdc-flat-button {
      border-radius: 6px;
    }

    /* Custom scrollbar for content */
    .p-6::-webkit-scrollbar {
      width: 4px;
    }

    .p-6::-webkit-scrollbar-track {
      background: transparent;
    }

    .p-6::-webkit-scrollbar-thumb {
      background: #e5e7eb;
      border-radius: 2px;
    }

    .p-6::-webkit-scrollbar-thumb:hover {
      background: #d1d5db;
    }

    /* Smooth transitions */
    * {
      transition: all 0.2s ease;
    }
  `]
})
export class PickupViewModalComponent {
  pickup: PickupRecord;

  constructor(
    public dialogRef: MatDialogRef<PickupViewModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { pickup: PickupRecord }
  ) {
    this.pickup = data.pickup;
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onEdit(): void {
    this.dialogRef.close({ action: 'edit', pickup: this.pickup });
  }

  getStatusIcon(): string {
    switch (this.pickup.status?.toLowerCase()) {
      case 'scheduled':
        return 'schedule';
      case 'in_progress':
        return 'hourglass_empty';
      case 'completed':
        return 'check_circle';
      case 'cancelled':
        return 'cancel';
      default:
        return 'help';
    }
  }

  getTypeIcon(): string {
    switch (this.pickup.pickupType?.toLowerCase()) {
      case 'direct':
        return 'business';
      case 'vendor':
        return 'person';
      default:
        return 'local_shipping';
    }
  }
}
