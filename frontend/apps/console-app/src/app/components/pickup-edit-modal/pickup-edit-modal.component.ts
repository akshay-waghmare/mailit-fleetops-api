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
import { PickupService } from '../../../../../../libs/shared/pickup.service';
import { PickupRecord } from '../../../../../../libs/shared/pickup.interface';

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
      <!-- Header with light green background to match view modal -->
      <div class="modal-header bg-green-50 border-b border-green-200 p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <mat-icon class="text-green-600">edit</mat-icon>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-green-900 m-0">Edit Pickup</h2>
              <p class="text-sm text-green-600 mt-1">Modify pickup details</p>
            </div>
          </div>
          <button 
            mat-icon-button 
            (click)="onCancel()" 
            class="text-green-400 hover:text-green-600">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>

      <!-- Form Content -->
      <div class="modal-content p-6 max-h-[calc(100vh-200px)] overflow-y-auto bg-white">
        <form [formGroup]="editForm" (ngSubmit)="onSave()">
          
          <!-- Basic Information Section -->
          <div class="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <div class="flex items-center mb-4 pb-2 border-b border-gray-100">
              <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <mat-icon class="text-blue-600 text-lg">person</mat-icon>
              </div>
              <h3 class="text-sm font-semibold text-gray-900 m-0">Basic Information</h3>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Customer Name</mat-label>
                <input matInput formControlName="clientName" placeholder="Customer Name">
                <mat-icon matSuffix>person</mat-icon>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Status</mat-label>
                <mat-select formControlName="status">
                  <mat-option value="scheduled">Scheduled</mat-option>
                  <mat-option value="in-progress">In Progress</mat-option>
                  <mat-option value="completed">Completed</mat-option>
                  <mat-option value="cancelled">Cancelled</mat-option>
                  <mat-option value="delayed">Delayed</mat-option>
                </mat-select>
                <mat-icon matSuffix>flag</mat-icon>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="w-full md:col-span-2">
                <mat-label>Pickup Address</mat-label>
                <textarea matInput formControlName="pickupAddress" rows="2" placeholder="Complete pickup address"></textarea>
                <mat-icon matSuffix>place</mat-icon>
              </mat-form-field>
            </div>
          </div>

          <!-- Package Details Section -->
          <div class="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <div class="flex items-center mb-4 pb-2 border-b border-gray-100">
              <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <mat-icon class="text-green-600 text-lg">inventory_2</mat-icon>
              </div>
              <h3 class="text-sm font-semibold text-gray-900 m-0">Package Details</h3>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Item Count</mat-label>
                <input matInput formControlName="itemCount" type="number" placeholder="1" min="1">
                <mat-icon matSuffix>inventory</mat-icon>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Total Weight (kg)</mat-label>
                <input matInput formControlName="totalWeight" type="number" placeholder="0.5" step="0.1">
                <mat-icon matSuffix>scale</mat-icon>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Pickup Type</mat-label>
                <mat-select formControlName="pickupType">
                  <mat-option value="vendor">Vendor Pickup</mat-option>
                  <mat-option value="direct">Direct Pickup</mat-option>
                </mat-select>
                <mat-icon matSuffix>category</mat-icon>
              </mat-form-field>
            </div>
          </div>

          <!-- Schedule & Assignment Section -->
          <div class="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <div class="flex items-center mb-4 pb-2 border-b border-gray-100">
              <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <mat-icon class="text-purple-600 text-lg">schedule</mat-icon>
              </div>
              <h3 class="text-sm font-semibold text-gray-900 m-0">Schedule & Assignment</h3>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Pickup Date</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="pickupDate">
                <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Pickup Time</mat-label>
                <input matInput formControlName="pickupTime" type="time">
                <mat-icon matSuffix>access_time</mat-icon>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Assigned Staff</mat-label>
                <input matInput formControlName="assignedStaff" placeholder="Staff Name">
                <mat-icon matSuffix>person_pin</mat-icon>
              </mat-form-field>
            </div>
          </div>

          <!-- Cost & Carrier Information Section -->
          <div class="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <div class="flex items-center mb-4 pb-2 border-b border-gray-100">
              <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                <mat-icon class="text-yellow-600 text-lg">attach_money</mat-icon>
              </div>
              <h3 class="text-sm font-semibold text-gray-900 m-0">Cost & Carrier Information</h3>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Estimated Cost (₹)</mat-label>
                <input matInput formControlName="estimatedCost" type="number" placeholder="0.00" step="0.01">
                <mat-icon matSuffix>currency_rupee</mat-icon>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Carrier ID</mat-label>
                <input matInput formControlName="carrierId" placeholder="Carrier ID">
                <mat-icon matSuffix>badge</mat-icon>
              </mat-form-field>
            </div>
          </div>

        </form>
      </div>

      <!-- Footer Actions -->
      <div class="border-t bg-white px-6 py-4">
        <div class="flex justify-between items-center">
          <div class="text-sm text-gray-500">
            <mat-icon class="text-base mr-1">info</mat-icon>
            Last updated: {{ pickup.updatedAt | date:'short' }}
          </div>
          
          <div class="flex space-x-3">
            <button mat-stroked-button (click)="onCancel()" class="px-6 border-gray-300 text-gray-700 hover:bg-gray-50">
              <mat-icon class="mr-2">close</mat-icon>
              Cancel
            </button>
            <button mat-flat-button 
                    (click)="onSave()" 
                    [disabled]="editForm.invalid || isSaving"
                    class="px-6 bg-green-600 hover:bg-green-700 text-white">
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
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      overflow: hidden;
    }

    .mat-mdc-form-field {
      margin-bottom: 8px;
    }

    .mat-mdc-form-field-appearance-outline .mat-mdc-form-field-outline {
      border-radius: 8px;
    }

    .mat-mdc-form-field-appearance-outline .mat-mdc-form-field-outline-thick {
      border-width: 1px;
    }

    /* Clean button styles */
    .mat-mdc-outlined-button {
      border-radius: 8px;
      font-weight: 500;
    }

    .mat-mdc-raised-button {
      border-radius: 8px;
      font-weight: 500;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    }

    .mat-mdc-raised-button:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    /* Icon styles */
    .mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
  `]
})
export class PickupEditModalComponent implements OnInit {
  editForm: FormGroup;
  isSaving = false;
  pickup: PickupRecord;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PickupEditModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { pickup: PickupRecord },
    private pickupService: PickupService
  ) {
    // Extract pickup from data object
    this.pickup = data.pickup;
    
    this.editForm = this.fb.group({
      // Available backend fields only (mapped to frontend interface)
      clientName: [this.pickup?.clientName || '', [Validators.required]],
      pickupAddress: [this.pickup?.pickupAddress || '', [Validators.required]],
      itemCount: [this.pickup?.itemCount || 1, [Validators.required, Validators.min(1)]],
      totalWeight: [this.pickup?.totalWeight || 0, [Validators.required, Validators.min(0)]],
      pickupType: [this.pickup?.pickupType || 'direct', [Validators.required]],
      assignedStaff: [this.pickup?.assignedStaff || ''],
      pickupDate: [this.pickup?.pickupDate || new Date(), [Validators.required]],
      pickupTime: [this.pickup?.pickupTime || '', [Validators.required]],
      estimatedCost: [this.pickup?.estimatedCost || 0, [Validators.min(0)]],
      carrierId: [this.pickup?.carrierId || ''],
      status: [this.pickup?.status || 'scheduled', [Validators.required]]
    });

    console.log('Pickup data passed to edit modal:', this.pickup);
    console.log('Form values after initialization:', this.editForm.value);
  }

  ngOnInit(): void {
    // Additional data population for complex fields
    if (this.pickup) {
      // Handle date conversion if needed
      if (this.pickup.pickupDate && typeof this.pickup.pickupDate === 'string') {
        const dateValue = new Date(this.pickup.pickupDate);
        this.editForm.patchValue({
          pickupDate: dateValue
        });
      }
      
      // Handle pickup time formatting if needed
      if (this.pickup.pickupTime) {
        let timeValue = this.pickup.pickupTime;
        // Convert from various time formats to HH:mm format expected by input[type="time"]
        if (typeof timeValue === 'string' && !timeValue.includes(':')) {
          // Handle cases like "1400" -> "14:00"
          if (timeValue.length === 4) {
            timeValue = timeValue.substr(0, 2) + ':' + timeValue.substr(2, 2);
          }
        }
        this.editForm.patchValue({
          pickupTime: timeValue
        });
      }
      
      console.log('Final form values after ngOnInit:', this.editForm.value);
      console.log('Form valid:', this.editForm.valid);
      
      // Mark form as pristine after initial load
      this.editForm.markAsPristine();
    }
  }

  onSave(): void {
    if (this.editForm.valid) {
      this.isSaving = true;
      
      // Map form values to only the backend available fields
      const formData = this.editForm.value;
      const updateData: any = {
        // Only include fields that exist in backend PickupDto
        clientName: formData.clientName,
        pickupAddress: formData.pickupAddress,
        itemsCount: formData.itemCount,
        totalWeight: formData.totalWeight,
        pickupType: formData.pickupType,
        assignedStaffName: formData.assignedStaff,
        pickupDate: formData.pickupDate instanceof Date ? 
          formData.pickupDate.toISOString().split('T')[0] : 
          formData.pickupDate,
        pickupTime: formData.pickupTime,
        estimatedCost: formData.estimatedCost,
        carrierId: formData.carrierId,
        status: formData.status
      };

      console.log('Updating pickup with ID:', this.pickup.id);
      console.log('Update data (backend fields only):', updateData);

      // Call pickup service to update the pickup in the database
      this.pickupService.updatePickup(this.pickup.id, updateData).subscribe({
        next: (updatedPickup) => {
          this.isSaving = false;
          console.log('Pickup updated successfully:', updatedPickup);
          // Close dialog and return the updated pickup data
          this.dialogRef.close({
            action: 'updated',
            pickup: updatedPickup
          });
        },
        error: (error) => {
          this.isSaving = false;
          console.error('Error updating pickup:', error);
          // You might want to show a snackbar or error message here
          alert('Error updating pickup. Please try again.');
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.editForm.markAllAsTouched();
      console.log('Form is invalid:', this.editForm.errors);
      
      // Find and log specific validation errors for debugging
      Object.keys(this.editForm.controls).forEach(key => {
        const control = this.editForm.get(key);
        if (control && control.errors) {
          console.log(`Field ${key} has errors:`, control.errors);
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
