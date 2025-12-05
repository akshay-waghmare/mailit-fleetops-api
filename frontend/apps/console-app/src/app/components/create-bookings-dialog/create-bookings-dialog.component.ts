import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { PickupRecord } from '../../../../../../libs/shared/pickup.interface';

export interface CreateBookingsDialogData {
  pickup: PickupRecord;
}

export interface BookingItem {
  index: number;
  selected: boolean;
  // Sender info (shared from pickup, but editable)
  senderName: string;
  senderAddress: string;
  senderContact: string;
  // Receiver info
  receiverName: string;
  receiverAddress: string;
  receiverContact: string;
  receiverPincode: string;
  receiverCity: string;
  receiverState: string;
  weight: number;
  description: string;
  serviceType: 'EXPRESS' | 'STANDARD' | 'ECONOMY';
  declaredValue: number;
  codAmount: number;
  specialInstructions: string;
}

export interface CreateBookingsResult {
  bookings: BookingItem[];
  pickupId: string;
}

@Component({
  selector: 'app-create-bookings-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatStepperModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatExpansionModule
  ],
  template: `
    <div class="bg-white rounded-lg overflow-hidden max-h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="px-6 py-4 border-b bg-blue-50 border-blue-200 flex-shrink-0">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <mat-icon class="text-blue-600">local_shipping</mat-icon>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-blue-900 m-0">Create Bookings from Pickup</h2>
              <p class="text-sm text-blue-600 mt-1">{{ data.pickup.pickupId }} • {{ data.pickup.itemsReceived || data.pickup.itemCount }} items received</p>
            </div>
          </div>
          <button mat-icon-button (click)="onCancel()" class="text-gray-400 hover:text-gray-600">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>

      <!-- Pickup Summary -->
      <div class="px-6 py-3 bg-gray-50 border-b flex-shrink-0">
        <div class="grid grid-cols-4 gap-4 text-sm">
          <div>
            <span class="text-gray-500">Client:</span>
            <span class="ml-1 font-medium">{{ data.pickup.clientName }}</span>
          </div>
          <div>
            <span class="text-gray-500">From:</span>
            <span class="ml-1 font-medium">{{ data.pickup.pickupAddress | slice:0:30 }}...</span>
          </div>
          <div>
            <span class="text-gray-500">Items:</span>
            <span class="ml-1 font-medium">{{ totalItems }}</span>
          </div>
          <div>
            <span class="text-gray-500">Selected:</span>
            <span class="ml-1 font-medium text-blue-600">{{ selectedCount }}</span>
          </div>
        </div>
      </div>

      <!-- Content - Scrollable -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- Quick Actions -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-2">
            <mat-checkbox 
              [checked]="allSelected" 
              [indeterminate]="someSelected && !allSelected"
              (change)="toggleSelectAll($event.checked)">
              Select All
            </mat-checkbox>
            <span class="text-sm text-gray-500">({{ selectedCount }} of {{ totalItems }} selected)</span>
          </div>
          <div class="flex items-center space-x-2">
            <button mat-stroked-button (click)="applyToAll()" [disabled]="selectedCount === 0" class="text-sm">
              <mat-icon class="mr-1">content_copy</mat-icon>
              Apply First to All
            </button>
          </div>
        </div>

        <!-- Booking Items -->
        <div class="space-y-4">
          <mat-accordion multi>
            <mat-expansion-panel *ngFor="let item of bookingItems; let i = index" 
                                 [expanded]="item.selected && expandedPanels[i]"
                                 class="border rounded-lg"
                                 [class.border-blue-300]="item.selected"
                                 [class.bg-blue-50]="item.selected">
              <mat-expansion-panel-header>
                <mat-panel-title class="flex items-center">
                  <mat-checkbox 
                    [(ngModel)]="item.selected" 
                    (click)="$event.stopPropagation()"
                    (change)="onItemSelectionChange()">
                  </mat-checkbox>
                  <span class="ml-2 font-medium">Booking #{{ i + 1 }}</span>
                  <span *ngIf="item.receiverName" class="ml-2 text-gray-500">→ {{ item.receiverName }}</span>
                </mat-panel-title>
                <mat-panel-description class="flex items-center">
                  <span class="text-sm" [class.text-green-600]="isItemValid(item)" [class.text-red-600]="!isItemValid(item) && item.selected">
                    {{ isItemValid(item) ? '✓ Ready' : '○ Incomplete' }}
                  </span>
                </mat-panel-description>
              </mat-expansion-panel-header>

              <div class="p-4 bg-white rounded-b-lg">
                <!-- Sender Information (Pre-filled from pickup) -->
                <div class="mb-4">
                  <h4 class="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <mat-icon class="mr-1 text-gray-500" style="font-size: 18px;">store</mat-icon>
                    Sender Information
                  </h4>
                  <div class="grid grid-cols-3 gap-4">
                    <mat-form-field class="w-full">
                      <mat-label>Sender Name</mat-label>
                      <input matInput [(ngModel)]="item.senderName" required>
                    </mat-form-field>
                    <mat-form-field class="w-full">
                      <mat-label>Sender Contact</mat-label>
                      <input matInput [(ngModel)]="item.senderContact" required placeholder="e.g., 9876543210">
                    </mat-form-field>
                    <mat-form-field class="w-full col-span-3">
                      <mat-label>Sender Address</mat-label>
                      <textarea matInput [(ngModel)]="item.senderAddress" rows="2" required></textarea>
                    </mat-form-field>
                  </div>
                </div>

                <!-- Receiver Information -->
                <div class="mb-4">
                  <h4 class="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <mat-icon class="mr-1 text-gray-500" style="font-size: 18px;">person</mat-icon>
                    Receiver Information
                  </h4>
                  <div class="grid grid-cols-2 gap-4">
                    <mat-form-field class="w-full">
                      <mat-label>Receiver Name</mat-label>
                      <input matInput [(ngModel)]="item.receiverName" required>
                    </mat-form-field>
                    <mat-form-field class="w-full">
                      <mat-label>Contact Number</mat-label>
                      <input matInput [(ngModel)]="item.receiverContact" required>
                    </mat-form-field>
                    <mat-form-field class="w-full col-span-2">
                      <mat-label>Address</mat-label>
                      <textarea matInput [(ngModel)]="item.receiverAddress" rows="2" required></textarea>
                    </mat-form-field>
                    <mat-form-field class="w-full">
                      <mat-label>City</mat-label>
                      <input matInput [(ngModel)]="item.receiverCity" required>
                    </mat-form-field>
                    <mat-form-field class="w-full">
                      <mat-label>Pincode</mat-label>
                      <input matInput [(ngModel)]="item.receiverPincode" required>
                    </mat-form-field>
                    <mat-form-field class="w-full">
                      <mat-label>State</mat-label>
                      <input matInput [(ngModel)]="item.receiverState">
                    </mat-form-field>
                  </div>
                </div>

                <!-- Package & Service Details -->
                <div class="mb-4">
                  <h4 class="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <mat-icon class="mr-1 text-gray-500" style="font-size: 18px;">inventory_2</mat-icon>
                    Package & Service
                  </h4>
                  <div class="grid grid-cols-3 gap-4">
                    <mat-form-field class="w-full">
                      <mat-label>Weight (kg)</mat-label>
                      <input matInput type="number" [(ngModel)]="item.weight" min="0.1" step="0.1">
                    </mat-form-field>
                    <mat-form-field class="w-full">
                      <mat-label>Service Type</mat-label>
                      <mat-select [(ngModel)]="item.serviceType">
                        <mat-option value="EXPRESS">Express</mat-option>
                        <mat-option value="STANDARD">Standard</mat-option>
                        <mat-option value="ECONOMY">Economy</mat-option>
                      </mat-select>
                    </mat-form-field>
                    <mat-form-field class="w-full">
                      <mat-label>Declared Value (₹)</mat-label>
                      <input matInput type="number" [(ngModel)]="item.declaredValue" min="0">
                    </mat-form-field>
                    <mat-form-field class="w-full col-span-2">
                      <mat-label>Item Description</mat-label>
                      <input matInput [(ngModel)]="item.description">
                    </mat-form-field>
                    <mat-form-field class="w-full">
                      <mat-label>COD Amount (₹)</mat-label>
                      <input matInput type="number" [(ngModel)]="item.codAmount" min="0">
                    </mat-form-field>
                    <mat-form-field class="w-full col-span-3">
                      <mat-label>Special Instructions</mat-label>
                      <input matInput [(ngModel)]="item.specialInstructions">
                    </mat-form-field>
                  </div>
                </div>
              </div>
            </mat-expansion-panel>
          </mat-accordion>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 bg-gray-50 border-t flex justify-between items-center flex-shrink-0">
        <div class="text-sm text-gray-600">
          <span class="font-medium text-blue-600">{{ validSelectedCount }}</span> of {{ selectedCount }} bookings ready
        </div>
        <div class="flex space-x-3">
          <button mat-stroked-button (click)="onCancel()">
            Cancel
          </button>
          <button 
            mat-raised-button 
            color="primary"
            (click)="onConfirm()"
            [disabled]="validSelectedCount === 0 || isSubmitting">
            <mat-icon class="mr-1" *ngIf="!isSubmitting">add_shopping_cart</mat-icon>
            <mat-spinner diameter="20" *ngIf="isSubmitting" class="mr-2"></mat-spinner>
            Create {{ validSelectedCount }} Booking{{ validSelectedCount !== 1 ? 's' : '' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 900px;
      max-width: 95vw;
    }
    
    /* Form field styling to match pickup form */
    .mat-mdc-form-field {
      font-size: 14px;
      width: 100%;
    }
    
    /* Ensure labels are visible */
    ::ng-deep .mat-mdc-text-field-wrapper {
      background-color: #f8fafc !important;
    }
    
    ::ng-deep .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }
    
    ::ng-deep .mat-expansion-panel-body {
      padding: 0 !important;
    }
    
    /* Grid span helpers */
    .col-span-2 {
      grid-column: span 2 / span 2;
    }
    
    .col-span-3 {
      grid-column: span 3 / span 3;
    }
  `]
})
export class CreateBookingsDialogComponent implements OnInit {
  bookingItems: BookingItem[] = [];
  expandedPanels: boolean[] = [];
  isSubmitting = false;

