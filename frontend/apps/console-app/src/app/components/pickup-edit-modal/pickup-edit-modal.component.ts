import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-pickup-edit-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule
  ],
  template: `
    <div class="pickup-edit-modal">
      <!-- Header with gradient background -->
      <div class="modal-header bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white p-6 rounded-t-lg">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <mat-icon class="text-2xl">edit_location</mat-icon>
            <div>
              <h2 class="text-xl font-bold">Edit Pickup</h2>
              <p class="text-blue-100 text-sm">Modify pickup details and schedule</p>
            </div>
          </div>
          <button mat-icon-button (click)="onCancel()" class="text-white hover:bg-white/20 rounded-full">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>

      <!-- Form Content -->
      <div class="modal-content p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
        <form [formGroup]="editForm" (ngSubmit)="onSave()">
          
          <!-- Customer Information Section -->
          <div class="section-card bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 mb-6">
            <div class="section-header">
              <mat-icon class="section-icon text-blue-600">person</mat-icon>
              <h3 class="section-title">Customer Information</h3>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Customer Name</mat-label>
                <input matInput formControlName="customerName" placeholder="Enter customer name">
                <mat-icon matSuffix>person</mat-icon>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Customer Phone</mat-label>
                <input matInput formControlName="customerPhone" placeholder="Enter phone number">
                <mat-icon matSuffix>phone</mat-icon>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="w-full md:col-span-2">
                <mat-label>Customer Email</mat-label>
                <input matInput formControlName="customerEmail" type="email" placeholder="Enter email address">
                <mat-icon matSuffix>email</mat-icon>
              </mat-form-field>
            </div>
          </div>

          <!-- Pickup Details Section -->
          <div class="section-card bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 mb-6">
            <div class="section-header">
              <mat-icon class="section-icon text-green-600">location_on</mat-icon>
              <h3 class="section-title">Pickup Details</h3>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <mat-form-field appearance="outline" class="w-full md:col-span-2">
                <mat-label>Pickup Address</mat-label>
                <textarea matInput formControlName="pickupAddress" rows="2" placeholder="Enter pickup address"></textarea>
                <mat-icon matSuffix>place</mat-icon>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Pickup Date</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="pickupDate">
                <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Pickup Time</mat-label>
                <input matInput formControlName="pickupTime" type="time">
                <mat-icon matSuffix>schedule</mat-icon>
              </mat-form-field>
            </div>
          </div>

          <!-- Service Details Section -->
          <div class="section-card bg-gradient-to-r from-purple-50 to-violet-50 border-l-4 border-purple-500 mb-6">
            <div class="section-header">
              <mat-icon class="section-icon text-purple-600">local_shipping</mat-icon>
              <h3 class="section-title">Service Details</h3>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Service Type</mat-label>
                <mat-select formControlName="serviceType">
                  <mat-option value="standard">Standard Pickup</mat-option>
                  <mat-option value="express">Express Pickup</mat-option>
                  <mat-option value="same-day">Same Day Pickup</mat-option>
                  <mat-option value="scheduled">Scheduled Pickup</mat-option>
                </mat-select>
                <mat-icon matSuffix>local_shipping</mat-icon>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Status</mat-label>
                <mat-select formControlName="status">
                  <mat-option value="pending">
                    <div class="flex items-center">
                      <mat-icon class="mr-2 text-orange-500">schedule</mat-icon>
                      Pending
                    </div>
                  </mat-option>
                  <mat-option value="confirmed">
                    <div class="flex items-center">
                      <mat-icon class="mr-2 text-blue-500">check_circle</mat-icon>
                      Confirmed
                    </div>
                  </mat-option>
                  <mat-option value="in-progress">
                    <div class="flex items-center">
                      <mat-icon class="mr-2 text-yellow-500">local_shipping</mat-icon>
                      In Progress
                    </div>
                  </mat-option>
                  <mat-option value="completed">
                    <div class="flex items-center">
                      <mat-icon class="mr-2 text-green-500">check_circle</mat-icon>
                      Completed
                    </div>
                  </mat-option>
                  <mat-option value="cancelled">
                    <div class="flex items-center">
                      <mat-icon class="mr-2 text-red-500">cancel</mat-icon>
                      Cancelled
                    </div>
                  </mat-option>
                </mat-select>
                <mat-icon matSuffix>flag</mat-icon>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Priority</mat-label>
                <mat-select formControlName="priority">
                  <mat-option value="low">Low</mat-option>
                  <mat-option value="medium">Medium</mat-option>
                  <mat-option value="high">High</mat-option>
                  <mat-option value="urgent">Urgent</mat-option>
                </mat-select>
                <mat-icon matSuffix>priority_high</mat-icon>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Estimated Weight (kg)</mat-label>
                <input matInput formControlName="estimatedWeight" type="number" placeholder="0.0">
                <mat-icon matSuffix>scale</mat-icon>
              </mat-form-field>
            </div>
          </div>

          <!-- Additional Information Section -->
          <div class="section-card bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 mb-6">
            <div class="section-header">
              <mat-icon class="section-icon text-amber-600">note</mat-icon>
              <h3 class="section-title">Additional Information</h3>
            </div>
            
            <div class="grid grid-cols-1 gap-4">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Special Instructions</mat-label>
                <textarea matInput formControlName="specialInstructions" rows="3" placeholder="Enter any special instructions..."></textarea>
                <mat-icon matSuffix>info</mat-icon>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Items Description</mat-label>
                <textarea matInput formControlName="itemsDescription" rows="2" placeholder="Describe the items to be picked up..."></textarea>
                <mat-icon matSuffix>inventory_2</mat-icon>
              </mat-form-field>
            </div>
          </div>

        </form>
      </div>

      <!-- Footer Actions -->
      <div class="modal-footer border-t bg-gray-50 px-6 py-4 rounded-b-lg">
        <div class="flex justify-between items-center">
          <div class="text-sm text-gray-500">
            <mat-icon class="text-base mr-1">info</mat-icon>
            Last updated: {{ pickup.updatedAt | date:'short' }}
          </div>
          
          <div class="flex space-x-3">
            <button mat-stroked-button (click)="onCancel()" class="px-6">
              <mat-icon class="mr-2">close</mat-icon>
              Cancel
            </button>
            <button mat-flat-button 
                    color="primary" 
                    (click)="onSave()" 
                    [disabled]="editForm.invalid || isSaving"
                    class="px-6 bg-gradient-to-r from-blue-600 to-purple-600">
              <mat-icon class="mr-2">{{ isSaving ? 'hourglass_empty' : 'save' }}</mat-icon>
              {{ isSaving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pickup-edit-modal {
      width: 100%;
      max-width: 800px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      overflow: hidden;
    }

    .section-card {
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .section-header {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(0,0,0,0.1);
    }

    .section-icon {
      margin-right: 12px;
      font-size: 20px;
    }

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #374151;
      margin: 0;
    }

    .mat-mdc-form-field {
      margin-bottom: 8px;
    }

    .mat-mdc-form-field-appearance-outline .mat-mdc-form-field-outline {
      border-radius: 6px;
    }

    .modal-footer {
      position: sticky;
      bottom: 0;
      background: white;
      z-index: 10;
    }

    .mat-mdc-option {
      padding: 8px 16px;
    }

    .mat-mdc-option .mat-icon {
      margin-right: 8px;
      font-size: 18px;
    }

    /* Custom gradient button styles */
    .mat-mdc-flat-button {
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%) !important;
      color: white !important;
    }

    .mat-mdc-flat-button:hover {
      background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%) !important;
    }

    .mat-mdc-flat-button:disabled {
      background: #e5e7eb !important;
      color: #9ca3af !important;
    }
  `]
})
export class PickupEditModalComponent implements OnInit {
  editForm: FormGroup;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PickupEditModalComponent>,
    @Inject(MAT_DIALOG_DATA) public pickup: any
  ) {
    this.editForm = this.fb.group({
      customerName: [pickup?.customerName || '', [Validators.required]],
      customerPhone: [pickup?.customerPhone || '', [Validators.required]],
      customerEmail: [pickup?.customerEmail || '', [Validators.email]],
      pickupAddress: [pickup?.pickupAddress || '', [Validators.required]],
      pickupDate: [pickup?.pickupDate || new Date(), [Validators.required]],
      pickupTime: [pickup?.pickupTime || '', [Validators.required]],
      serviceType: [pickup?.serviceType || 'standard', [Validators.required]],
      status: [pickup?.status || 'pending', [Validators.required]],
      priority: [pickup?.priority || 'medium'],
      estimatedWeight: [pickup?.estimatedWeight || 0],
      specialInstructions: [pickup?.specialInstructions || ''],
      itemsDescription: [pickup?.itemsDescription || '']
    });
  }

  ngOnInit(): void {
    // Any additional initialization logic
  }

  onSave(): void {
    if (this.editForm.valid) {
      this.isSaving = true;
      
      const updatedPickup = {
        ...this.pickup,
        ...this.editForm.value,
        updatedAt: new Date()
      };

      // Simulate save operation
      setTimeout(() => {
        this.isSaving = false;
        this.dialogRef.close(updatedPickup);
      }, 1500);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
