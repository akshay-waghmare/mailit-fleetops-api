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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Observable, of } from 'rxjs';
import { map, startWith, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PlaceRecord, PlaceService, CountriesService, Country } from '../../../../../libs/shared';

@Component({
  selector: 'app-place-edit-modal',
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
    MatSlideToggleModule
  ],
  template: `
    <!-- Modal Header -->
    <div mat-dialog-title class="flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-100 p-6 m-[-24px_-24px_0_-24px]">
      <div class="flex items-center gap-3">
        <mat-icon class="text-blue-600">{{ isDuplicate ? 'content_copy' : 'edit_location' }}</mat-icon>
        <div>
          <h2 class="text-xl font-semibold text-slate-900 m-0">{{ isDuplicate ? 'Duplicate Place' : 'Edit Place' }}</h2>
          <p class="text-sm text-slate-600 m-0 mt-1">{{ isDuplicate ? 'Create a copy of this place' : 'Update place details and location information' }}</p>
        </div>
      </div>
      <button mat-icon-button (click)="onCancel()" class="text-slate-500 hover:text-slate-700">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <!-- Modal Content -->
    <mat-dialog-content class="py-6 max-h-[70vh] overflow-y-auto">
      
      <!-- Loading State -->
      <div *ngIf="loading" class="flex justify-center py-8">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div class="flex items-center gap-2 text-red-800">
          <mat-icon class="text-red-600">error</mat-icon>
          <span class="font-medium">Error loading place</span>
        </div>
        <p class="text-red-700 mt-1">{{error}}</p>
      </div>

      <!-- Edit Form -->
      <form *ngIf="isFormReady && !loading" [formGroup]="placeForm!" class="space-y-4">
        
        <!-- Basic Information -->
        <div class="bg-slate-50 rounded-lg p-4 mb-4">
          <h3 class="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <mat-icon class="text-slate-600 text-base">info</mat-icon>
            Basic Information
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Place Name</mat-label>
              <input matInput formControlName="name" placeholder="Enter place name" required />
              <mat-icon matSuffix>business</mat-icon>
              <mat-error *ngIf="placeForm?.get('name')?.hasError('required')">
                Place name is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Type</mat-label>
              <mat-select formControlName="type" required>
                <mat-option value="DEPOT">Depot</mat-option>
                <mat-option value="WAREHOUSE">Warehouse</mat-option>
                <mat-option value="CUSTOMER">Customer</mat-option>
                <mat-option value="PICKUP_POINT">Pickup Point</mat-option>
                <mat-option value="DELIVERY_POINT">Delivery Point</mat-option>
                <mat-option value="OTHER">Other</mat-option>
              </mat-select>
              <mat-icon matSuffix>category</mat-icon>
              <mat-error *ngIf="placeForm?.get('type')?.hasError('required')">
                Place type is required
              </mat-error>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="2" placeholder="Enter place description"></textarea>
            <mat-icon matSuffix>description</mat-icon>
          </mat-form-field>

          <div class="flex items-center gap-2 mt-2">
            <mat-slide-toggle formControlName="active" color="primary">
              Active
            </mat-slide-toggle>
            <span class="text-sm text-slate-600">This place is currently active</span>
          </div>
        </div>

        <!-- Location Information -->
        <div class="bg-slate-50 rounded-lg p-4 mb-4">
          <h3 class="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <mat-icon class="text-slate-600 text-base">place</mat-icon>
            Location
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Latitude</mat-label>
              <input matInput type="number" formControlName="latitude" placeholder="e.g. 19.0760" required step="any" />
              <mat-icon matSuffix>my_location</mat-icon>
              <mat-error *ngIf="placeForm?.get('latitude')?.hasError('required')">
                Latitude is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Longitude</mat-label>
              <input matInput type="number" formControlName="longitude" placeholder="e.g. 72.8777" required step="any" />
              <mat-icon matSuffix>my_location</mat-icon>
              <mat-error *ngIf="placeForm?.get('longitude')?.hasError('required')">
                Longitude is required
              </mat-error>
            </mat-form-field>
          </div>
        </div>

        <!-- Address Details -->
        <div class="bg-slate-50 rounded-lg p-4 mb-4">
          <h3 class="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <mat-icon class="text-slate-600 text-base">home</mat-icon>
            Address
          </h3>
          
          <mat-form-field appearance="outline" class="w-full mb-4">
            <mat-label>Full Address</mat-label>
            <textarea matInput formControlName="address" rows="2" placeholder="Enter complete address"></textarea>
            <mat-icon matSuffix>location_on</mat-icon>
          </mat-form-field>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Address Line 1</mat-label>
              <input matInput formControlName="addressLine1" placeholder="Street address" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Address Line 2</mat-label>
              <input matInput formControlName="addressLine2" placeholder="Apartment, suite, etc." />
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>City</mat-label>
              <input matInput formControlName="city" placeholder="Enter city" />
              <mat-icon matSuffix>location_city</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>State/Province</mat-label>
              <input matInput formControlName="state" placeholder="Enter state" />
              <mat-icon matSuffix>map</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Postal Code</mat-label>
              <input matInput formControlName="postalCode" placeholder="Enter postal code" />
              <mat-icon matSuffix>markunread_mailbox</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Country</mat-label>
              <mat-select formControlName="country">
                <mat-option *ngFor="let country of countries$ | async" [value]="country.code">
                  {{ country.name }}
                </mat-option>
              </mat-select>
              <mat-icon matSuffix>public</mat-icon>
            </mat-form-field>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="bg-slate-50 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <mat-icon class="text-slate-600 text-base">contact_phone</mat-icon>
            Contact
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Phone Number</mat-label>
              <input matInput formControlName="phoneNumber" placeholder="Enter phone number" />
              <mat-icon matSuffix>phone</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Contact Person</mat-label>
              <input matInput formControlName="contactPerson" placeholder="Enter contact name" />
              <mat-icon matSuffix>person</mat-icon>
            </mat-form-field>
          </div>
        </div>

      </form>
    </mat-dialog-content>

    <!-- Modal Actions -->
    <mat-dialog-actions align="end" class="p-6 bg-slate-50 m-[-24px] mt-0">
      <button mat-button (click)="onCancel()" [disabled]="saving">
        Cancel
      </button>
      <button 
        mat-raised-button 
        color="primary" 
        (click)="onSave()"
        [disabled]="!isFormReady || saving || placeForm?.invalid"
        class="min-w-[120px]">
        <mat-icon *ngIf="!saving">{{ isDuplicate ? 'content_copy' : 'save' }}</mat-icon>
        <mat-spinner *ngIf="saving" diameter="20" class="inline-block"></mat-spinner>
        <span *ngIf="!saving">{{ isDuplicate ? 'Duplicate' : 'Save Changes' }}</span>
        <span *ngIf="saving">Saving...</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
    }

    mat-form-field {
      width: 100%;
    }

    .mat-mdc-dialog-content {
      max-height: 70vh;
      overflow-y: auto;
    }

    mat-spinner {
      display: inline-block;
      margin-right: 8px;
    }
  `]
})
export class PlaceEditModalComponent implements OnInit {
  placeForm?: FormGroup;
  loading = false;
  saving = false;
  error: string | null = null;
  isFormReady = false;
  countries$: Observable<Country[]>;
  isDuplicate = false;