  constructor(
    public dialogRef: MatDialogRef<CreateBookingsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CreateBookingsDialogData
  ) {}

  ngOnInit() {
    this.initializeBookingItems();
  }

  private initializeBookingItems() {
    const itemCount = this.data.pickup.itemsReceived || this.data.pickup.itemCount || 1;
    const weightPerItem = (this.data.pickup.totalWeight || 1) / itemCount;

    for (let i = 0; i < itemCount; i++) {
      this.bookingItems.push({
        index: i,
        selected: true,
        // Sender info pre-filled from pickup
        senderName: this.data.pickup.clientName || '',
        senderAddress: this.data.pickup.pickupAddress || '',
        senderContact: this.data.pickup.contactNumber || '',
        // Receiver info (to be filled by user)
        receiverName: '',
        receiverAddress: '',
        receiverContact: '',
        receiverPincode: '',
        receiverCity: '',
        receiverState: '',
        weight: Math.round(weightPerItem * 10) / 10,
        description: this.data.pickup.itemDescription || '',
        serviceType: 'STANDARD',
        declaredValue: 0,
        codAmount: 0,
        specialInstructions: ''
      });
      this.expandedPanels.push(i === 0); // Only first panel expanded by default
    }
  }

  get totalItems(): number {
    return this.bookingItems.length;
  }

