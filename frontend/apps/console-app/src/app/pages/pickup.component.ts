import { Component, OnInit, ViewChild, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';

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

interface PickupCarrierOption {
  id: string;
  name: string;
  type?: string;
  duration: string;
  price: number;
  serviceable: boolean;
  estimatedPickup: string;
  logo?: string;
  // Enhanced serviceability properties
  pickupDays?: number;
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
  selector: 'app-pickup',
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
    MatIconModule
  ],
  template: `
    <!-- Modern Layout with Tailwind + Material -->
    <div class="min-h-screen bg-slate-50">
      
      <!-- Header Section -->
      <header class="bg-white border-b border-slate-200 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-6">
            <h1 class="text-3xl font-bold text-slate-900 flex items-center">
              🚚 <span class="ml-2">Pickup Entry</span>
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
                    Next: Pickup Details →
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
          </mat-step>

          <!-- Step 2: Pickup Details (Modified from Orders Step 2) -->
          <mat-step label="Pickup Details" [completed]="pickupForm.get('weight')?.valid">
            <mat-card class="mb-6 border-0 shadow-md">
              <mat-card-header class="pb-4">
                <mat-card-title class="text-xl font-semibold text-slate-900">
                  📦 Pickup Details
                </mat-card-title>
                <p class="text-sm text-slate-600 mt-2">Enter item details and pickup information</p>
              </mat-card-header>
              
              <mat-card-content>
                <form [formGroup]="pickupForm">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  <!-- Package Details -->
                  <div class="lg:col-span-2">
                    <h4 class="text-lg font-medium text-slate-700 mb-4">Package Information</h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <mat-form-field>
                        <mat-label>Weight (kg)</mat-label>
                        <input matInput formControlName="weight" type="number" placeholder="0.5" (input)="onPickupDetailsChange()">
                      </mat-form-field>
                      <mat-form-field>
                        <mat-label>Length (cm)</mat-label>
                        <input matInput formControlName="length" type="number" placeholder="10" (input)="onPickupDetailsChange()">
                      </mat-form-field>
                      <mat-form-field>
                        <mat-label>Width (cm)</mat-label>
                        <input matInput formControlName="width" type="number" placeholder="10" (input)="onPickupDetailsChange()">
                      </mat-form-field>
                      <mat-form-field>
                        <mat-label>Height (cm)</mat-label>
                        <input matInput formControlName="height" type="number" placeholder="5" (input)="onPickupDetailsChange()">
                      </mat-form-field>
                      <mat-form-field>
                        <mat-label>Item Count</mat-label>
                        <input matInput formControlName="itemCount" type="number" placeholder="1" (input)="onPickupDetailsChange()">
                      </mat-form-field>
                      <mat-form-field>
                        <mat-label>Item Description</mat-label>
                        <input matInput formControlName="itemDescription" placeholder="Electronics, Documents, etc.">
                      </mat-form-field>
                    </div>
                  </div>

                  <!-- Pickup Details (Sender Details from Orders) -->
                  <div class="md:col-span-2 lg:col-span-3">
                    <h4 class="text-lg font-medium text-slate-700 mb-4 pt-4 border-t border-slate-200">Pickup Address</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <mat-form-field>
                        <mat-label>Sender Name</mat-label>
                        <input matInput formControlName="senderName" placeholder="Contact Person Name" (input)="onAddressChange()">
                      </mat-form-field>
                      <mat-form-field>
                        <mat-label>Sender Contact</mat-label>
                        <input matInput formControlName="senderContact" placeholder="9876543210">
                      </mat-form-field>
                      <div class="md:col-span-2">
                        <mat-form-field class="w-full">
                          <mat-label>Pickup Address</mat-label>
                          <input matInput formControlName="pickupAddress" placeholder="Complete pickup address with pincode" (input)="onAddressChange()">
                        </mat-form-field>
                      </div>
                      <div class="md:col-span-2">
                        <mat-form-field class="w-full">
                          <mat-label>Special Instructions</mat-label>
                          <textarea matInput formControlName="specialInstructions" rows="3" placeholder="Any special pickup instructions..."></textarea>
                        </mat-form-field>
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
                    [disabled]="!pickupForm.get('weight')?.valid" 
                    (click)="proceedToServiceSelection(stepper)"
                    class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                    Check Service Availability →
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
          </mat-step>

          <!-- Step 3: Pickup Service Selection (Modified from Orders Step 3) -->
          <mat-step label="Service Selection" [completed]="selectedCarrier !== null">
            <mat-card class="mb-6 border-0 shadow-md">
              <mat-card-header class="pb-4">
                <mat-card-title class="text-xl font-semibold text-slate-900">
                  🚚 Select Pickup Service
                </mat-card-title>
                <p class="text-sm text-slate-600 mt-2">Choose from available pickup services for your location</p>
              </mat-card-header>
              
              <mat-card-content>
                <!-- Service Availability Check Button -->
                <div class="mb-6 text-center" *ngIf="!serviceabilityChecked">
                  <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div class="text-blue-700 mb-4">
                      <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <h3 class="text-lg font-semibold">Ready to Check Service Availability</h3>
                      <p class="text-sm">We'll check which pickup services are available in your area</p>
                    </div>
                    <button 
                      mat-raised-button 
                      color="primary"
                      [disabled]="!canCheckServiceability()" 
                      (click)="checkServiceability()"
                      class="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold">
                      🔍 Check Available Services
                    </button>
                    <div class="mt-3 text-xs text-slate-500" *ngIf="!canCheckServiceability()">
                      Please fill in weight and pickup address to check availability
                    </div>
                  </div>
                </div>

                <!-- Loading State -->
                <div class="text-center py-12" *ngIf="checkingServiceability">
                  <mat-spinner class="mx-auto mb-4"></mat-spinner>
                  <p class="text-slate-600">Checking pickup service availability...</p>
                </div>

                <!-- Pickup Service Results -->
                <div *ngIf="!checkingServiceability && serviceabilityChecked && pickupCarriers.length > 0">
                  <div class="mb-6">
                    <h3 class="text-lg font-semibold text-slate-700 mb-2">Available Pickup Services</h3>
                    <p class="text-sm text-slate-600">{{getServiceableCount()}} out of {{pickupCarriers.length}} services available for this location</p>
                  </div>
                  
                  <div class="space-y-4">
                    <div *ngFor="let carrier of pickupCarriers; trackBy: trackByCarrierId" 
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
                            <p class="text-sm text-slate-600">{{carrier.type || 'Pickup Service'}}</p>
                          </div>
                        </div>
                        <mat-chip [class]="carrier.serviceable ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'">
                          {{carrier.serviceable ? '✅ Available' : '❌ Not Available'}}
                        </mat-chip>
                      </div>
                      
                      <div *ngIf="carrier.serviceable" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div class="text-center">
                          <div class="text-sm text-slate-500">Pickup Time</div>
                          <div class="font-semibold text-slate-900">{{carrier.duration}}</div>
                        </div>
                        <div class="text-center">
                          <div class="text-sm text-slate-500">Service Fee</div>
                          <div class="font-bold text-blue-600 text-lg">₹{{carrier.price}}</div>
                        </div>
                        <div class="text-center">
                          <div class="text-sm text-slate-500">Est. Pickup</div>
                          <div class="font-semibold text-slate-900">{{carrier.estimatedPickup}}</div>
                        </div>
                        <div class="text-center">
                          <div class="text-sm text-slate-500">Weight</div>
                          <div class="font-semibold text-green-600 text-xs">{{carrier.weightCharged || pickupForm.get('weight')?.value}}kg</div>
                        </div>
                      </div>
                      
                      <div *ngIf="!carrier.serviceable" class="text-center py-4">
                        <p class="text-red-600 text-sm italic">{{carrier.reason || 'Pickup service not available for this location'}}</p>
                        <div class="text-xs text-slate-500 mt-1">Unable to service {{pickupForm.get('pickupAddress')?.value}}</div>
                      </div>
                      
                      <div *ngIf="carrier.serviceable" class="flex items-center justify-between pt-3 border-t border-slate-100">
                        <div class="flex items-center space-x-2 text-sm text-slate-600">
                          <span>✓ SMS Updates</span>
                          <span>✓ Real-time tracking</span>
                        </div>
                        <div class="text-right">
                          <div class="text-xs text-slate-500">
                            {{selectedCarrier?.id === carrier.id ? '✓ Selected' : 'Click to select'}}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- No Services Available -->
                <div *ngIf="serviceabilityChecked && !checkingServiceability && pickupCarriers.length === 0" class="text-center py-12">
                  <div class="text-slate-400 mb-4">
                    <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <h3 class="text-lg font-medium text-slate-900 mb-2">No Pickup Services Available</h3>
                  <p class="text-slate-600">Sorry, we don't have pickup services available in this area at the moment.</p>
                </div>
                
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
                    [disabled]="!selectedCarrier?.serviceable" 
                    (click)="confirmPickup()"
                    class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                    🎯 Schedule Pickup
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
          </mat-step>

        </mat-stepper>

      </main>

      <!-- Always Visible Pickup Summary Below Content -->
      <div *ngIf="selectedClient" class="mt-8">
        <mat-card class="booking-summary-card border-0 shadow-lg">
          <mat-card-header class="pb-4">
            <mat-card-title class="text-xl font-semibold text-slate-900 flex items-center">
              📋 <span class="ml-2">Pickup Summary</span>
            </mat-card-title>
          </mat-card-header>
          
          <mat-card-content>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <!-- Client & Pickup Summary -->
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
                
                <!-- Pickup Details -->
                <div class="bg-slate-50 rounded-lg p-4">
                  <h3 class="font-semibold text-slate-900 mb-3">Pickup Details</h3>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="text-center">
                      <div class="text-sm text-slate-500">Weight</div>
                      <div class="font-bold text-slate-900">{{pickupForm.get('weight')?.value || 0}}kg</div>
                    </div>
                    <div class="text-center">
                      <div class="text-sm text-slate-500">Items</div>
                      <div class="font-bold text-slate-900">{{pickupForm.get('itemCount')?.value || 0}}</div>
                    </div>
                    <div class="text-center">
                      <div class="text-sm text-slate-500">Type</div>
                      <div class="font-bold text-slate-900">{{pickupForm.get('itemDescription')?.value || 'N/A'}}</div>
                    </div>
                    <div class="text-center">
                      <div class="text-sm text-slate-500">Pickup ID</div>
                      <div class="font-bold text-green-600 font-mono text-xs">{{pickupId}}</div>
                    </div>
                  </div>
                </div>
                
                <!-- Selected Carrier (if any) -->
                <div *ngIf="selectedCarrier" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 class="font-semibold text-blue-900 mb-3">Selected Pickup Service</h3>
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="font-semibold text-blue-900 text-lg">{{selectedCarrier.name}}</div>
                      <div class="text-blue-700 text-sm">{{selectedCarrier.type || 'Pickup Service'}}</div>
                    </div>
                    <div class="text-right">
                      <div class="font-bold text-blue-900 text-xl">₹{{selectedCarrier.price}}</div>
                      <div class="text-blue-700 text-sm">{{selectedCarrier.duration}}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Action Buttons & Status -->
              <div class="space-y-6">
                
                <!-- Completion Status -->
                <div class="bg-white border border-slate-200 rounded-lg p-4">
                  <h3 class="font-semibold text-slate-900 mb-3">Completion Status</h3>
                  <div class="space-y-3">
                    <div class="flex items-center space-x-3">
                      <div class="flex-shrink-0">
                        <div class="w-5 h-5 rounded-full" [class]="selectedClient ? 'bg-green-500' : 'bg-slate-300'"></div>
                      </div>
                      <span class="text-sm" [class]="selectedClient ? 'text-green-700 font-medium' : 'text-slate-500'">Client Selected</span>
                    </div>
                    <div class="flex items-center space-x-3">
                      <div class="flex-shrink-0">
                        <div class="w-5 h-5 rounded-full" [class]="pickupForm.get('weight')?.valid ? 'bg-green-500' : 'bg-slate-300'"></div>
                      </div>
                      <span class="text-sm" [class]="pickupForm.get('weight')?.valid ? 'text-green-700 font-medium' : 'text-slate-500'">Pickup Details</span>
                    </div>
                    <div class="flex items-center space-x-3">
                      <div class="flex-shrink-0">
                        <div class="w-5 h-5 rounded-full" [class]="selectedCarrier ? 'bg-green-500' : 'bg-slate-300'"></div>
                      </div>
                      <span class="text-sm" [class]="selectedCarrier ? 'text-green-700 font-medium' : 'text-slate-500'">Service Selected</span>
                    </div>
                  </div>
                </div>
                
                <!-- Quick Actions -->
                <div class="bg-slate-50 rounded-lg p-4">
                  <h3 class="font-semibold text-slate-900 mb-3">Quick Actions</h3>
                  <div class="space-y-2">
                    <button 
                      class="w-full text-left text-sm text-slate-600 hover:text-slate-900 py-2 px-3 rounded hover:bg-white transition-colors"
                      (click)="resetForm()">
                      🔄 Reset Form
                    </button>
                    <button 
                      class="w-full text-left text-sm text-slate-600 hover:text-slate-900 py-2 px-3 rounded hover:bg-white transition-colors"
                      *ngIf="selectedClient">
                      📋 View Client Details
                    </button>
                    <button 
                      class="w-full text-left text-sm text-slate-600 hover:text-slate-900 py-2 px-3 rounded hover:bg-white transition-colors"
                      *ngIf="selectedCarrier">
                      🚚 Service Details
                    </button>
                  </div>
                </div>
                
                <!-- Final Action Button -->
                <div *ngIf="selectedCarrier" class="bg-green-50 border border-green-200 rounded-lg p-4">
                  <button 
                    mat-raised-button 
                    color="primary"
                    class="w-full bg-green-600 hover:bg-green-700"
                    (click)="confirmPickup()">
                    🎯 Confirm Pickup
                  </button>
                  <div class="text-center mt-2">
                    <span class="text-xs text-green-700">Total: ₹{{selectedCarrier.price}}</span>
                  </div>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styleUrl: './pickup.component.scss'
})
export class PickupComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;
  
  pickupForm!: FormGroup;
  selectedClient: Client | null = null;
  selectedCarrier: PickupCarrierOption | null = null;
  pickupId: string = '';
  
  // Search and filter properties
  showClientSearch = false;
  searchQuery = '';
  statusFilter: 'all' | 'active' | 'inactive' = 'all';
  viewMode: 'grid' | 'list' = 'grid';
  filteredClients: Client[] = [];
  
  // Service checking
  serviceabilityChecked = false;
  checkingServiceability = false;
  
  // Demo data (same as orders)
  clients: Client[] = [
    {
      id: '1',
      date: '22/08/2025',
      subContractCode: 'FIRST001',
      clientName: 'First Promotional - Pune',
      accountNo: '411040',
      contactPerson: 'Rajesh Gupta',
      address: 'Shivajinagar, Pune',
      pincode: '411005',
      city: 'Pune',
      active: true
    },
    {
      id: '2',
      date: '22/08/2025',
      subContractCode: 'TECH002',
      clientName: 'TechCorp Solutions',
      accountNo: '400069',
      contactPerson: 'Priya Sharma',
      address: 'Andheri East, Mumbai',
      pincode: '400069',
      city: 'Mumbai',
      active: true
    },
    {
      id: '3',
      date: '21/08/2025',
      subContractCode: 'GLOB003',
      clientName: 'Global Industries Ltd',
      accountNo: '110001',
      contactPerson: 'Amit Kumar',
      address: 'Connaught Place, Delhi',
      pincode: '110001',
      city: 'Delhi',
      active: false
    },
    {
      id: '4',
      date: '20/08/2025',
      subContractCode: 'RETAIL004',
      clientName: 'Retail Express Co',
      accountNo: '560034',
      contactPerson: 'Sneha Patel',
      address: 'Koramangala, Bangalore',
      pincode: '560034',
      city: 'Bangalore',
      active: true
    }
  ];

  pickupCarriers: PickupCarrierOption[] = [
    {
      id: 'express-pickup',
      name: 'Express Pickup',
      type: 'Same Day Pickup',
      duration: 'Within 4 hours',
      price: 150,
      serviceable: true,
      estimatedPickup: 'Today by 6 PM',
      weightCharged: 0.5,
      route: 'Local'
    },
    {
      id: 'standard-pickup',
      name: 'Standard Pickup',
      type: 'Next Day Pickup',
      duration: 'Next working day',
      price: 75,
      serviceable: true,
      estimatedPickup: 'Tomorrow',
      weightCharged: 0.5,
      route: 'Regional'
    },
    {
      id: 'economy-pickup',
      name: 'Economy Pickup',
      type: 'Scheduled Pickup',
      duration: '2-3 working days',
      price: 50,
      serviceable: true,
      estimatedPickup: 'Within 3 days',
      weightCharged: 0.5,
      route: 'Standard'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.initializeClients();
    this.pickupId = this.generatePickupId();
  }

  initializeForm() {
    this.pickupForm = this.fb.group({
      // Package details
      weight: ['', [Validators.required, Validators.min(0.1)]],
      length: [''],
      width: [''],
      height: [''],
      itemCount: ['1', [Validators.required, Validators.min(1)]],
      itemDescription: [''],
      
      // Pickup details
      senderName: ['', Validators.required],
      senderContact: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      pickupAddress: ['', Validators.required],
      specialInstructions: ['']
    });
  }

  initializeClients() {
    this.updateFilteredClients();
  }

  // Client Management Methods (copied from orders)
  toggleClientSearch() {
    this.showClientSearch = !this.showClientSearch;
    if (!this.showClientSearch) {
      this.searchQuery = '';
      this.updateFilteredClients();
    }
  }

  onSearchChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value;
    this.updateFilteredClients();
  }

  setStatusFilter(filter: 'all' | 'active' | 'inactive') {
    this.statusFilter = filter;
    this.updateFilteredClients();
  }

  updateFilteredClients() {
    let filtered = this.clients;

    // Apply status filter
    if (this.statusFilter === 'active') {
      filtered = filtered.filter(client => client.active);
    } else if (this.statusFilter === 'inactive') {
      filtered = filtered.filter(client => !client.active);
    }

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(client =>
        client.clientName.toLowerCase().includes(query) ||
        client.contactPerson.toLowerCase().includes(query) ||
        client.subContractCode.toLowerCase().includes(query) ||
        client.city.toLowerCase().includes(query) ||
        client.accountNo.includes(query)
      );
    }

    this.filteredClients = filtered;
  }

  selectClient(client: Client) {
    if (client.active) {
      this.selectedClient = client;
      // Pre-fill some form fields based on client data
      this.pickupForm.patchValue({
        senderName: client.contactPerson,
        pickupAddress: `${client.address}, ${client.city} - ${client.pincode}`
      });
    }
  }

  clearFilters() {
    this.searchQuery = '';
    this.statusFilter = 'all';
    this.updateFilteredClients();
  }

  // Helper methods for client display (copied from orders)
  getTotalClientsCount(): number {
    return this.clients.length;
  }

  getActiveClientsCount(): number {
    return this.clients.filter(client => client.active).length;
  }

  getInactiveClientsCount(): number {
    return this.clients.filter(client => !client.active).length;
  }

  getClientGridClasses(): string {
    const baseClasses = 'grid gap-6 mt-4';
    return this.viewMode === 'grid' 
      ? `${baseClasses} grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
      : `${baseClasses} grid-cols-1`;
  }

  getEnhancedClientCardClasses(client: Client): string {
    const baseClasses = 'enhanced-client-card';
    const selectedClass = this.selectedClient?.id === client.id ? 'selected' : '';
    const inactiveClass = !client.active ? 'inactive' : '';
    
    return `${baseClasses} ${selectedClass} ${inactiveClass}`.trim();
  }

  trackByClientId(index: number, client: Client): string {
    return client.id;
  }

  // Form change handlers
  onPickupDetailsChange() {
    // Reset serviceability when pickup details change
    this.serviceabilityChecked = false;
    this.selectedCarrier = null;
  }

  onAddressChange() {
    // Reset serviceability when address changes
    this.serviceabilityChecked = false;
    this.selectedCarrier = null;
  }

  // Service selection methods (adapted from orders)
  canCheckServiceability(): boolean {
    return !!(this.pickupForm.get('weight')?.valid && 
              this.pickupForm.get('pickupAddress')?.valid);
  }

  proceedToServiceSelection(stepper: MatStepper) {
    if (this.canCheckServiceability()) {
      stepper.next();
    }
  }

  checkServiceability() {
    this.checkingServiceability = true;
    this.serviceabilityChecked = false;
    
    // Simulate API call
    setTimeout(() => {
      this.checkingServiceability = false;
      this.serviceabilityChecked = true;
      this.cdr.detectChanges();
    }, 2000);
  }

  selectCarrier(carrier: PickupCarrierOption) {
    if (carrier.serviceable) {
      this.selectedCarrier = carrier;
    }
  }

  getCarrierCardClasses(carrier: PickupCarrierOption): string {
    const baseClasses = 'pickup-service-card';
    const selectedClass = this.selectedCarrier?.id === carrier.id ? 'selected' : '';
    const serviceableClass = carrier.serviceable ? 'serviceable' : 'not-serviceable';
    
    return `${baseClasses} ${selectedClass} ${serviceableClass}`.trim();
  }

  trackByCarrierId(index: number, carrier: PickupCarrierOption): string {
    return carrier.id;
  }

  confirmPickup() {
    if (this.pickupForm.valid && this.selectedClient && this.selectedCarrier) {
      const pickupData = {
        ...this.pickupForm.value,
        client: this.selectedClient,
        carrier: this.selectedCarrier,
        pickupId: this.generatePickupId()
      };
      
      console.log('Pickup scheduled:', pickupData);
      
      alert(`🚚 Pickup scheduled successfully!
        
Client: ${this.selectedClient.clientName}
Service: ${this.selectedCarrier.name}
Fee: ₹${this.selectedCarrier.price}
Estimated Pickup: ${this.selectedCarrier.estimatedPickup}
        
Pickup ID: ${pickupData.pickupId}`);
      
      // Reset form for next pickup
      this.resetForm();
    } else {
      alert('❌ Please fill all required fields and select a pickup service.');
    }
  }

  resetForm() {
    this.pickupForm.reset();
    this.selectedClient = null;
    this.selectedCarrier = null;
    this.serviceabilityChecked = false;
    this.stepper.reset();
  }

  generatePickupId(): string {
    return 'PKP' + Math.floor(Math.random() * 1000000000);
  }

  getServiceableCount(): number {
    return this.pickupCarriers.filter(carrier => carrier.serviceable).length;
  }

  getCarrierIcon(carrierName: string): string {
    const icons: { [key: string]: string } = {
      'ExpressPickup': '⚡',
      'StandardPickup': '📦',
      'EconomyPickup': '🚚',
      'SameDay': '🏃',
      'NextDay': '⏰'
    };
    return icons[carrierName] || '🚚';
  }
}