  constructor(
    private dialogRef: MatDialogRef<PlaceEditModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { place: PlaceRecord; isDuplicate?: boolean },
    private fb: FormBuilder,
    private placeService: PlaceService,
    private countriesService: CountriesService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.countries$ = of(this.countriesService.getAllCountries());
    this.isDuplicate = data.isDuplicate || false;
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    const place = this.data.place;
    
    this.placeForm = this.fb.group({
      name: [place.name, Validators.required],
      description: [place.description || ''],
      type: [place.type || 'OTHER', Validators.required],
      latitude: [place.location?.latitude || null, Validators.required],
      longitude: [place.location?.longitude || null, Validators.required],
      address: [place.address || ''],
      addressLine1: [place.addressLine1 || ''],
      addressLine2: [place.addressLine2 || ''],
      city: [place.city || ''],
      state: [place.state || ''],
      postalCode: [place.postalCode || ''],
      country: [place.country || 'IN'],
      phoneNumber: [place.phoneNumber || ''],
      contactPerson: [place.contactPerson || ''],
      active: [place.active !== false] // Default to true if undefined
    });

    // If duplicate, modify the name to indicate it's a copy
    if (this.isDuplicate) {
      const currentName = this.placeForm.get('name')?.value;
      this.placeForm.patchValue({
        name: `${currentName} (Copy)`
      });
    }

    this.isFormReady = true;
    this.cdr.detectChanges();
  }

  onSave(): void {
    if (this.placeForm?.invalid) {
      this.snackBar.open('Please fill in all required fields', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.saving = true;
    const formValue = this.placeForm!.value;

    // Construct place data according to PlaceRecord interface
    const placeData: any = {
      name: formValue.name,
      description: formValue.description || null,
      type: formValue.type,
      location: {
        latitude: parseFloat(formValue.latitude),
        longitude: parseFloat(formValue.longitude)
      },
      address: formValue.address || null,
      addressLine1: formValue.addressLine1 || null,
      addressLine2: formValue.addressLine2 || null,
      city: formValue.city || null,
      state: formValue.state || null,
      postalCode: formValue.postalCode || null,
      country: formValue.country || null,
      phoneNumber: formValue.phoneNumber || null,
      contactPerson: formValue.contactPerson || null,
      active: formValue.active
    };

    // If not duplicate, include the ID for update
    if (!this.isDuplicate && this.data.place.id) {
      placeData.id = this.data.place.id;
    }

    const operation = this.isDuplicate 
      ? this.placeService.createPlace(placeData)
      : this.placeService.updatePlace(this.data.place.id!, placeData);

    operation.subscribe({
      next: (result) => {
        this.saving = false;
        this.snackBar.open(
          this.isDuplicate ? 'Place duplicated successfully!' : 'Place updated successfully!',
          'Close',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
        this.dialogRef.close(result);
      },
      error: (error) => {
        this.saving = false;
        console.error('Error saving place:', error);
        this.snackBar.open(
          `Failed to ${this.isDuplicate ? 'duplicate' : 'update'} place: ${error.message || 'Unknown error'}`,
          'Close',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
