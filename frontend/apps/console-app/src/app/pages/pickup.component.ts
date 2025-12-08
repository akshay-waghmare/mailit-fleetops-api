import { Component, OnInit, ViewChild, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

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
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Services
import { PickupService } from '../../../../../libs/shared/pickup.service';
import { SchedulePickupData } from '../../../../../libs/shared/pickup.interface';
import { ClientService } from '../services/client.service';
import { Client } from '../models/client.model';

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

interface Employee {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  designation: string;
  contact: string;
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
    MatIconModule,
    MatRadioModule,
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
                  <div *ngFor="let client of displayedClients; trackBy: trackByClientId" 
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
                
                <!-- Load More Button -->
                <div *ngIf="hasMoreClients()" class="mt-6 flex justify-center">
                  <button 
                    mat-stroked-button 
                    color="primary"
                    (click)="loadMoreClients()"
                    class="px-8 py-2 rounded-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors">
                    <span class="flex items-center gap-2">
                      <span>Load More Clients</span>
                      <span class="text-sm text-slate-500">({{getRemainingClientsCount()}} remaining)</span>
                    </span>
                  </button>
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
          <mat-step label="Pickup Details" [completed]="isPickupDetailsComplete()">
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

                  <!-- Vendor Type Selection -->
                  <div class="md:col-span-2 lg:col-span-3">
                    <h4 class="text-lg font-medium text-slate-700 mb-4 pt-4 border-t border-slate-200">Pickup Configuration</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      
                      <!-- Vendor Type Selection -->
                      <div class="bg-slate-50 rounded-lg p-4">
                        <h5 class="text-md font-medium text-slate-700 mb-3 flex items-center">
                          <span class="mr-2">🏪</span> Pickup Type
                        </h5>
                        <mat-radio-group formControlName="isVendorType" (change)="onVendorTypeChange()">
                          <div class="space-y-3">
                            <mat-radio-button [value]="true" class="block">
                              <span class="ml-2">
                                <strong>Vendor Pickup</strong>
                                <div class="text-sm text-slate-600">Requires carrier selection and scheduling</div>
                              </span>
                            </mat-radio-button>
                            <mat-radio-button [value]="false" class="block">
                              <span class="ml-2">
                                <strong>Direct Pickup</strong>
                                <div class="text-sm text-slate-600">Internal pickup, no external carrier needed</div>
                              </span>
                            </mat-radio-button>
                          </div>
                        </mat-radio-group>
                      </div>

                      <!-- Pickup Staff Selection -->
                      <div class="bg-blue-50 rounded-lg p-4">
                        <h5 class="text-md font-medium text-slate-700 mb-3 flex items-center">
                          <span class="mr-2">👤</span> Assign Pickup Staff
                        </h5>
                        <mat-form-field class="w-full">
                          <mat-label>Select Employee</mat-label>
                          <mat-select formControlName="pickupStaffId" (selectionChange)="onPickupStaffChange()">
                            <mat-option value="">Choose Staff Member</mat-option>
                            <mat-option *ngFor="let employee of employees" [value]="employee.id">
                              <div class="py-1">
                                <div class="font-medium">{{employee.name}}</div>
                                <div class="text-sm text-slate-600">{{employee.designation}} • {{employee.employeeId}}</div>
                              </div>
                            </mat-option>
                          </mat-select>
                          <mat-hint>Employee responsible for handling this pickup</mat-hint>
                        </mat-form-field>
                      </div>
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
                    [disabled]="!isPickupDetailsComplete()" 
                    (click)="proceedToNextStep(stepper)"
                    class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                    {{getNextStepLabel()}} →
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
          </mat-step>

          <!-- Step 3: Pickup Service Selection (Modified from Orders Step 3) - Only for Vendor Type -->
          <mat-step *ngIf="isVendorPickup()" label="Service Selection" [completed]="selectedCarrier !== null">
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

          <!-- Step 3 Alternative: Direct Pickup Confirmation (For Non-Vendor Type) -->
          <mat-step *ngIf="!isVendorPickup() && isPickupDetailsComplete()" label="Confirm Pickup" [completed]="false">
            <mat-card class="mb-6 border-0 shadow-md">
              <mat-card-header class="pb-4">
                <mat-card-title class="text-xl font-semibold text-slate-900">
                  ✅ Confirm Direct Pickup
                </mat-card-title>
                <p class="text-sm text-slate-600 mt-2">Review and confirm your internal pickup details</p>
              </mat-card-header>
              
              <mat-card-content>
                <div class="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div class="text-green-700 mb-4">
                    <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h3 class="text-lg font-semibold text-center">Direct Pickup Ready</h3>
                    <p class="text-sm text-center">This pickup will be handled internally by your staff</p>
                  </div>
                  
                  <!-- Internal Pickup Summary -->
                  <div class="bg-white rounded-lg p-4 mb-4">
                    <h4 class="font-semibold text-slate-700 mb-3">Pickup Summary</h4>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span class="text-slate-600">Pickup Type:</span>
                        <span class="font-medium text-green-700 ml-2">Direct/Internal</span>
                      </div>
                      <div>
                        <span class="text-slate-600">Assigned Staff:</span>
                        <span class="font-medium text-blue-700 ml-2">{{getSelectedEmployeeName()}}</span>
                      </div>
                      <div>
                        <span class="text-slate-600">Items:</span>
                        <span class="font-medium ml-2">{{pickupForm.get('itemCount')?.value}} item(s)</span>
                      </div>
                      <div>
                        <span class="text-slate-600">Weight:</span>
                        <span class="font-medium ml-2">{{pickupForm.get('weight')?.value}} kg</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="text-center">
                    <p class="text-sm text-green-600 mb-4">✓ No external carrier required for this pickup</p>
                    <button 
                      mat-raised-button 
                      color="primary"
                      (click)="confirmDirectPickup()"
                      class="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-semibold">
                      🎯 Confirm Internal Pickup
                    </button>
                  </div>
                </div>
                
                <div class="mt-8 flex justify-between">
                  <button 
                    mat-stroked-button 
                    (click)="stepper.previous()"
                    class="border-slate-300 text-slate-700 hover:bg-slate-50">
                    ← Previous
                  </button>
                  <div></div>
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

                <!-- Pickup Configuration -->
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 class="font-semibold text-blue-900 mb-3">Pickup Configuration</h3>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <div class="text-sm text-blue-600">Pickup Type:</div>
                      <div class="font-semibold text-blue-900">
                        {{isVendorPickup() ? '🏪 Vendor Pickup' : '🏢 Direct Pickup'}}
                      </div>
                    </div>
                    <div>
                      <div class="text-sm text-blue-600">Assigned Staff:</div>
                      <div class="font-semibold text-blue-900">
                        {{getSelectedEmployeeName()}}
                      </div>
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
                        <div class="w-5 h-5 rounded-full" [class]="isPickupDetailsComplete() ? 'bg-green-500' : 'bg-slate-300'"></div>
                      </div>
                      <span class="text-sm" [class]="isPickupDetailsComplete() ? 'text-green-700 font-medium' : 'text-slate-500'">Pickup Details</span>
                    </div>
                    <div class="flex items-center space-x-3">
                      <div class="flex-shrink-0">
                        <div class="w-5 h-5 rounded-full" [class]="selectedEmployee ? 'bg-green-500' : 'bg-slate-300'"></div>
                      </div>
                      <span class="text-sm" [class]="selectedEmployee ? 'text-green-700 font-medium' : 'text-slate-500'">Staff Assigned</span>
                    </div>
                    <div class="flex items-center space-x-3" *ngIf="isVendorPickup()">
                      <div class="flex-shrink-0">
                        <div class="w-5 h-5 rounded-full" [class]="selectedCarrier ? 'bg-green-500' : 'bg-slate-300'"></div>
                      </div>
                      <span class="text-sm" [class]="selectedCarrier ? 'text-green-700 font-medium' : 'text-slate-500'">Service Selected</span>
                    </div>
                    <div class="flex items-center space-x-3" *ngIf="!isVendorPickup()">
                      <div class="flex-shrink-0">
                        <div class="w-5 h-5 rounded-full" [class]="isPickupDetailsComplete() ? 'bg-green-500' : 'bg-slate-300'"></div>
                      </div>
                      <span class="text-sm" [class]="isPickupDetailsComplete() ? 'text-green-700 font-medium' : 'text-slate-500'">Ready for Confirmation</span>
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
                <div *ngIf="isPickupDetailsComplete()" class="bg-green-50 border border-green-200 rounded-lg p-4">
                  <button 
                    *ngIf="isVendorPickup() && selectedCarrier"
                    mat-raised-button 
                    color="primary"
                    class="w-full bg-green-600 hover:bg-green-700"
                    (click)="confirmPickup()">
                    🎯 Confirm Vendor Pickup
                  </button>
                  <button 
                    *ngIf="!isVendorPickup()"
                    mat-raised-button 
                    color="primary"
                    class="w-full bg-green-600 hover:bg-green-700"
                    (click)="confirmDirectPickup()">
                    🎯 Confirm Direct Pickup
                  </button>
                  <div class="text-center mt-2">
                    <span *ngIf="isVendorPickup() && selectedCarrier" class="text-xs text-green-700">
                      Total: ₹{{selectedCarrier.price}}
                    </span>
                    <span *ngIf="!isVendorPickup()" class="text-xs text-green-700">
                      Internal Pickup - No Service Fee
                    </span>
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
  selectedEmployee: Employee | null = null;
  pickupId: string = '';
  
  // Search and filter properties
  showClientSearch = true;
  searchQuery = '';
  private searchSubject = new Subject<string>();
  statusFilter: 'all' | 'active' | 'inactive' = 'all';
  viewMode: 'grid' | 'list' = 'grid';
  filteredClients: Client[] = [];
  
  // Pagination properties
  displayedClients: Client[] = [];
  clientsPerPage = 12;
  currentPage = 0; // 0-indexed for backend
  totalClients = 0;
  
  // Service checking
  serviceabilityChecked = false;
  checkingServiceability = false;
  
  // Client data loaded from API
  clients: Client[] = [];

  // Demo employee data
  employees: Employee[] = [
    {
      id: 'emp001',
      name: 'Rahul Sharma',
      employeeId: 'FLT001',
      department: 'Operations',
      designation: 'Pickup Executive',
      contact: '9876543210',
      active: true
    },
    {
      id: 'emp002',
      name: 'Priya Patel',
      employeeId: 'FLT002',
      department: 'Logistics',
      designation: 'Senior Pickup Coordinator',
      contact: '9876543211',
      active: true
    },
    {
      id: 'emp003',
      name: 'Amit Kumar',
      employeeId: 'FLT003',
      department: 'Operations',
      designation: 'Field Officer',
      contact: '9876543212',
      active: true
    },
    {
      id: 'emp004',
      name: 'Sneha Singh',
      employeeId: 'FLT004',
      department: 'Customer Service',
      designation: 'Pickup Specialist',
      contact: '9876543213',
      active: true
    },
    {
      id: 'emp005',
      name: 'Ravi Gupta',
      employeeId: 'FLT005',
      department: 'Operations',
      designation: 'Team Lead - Pickup',
      contact: '9876543214',
      active: false
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
    private ngZone: NgZone,
    private pickupService: PickupService,
    private clientService: ClientService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.initializeClients();
    this.pickupId = this.generatePickupId();

    // Setup search debounce
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(query => {
      this.currentPage = 0;
      this.clients = []; // Clear existing list for new search
      this.loadClients(query);
    });
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
      
      // Pickup configuration
      isVendorType: [true, Validators.required], // Default to vendor pickup
      pickupStaffId: ['', Validators.required],
      
      // Pickup details
      senderName: ['', Validators.required],
      senderContact: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      pickupAddress: ['', Validators.required],
      specialInstructions: ['']
    });
  }

  initializeClients() {
    this.loadClients();
  }

  loadClients(query: string = '') {
    this.clientService.getClientsPaginated(this.currentPage, this.clientsPerPage, query).subscribe({
      next: (response: any) => {
        const apiClients = response.content || [];
        this.totalClients = response.totalElements;
        
        // Transform API clients
        const newClients = apiClients.map((client: any) => ({
          id: client.id,
          date: client.createdAt || new Date().toLocaleDateString(),
          subContractCode: client.subContractCode || '',
          clientName: client.name || '',
          accountNo: client.contractNo || '',
          contactPerson: client.contactPerson || client.vcontactPerson || '',
          address: client.address || client.vaddress || '',
          pincode: client.vpincode || '',
          city: client.vcity || '',
          active: true,
          name: client.name,
          vcontactMobile: client.vcontactMobile || ''
        }));

        if (this.currentPage === 0) {
          this.clients = newClients;
        } else {
          this.clients = [...this.clients, ...newClients];
        }
        
        // Update display lists
        this.filteredClients = this.clients;
        this.displayedClients = this.clients;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load clients:', err);
        this.snackBar.open('Failed to load clients', 'Close', { duration: 3000 });
      }
    });
  }

  // Client Management Methods (copied from orders)
  toggleClientSearch() {
    this.showClientSearch = !this.showClientSearch;
    if (!this.showClientSearch) {
      this.searchQuery = '';
      this.currentPage = 0;
      this.loadClients();
    }
  }

  onSearchChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value;
    this.searchSubject.next(this.searchQuery);
  }

  setStatusFilter(filter: 'all' | 'active' | 'inactive') {
    this.statusFilter = filter;
    // For now, just reload (though backend doesn't support status filter yet)
    // Ideally we would add status param to backend
    this.currentPage = 0;
    this.loadClients(this.searchQuery);
  }

  updateFilteredClients() {
    // No-op for now as we use server-side search
    // If we implement status filter locally on the loaded page:
    /*
    let filtered = this.clients;
    if (this.statusFilter === 'active') {
      filtered = filtered.filter(client => client.active);
    } else if (this.statusFilter === 'inactive') {
      filtered = filtered.filter(client => !client.active);
    }
    this.displayedClients = filtered;
    */
   this.displayedClients = this.clients;
  }

  updateDisplayedClients() {
    // No-op as displayedClients is updated in loadClients
  }

  loadMoreClients() {
    this.currentPage++;
    this.loadClients(this.searchQuery);
  }

  hasMoreClients(): boolean {
    return this.clients.length < this.totalClients;
  }

  getRemainingClientsCount(): number {
    return this.totalClients - this.clients.length;
  }

  selectClient(client: Client) {
    if (client.active) {
      this.selectedClient = client;
      console.log('Selected client:', client);
      console.log('vcontactMobile:', client.vcontactMobile);
      // Pre-fill some form fields based on client data
      const formValues = {
        senderName: client.contactPerson || client.vcontactPerson,
        senderContact: client.vcontactMobile || '',
        pickupAddress: `${client.address || client.vaddress || ''}, ${client.city || client.vcity || ''} - ${client.pincode || client.vpincode || ''}`
      };
      console.log('Form values to patch:', formValues);
      this.pickupForm.patchValue(formValues);
      
      // Auto-advance to next step
      setTimeout(() => {
        if (this.stepper) {
          this.stepper.next();
        }
      }, 100);
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
    return client.id?.toString() || '';
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

  onVendorTypeChange() {
    // Reset carrier selection when vendor type changes
    this.selectedCarrier = null;
    this.serviceabilityChecked = false;
  }

  onPickupStaffChange() {
    const staffId = this.pickupForm.get('pickupStaffId')?.value;
    this.selectedEmployee = this.employees.find(emp => emp.id === staffId) || null;
  }

  // Form validation helpers
  isPickupDetailsComplete(): boolean {
    const form = this.pickupForm;
    return !!(
      form.get('weight')?.valid &&
      form.get('itemCount')?.valid &&
      form.get('senderName')?.valid &&
      form.get('senderContact')?.valid &&
      form.get('pickupAddress')?.valid &&
      form.get('pickupStaffId')?.valid &&
      form.get('isVendorType')?.valid
    );
  }

  isVendorPickup(): boolean {
    return this.pickupForm.get('isVendorType')?.value === true;
  }

  getNextStepLabel(): string {
    return this.isVendorPickup() ? 'Check Service Availability' : 'Confirm Pickup';
  }

  proceedToNextStep(stepper: MatStepper) {
    if (this.isPickupDetailsComplete()) {
      if (this.isVendorPickup()) {
        stepper.next(); // Go to carrier selection
      } else {
        stepper.next(); // Go to direct pickup confirmation
      }
    }
  }

  getSelectedEmployeeName(): string {
    return this.selectedEmployee?.name || 'Not assigned';
  }

  confirmDirectPickup() {
    if (this.pickupForm.valid && this.selectedClient && this.selectedEmployee) {
      const scheduleData: SchedulePickupData = {
        client: {
          id: this.selectedClient.id?.toString() || '',
          clientName: this.selectedClient.clientName || this.selectedClient.name || '',
          clientCompany: this.selectedClient.subContractCode,
          address: this.selectedClient.address || '',
          contactNumber: this.selectedClient.contactPerson
        },
        itemCount: parseInt(this.pickupForm.value.itemCount) || 1,
        totalWeight: parseFloat(this.pickupForm.value.weight) || 0,
        itemDescription: this.pickupForm.value.itemDescription || '',
        specialInstructions: this.pickupForm.value.specialInstructions || '',
        pickupType: 'direct',
        employee: {
          id: this.selectedEmployee.id,
          name: this.selectedEmployee.name,
          employeeId: this.selectedEmployee.employeeId,
          department: 'Operations'
        },
        pickupDate: new Date().toISOString().split('T')[0],
        pickupTime: '10:00 AM'
      };
      
      // Call the pickup service to create the pickup
      this.pickupService.createPickup(scheduleData).subscribe({
        next: (createdPickup) => {
          console.log('Direct pickup created successfully:', createdPickup);
          
          // Show success notification with navigation option
          const snackBarRef = this.snackBar.open(
            `✅ Direct pickup ${createdPickup.pickupId} confirmed successfully!`, 
            'View All Pickups', 
            {
              duration: 10000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['success-snackbar']
            }
          );
          
          // Navigate to pickup list when user clicks the action button
          snackBarRef.onAction().subscribe(() => {
            this.router.navigate(['/pickup-list'], { 
              queryParams: { highlight: createdPickup.id } 
            });
          });
          
          // Show additional detailed notification with better UX
          setTimeout(() => {
            this.snackBar.open(
              `Pickup assigned to ${this.selectedEmployee?.name || 'Staff'} • ${this.pickupForm.get('itemCount')?.value} items (${this.pickupForm.get('weight')?.value}kg) • Type: Direct/Internal`,
              'View List',
              {
                duration: 6000,
                panelClass: ['info-snackbar'],
                horizontalPosition: 'right',
                verticalPosition: 'top'
              }
            ).onAction().subscribe(() => {
              this.router.navigate(['/pickup-list'], { 
                queryParams: { highlight: createdPickup.id } 
              });
            });
          }, 1500);
          
          // Reset form for next pickup
          this.resetForm();
        },
        error: (error) => {
          console.error('Error creating direct pickup:', error);
          this.snackBar.open(
            '❌ Failed to confirm direct pickup. Please try again.', 
            'Close', 
            {
              duration: 5000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            }
          );
        }
      });
    } else {
      this.snackBar.open(
        '❌ Please fill all required fields and select pickup staff.', 
        'Close', 
        {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['warning-snackbar']
        }
      );
    }
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
    if (this.pickupForm.valid && this.selectedClient && this.selectedCarrier && this.selectedEmployee) {
      const scheduleData: SchedulePickupData = {
        client: {
          id: this.selectedClient.id?.toString() || '',
          clientName: this.selectedClient.clientName || this.selectedClient.name || '',
          clientCompany: this.selectedClient.subContractCode,
          address: this.selectedClient.address || '',
          contactNumber: this.selectedClient.contactPerson
        },
        itemCount: parseInt(this.pickupForm.value.itemCount) || 1,
        totalWeight: parseFloat(this.pickupForm.value.weight) || 0,
        itemDescription: this.pickupForm.value.itemDescription || '',
        specialInstructions: this.pickupForm.value.specialInstructions || '',
        pickupType: this.pickupForm.value.isVendorType ? 'vendor' : 'direct',
        carrier: {
          id: this.selectedCarrier.id,
          name: this.selectedCarrier.name,
          price: this.selectedCarrier.price,
          estimatedPickup: this.selectedCarrier.estimatedPickup
        },
        employee: {
          id: this.selectedEmployee.id,
          name: this.selectedEmployee.name,
          employeeId: this.selectedEmployee.employeeId,
          department: 'Operations'
        },
        pickupDate: new Date().toISOString().split('T')[0],
        pickupTime: this.selectedCarrier.estimatedPickup
      };
      
      // Call the pickup service to create the pickup
      this.pickupService.createPickup(scheduleData).subscribe({
        next: (createdPickup) => {
          console.log('Pickup created successfully:', createdPickup);
          
          // Show success notification with navigation option
          const snackBarRef = this.snackBar.open(
            `🚚 Pickup ${createdPickup.pickupId} scheduled successfully!`, 
            'View All Pickups', 
            {
              duration: 10000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['success-snackbar']
            }
          );
          
          // Navigate to pickup list when user clicks the action button
          snackBarRef.onAction().subscribe(() => {
            this.router.navigate(['/pickup-list'], { 
              queryParams: { highlight: createdPickup.id } 
            });
          });
          
          // Show additional detailed notification with service information
          setTimeout(() => {
            this.snackBar.open(
              `Service: ${this.selectedCarrier?.name || 'Carrier'} • Fee: ₹${this.selectedCarrier?.price || 0} • Staff: ${this.selectedEmployee?.name || 'Staff'}`,
              'View Details',
              {
                duration: 8000,
                panelClass: ['info-snackbar'],
                horizontalPosition: 'right',
                verticalPosition: 'top'
              }
            ).onAction().subscribe(() => {
              this.router.navigate(['/pickup-list'], { 
                queryParams: { highlight: createdPickup.id } 
              });
            });
          }, 1500);
          
          // Reset form for next pickup
          this.resetForm();
        },
        error: (error) => {
          console.error('Error creating pickup:', error);
          this.snackBar.open(
            '❌ Failed to schedule pickup. Please try again.', 
            'Close', 
            {
              duration: 5000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            }
          );
        }
      });
    } else {
      this.snackBar.open(
        '❌ Please fill all required fields, select a pickup service, and assign pickup staff.', 
        'Close', 
        {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['warning-snackbar']
        }
      );
    }
  }

  resetForm() {
    this.pickupForm.reset({
      itemCount: '1',
      isVendorType: true // Reset to default vendor pickup
    });
    this.selectedClient = null;
    this.selectedCarrier = null;
    this.selectedEmployee = null;
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