  import { Component, OnInit, ViewChild, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Angular Material imports
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

// Order Management imports
import { OrderService, CreateOrderData } from '../../../../../libs/shared';

interface CarrierOption {
  id: string;
  name: string;
  type?: string;
  duration: string;
  price: number;
  serviceable: boolean;
  estimatedDelivery: string;
  logo?: string;
  // Enhanced serviceability properties
  deliveryDays?: number;
  weightCharged?: number;
  route?: string;
  reason?: string;
}

interface Client {
  id: string;
  date: string;
  subContractCode: string;
  clientName: string;
  accountNo: string;
  contactPerson: string;
  address: string;
  pincode: string;
  city: string;
  active: boolean;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule,
    MatStepperModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <!-- Modern Layout with Tailwind + Material -->
    <div class="min-h-screen bg-slate-50">
      
      <!-- Header Section -->
      <header class="bg-white border-b border-slate-200 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-6">
            <h1 class="text-3xl font-bold text-slate-900 flex items-center">
              📦 <span class="ml-2">New Order</span>
            </h1>
            <button class="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-200 transition-colors">
              🧪 Demo Mode
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <!-- Enhanced Stepper -->
        <mat-stepper linear="false" class="bg-transparent mb-8" #stepper>
          
          <!-- Step 1: Client Selection -->
          <mat-step label="Client Selection" [completed]="selectedClient !== null">
            <mat-card class="mb-6 border-0 shadow-md">
              <mat-card-header class="pb-4">
                <div class="flex justify-between items-center w-full">
                  <mat-card-title class="text-2xl font-semibold text-slate-900">Select Client</mat-card-title>
                  <button 
                    class="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                    (click)="toggleClientSearch()">
                    🔍 {{showClientSearch ? 'Hide Search' : 'Search Clients'}}
                  </button>
                </div>
              </mat-card-header>
              
              <mat-card-content>
                <!-- Enhanced Search Bar with Filters -->
                <div class="mb-8" *ngIf="showClientSearch">
                  <div class="flex flex-col lg:flex-row gap-4 mb-4">
                    <!-- Search Input -->
                    <div class="flex-1 relative">
                      <mat-form-field class="w-full search-field-override" appearance="outline">
                        <mat-label>Search Clients</mat-label>
                        <input matInput 
                               placeholder="Type to search..."
                               [(ngModel)]="searchQuery"
                               (input)="onSearchChange($event)">
                      </mat-form-field>
                      <!-- Custom Search Icon as SVG -->
                      <div class="search-icon-overlay">
                        <svg class="search-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                      </div>
                    </div>
                    
                    <!-- Quick Filters -->
                    <div class="flex gap-2 items-end pb-1">
                      <button 
                        class="filter-chip"
                        [class.active]="statusFilter === 'all'"
                        (click)="setStatusFilter('all')">
                        All ({{getTotalClientsCount()}})
                      </button>
                      <button 
                        class="filter-chip"
                        [class.active]="statusFilter === 'active'"
                        (click)="setStatusFilter('active')">
                        Active ({{getActiveClientsCount()}})
                      </button>
                      <button 
                        class="filter-chip"
                        [class.active]="statusFilter === 'inactive'"
                        (click)="setStatusFilter('inactive')">
                        Inactive ({{getInactiveClientsCount()}})
                      </button>
                    </div>
                  </div>
                  
                  <!-- Search Results Summary -->
                  <div class="flex justify-between items-center mb-4 px-1">
                    <div class="text-sm text-slate-600">
                      <span *ngIf="searchQuery">
                        Found <strong>{{filteredClients.length}}</strong> client(s) for "<em>{{searchQuery}}</em>"
                      </span>
                      <span *ngIf="!searchQuery">
                        Showing <strong>{{filteredClients.length}}</strong> client(s)
                      </span>
                    </div>
                    
                    <!-- View Mode Toggle -->
                    <div class="flex bg-white border border-slate-200 rounded-lg p-1">
                      <button 
                        class="view-toggle-btn"
                        [class.active]="viewMode === 'grid'"
                        (click)="viewMode = 'grid'"
                        title="Grid View">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                        </svg>
                      </button>
                      <button 
                        class="view-toggle-btn"
                        [class.active]="viewMode === 'list'"
                        (click)="viewMode = 'list'"
                        title="List View">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Enhanced Client Grid with Improved Cards -->
                <div [ngClass]="getClientGridClasses()" class="client-search-results">
                  
                  <!-- Grid View Cards -->
                  <div *ngFor="let client of filteredClients; trackBy: trackByClientId" 
                       class="enhanced-client-card"
                       [class]="getEnhancedClientCardClasses(client)"
                       (click)="selectClient(client)"
                       [attr.data-client-id]="client.id"
                       role="button"
                       tabindex="0"
                       [attr.aria-label]="'Select client ' + client.clientName"
                       (keydown.enter)="selectClient(client)"
                       (keydown.space)="selectClient(client)">
                    
                    <!-- Card Header with Status and Selection -->
                    <div class="card-header">
                      <div class="flex justify-between items-start mb-4">
                        <!-- Selection Indicator -->
                        <div class="selection-indicator" [class.visible]="selectedClient?.id === client.id">
                          <div class="selection-ring">
                            <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                            </svg>
                          </div>
                        </div>
                        
                        <!-- Status Badge -->
                        <div class="status-badge-enhanced" [class]="client.active ? 'status-active' : 'status-inactive'">
                          <div class="status-dot"></div>
                          <span>{{client.active ? 'Active' : 'Inactive'}}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Client Identity Section -->
                    <div class="client-identity mb-4">
                      <h3 class="client-name">{{client.clientName}}</h3>
                      <div class="client-meta">
                        <span class="contract-code">{{client.subContractCode}}</span>
                        <span class="account-separator">•</span>
                        <span class="account-number">{{client.accountNo}}</span>
                      </div>
                    </div>

                    <!-- Contact Information -->
                    <div class="contact-info mb-4">
                      <div class="contact-item">
                        <div class="contact-icon">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                          </svg>
                        </div>
                        <div class="contact-details">
                          <div class="contact-label">Contact Person</div>
                          <div class="contact-value">{{client.contactPerson}}</div>
                        </div>
                      </div>
                    </div>

                    <!-- Location Information -->
                    <div class="location-info mb-4">
                      <div class="location-item">
                        <div class="location-icon">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          </svg>
                        </div>
                        <div class="location-details">
                          <div class="location-primary">{{client.city}}</div>
                          <div class="location-secondary">{{client.pincode}}</div>
                        </div>
                      </div>
                    </div>

                    <!-- Quick Actions (Shown on Hover) -->
                    <div class="card-actions">
                      <div class="flex justify-between items-center">
                        <div class="client-date">
                          <span class="date-label">Added:</span>
                          <span class="date-value">{{client.date}}</span>
                        </div>
                        <div class="action-hint" *ngIf="selectedClient?.id !== client.id">
                          <span class="hint-text">Click to select</span>
                        </div>
                        <div class="selected-indicator" *ngIf="selectedClient?.id === client.id">
                          <span class="selected-text">✓ Selected</span>
                        </div>
                      </div>
                    </div>

                    <!-- Selection Overlay for Better Visual Feedback -->
                    <div class="selection-overlay" [class.active]="selectedClient?.id === client.id"></div>
                  </div>
                  
                  <!-- Empty State -->
                  <div *ngIf="filteredClients.length === 0" class="empty-state">
                    <div class="empty-state-content">
                      <div class="empty-icon">
                        <svg class="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                      </div>
                      <h3 class="empty-title">No clients found</h3>
                      <p class="empty-description">
                        <span *ngIf="searchQuery">Try adjusting your search terms or</span>
                        <span *ngIf="!searchQuery">No clients match the current filter. Try</span>
                        <button class="link-button" (click)="clearFilters()">clearing filters</button>
                      </p>
                    </div>
                  </div>
                </div>
                
                <div class="mt-6 flex justify-end">
                  <button 
                    mat-raised-button 
                    color="primary"
                    [disabled]="!selectedClient" 
                    (click)="stepper.next()"
                    class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300">
                    Next: Shipment Details →
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
          </mat-step>

          <!-- Step 2: Shipment Details -->
          <mat-step label="Shipment Details" [completed]="orderForm.get('weight')?.valid">
            <mat-card class="mb-6 border-0 shadow-md">
              <mat-card-header class="pb-4">
                <mat-card-title class="text-xl font-semibold text-slate-900">
                  📦 Shipment Information
                </mat-card-title>
              </mat-card-header>
              
              <mat-card-content>
                <form [formGroup]="orderForm">
                  <!-- Shipment Type Selection -->
                  <div class="mb-8">
                    <h4 class="text-lg font-medium text-slate-700 mb-4">Shipment Type</h4>
                    <div class="grid grid-cols-2 gap-4">
                      <label class="relative cursor-pointer" (click)="orderForm.get('shipmentType')?.setValue('domestic')">
                        <input type="radio" name="shipmentType" formControlName="shipmentType" value="domestic" class="sr-only" (change)="orderForm.get('shipmentType')?.setValue('domestic')">
                        <div class="shipment-type-card p-6 border-2 rounded-xl transition-all duration-200"
                             [class]="getShipmentTypeClasses('domestic')">
                          <div class="text-center">
                            <div class="text-3xl mb-3">🇮🇳</div>
                            <div class="font-semibold text-lg mb-1">Domestic</div>
                            <div class="text-sm text-slate-600">Within India</div>
                            <div class="text-xs text-slate-500 mt-2">Standard rates apply</div>
                          </div>
                        </div>
                      </label>
                      <label class="relative cursor-pointer" (click)="orderForm.get('shipmentType')?.setValue('international')">
                        <input type="radio" name="shipmentType" formControlName="shipmentType" value="international" class="sr-only" (change)="orderForm.get('shipmentType')?.setValue('international')">
                        <div class="shipment-type-card p-6 border-2 rounded-xl transition-all duration-200"
                             [class]="getShipmentTypeClasses('international')">
                          <div class="text-center">
                            <div class="text-3xl mb-3">🌍</div>
                            <div class="font-semibold text-lg mb-1">International</div>
                            <div class="text-sm text-slate-600">Worldwide delivery</div>
                            <div class="text-xs text-slate-500 mt-2">Customs clearance included</div>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <!-- Form Grid -->
                  <div class="professional-form-container">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <mat-form-field >
                    <mat-label>Weight (kg)</mat-label>
                    <input matInput 
                           formControlName="weight" 
                           type="number" 
                           placeholder="10.5"
                           (input)="onShipmentDetailsChange()">
                    <mat-error *ngIf="orderForm.get('weight')?.hasError('required')">
                      Weight is required
                    </mat-error>
                  </mat-form-field>
                  
                  <mat-form-field >
                    <mat-label>Packages</mat-label>
                    <input matInput 
                           formControlName="packages" 
                           type="number" 
                           placeholder="1">
                  </mat-form-field>
                  
                  <mat-form-field >
                    <mat-label>Commodity Type</mat-label>
                    <mat-select formControlName="commodity">
                      <mat-option value="electronics">Electronics</mat-option>
                      <mat-option value="clothing">Clothing</mat-option>
                      <mat-option value="documents">Documents</mat-option>
                      <mat-option value="books">Books</mat-option>
                      <mat-option value="jewelry">Jewelry</mat-option>
                      <mat-option value="food">Food Items</mat-option>
                      <mat-option value="other">Other</mat-option>
                    </mat-select>
                  </mat-form-field>
                  
                  <!-- Financial Details -->
                  <mat-form-field >
                    <mat-label>Declared Value (₹)</mat-label>
                    <input matInput 
                           formControlName="declaredValue" 
                           type="number" 
                           placeholder="5000"
                           min="1"
                           step="0.01">
                  </mat-form-field>
                  
                  <mat-form-field >
                    <mat-label>COD Amount (₹)</mat-label>
                    <input matInput 
                           formControlName="codAmount" 
                           type="number" 
                           placeholder="0"
                           min="0"
                           step="0.01">
                  </mat-form-field>
                  
                  <mat-form-field >
                    <mat-label>Payment Status</mat-label>
                    <mat-select formControlName="paymentStatus">
                      <mat-option value="pending">Pending</mat-option>
                      <mat-option value="paid">Paid</mat-option>
                      <mat-option value="cod">Cash on Delivery</mat-option>
                      <mat-option value="refunded">Refunded</mat-option>
                    </mat-select>
                  </mat-form-field>
                  
                  <!-- Dimensions -->
                  <div class="md:col-span-2 lg:col-span-3">
                    <label class="block text-sm font-medium text-slate-700 mb-2">Dimensions (L × W × H cm)</label>
                    <div class="grid grid-cols-3 gap-3">
                      <mat-form-field >
                        <mat-label>Length</mat-label>
                        <input matInput formControlName="length" type="number" placeholder="30" (input)="onShipmentDetailsChange()">
                      </mat-form-field>
                      <mat-form-field >
                        <mat-label>Width</mat-label>
                        <input matInput formControlName="width" type="number" placeholder="40" (input)="onShipmentDetailsChange()">
                      </mat-form-field>
                      <mat-form-field >
                        <mat-label>Height</mat-label>
                        <input matInput formControlName="height" type="number" placeholder="50" (input)="onShipmentDetailsChange()">
                      </mat-form-field>
                    </div>
                  </div>

                  <!-- Delivery Details -->
                  <div class="md:col-span-2 lg:col-span-3">
                    <h4 class="text-lg font-medium text-slate-700 mb-4 pt-4 border-t border-slate-200">Delivery Details</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <mat-form-field >
                        <mat-label>Receiver Name</mat-label>
                        <input matInput formControlName="receiverName" placeholder="Naveen Kumar" (input)="onAddressChange()">
                      </mat-form-field>
                      <mat-form-field >
                        <mat-label>Receiver Contact</mat-label>
                        <input matInput formControlName="receiverContact" placeholder="9878543210">
                      </mat-form-field>
                      <div class="md:col-span-2">
                        <mat-form-field  class="w-full">
                          <mat-label>Delivery Address</mat-label>
                          <input matInput formControlName="receiverAddress" placeholder="Delhi 110024" (input)="onAddressChange()">
                        </mat-form-field>
                      </div>
                    </div>
                  </div>

                  <!-- Sender Details -->
                  <div class="md:col-span-2 lg:col-span-3">
                    <h4 class="text-lg font-medium text-slate-700 mb-4 pt-4 border-t border-slate-200">Sender Details</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <mat-form-field >
                        <mat-label>Sender Name</mat-label>
                        <input matInput formControlName="senderName" placeholder="FleetOps India Pvt Ltd">
                      </mat-form-field>
                      <mat-form-field >
                        <mat-label>Sender Contact</mat-label>
                        <input matInput formControlName="senderContact" placeholder="9876543210">
                      </mat-form-field>
                      <div class="md:col-span-2">
                        <mat-form-field  class="w-full">
                          <mat-label>Pickup Address</mat-label>
                          <input matInput formControlName="senderAddress" placeholder="Mumbai, Maharashtra 400001">
                        </mat-form-field>
                      </div>
                    </div>
                    </div>
                  </div>
                </div>
                </form>
                
                <div class="mt-8 flex justify-between">
                  <button 
                    mat-stroked-button 
                    (click)="stepper.previous()"
                    class="border-slate-300 text-slate-700 hover:bg-slate-50">
                    ← Previous
                  </button>
                  <button 
                    mat-raised-button 
                    color="primary"
                    [disabled]="!orderForm.get('weight')?.valid" 
                    (click)="proceedToCarrierSelection(stepper)"
                    class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                    Check Serviceability →
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
          </mat-step>

          <!-- Step 3: Carrier Selection -->
          <mat-step label="Carrier Selection" [completed]="selectedCarrier !== null">
            <mat-card class="mb-6 border-0 shadow-md">
              <mat-card-header class="pb-4">
                <mat-card-title class="text-xl font-semibold text-slate-900">
                  🚚 Select Carrier & Service
                </mat-card-title>
                <p class="text-sm text-slate-600 mt-2">Choose from available carriers for your shipment route</p>
              </mat-card-header>
              
              <mat-card-content>
                <!-- Serviceability Check Button -->
                <div class="mb-6 text-center" *ngIf="!serviceabilityChecked">
                  <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div class="text-blue-700 mb-4">
                      <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <h3 class="text-lg font-semibold">Ready to Check Serviceability</h3>
                      <p class="text-sm">We'll check which carriers can deliver to your destination</p>
                    </div>
                    <button 
                      mat-raised-button 
                      color="primary"
                      [disabled]="!canCheckServiceability()" 
                      (click)="checkServiceability()"
                      class="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold">
                      🔍 Check Available Carriers
                    </button>
                    <div class="mt-3 text-xs text-slate-500" *ngIf="!canCheckServiceability()">
                      Please fill in weight and addresses to check serviceability
                    </div>
                  </div>
                </div>

                <!-- Loading State -->
                <div class="text-center py-12" *ngIf="checkingServiceability">
                  <mat-spinner diameter="48" class="mx-auto mb-4"></mat-spinner>
                  <h3 class="text-lg font-semibold text-slate-700 mb-2">Checking Serviceability</h3>
                  <p class="text-slate-600">Finding the best carriers for your route...</p>
                  <div class="mt-4 bg-slate-50 rounded-lg p-4 max-w-md mx-auto">
                    <div class="text-sm text-slate-600">
                      <div class="flex items-center justify-between mb-2">
                        <span>From:</span>
                        <span class="font-medium">{{getShortAddress(orderForm.get('senderAddress')?.value)}}</span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span>To:</span>
                        <span class="font-medium">{{getShortAddress(orderForm.get('receiverAddress')?.value)}}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Carrier Results -->
                <div *ngIf="!checkingServiceability && serviceabilityChecked && availableCarriers.length > 0">
                  <div class="mb-6">
                    <h3 class="text-lg font-semibold text-slate-700 mb-2">Available Services</h3>
                    <p class="text-sm text-slate-600">{{getServiceableCount()}} out of {{availableCarriers.length}} carriers available for this route</p>
                  </div>
                  
                  <div class="space-y-4">
                    <div *ngFor="let carrier of availableCarriers; trackBy: trackByCarrierId" 
                         class="carrier-option border rounded-xl p-4 transition-all duration-200"
                         [class]="getCarrierCardClasses(carrier)"
                         (click)="selectCarrier(carrier)"
                         [attr.data-carrier]="carrier.id"
                         [attr.data-serviceable]="carrier.serviceable">
                      
                      <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center space-x-3">
                          <div class="carrier-logo w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                            <span class="text-xl">{{getCarrierIcon(carrier.name)}}</span>
                          </div>
                          <div>
                            <h4 class="font-semibold text-slate-900">{{carrier.name}}</h4>
                            <p class="text-sm text-slate-600">{{carrier.type || 'Express Delivery'}}</p>
                          </div>
                        </div>
                        <mat-chip [class]="carrier.serviceable ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'">
                          {{carrier.serviceable ? '✅ Available' : '❌ Not Available'}}
                        </mat-chip>
                      </div>
                      
                      <div *ngIf="carrier.serviceable" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div class="text-center">
                          <div class="text-sm text-slate-500">Delivery Days</div>
                          <div class="font-semibold text-slate-900">{{carrier.deliveryDays || carrier.duration}}</div>
                        </div>
                        <div class="text-center">
                          <div class="text-sm text-slate-500">Price ({{carrier.weightCharged}}kg)</div>
                          <div class="font-bold text-blue-600 text-lg">₹{{carrier.price}}</div>
                        </div>
                        <div class="text-center">
                          <div class="text-sm text-slate-500">Est. Delivery</div>
                          <div class="font-semibold text-slate-900">{{carrier.estimatedDelivery}}</div>
                        </div>
                        <div class="text-center">
                          <div class="text-sm text-slate-500">Route</div>
                          <div class="font-semibold text-green-600 text-xs">{{carrier.route || 'Serviceable'}}</div>
                        </div>
                      </div>
                      
                      <div *ngIf="!carrier.serviceable" class="text-center py-4">
                        <p class="text-red-600 text-sm italic">{{carrier.reason || 'Service not available for this route'}}</p>
                        <div class="text-xs text-slate-500 mt-1">Unable to service {{orderForm.get('fromPincode')?.value}} → {{orderForm.get('toPincode')?.value}}</div>
                      </div>
                      
                      <div *ngIf="carrier.serviceable" class="flex items-center justify-between pt-3 border-t border-slate-100">
                        <div class="flex items-center space-x-2 text-sm text-slate-600">
                          <span>✓ Insurance included</span>
                          <span>✓ SMS tracking</span>
                        </div>
                        <div class="flex items-center space-x-2">
                          <span class="text-sm text-slate-500" *ngIf="selectedCarrier?.id !== carrier.id">Click to select</span>
                          <span class="text-sm font-semibold text-blue-600" *ngIf="selectedCarrier?.id === carrier.id">✓ Selected</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- No Carriers Available -->
                <div class="text-center py-12" *ngIf="!checkingServiceability && serviceabilityChecked && availableCarriers.length === 0">
                  <div class="text-red-600 mb-4">
                    <svg class="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                    <h3 class="text-lg font-semibold">No Carriers Available</h3>
                    <p class="text-slate-600 mt-2">Unfortunately, no carriers service this route currently</p>
                  </div>
                  <button 
                    mat-stroked-button 
                    (click)="resetServiceability()"
                    class="border-slate-300 text-slate-700 hover:bg-slate-50">
                    🔄 Check Different Route
                  </button>
                </div>
                
                <div class="mt-8 flex justify-between" *ngIf="serviceabilityChecked">
                  <button 
                    mat-stroked-button 
                    (click)="stepper.previous()"
                    class="border-slate-300 text-slate-700 hover:bg-slate-50">
                    ← Previous
                  </button>
                  <button 
                    mat-raised-button 
                    color="primary"
                    [disabled]="!selectedCarrier?.serviceable" 
                    (click)="stepper.next()"
                    class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                    Proceed to Book →
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
          </mat-step>

        </mat-stepper>
      </main>

      <!-- Always Visible Booking Summary Below Content -->
      <div *ngIf="selectedClient" class="mt-8">
        <mat-card class="booking-summary-card border-0 shadow-lg">
          <mat-card-header class="pb-4">
            <mat-card-title class="text-xl font-semibold text-slate-900 flex items-center">
              📋 <span class="ml-2">Booking Summary</span>
            </mat-card-title>
          </mat-card-header>
          
          <mat-card-content>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <!-- Client & Order Summary -->
              <div class="lg:col-span-2 space-y-6">
                
                <!-- Client Summary -->
                <div class="bg-slate-50 rounded-lg p-4">
                  <h3 class="font-semibold text-slate-900 mb-3">Client Information</h3>
                  <div class="space-y-2">
                    <div class="flex justify-between">
                      <span class="text-slate-500 font-medium">Client:</span>
                      <span class="text-slate-900 font-semibold">{{selectedClient.clientName}}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-slate-500 font-medium">Contract Code:</span>
                      <span class="text-blue-600 font-bold">{{selectedClient.subContractCode}}</span>
                    </div>
                  </div>
                </div>
                
                <!-- Order Details -->
                <div class="bg-slate-50 rounded-lg p-4">
                  <h3 class="font-semibold text-slate-900 mb-3">Order Details</h3>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="text-center">
                      <div class="text-sm text-slate-500">Weight</div>
                      <div class="font-bold text-slate-900">{{orderForm.get('weight')?.value || 0}}kg</div>
                    </div>
                    <div class="text-center">
                      <div class="text-sm text-slate-500">Packages</div>
                      <div class="font-bold text-slate-900">{{orderForm.get('packages')?.value || 0}}</div>
                    </div>
                    <div class="text-center">
                      <div class="text-sm text-slate-500">Type</div>
                      <div class="font-bold text-slate-900">{{orderForm.get('shipmentType')?.value || 'N/A'}}</div>
                    </div>
                    <div class="text-center">
                      <div class="text-sm text-slate-500">Tracking ID</div>
                      <div class="font-bold text-green-600 font-mono text-xs">{{trackingId}}</div>
                    </div>
                  </div>
                </div>
                
                <!-- Selected Carrier (if any) -->
                <div *ngIf="selectedCarrier" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 class="font-semibold text-blue-900 mb-3">Selected Carrier</h3>
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="font-semibold text-blue-900 text-lg">{{selectedCarrier.name}}</div>
                      <div class="text-sm text-blue-700">{{selectedCarrier.estimatedDelivery}}</div>
                    </div>
                    <div class="text-right">
                      <div class="text-2xl font-bold text-blue-600">₹{{selectedCarrier.price}}</div>
                      <div class="text-sm text-blue-600">Total Cost</div>
                    </div>
                  </div>
                </div>
                
              </div>
              
              <!-- Action Panel -->
              <div class="lg:col-span-1">
                <div class="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 h-full flex flex-col justify-center">
                  
                  <div class="text-center mb-6">
                    <div class="text-3xl mb-2">🚀</div>
                    <h3 class="font-bold text-slate-900 text-lg mb-2">Ready to Book?</h3>
                    <p class="text-sm text-slate-600">Review your order details and complete the booking</p>
                  </div>
                  
                  <!-- Status indicator -->
                  <div class="mb-6">
                    <div *ngIf="!selectedCarrier" class="text-center">
                      <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span class="text-orange-600 text-xl">⏳</span>
                      </div>
                      <div class="text-sm text-orange-600 font-medium">Select a carrier to proceed</div>
                    </div>
                    
                    <div *ngIf="selectedCarrier" class="text-center">
                      <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span class="text-green-600 text-xl">✅</span>
                      </div>
                      <div class="text-sm text-green-600 font-medium">Ready for booking!</div>
                    </div>
                  </div>
                  
                  <!-- Booking Button -->
                  <button type="button" 
                          class="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-lg font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
                          [disabled]="!selectedCarrier"
                          (click)="bookShipment()">
                    <span *ngIf="selectedCarrier">🎯 Book Shipment</span>
                    <span *ngIf="!selectedCarrier">🔄 Select Carrier First</span>
                  </button>
                  
                </div>
              </div>
              
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;
  
  orderForm!: FormGroup;
  selectedCarrier: CarrierOption | null = null;
  selectedClient: Client | null = null;
  trackingId = '4619825878203';
  serviceabilityChecked = false;
  checkingServiceability = false;
  availableCarriers: CarrierOption[] = [];
  showMobileSummary = false;
  
  // Client search functionality
  searchQuery = '';
  filteredClients: Client[] = [];
  showClientSearch = false;
  statusFilter: 'all' | 'active' | 'inactive' = 'active';
  viewMode: 'grid' | 'list' = 'grid';

  clients: Client[] = [
    { 
      id: 'client1', 
      date: '21/08/2025', 
      subContractCode: 'SUC00425',
      clientName: 'First Promotional Clothing Co', 
      accountNo: 'FIRST', 
      contactPerson: 'Ms. Ruchira Naik', 
      address: 'Shop No. 24, Anusuya Enclave, Jagtap Chowk Wanowrie, Near Shinde Chhatri, Pune', 
      pincode: '411040', 
      city: 'Pune', 
      active: true 
    },
    { 
      id: 'client2', 
      date: '20/08/2025', 
      subContractCode: 'SUC00426',
      clientName: 'ABC Logistics Solutions Pvt Ltd', 
      accountNo: 'ABC001', 
      contactPerson: 'Mr. Rajesh Kumar', 
      address: 'Plot No. 15, Sector 18, Noida', 
      pincode: '201301', 
      city: 'Delhi', 
      active: true 
    },
    { 
      id: 'client3', 
      date: '19/08/2025', 
      subContractCode: 'SUC00427',
      clientName: 'XYZ Corporation Ltd', 
      accountNo: 'XYZ002', 
      contactPerson: 'Ms. Priya Sharma', 
      address: 'Tower B, IT Park, Electronic City', 
      pincode: '560100', 
      city: 'Bangalore', 
      active: true 
    },
    { 
      id: 'client4', 
      date: '18/08/2025', 
      subContractCode: 'SUC00428',
      clientName: 'Tech Innovations Pvt Ltd', 
      accountNo: 'TECH003', 
      contactPerson: 'Mr. Amit Patel', 
      address: 'Hinjewadi Phase 2, Rajiv Gandhi Infotech Park', 
      pincode: '411057', 
      city: 'Pune', 
      active: false 
    },
    { 
      id: 'client5', 
      date: '17/08/2025', 
      subContractCode: 'SUC00429',
      clientName: 'Global Traders LLC', 
      accountNo: 'GLB004', 
      contactPerson: 'Ms. Sneha Singh', 
      address: 'Anna Salai, T Nagar', 
      pincode: '600017', 
      city: 'Chennai', 
      active: true 
    }
  ];

  carrierOptions: CarrierOption[] = [
    { 
      id: 'dhl', 
      name: 'DHL Express', 
      type: 'Express International',
      duration: '1–2 days', 
      price: 2100, 
      serviceable: true, 
      estimatedDelivery: 'Aug 23, 2025' 
    },
    { 
      id: 'delhivery', 
      name: 'Delhivery', 
      type: 'Standard Delivery',
      duration: '2–3 days', 
      price: 1700, 
      serviceable: true, 
      estimatedDelivery: 'Aug 24, 2025' 
    },
    { 
      id: 'bluedart', 
      name: 'Blue Dart', 
      type: 'Express Domestic',
      duration: '1–2 days', 
      price: 2000, 
      serviceable: true, 
      estimatedDelivery: 'Aug 23, 2025' 
    },
    { 
      id: 'dtdc', 
      name: 'DTDC Courier', 
      type: 'Economy Delivery',
      duration: '3–5 days', 
      price: 1300, 
      serviceable: false, 
      estimatedDelivery: 'Aug 26, 2025' 
    },
    { 
      id: 'ecom', 
      name: 'Ecom Express', 
      type: 'E-commerce Specialist',
      duration: '2–4 days', 
      price: 1400, 
      serviceable: true, 
      estimatedDelivery: 'Aug 25, 2025' 
    }
  ];

  constructor(
    private fb: FormBuilder, 
    private cdr: ChangeDetectorRef, 
    private ngZone: NgZone,
    private router: Router,
    private snackBar: MatSnackBar,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.generateTrackingId();
    
    // Initialize filtered clients with active clients by default
    this.searchClients();
    
    // Auto-select first active client for demo
    const firstActiveClient = this.filteredClients.find(client => client.active);
    if (firstActiveClient) {
      this.selectClient(firstActiveClient);
    }
  }

  // Client search functionality
  onSearchChange(event: any) {
    this.searchQuery = event.target.value;
    this.searchClients();
  }

  searchClients() {
    let filtered = this.clients;

    // Apply status filter first
    if (this.statusFilter === 'active') {
      filtered = filtered.filter(client => client.active);
    } else if (this.statusFilter === 'inactive') {
      filtered = filtered.filter(client => !client.active);
    }

    // Apply search query if provided
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(client => {
        return (
          client.clientName.toLowerCase().includes(query) ||
          client.subContractCode.toLowerCase().includes(query) ||
          client.contactPerson.toLowerCase().includes(query) ||
          client.accountNo.toLowerCase().includes(query) ||
          client.city.toLowerCase().includes(query) ||
          client.pincode.includes(query)
        );
      });
    }

    this.filteredClients = filtered;
  }

  setStatusFilter(filter: 'all' | 'active' | 'inactive') {
    this.statusFilter = filter;
    this.searchClients();
  }

  clearFilters() {
    this.searchQuery = '';
    this.statusFilter = 'active';
    this.searchClients();
  }

  // Helper methods for filter counts
  getTotalClientsCount(): number {
    return this.clients.length;
  }

  getActiveClientsCount(): number {
    return this.clients.filter(client => client.active).length;
  }

  getInactiveClientsCount(): number {
    return this.clients.filter(client => !client.active).length;
  }

  // Enhanced UI helper methods
  getClientGridClasses(): string {
    const baseClasses = 'transition-all duration-300';
    if (this.viewMode === 'grid') {
      return `${baseClasses} grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6`;
    }
    return `${baseClasses} space-y-4`;
  }

  getEnhancedClientCardClasses(client: Client): string {
    const baseClasses = 'relative bg-white border-2 rounded-xl cursor-pointer transition-all duration-300 overflow-hidden';
    const selectedClasses = this.selectedClient?.id === client.id 
      ? 'border-blue-500 bg-blue-50 shadow-xl ring-4 ring-blue-100 transform scale-105' 
      : 'border-slate-200 hover:border-blue-300 hover:shadow-lg hover:transform hover:scale-102';
    const statusClasses = client.active ? 'hover:bg-white' : 'opacity-75 hover:opacity-85';
    const interactionClasses = client.active ? 'cursor-pointer' : 'cursor-not-allowed';
    
    return `${baseClasses} ${selectedClasses} ${statusClasses} ${interactionClasses}`;
  }

  trackByClientId(index: number, client: Client): string {
    return client.id;
  }

  toggleClientSearch() {
    this.showClientSearch = !this.showClientSearch;
    if (!this.showClientSearch) {
      this.clearFilters();
    }
  }

  initializeForm() {
    this.orderForm = this.fb.group({
      shipmentType: ['domestic', Validators.required],
      weight: ['10', [Validators.required, Validators.min(0.1)]],
      length: ['30', Validators.min(1)],
      width: ['40', Validators.min(1)],
      height: ['50', Validators.min(1)],
      packages: ['1', [Validators.required, Validators.min(1)]],
      commodity: ['electronics', Validators.required],
      receiverName: ['Naveen Kumar', Validators.required],
      receiverContact: ['9878543210', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      receiverAddress: ['123 Main Street, New Delhi, Delhi 110001', Validators.required],
      senderName: ['FleetOps India Pvt Ltd', Validators.required],
      senderContact: ['9876543210', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      senderAddress: ['456 Business Park, Mumbai, Maharashtra 400001', Validators.required],
      selectedCarrier: [''],
      declaredValue: ['5000', [Validators.required, Validators.min(1)]],
      codAmount: ['0', [Validators.min(0)]],
      paymentStatus: ['pending', Validators.required]
    });
  }

  selectClient(client: Client) {
    if (client.active) {
      this.selectedClient = client;
      this.loadSampleDataForClient(client);
      this.resetServiceability();
    }
  }

  loadSampleDataForClient(client: Client) {
    // Load sample data based on selected client
    this.orderForm.patchValue({
      weight: '10',
      length: '30',
      width: '40',
      height: '50',
      packages: '1',
      commodity: 'electronics',
      receiverName: 'Naveen Kumar',
      receiverContact: '9878543210',
      receiverAddress: 'Delhi 110024',
      senderName: client.contactPerson,
      senderContact: '9876543210',
      senderAddress: `${client.address}, ${client.city} - ${client.pincode}`
    });
  }

  onShipmentDetailsChange() {
    this.resetServiceability();
  }

  onAddressChange() {
    this.resetServiceability();
  }

  onCarrierChange() {
    const carrierId = this.orderForm.get('selectedCarrier')?.value;
    if (carrierId) {
      const carrier = this.carrierOptions.find(c => c.id === carrierId);
      if (carrier) {
        this.selectedCarrier = carrier;
      }
    }
  }

  canCheckServiceability(): boolean {
    const form = this.orderForm;
    return !!(
      form.get('weight')?.value &&
      form.get('receiverAddress')?.value &&
      form.get('senderAddress')?.value &&
      this.selectedClient
    );
  }

  checkServiceability() {
    if (!this.canCheckServiceability()) return;

    this.checkingServiceability = true;
    this.serviceabilityChecked = true;
    this.availableCarriers = [];

    // Force change detection to show spinner immediately
    this.cdr.detectChanges();
    console.log('🔄 Serviceability check started - Change detection triggered');

    // Extract pincodes from addresses
    const senderAddress = this.orderForm.get('senderAddress')?.value || '';
    const receiverAddress = this.orderForm.get('receiverAddress')?.value || '';
    const fromPin = this.extractPincode(senderAddress);
    const toPin = this.extractPincode(receiverAddress);
    const weight = this.orderForm.get('weight')?.value || 1;

    console.log(`🔍 Checking serviceability from ${fromPin} to ${toPin} for ${weight}kg...`);
    console.log(`Sender: ${senderAddress}`);
    console.log(`Receiver: ${receiverAddress}`);

    // Simulate multiple carrier API calls with realistic delays
    setTimeout(() => {
      // Wrap the entire callback in NgZone.run to ensure proper change detection
      this.ngZone.run(() => {
        console.log('📡 Fetching rates from multiple carriers...');
        console.log(`Route: ${fromPin} → ${toPin}, Weight: ${weight}kg`);
        
        // Realistic carrier serviceability logic
        this.availableCarriers = this.carrierOptions.map((carrier, index) => {
          console.log(`🔍 Checking ${carrier.name} serviceability...`);
          
          // Simulate different serviceability based on pincodes
          const isServiceable = this.checkPincodeServiceability(carrier.id, fromPin, toPin);
          console.log(`${carrier.name}: ${isServiceable ? '✅ Serviceable' : '❌ Not serviceable'}`);
          
          if (!isServiceable) {
            return {
              ...carrier,
              serviceable: false,
              price: 0,
              estimatedDelivery: 'Not Available',
              reason: 'Service not available for this route'
            };
          }

          // Calculate realistic pricing based on weight, distance, and carrier type
          const basePricePerKg = carrier.price;
          const weightMultiplier = weight <= 5 ? 1 : 1 + ((weight - 5) * 0.15);
          const distanceMultiplier = this.getDistanceMultiplier(fromPin, toPin);
          const serviceMultiplier = carrier.type === 'Express' ? 1.5 : carrier.type === 'Priority' ? 1.2 : 1;
          
          const calculatedPrice = Math.round(
            basePricePerKg * weightMultiplier * distanceMultiplier * serviceMultiplier
          );

          // Calculate delivery days based on carrier type and distance
          const carrierType = carrier.type || 'Standard';
          const baseDeliveryDays = this.getDeliveryDays(carrierType, fromPin, toPin);
          
          console.log(`${carrier.name}: ₹${calculatedPrice}, ${baseDeliveryDays} days`);
          
          return {
            ...carrier,
            serviceable: true,
            price: calculatedPrice,
            estimatedDelivery: this.getEstimatedDeliveryDate(baseDeliveryDays.toString()),
            deliveryDays: baseDeliveryDays,
            weightCharged: weight,
            route: `${fromPin} → ${toPin}`
          };
        });

        // Sort by price (serviceable carriers first)
        this.availableCarriers.sort((a, b) => {
          if (a.serviceable && !b.serviceable) return -1;
          if (!a.serviceable && b.serviceable) return 1;
          if (a.serviceable && b.serviceable) return a.price - b.price;
          return 0;
        });

        const serviceableCount = this.availableCarriers.filter(c => c.serviceable).length;
        console.log(`✅ Found ${serviceableCount} serviceable carriers out of ${this.availableCarriers.length}`);
        
        this.checkingServiceability = false;
        console.log('🛑 Spinner should stop now - checkingServiceability set to false');
        
        // Try multiple change detection strategies
        this.cdr.markForCheck();
        this.cdr.detectChanges();
        console.log('🔄 Both markForCheck and detectChanges triggered in NgZone');
        
        // Force a re-render by updating a dummy property
        this.ngZone.runOutsideAngular(() => {
          setTimeout(() => {
            this.ngZone.run(() => {
              // Dummy update to force template re-evaluation
              console.log('🔄 Final attempt with zone re-entry');
              this.cdr.detectChanges();
            });
          }, 50);
        });
        
        // Double check the state
        console.log('State after immediate change detection:', {
          checkingServiceability: this.checkingServiceability,
          serviceabilityChecked: this.serviceabilityChecked,
          availableCarriersLength: this.availableCarriers.length,
          serviceableCount: this.availableCarriers.filter(c => c.serviceable).length
        });
      });
    }, 3000);
  }

  private getEstimatedDeliveryDate(duration: string): string {
    const today = new Date();
    const days = duration.includes('1–2') ? 2 : 
                 duration.includes('2–3') ? 3 : 
                 duration.includes('2–4') ? 4 : 
                 duration.includes('3–5') ? 5 : 3;
    
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + days);
    
    return deliveryDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  private isServiceableRoute(pickupPin: string, deliveryPin: string, carrierId: string): boolean {
    // Simulate serviceability logic
    if (!pickupPin || !deliveryPin) return Math.random() > 0.3;
    
    // Some carriers might not service certain routes
    if (carrierId === 'dtdc' && deliveryPin.startsWith('11')) return false; // Delhi not serviceable for DTDC
    if (carrierId === 'ecom' && pickupPin.startsWith('40')) return Math.random() > 0.4; // Mumbai limited for Ecom
    
    return Math.random() > 0.2; // 80% serviceability rate
  }

  private calculateDynamicPrice(carrier: CarrierOption, weight: number): number {
    const basePrice = carrier.price;
    const weightMultiplier = Math.max(1, weight / 10);
    return Math.round(basePrice * weightMultiplier);
  }

  private calculateEstimatedDelivery(duration: string): string {
    const today = new Date();
    const daysToAdd = duration.includes('1–2') ? 2 : 
                     duration.includes('2–3') ? 3 :
                     duration.includes('2–4') ? 4 :
                     duration.includes('3–5') ? 5 : 3;
    
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + daysToAdd);
    
    return deliveryDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  selectCarrier(carrier: CarrierOption) {
    console.log('🎯 Click detected on carrier:', carrier.name);
    console.log('🎯 Attempting to select carrier:', carrier.name, 'Serviceable:', carrier.serviceable);
    
    if (carrier.serviceable) {
      this.selectedCarrier = carrier;
      this.orderForm.patchValue({ selectedCarrier: carrier.id });
      console.log('✅ Carrier selected:', carrier.name);
      console.log('✅ Form updated with carrier ID:', carrier.id);
      
      // Force change detection for SSR
      this.cdr.detectChanges();
      console.log('🔄 Carrier selection - Change detection triggered');
      
      // Trigger change detection
      this.logComponentState();
    } else {
      console.log('❌ Cannot select non-serviceable carrier:', carrier.name);
    }
  }

  resetServiceability() {
    this.serviceabilityChecked = false;
    this.checkingServiceability = false;
    this.availableCarriers = [];
    this.selectedCarrier = null;
    this.orderForm.patchValue({ selectedCarrier: '' });
  }

  toggleMobileSummary() {
    this.showMobileSummary = !this.showMobileSummary;
    this.cdr.detectChanges();
  }

  proceedToCarrierSelection(stepper: any) {
    // Always move to the next step first
    stepper.next();
    
    // Then check serviceability if not already checked
    if (!this.serviceabilityChecked && this.canCheckServiceability()) {
      // Small delay to ensure the step transition is complete
      setTimeout(() => {
        this.checkServiceability();
      }, 100);
    }
  }

  generateTrackingId() {
    this.trackingId = Math.floor(Math.random() * 9000000000000) + 1000000000000 + '';
  }

  getDimensions(): string {
    const length = this.orderForm.get('length')?.value;
    const width = this.orderForm.get('width')?.value;
    const height = this.orderForm.get('height')?.value;
    
    if (length && width && height) {
      return `${length} × ${width} × ${height} cm`;
    }
    return '';
  }

  printLabel() {
    alert('🖨️ Printing shipping label...');
  }

  downloadAWB() {
    alert('📄 Downloading AWB (Air Waybill)...');
  }

  sendTrackingEmail() {
    const receiverName = this.orderForm.get('receiverName')?.value;
    alert(`📧 Tracking email sent to ${receiverName} with tracking ID: ${this.trackingId}`);
  }

  bookShipment() {
    if (this.orderForm.valid && this.selectedCarrier?.serviceable && this.selectedClient) {
      const formData = this.orderForm.value;
      
      // Extract pincode and city from receiver address
      const receiverAddress = formData.receiverAddress || '';
      const receiverPincode = this.extractPincode(receiverAddress);
      const receiverCity = this.extractCity(receiverAddress);
      
      // Extract pincode and city from sender address  
      const senderAddress = formData.senderAddress || this.selectedClient.address;
      const senderPincode = this.extractPincode(senderAddress);
      const senderCity = this.extractCity(senderAddress);
      
      // Create order data for the backend API (using snake_case as expected by backend)
      const orderData = {
        // Client Information (snake_case for backend)
        client_id: parseInt(this.selectedClient.id.replace('client', '')) || null,
        client_name: this.selectedClient.clientName,
        client_company: this.selectedClient.clientName,
        contact_number: this.selectedClient.contactPerson,
        
        // Sender Information
        sender_name: formData.senderName || this.selectedClient.contactPerson,
        sender_address: senderAddress,
        sender_contact: formData.senderContact || '9876543210',
        sender_email: null,
        sender_pincode: senderPincode,
        sender_city: senderCity,
        sender_state: this.extractState(senderAddress),
        
        // Receiver Information  
        receiver_name: formData.receiverName,
        receiver_address: receiverAddress,
        receiver_contact: formData.receiverContact,
        receiver_email: null,
        receiver_pincode: receiverPincode,
        receiver_city: receiverCity,
        receiver_state: this.extractState(receiverAddress),
        
        // Package Details
        item_count: parseInt(formData.packages) || 1,
        total_weight: parseFloat(formData.weight) || 1,
        length_cm: formData.length ? parseFloat(formData.length) : null,
        width_cm: formData.width ? parseFloat(formData.width) : null,
        height_cm: formData.height ? parseFloat(formData.height) : null,
        item_description: formData.commodity || 'General Items',
        declared_value: formData.declaredValue ? parseFloat(formData.declaredValue) : null,
        
        // Service Details
        service_type: this.getServiceType(this.selectedCarrier.type || 'standard'),
        carrier_name: this.selectedCarrier.name,
        carrier_id: this.selectedCarrier.id,
        tracking_number: this.trackingId,
        
        // Financial Information
        estimated_cost: this.selectedCarrier.price,
        actual_cost: this.selectedCarrier.price,
        total_amount: this.selectedCarrier.price,
        cod_amount: formData.codAmount ? parseFloat(formData.codAmount) : 0,
        payment_status: formData.paymentStatus || 'pending',
        
        // Additional Information
        special_instructions: null,
        notes: `Order created via FleetOps Portal for ${this.selectedClient.clientName}`
      };

      // Create the order using direct API call since we need to match backend format
      console.log('📤 Sending order data to backend:', orderData);
      
      this.orderService.createOrder(orderData as any).subscribe({
        next: (createdOrder) => {
          console.log('Order created successfully:', createdOrder);
          
          // Show success message with navigation options
          const snackBarRef = this.snackBar.open(
            `🚀 Order ${createdOrder.order_id} created successfully!`,
            'View Orders',
            {
              duration: 5000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['success-snackbar']
            }
          );

          // Handle navigation to order management
          snackBarRef.onAction().subscribe(() => {
            this.router.navigate(['/order-list'], { 
              queryParams: { highlight: createdOrder.id } 
            });
          });

          // Reset form after successful creation
          this.resetForm();
          
          // Generate new tracking ID for next order
          this.generateTrackingId();
        },
        error: (error) => {
          console.error('Error creating order:', error);
          this.snackBar.open(
            '❌ Failed to create order. Please try again.',
            'Close',
            {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            }
          );
        }
      });
    } else {
      this.snackBar.open(
        '❌ Please fill all required fields, select a client, and choose a serviceable carrier.',
        'Close',
        {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['warning-snackbar']
        }
      );
    }
  }

  saveAsDraft() {
    console.log('Saving draft:', {
      form: this.orderForm.value,
      client: this.selectedClient,
      carrier: this.selectedCarrier
    });
    alert('💾 Order saved as draft successfully!');
  }

  cancelOrder() {
    if (confirm('❌ Are you sure you want to cancel? All data will be lost.')) {
      this.orderForm.reset();
      this.selectedCarrier = null;
      this.selectedClient = null;
      this.resetServiceability();
      this.initializeForm();
    }
  }

  // UI Helper Methods for Tailwind Classes
  getClientCardClasses(client: any): string {
    const baseClasses = 'border-slate-200 hover:border-blue-300';
    const selectedClasses = this.selectedClient?.id === client.id 
      ? 'border-blue-500 bg-blue-50 shadow-md' 
      : 'hover:shadow-sm';
    const statusClasses = client.active ? '' : 'opacity-60';
    return `${baseClasses} ${selectedClasses} ${statusClasses}`;
  }

  getShipmentTypeClasses(type: string): string {
    const selected = this.orderForm.get('shipmentType')?.value === type;
    return selected 
      ? 'border-blue-500 bg-blue-50 text-blue-700' 
      : 'border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50';
  }

  getCarrierCardClasses(carrier: any): string {
    const baseClasses = 'transition-all duration-200';
    if (!carrier.serviceable) {
      return `${baseClasses} opacity-60 cursor-not-allowed bg-gray-50 border-gray-200`;
    }
    const selectedClasses = this.selectedCarrier?.id === carrier.id 
      ? 'border-blue-500 bg-blue-50 shadow-lg cursor-pointer' 
      : 'border-slate-200 hover:border-blue-300 hover:shadow-md cursor-pointer';
    return `${baseClasses} ${selectedClasses}`;
  }

  // New helper methods for improved carrier selection
  getShortAddress(address: string): string {
    if (!address) return 'Not specified';
    const parts = address.split(',');
    return parts.length > 2 ? `${parts[parts.length - 2]?.trim()}, ${parts[parts.length - 1]?.trim()}` : address;
  }

  getServiceableCount(): number {
    return this.availableCarriers.filter(c => c.serviceable).length;
  }

  getCarrierIcon(carrierName: string): string {
    const icons: { [key: string]: string } = {
      'BlueDart': '🔵',
      'FedEx': '🟣',
      'DHL': '🟡',
      'Aramex': '🟠',
      'DTDC': '🟢',
      'Ecom Express': '🔴',
      'Delhivery': '⚫',
      'Xpressbees': '🟤'
    };
    return icons[carrierName] || '📦';
  }

  onSubmit() {
    this.bookShipment();
  }

  // TrackBy function for carrier list performance
  trackByCarrierId(index: number, carrier: CarrierOption): string {
    return carrier.id;
  }

  // Debug method to check component state
  logComponentState() {
    console.log('Component State:', {
      checkingServiceability: this.checkingServiceability,
      serviceabilityChecked: this.serviceabilityChecked,
      availableCarriers: this.availableCarriers.length,
      selectedCarrier: this.selectedCarrier?.name || 'None'
    });
  }

  // Force method to manually fix the UI state
  forceShowCarriers() {
    console.log('🔧 Forcing UI to show carriers...');
    this.checkingServiceability = false;
    this.serviceabilityChecked = true;
    
    // If we don't have carriers, create some dummy ones
    if (this.availableCarriers.length === 0) {
      console.log('No carriers found, creating dummy carriers...');
      this.availableCarriers = [
        {
          id: 'dhl',
          name: 'DHL Express',
          type: 'Express',
          duration: '1-2 days',
          price: 450,
          serviceable: true,
          estimatedDelivery: 'Aug 23, 2025',
          deliveryDays: 2,
          weightCharged: 10,
          route: '411040 → 110024'
        },
        {
          id: 'dtdc',
          name: 'DTDC Courier',
          type: 'Standard',
          duration: '3-5 days',
          price: 280,
          serviceable: true,
          estimatedDelivery: 'Aug 25, 2025',
          deliveryDays: 4,
          weightCharged: 10,
          route: '411040 → 110024'
        }
      ];
    }
    
    // Multiple change detection attempts
    this.cdr.markForCheck();
    this.cdr.detectChanges();
    
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
    
    console.log('🔧 Force complete. Current state:', {
      checkingServiceability: this.checkingServiceability,
      serviceabilityChecked: this.serviceabilityChecked,
      availableCarriers: this.availableCarriers.length
    });
  }

  // Helper methods for address parsing
  private extractPincode(address: string): string {
    if (!address) return '';
    const pincodeMatch = address.match(/\b\d{6}\b/);
    return pincodeMatch ? pincodeMatch[0] : '';
  }

  private extractCity(address: string): string {
    if (!address) return '';
    
    // Common patterns to extract city names
    const patterns = [
      /,\s*([A-Za-z\s]+)\s*,?\s*\d{6}/, // City before pincode
      /,\s*([A-Za-z\s]+)\s*-\s*\d{6}/, // City with dash before pincode
      /([A-Za-z\s]+)\s+\d{6}/, // City directly before pincode
    ];
    
    for (const pattern of patterns) {
      const match = address.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    // If no pattern matches, try to extract last meaningful word before numbers
    const words = address.split(/[,\s]+/).filter(word => word && !/^\d+$/.test(word));
    return words.length > 0 ? words[words.length - 1] : '';
  }

  private extractState(address: string): string {
    if (!address) return '';
    
    // Common Indian state names and abbreviations
    const states = [
      'Maharashtra', 'MH', 'Delhi', 'DL', 'Karnataka', 'KA', 'Tamil Nadu', 'TN',
      'Gujarat', 'GJ', 'Rajasthan', 'RJ', 'West Bengal', 'WB', 'Uttar Pradesh', 'UP',
      'Madhya Pradesh', 'MP', 'Bihar', 'BR', 'Odisha', 'OR', 'Telangana', 'TS',
      'Andhra Pradesh', 'AP', 'Kerala', 'KL', 'Haryana', 'HR', 'Punjab', 'PB'
    ];
    
    const addressUpper = address.toUpperCase();
    
    for (const state of states) {
      if (addressUpper.includes(state.toUpperCase())) {
        return state;
      }
    }
    
    return '';
  }

  private getServiceType(carrierType: string): string {
    if (!carrierType) return 'standard';
    
    const type = carrierType.toLowerCase();
    if (type.includes('express') || type.includes('priority')) {
      return 'express';
    } else if (type.includes('economy') || type.includes('surface')) {
      return 'economy';
    } else {
      return 'standard';
    }
  }

  private resetForm() {
    this.orderForm.reset();
    this.selectedClient = null;
    this.selectedCarrier = null;
    this.resetServiceability();
    this.stepper.reset();
  }

  // Helper method to check pincode serviceability for different carriers
  private checkPincodeServiceability(carrierId: string, fromPin: string, toPin: string): boolean {
    // Add null/undefined checks
    if (!fromPin || !toPin || fromPin.length !== 6 || toPin.length !== 6) {
      console.warn(`Invalid pincodes: ${fromPin} -> ${toPin}`);
      return false;
    }

    // Simulate realistic serviceability based on carrier reach
    const pincodeRules = {
      'dhl': this.isMetroToMetro(fromPin, toPin) || this.isInternationalHub(fromPin, toPin),
      'fedex': this.isMetroToMetro(fromPin, toPin) || this.isTierOneCity(fromPin, toPin),
      'ups': this.isUrbanArea(fromPin, toPin),
      'dtdc': this.isDomesticRoute(fromPin, toPin) && !this.isRemoteArea(fromPin, toPin),
      'bluedart': this.isUrbanArea(fromPin, toPin) || this.isTierTwoCity(fromPin, toPin),
      'ecom': this.isDomesticRoute(fromPin, toPin), // Ecom Express
      'delhivery': true, // Most comprehensive coverage
      'indiapost': true  // Government service - covers all areas
    };
    
    return pincodeRules[carrierId as keyof typeof pincodeRules] ?? true;
  }

  // Helper method to calculate distance-based pricing multiplier
  private getDistanceMultiplier(fromPin: string, toPin: string): number {
    // Simulate distance calculation based on pincode zones
    const zone1 = this.getPincodeZone(fromPin);
    const zone2 = this.getPincodeZone(toPin);
    
    if (zone1 === zone2) return 1.0; // Same zone
    if (Math.abs(zone1 - zone2) === 1) return 1.2; // Adjacent zones
    if (Math.abs(zone1 - zone2) === 2) return 1.4; // 2 zones apart
    return 1.6; // Far zones
  }

  // Helper method to calculate delivery days based on carrier type and route
  private getDeliveryDays(carrierType: string, fromPin: string, toPin: string): number {
    const baseDelivery = {
      'Express': 1,
      'Priority': 2,
      'Standard': 3,
      'Economy': 5
    };
    
    const base = baseDelivery[carrierType as keyof typeof baseDelivery] || 3;
    const distanceMultiplier = this.getDistanceMultiplier(fromPin, toPin);
    
    return Math.round(base * distanceMultiplier);
  }

  // Pincode utility methods
  private getPincodeZone(pincode: string): number {
    if (!pincode || pincode.length === 0) return 1;
    const firstDigit = parseInt(pincode.charAt(0));
    return firstDigit || 1;
  }

  private isMetroToMetro(fromPin: string, toPin: string): boolean {
    if (!fromPin || !toPin) return false;
    const metroZones = ['110', '400', '560', '600', '700', '201']; // Delhi, Mumbai, Bangalore, Chennai, Kolkata, Noida
    return metroZones.some(zone => fromPin.startsWith(zone)) && 
           metroZones.some(zone => toPin.startsWith(zone));
  }

  private isInternationalHub(fromPin: string, toPin: string): boolean {
    if (!fromPin || !toPin) return false;
    const hubs = ['110', '400', '600']; // Major international hubs
    return hubs.some(hub => fromPin.startsWith(hub) || toPin.startsWith(hub));
  }

  private isTierOneCity(fromPin: string, toPin: string): boolean {
    if (!fromPin || !toPin) return false;
    const tierOne = ['110', '400', '560', '600', '700', '201', '411', '500']; // Major cities
    return tierOne.some(city => fromPin.startsWith(city) || toPin.startsWith(city));
  }

  private isTierTwoCity(fromPin: string, toPin: string): boolean {
    if (!fromPin || !toPin) return false;
    const tierTwo = ['302', '380', '462', '482', '641', '682']; // Tier 2 cities
    return tierTwo.some(city => fromPin.startsWith(city) || toPin.startsWith(city));
  }

  private isUrbanArea(fromPin: string, toPin: string): boolean {
    if (!fromPin || !toPin || fromPin.length < 6 || toPin.length < 6) return false;
    // Urban areas typically have pincodes ending in 001-099
    const fromUrban = parseInt(fromPin.slice(-3)) < 100;
    const toUrban = parseInt(toPin.slice(-3)) < 100;
    return fromUrban || toUrban;
  }

  private isRemoteArea(fromPin: string, toPin: string): boolean {
    if (!fromPin || !toPin || fromPin.length < 6 || toPin.length < 6) return false;
    // Remote areas typically have pincodes ending in 800-999
    const fromRemote = parseInt(fromPin.slice(-3)) > 800;
    const toRemote = parseInt(toPin.slice(-3)) > 800;
    return fromRemote || toRemote;
  }

  private isDomesticRoute(fromPin: string, toPin: string): boolean {
    if (!fromPin || !toPin) return false;
    // All Indian pincodes are 6 digits starting with 1-8
    const fromValid = /^[1-8]\d{5}$/.test(fromPin);
    const toValid = /^[1-8]\d{5}$/.test(toPin);
    return fromValid && toValid;
  }
}