  get selectedCount(): number {
    return this.bookingItems.filter(item => item.selected).length;
  }

  get validSelectedCount(): number {
    return this.bookingItems.filter(item => item.selected && this.isItemValid(item)).length;
  }

  get allSelected(): boolean {
    return this.bookingItems.every(item => item.selected);
  }

  get someSelected(): boolean {
    return this.bookingItems.some(item => item.selected);
  }

  isItemValid(item: BookingItem): boolean {
    return !!(
      item.senderName?.trim() &&
      item.senderAddress?.trim() &&
      item.senderContact?.trim() &&
      item.receiverName?.trim() &&
      item.receiverAddress?.trim() &&
      item.receiverContact?.trim() &&
      item.receiverPincode?.trim() &&
      item.receiverCity?.trim()
    );
  }

  toggleSelectAll(selected: boolean) {
    this.bookingItems.forEach(item => item.selected = selected);
  }

  onItemSelectionChange() {
    // Optional: could add logic here
  }

  applyToAll() {
    const firstItem = this.bookingItems.find(item => item.selected);
    if (!firstItem) return;

    this.bookingItems.forEach((item, index) => {
      if (item.selected && index > 0) {
        // Copy all fields from first item to other selected items
        // Sender info
        item.senderName = firstItem.senderName;
        item.senderAddress = firstItem.senderAddress;
        item.senderContact = firstItem.senderContact;
        // Receiver info
        item.receiverName = firstItem.receiverName;
        item.receiverAddress = firstItem.receiverAddress;
        item.receiverContact = firstItem.receiverContact;
        item.receiverPincode = firstItem.receiverPincode;
        item.receiverCity = firstItem.receiverCity;
        item.receiverState = firstItem.receiverState;
        // Package details
        item.weight = firstItem.weight;
        item.description = firstItem.description;
        item.serviceType = firstItem.serviceType;
        item.declaredValue = firstItem.declaredValue;
        item.codAmount = firstItem.codAmount;
        item.specialInstructions = firstItem.specialInstructions;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    const selectedBookings = this.bookingItems.filter(
      item => item.selected && this.isItemValid(item)
    );

    if (selectedBookings.length === 0) return;

    const result: CreateBookingsResult = {
      bookings: selectedBookings,
      pickupId: this.data.pickup.pickupId
    };

    this.dialogRef.close(result);
  }
}
