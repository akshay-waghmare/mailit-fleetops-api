import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

// Angular Material imports
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { PlaceRecord, PlaceFormData, PlaceService, CountriesService, Country, ConfigService } from '../../../../../libs/shared';

@Component({
  selector: 'app-place-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatSnackBarModule
  ],
  template: `
    <div class="place-modal-overlay" *ngIf="isOpen" (click)="onOverlayClick($event)">
      <div class="place-modal" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="modal-header">
          <div class="header-content">
            <div class="header-title">
              <mat-icon>{{ isEditMode ? 'edit_location' : 'add_location' }}</mat-icon>
              <h2>{{ isEditMode ? 'Edit Place' : 'Create New Place' }}</h2>
            </div>
            <button mat-icon-button (click)="onClose()" class="close-button">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          <mat-progress-bar *ngIf="isSubmitting" mode="indeterminate"></mat-progress-bar>
        </div>

        <!-- Form Content -->
        <div class="modal-body">
          <form [formGroup]="placeForm" (ngSubmit)="onSubmit()" #placeFormRef="ngForm">
            
            <!-- Place Details Section -->
            <mat-expansion-panel [expanded]="true" class="form-section">
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <mat-icon>place</mat-icon>
                  Place Details
                </mat-panel-title>
              </mat-expansion-panel-header>
              
              <div class="form-grid">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Place Name *</mat-label>
                  <input matInput formControlName="name" 
                         placeholder="e.g., Main Office, Warehouse A, Distribution Center"
                         autocomplete="organization">
                  <mat-hint>Enter a descriptive name for this location</mat-hint>
                  <mat-error *ngIf="placeForm.get('name')?.hasError('required')">
                    Place name is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Description</mat-label>
                  <textarea matInput formControlName="description" 
                           placeholder="e.g., Primary business location with customer service"
                           rows="3" maxlength="500"></textarea>
                  <mat-hint>Optional description of this place (max 500 characters)</mat-hint>
                </mat-form-field>

                <div class="toggle-field">
                  <mat-slide-toggle formControlName="active">
                    <span class="toggle-label">Active Place</span>
                  </mat-slide-toggle>
                  <div class="toggle-hint">Inactive places won't appear in delivery options</div>
                </div>

                <!-- Place Type Field -->
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Place Type</mat-label>
                  <mat-select formControlName="type" placeholder="Select Place Type">
                    <mat-option value="DEPOT">🏭 Depot</mat-option>
                    <mat-option value="WAREHOUSE">🏪 Warehouse</mat-option>
                    <mat-option value="CUSTOMER">👥 Customer Location</mat-option>
                    <mat-option value="PICKUP_POINT">📦 Pickup Point</mat-option>
                    <mat-option value="DELIVERY_POINT">🚚 Delivery Point</mat-option>
                    <mat-option value="SERVICE_CENTER">🔧 Service Center</mat-option>
                    <mat-option value="RETAIL_STORE">🏬 Retail Store</mat-option>
                    <mat-option value="DISTRIBUTION_CENTER">📊 Distribution Center</mat-option>
                    <mat-option value="OFFICE">🏢 Office</mat-option>
                    <mat-option value="OTHER">📍 Other</mat-option>
                  </mat-select>
                  <mat-hint>Select the type of place this represents</mat-hint>
                  <mat-error *ngIf="placeForm.get('type')?.hasError('required')">
                    Place type is required
                  </mat-error>
                </mat-form-field>
              </div>
            </mat-expansion-panel>

            <!-- Address Information Section -->
            <mat-expansion-panel [expanded]="true" class="form-section">
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <mat-icon>home</mat-icon>
                  Address Information
                </mat-panel-title>
              </mat-expansion-panel-header>
              
              <div class="form-grid">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Street Address 1 *</mat-label>
                  <input matInput formControlName="addressLine1" 
                         placeholder="e.g., 123 Main Street, 456 Business Boulevard"
                         autocomplete="address-line1">
                  <mat-hint>Street number and name</mat-hint>
                  <mat-error *ngIf="placeForm.get('addressLine1')?.hasError('required')">
                    Street address is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Street Address 2</mat-label>
                  <input matInput formControlName="addressLine2" 
                         placeholder="e.g., Apartment 5B, Suite 200, Building C"
                         autocomplete="address-line2">
                  <mat-hint>Apartment, suite, unit, building (optional)</mat-hint>
                </mat-form-field>

                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Neighborhood</mat-label>
                    <input matInput formControlName="neighborhood"
                           placeholder="e.g., Downtown, Financial District">
                    <mat-hint>Area/district name</mat-hint>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Building</mat-label>
                    <input matInput formControlName="building"
                           placeholder="e.g., Tower A, Building 1">
                    <mat-hint>Building identifier</mat-hint>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Security Code</mat-label>
                    <input matInput formControlName="securityAccessCode"
                           placeholder="e.g., #1234, Gate A">
                    <mat-hint>Access code/gate info</mat-hint>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Postal Code *</mat-label>
                    <input matInput formControlName="postalCode"
                           placeholder="10001"
                           autocomplete="postal-code">
                    <mat-hint>ZIP/Postal code</mat-hint>
                    <mat-error *ngIf="placeForm.get('postalCode')?.hasError('required')">
                      Postal code is required
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>City *</mat-label>
                    <input matInput formControlName="city"
                           placeholder="New York"
                           autocomplete="address-level2">
                    <mat-hint>City name</mat-hint>
                    <mat-error *ngIf="placeForm.get('city')?.hasError('required')">
                      City is required
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>State/Province *</mat-label>
                    <input matInput formControlName="state"
                           placeholder="NY"
                           autocomplete="address-level1">
                    <mat-hint>State or Province</mat-hint>
                    <mat-error *ngIf="placeForm.get('state')?.hasError('required')">
                      State/Province is required
                    </mat-error>
                  </mat-form-field>
                </div>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Country *</mat-label>
                  <input type="text" 
                         matInput 
                         [formControl]="countrySearchControl"
                         [matAutocomplete]="countryAutocomplete"
                         placeholder="Search and select country">
                  <mat-autocomplete #countryAutocomplete="matAutocomplete" 
                                   [displayWith]="displayCountryFn"
                                   (optionSelected)="onCountrySelected($event.option.value)">
                    
                    <!-- Popular Countries Section -->
                    <mat-optgroup *ngIf="popularCountries.length > 0 && !isSearching()" 
                                  label="Popular Countries">
                      <mat-option *ngFor="let country of popularCountries" [value]="country">
                        {{country.flag}} {{country.name}}
                      </mat-option>
                    </mat-optgroup>
                    
                    <!-- Filtered Countries Section -->
                    <mat-optgroup [label]="getCountriesGroupLabel()">
                      <mat-option *ngFor="let country of filteredCountries" [value]="country">
                        {{country.flag}} {{country.name}}
                      </mat-option>
                    </mat-optgroup>
                    
                    <!-- No Results -->
                    <mat-option *ngIf="filteredCountries.length === 0 && isSearching()" disabled>
                      No countries found for "{{getSearchTerm()}}"
                    </mat-option>
                  </mat-autocomplete>
                  <mat-hint>Type to search for countries</mat-hint>
                  <mat-error *ngIf="placeForm.get('country')?.hasError('required')">
                    Country is required
                  </mat-error>
                </mat-form-field>
              </div>
            </mat-expansion-panel>

            <!-- Coordinates Section -->
            <mat-expansion-panel class="form-section">
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <mat-icon>map</mat-icon>
                  Coordinates
                </mat-panel-title>
              </mat-expansion-panel-header>
              
              <div class="form-grid">
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Latitude *</mat-label>
                    <input matInput type="number" step="0.000001" 
                           formControlName="latitude" 
                           placeholder="40.712800"
                           autocomplete="off">
                    <mat-hint>Decimal degrees (e.g., 40.712800) - Required</mat-hint>
                    <mat-error *ngIf="placeForm.get('latitude')?.hasError('required')">
                      Latitude is required
                    </mat-error>
                    <mat-error *ngIf="placeForm.get('latitude')?.hasError('min') || placeForm.get('latitude')?.hasError('max')">
                      Latitude must be between -90 and 90
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Longitude *</mat-label>
                    <input matInput type="number" step="0.000001" 
                           formControlName="longitude" 
                           placeholder="-74.006000"
                           autocomplete="off">
                    <mat-hint>Decimal degrees (e.g., -74.006000) - Required</mat-hint>
                    <mat-error *ngIf="placeForm.get('longitude')?.hasError('required')">
                      Longitude is required
                    </mat-error>
                    <mat-error *ngIf="placeForm.get('longitude')?.hasError('min') || placeForm.get('longitude')?.hasError('max')">
                      Longitude must be between -180 and 180
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="coordinates-hint">
                  <mat-icon>info</mat-icon>
                  <span>Enter coordinates in decimal degrees format (required). Use the buttons below to get coordinates automatically.</span>
                </div>

                <div class="map-actions">
                  <button type="button" mat-stroked-button 
                          (click)="selectFromMap()" class="map-button">
                    <mat-icon>map</mat-icon>
                    Select from Map
                  </button>
                  <button type="button" mat-stroked-button 
                          (click)="getCurrentLocation()" class="map-button">
                    <mat-icon>my_location</mat-icon>
                    Use Current Location
                  </button>
                  <button type="button" mat-stroked-button 
                          (click)="geocodeAddress()" class="map-button"
                          [disabled]="!hasValidAddress()">
                    <mat-icon>search</mat-icon>
                    Find from Address
                  </button>
                </div>

                <!-- Enhanced Map Preview -->
                <div class="map-preview" *ngIf="hasCoordinates()">
                  <div class="map-preview-header">
                    <mat-icon>map</mat-icon>
                    <span>Location Preview</span>
                    <button type="button" mat-icon-button (click)="clearCoordinates()" 
                            matTooltip="Clear coordinates">
                      <mat-icon>clear</mat-icon>
                    </button>
                  </div>
                  <div class="map-placeholder">
                    <div class="coordinates-display">
                      <strong>{{ getCoordinatesDisplay() }}</strong>
                    </div>
                    <div class="map-placeholder-content">
                      <mat-icon>place</mat-icon>
                      <p>Interactive map preview will appear here</p>
                      <small>Latitude: {{ placeForm.get('latitude')?.value || 'Not set' }}</small>
                      <small>Longitude: {{ placeForm.get('longitude')?.value || 'Not set' }}</small>
                    </div>
                  </div>
                </div>
              </div>
            </mat-expansion-panel>

            <!-- Contact Information Section -->
            <mat-expansion-panel class="form-section">
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <mat-icon>phone</mat-icon>
                  Contact Information
                </mat-panel-title>
              </mat-expansion-panel-header>
              
              <div class="form-grid">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Phone Number</mat-label>
                  <input matInput formControlName="phoneNumber" 
                         type="tel"
                         placeholder="e.g., +1 (555) 123-4567, +44 20 7946 0958"
                         autocomplete="tel">
                  <mat-hint>Include country code for international numbers</mat-hint>
                  <mat-icon matPrefix>phone</mat-icon>
                </mat-form-field>
              </div>
            </mat-expansion-panel>

          </form>
        </div>

        <!-- Footer Actions -->
        <div class="modal-footer">
          <div class="footer-actions">
            <button mat-stroked-button (click)="onClose()" 
                    [disabled]="isSubmitting">
              Cancel
            </button>
            <button mat-raised-button color="primary" 
                    type="submit" 
                    form="placeFormRef"
                    [disabled]="placeForm.invalid || isSubmitting"
                    (click)="onSubmit()">
              <mat-icon>{{ isEditMode ? 'save' : 'add' }}</mat-icon>
              {{ isEditMode ? 'Update Place' : 'Create Place' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .place-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      animation: fadeIn 0.3s ease;
      padding: 20px;
    }

    .place-modal {
      width: 600px;
      max-width: 90vw;
      max-height: 90vh;
      background: white;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      animation: slideInCenter 0.3s ease;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      overflow: hidden;
    }

    .modal-header {
      padding: 24px 24px 0;
      border-bottom: 1px solid #e2e8f0;
      
      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 16px;
      }
      
      .header-title {
        display: flex;
        align-items: center;
        gap: 12px;
        
        mat-icon {
          color: #2563eb;
          font-size: 28px;
          width: 28px;
          height: 28px;
        }
        
        h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
        }
      }
      
      .close-button {
        color: #64748b;
        
        &:hover {
          background: #f1f5f9;
        }
      }
    }

    .modal-body {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
    }

    .form-section {
      margin-bottom: 16px;
      
      ::ng-deep .mat-expansion-panel-header {
        height: 56px;
        
        .mat-panel-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 500;
          
          mat-icon {
            color: #2563eb;
          }
        }
      }
      
      ::ng-deep .mat-expansion-panel-content .mat-expansion-panel-body {
        padding: 24px 16px 16px;
      }
    }

    .form-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
      
      ::ng-deep .mat-mdc-form-field {
        .mat-mdc-form-field-label {
          color: #374151 !important;
        }
        
        .mdc-notched-outline__leading,
        .mdc-notched-outline__notch,
        .mdc-notched-outline__trailing {
          border-color: #d1d5db;
        }
        
        &.mat-focused .mdc-notched-outline__leading,
        &.mat-focused .mdc-notched-outline__notch,
        &.mat-focused .mdc-notched-outline__trailing {
          border-color: #2563eb;
        }
        
        .mat-mdc-form-field-hint {
          color: #6b7280;
          font-size: 0.75rem;
        }
      }
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
      
      mat-form-field {
        width: 100%;
      }
    }

    .full-width {
      width: 100%;
    }

    .toggle-field {
      padding: 16px 0;
      
      .toggle-label {
        font-weight: 500;
        margin-left: 8px;
      }
      
      .toggle-hint {
        font-size: 0.75rem;
        color: #64748b;
        margin-top: 4px;
        margin-left: 32px;
      }
    }

    .coordinates-hint {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #f0f9ff;
      border: 1px solid #e0f2fe;
      border-radius: 8px;
      margin: 16px 0;
      
      mat-icon {
        color: #0ea5e9;
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
      
      span {
        font-size: 0.875rem;
        color: #0f172a;
        line-height: 1.4;
      }
    }

    .map-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      
      .map-button {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 140px;
        
        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }
    }

    .map-preview {
      margin-top: 20px;
      
      .map-preview-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-bottom: none;
        border-radius: 8px 8px 0 0;
        
        > div {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        mat-icon {
          color: #2563eb;
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
        
        span {
          font-weight: 500;
          color: #1e293b;
        }
        
        button {
          width: 32px;
          height: 32px;
          line-height: 32px;
          
          mat-icon {
            color: #64748b;
            font-size: 18px;
            width: 18px;
            height: 18px;
          }
        }
      }
      
      .map-placeholder {
        border: 1px solid #e2e8f0;
        border-radius: 0 0 8px 8px;
        background: #fff;
        
        .coordinates-display {
          padding: 12px 16px;
          background: #eff6ff;
          border-bottom: 1px solid #e0f2fe;
          font-family: monospace;
          font-size: 0.875rem;
          color: #1e40af;
        }
        
        .map-placeholder-content {
          padding: 32px;
          text-align: center;
          
          mat-icon {
            font-size: 48px;
            width: 48px;
            height: 48px;
            color: #94a3b8;
            margin-bottom: 12px;
          }
          
          p {
            margin: 0 0 12px;
            color: #64748b;
            font-weight: 500;
          }
          
          small {
            display: block;
            color: #94a3b8;
            font-size: 0.75rem;
            margin: 2px 0;
          }
        }
      }
    }

    .modal-footer {
      padding: 16px 24px 24px;
      border-top: 1px solid #e2e8f0;
      
      .footer-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideInCenter {
      from { 
        opacity: 0;
        transform: scale(0.9) translateY(-20px);
      }
      to { 
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    // Responsive design
    @media (max-width: 768px) {
      .place-modal-overlay {
        padding: 10px;
      }
      
      .place-modal {
        width: 100%;
        max-width: 100%;
        max-height: 95vh;
      }
      
      .form-row {
        grid-template-columns: 1fr;
      }
      
      .map-actions {
        flex-direction: column;
      }
    }
  `]
})
export class PlaceFormModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() placeData?: PlaceRecord;
  @Input() isEditMode = false;
  
  @Output() closeModal = new EventEmitter<void>();
  @Output() placeCreated = new EventEmitter<PlaceRecord>();
  @Output() placeUpdated = new EventEmitter<PlaceRecord>();

  placeForm: FormGroup;
  isSubmitting = false;
  
  // Countries data
  countries: Country[] = [];
  popularCountries: Country[] = [];
  filteredCountries: Country[] = [];
  
  // Country search
  countrySearchControl: FormControl;
  selectedCountry: Country | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private placeService: PlaceService,
    private countriesService: CountriesService,
    private configService: ConfigService
  ) {
    this.placeForm = this.createForm();
    this.countrySearchControl = new FormControl('');
    this.loadCountries();
  }

  ngOnInit(): void {
    this.initializeForm();
    
    // Remove the problematic status change subscription that causes ExpressionChangedAfterItHasBeenCheckedError
    // Debug form validation status only when needed
  }

  private loadCountries(): void {
    this.countries = this.countriesService.sortCountriesAlphabetically();
    this.popularCountries = this.countriesService.getPopularCountries();
    this.filteredCountries = this.countries;
    
    // Set up search functionality
    this.setupCountrySearch();
  }

  private setupCountrySearch(): void {
    // Listen to search input changes
    this.countrySearchControl.valueChanges.subscribe(value => {
      // Handle both string input (user typing) and object input (selection)
      if (typeof value === 'string') {
        // User is typing - filter countries
        this.filterCountries(value);
      } else if (value && typeof value === 'object') {
        // Country was selected - reset filter to show all countries
        this.filteredCountries = this.countries;
      } else if (value === null || value === undefined) {
        // Value was cleared - reset filter
        this.filteredCountries = this.countries;
      }
    });
  }

  private filterCountries(searchTerm: string): void {
    if (!searchTerm || searchTerm.trim() === '') {
      this.filteredCountries = this.countries;
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    this.filteredCountries = this.countries.filter(country =>
      country.name.toLowerCase().includes(term) ||
      country.code.toLowerCase().includes(term)
    );
  }

  onCountrySelected(country: Country): void {
    if (country && country.code && country.name && country.flag) {
      this.selectedCountry = country;
      this.placeForm.patchValue({ country: country.code });
      // Don't set the search control value here, let displayWith handle it
    }
  }

  displayCountryFn = (country: Country | null): string => {
    if (!country) return '';
    // Ensure all required properties exist
    if (country.flag && country.name) {
      return `${country.flag} ${country.name}`;
    }
    // Fallback if properties are missing
    return country.name || '';
  }

  isSearching(): boolean {
    const value = this.countrySearchControl.value;
    // User is searching when they're typing (string) and it's not empty
    // or when they have text but no selected country
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    // If value is an object (selected country), user is not actively searching
    return false;
  }

  getSearchTerm(): string {
    const value = this.countrySearchControl.value;
    return typeof value === 'string' ? value.trim() : '';
  }

  getCountriesGroupLabel(): string {
    return this.isSearching() ? `Search Results (${this.filteredCountries.length})` : `All Countries (${this.filteredCountries.length})`;
  }

  ngOnChanges(): void {
    if (this.isOpen && !this.isEditMode) {
      // Always reset form when opening for create
      this.resetForm();
    } else if (this.placeData && this.isEditMode && this.isOpen) {
      this.populateForm();
    }
  }

  onClose(): void {
    this.closeModal.emit();
    this.resetForm();
  }

  onOverlayClick(event: Event): void {
    // Disabled: Modal can only be closed via the close button or cancel button
    // Previously: clicking outside would close the modal
    // if (event.target === event.currentTarget) {
    //   this.onClose();
    // }
  }

  onSubmit(): void {
    console.log('Form submission triggered');
    console.log('Form valid:', this.placeForm.valid);
    console.log('Form values:', this.placeForm.value);
    console.log('Form errors:', this.getFormErrors());
    
    if (this.placeForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      
      const formValues = this.placeForm.value;
      const formData: PlaceFormData = {
        name: formValues.name,
        description: formValues.description,
        addressLine1: formValues.addressLine1,
        addressLine2: formValues.addressLine2,
        neighbourhood: formValues.neighborhood,
        building: formValues.building,
        securityAccessCode: formValues.securityAccessCode,
        city: formValues.city,
        state: formValues.state,
        postalCode: formValues.postalCode,
        country: formValues.country,
        latitude: parseFloat(formValues.latitude),
        longitude: parseFloat(formValues.longitude),
        phoneNumber: formValues.phoneNumber,
        type: formValues.type,
        active: formValues.active,
        organizationId: this.configService.defaultOrganizationId
      };

      console.log('Submitting form data:', formData);

      if (this.isEditMode && this.placeData?.id) {
        // Handle update using PlaceService
        console.log('Updating place with ID:', this.placeData.id);
        console.log('Update data:', formData);
        this.placeService.updatePlace(this.placeData.id, formData).subscribe({
          next: (updatedPlace) => {
            console.log('Place updated successfully:', updatedPlace);
            this.placeUpdated.emit(updatedPlace);
            this.showSuccessAndClose('Place updated successfully');
          },
          error: (error) => {
            console.error('Error updating place:', error);
            console.error('Error status:', error.status);
            console.error('Error message:', error.message);
            console.error('Error details:', error.error);
            
            // Show more specific error message
            let errorMessage = 'Error updating place. Please try again.';
            if (error.status === 400) {
              errorMessage = 'Invalid data provided. Please check all required fields.';
              if (error.error && error.error.message) {
                errorMessage += ` (${error.error.message})`;
              }
            }
            
            this.snackBar.open(errorMessage, 'Close', { duration: 8000 });
            
            // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
            setTimeout(() => {
              this.isSubmitting = false;
            }, 0);
          }
        });
      } else if (this.isEditMode) {
        // Handle case where we're in edit mode but don't have place ID
        console.error('Edit mode but no place ID available:', this.placeData);
        this.snackBar.open('Error: Unable to update place - missing place ID', 'Close', { duration: 5000 });
        this.isSubmitting = false;
      } else {
        // Handle create using PlaceService
        this.placeService.createPlace(formData).subscribe({
          next: (newPlace) => {
            console.log('Place created successfully:', newPlace);
            this.placeCreated.emit(newPlace);
            this.showSuccessAndClose('Place created successfully');
          },
          error: (error) => {
            console.error('Error creating place:', error);
            console.error('Error status:', error.status);
            console.error('Error message:', error.message);
            console.error('Error details:', error.error);
            
            // Show more specific error message
            let errorMessage = 'Error creating place. Please try again.';
            if (error.status === 400) {
              errorMessage = 'Invalid data provided. Please check all required fields.';
              if (error.error && error.error.message) {
                errorMessage += ` (${error.error.message})`;
              }
            }
            
            this.snackBar.open(errorMessage, 'Close', { duration: 8000 });
            
            // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
            setTimeout(() => {
              this.isSubmitting = false;
            }, 0);
          }
        });
      }
    } else {
      console.log('Form submission blocked - invalid form or already submitting');
      if (!this.placeForm.valid) {
        this.markAllFieldsAsTouched();
        // Show specific validation errors
        setTimeout(() => {
          this.snackBar.open('Please fill in all required fields correctly', 'Close', { duration: 4000 });
        }, 0);
      }
    }
  }

  selectFromMap(): void {
    // TODO: Implement map selection modal
    this.snackBar.open('Map selection coming soon', 'Close', { duration: 2000 });
  }

  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.placeForm.patchValue({
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          });
          this.snackBar.open('Location updated', 'Close', { duration: 2000 });
        },
        (error) => {
          this.snackBar.open('Unable to get current location', 'Close', { duration: 3000 });
        }
      );
    } else {
      this.snackBar.open('Geolocation not supported', 'Close', { duration: 3000 });
    }
  }

  hasCoordinates(): boolean {
    const lat = this.placeForm.get('latitude')?.value;
    const lng = this.placeForm.get('longitude')?.value;
    return lat && lng && lat !== '' && lng !== '' && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng));
  }

  hasValidAddress(): boolean {
    const addressLine1 = this.placeForm.get('addressLine1')?.value;
    const city = this.placeForm.get('city')?.value;
    const state = this.placeForm.get('state')?.value;
    const country = this.placeForm.get('country')?.value;
    return !!(addressLine1 && city && state && country);
  }

  getCoordinatesDisplay(): string {
    const lat = this.placeForm.get('latitude')?.value;
    const lng = this.placeForm.get('longitude')?.value;
    if (this.hasCoordinates()) {
      return `${parseFloat(lat).toFixed(6)}, ${parseFloat(lng).toFixed(6)}`;
    }
    return '';
  }

  clearCoordinates(): void {
    this.placeForm.patchValue({
      latitude: '',
      longitude: ''
    });
  }

  geocodeAddress(): void {
    if (!this.hasValidAddress()) {
      this.snackBar.open('Please fill in the address fields first', 'Close', { duration: 3000 });
      return;
    }

    const address = [
      this.placeForm.get('addressLine1')?.value,
      this.placeForm.get('city')?.value,
      this.placeForm.get('state')?.value,
      this.placeForm.get('country')?.value
    ].filter(Boolean).join(', ');

    // TODO: Implement actual geocoding service
    this.snackBar.open(`Geocoding "${address}" - Feature coming soon`, 'Close', { duration: 3000 });
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      name: ['', [Validators.required]], // Simplified - just required
      description: [''],
      addressLine1: ['', [Validators.required]], // Simplified - just required
      addressLine2: [''],
      neighborhood: [''],
      building: [''],
      securityAccessCode: [''],
      city: ['', [Validators.required]], // Simplified - just required
      state: ['', [Validators.required]], // Simplified - just required
      postalCode: ['', [Validators.required]], // Simplified - just required
      country: ['', Validators.required],
      latitude: ['', [Validators.required, Validators.min(-90), Validators.max(90)]], // Now required
      longitude: ['', [Validators.required, Validators.min(-180), Validators.max(180)]], // Now required
      phoneNumber: [''],
      active: [true], // This should always be valid
      type: ['WAREHOUSE', Validators.required] // Use WAREHOUSE instead of OTHER temporarily
    });
  }

  private initializeForm(): void {
    if (this.placeData && this.isEditMode) {
      this.populateForm();
    }
  }

  private populateForm(): void {
    if (this.placeData) {
      const formData = {
        name: this.placeData.name,
        description: this.placeData.description || '',
        addressLine1: this.placeData.addressLine1,
        addressLine2: this.placeData.addressLine2 || '',
        city: this.placeData.city,
        state: this.placeData.state,
        postalCode: this.placeData.postalCode,
        country: this.placeData.country,
        latitude: this.placeData.location.latitude,
        longitude: this.placeData.location.longitude,
        phoneNumber: this.placeData.phoneNumber || '',
        active: this.placeData.active,
        type: this.placeData.type || 'OTHER'
      };
      
      this.placeForm.patchValue(formData);
      
      // Set the country search control for editing
      if (this.placeData.country) {
        const selectedCountry = this.countriesService.getCountryByCode(this.placeData.country);
        if (selectedCountry) {
          this.selectedCountry = selectedCountry;
          this.countrySearchControl.setValue(selectedCountry);
        }
      }
    }
  }

  private resetForm(): void {
    this.placeForm.reset({
      name: '',
      description: '',
      addressLine1: '',
      addressLine2: '',
      neighborhood: '',
      building: '',
      securityAccessCode: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      latitude: '',
      longitude: '',
      phoneNumber: '',
      active: true,
      type: 'OTHER'
    });
    this.isSubmitting = false;
    
    // Reset country search
    this.selectedCountry = null;
    this.countrySearchControl.setValue(null);
    this.filteredCountries = this.countries;
    
    // Mark all fields as untouched to ensure proper label behavior
    Object.keys(this.placeForm.controls).forEach(key => {
      this.placeForm.get(key)?.markAsUntouched();
      this.placeForm.get(key)?.markAsPristine();
    });
  }

  private getFormErrors(): any {
    let errors: any = {};
    Object.keys(this.placeForm.controls).forEach(key => {
      const controlErrors = this.placeForm.get(key)?.errors;
      if (controlErrors) {
        errors[key] = controlErrors;
      }
    });
    return errors;
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.placeForm.controls).forEach(key => {
      this.placeForm.get(key)?.markAsTouched();
    });
  }

  // Helper method to check if form is ready for submission
  isFormValid(): boolean {
    return this.placeForm.valid && !this.isSubmitting;
  }

  // Helper method to show success message and close modal
  private showSuccessAndClose(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000 });
    this.isSubmitting = false;
    
    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.onClose();
    }, 0);
  }
}
