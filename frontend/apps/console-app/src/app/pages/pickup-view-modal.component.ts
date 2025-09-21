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
    <div class="pickup-view-modal">
      <!-- Enhanced Header with Gradient Background -->
      <div mat-dialog-title class="relative overflow-hidden -m-6 mb-6">
        <div class="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 p-6 text-white">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="bg-white/20 p-3 rounded-full">
                <mat-icon class="text-white text-2xl">local_shipping</mat-icon>
              </div>
              <div>
                <h2 class="text-2xl font-bold m-0">Pickup Details</h2>
                <p class="text-blue-100 text-sm mt-1">{{ pickup.pickupId }}</p>
              </div>
            </div>
            <button 
              mat-icon-button 
              (click)="onClose()" 
              class="text-white/80 hover:text-white hover:bg-white/10 transition-colors">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          
          <!-- Status and Type Chips in Header -->
          <div class="flex items-center space-x-3 mt-4">
            <div class="flex items-center space-x-2">
              <mat-chip-row [ngClass]="getStatusChipClass(pickup.status)" class="font-medium">
                <mat-icon matChipAvatar>{{ getStatusIcon(pickup.status) }}</mat-icon>
                {{ pickup.status | titlecase }}
              </mat-chip-row>
              <mat-chip-row [ngClass]="getTypeChipClass(pickup.pickupType)" class="font-medium">
                <mat-icon matChipAvatar>{{ getTypeIcon(pickup.pickupType) }}</mat-icon>
                {{ pickup.pickupType | titlecase }}
              </mat-chip-row>
            </div>
          </div>
        </div>
        
        <!-- Decorative wave -->
        <div class="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg class="relative block w-full h-4" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="currentColor"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="currentColor"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="currentColor"></path>
          </svg>
        </div>
      </div>

      <!-- Content with Enhanced Cards -->
      <div mat-dialog-content class="pickup-details-content space-y-6">
        
        <!-- Quick Overview Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div class="flex items-center space-x-3">
              <mat-icon class="text-blue-600">person</mat-icon>
              <div>
                <p class="text-xs text-blue-600 font-medium">Client</p>
                <p class="text-sm font-bold text-blue-800 truncate">{{ pickup.clientName }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div class="flex items-center space-x-3">
              <mat-icon class="text-green-600">event</mat-icon>
              <div>
                <p class="text-xs text-green-600 font-medium">Date</p>
                <p class="text-sm font-bold text-green-800">{{ pickup.pickupDate | date:'MMM dd' }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div class="flex items-center space-x-3">
              <mat-icon class="text-purple-600">inventory</mat-icon>
              <div>
                <p class="text-xs text-purple-600 font-medium">Items</p>
                <p class="text-sm font-bold text-purple-800">{{ pickup.itemCount || 0 }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
            <div class="flex items-center space-x-3">
              <mat-icon class="text-orange-600">attach_money</mat-icon>
              <div>
                <p class="text-xs text-orange-600 font-medium">Cost</p>
                <p class="text-sm font-bold text-orange-800">₹{{ pickup.estimatedCost || 0 | number:'1.0-0' }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <!-- Schedule Information Card -->
          <mat-card class="border-0 shadow-lg overflow-hidden">
            <div class="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
              <div class="flex items-center space-x-3">
                <mat-icon class="text-2xl">schedule</mat-icon>
                <h3 class="text-lg font-semibold m-0">Schedule Details</h3>
              </div>
            </div>
            <mat-card-content class="p-6">
              <div class="space-y-4">
                <div class="flex items-center justify-between py-2">
                  <div class="flex items-center space-x-3">
                    <mat-icon class="text-gray-400">event</mat-icon>
                    <span class="font-medium text-gray-600">Pickup Date</span>
                  </div>
                  <span class="text-gray-900 font-semibold">{{ pickup.pickupDate | date:'fullDate' }}</span>
                </div>
                <mat-divider></mat-divider>
                
                <div class="flex items-center justify-between py-2">
                  <div class="flex items-center space-x-3">
                    <mat-icon class="text-gray-400">access_time</mat-icon>
                    <span class="font-medium text-gray-600">Pickup Time</span>
                  </div>
                  <span class="text-gray-900 font-semibold">{{ pickup.pickupTime || 'Not specified' }}</span>
                </div>
                <mat-divider></mat-divider>
                
                <div class="flex items-center justify-between py-2">
                  <div class="flex items-center space-x-3">
                    <mat-icon class="text-gray-400">add_circle</mat-icon>
                    <span class="font-medium text-gray-600">Created</span>
                  </div>
                  <span class="text-gray-900 font-semibold">{{ pickup.createdAt | date:'short' }}</span>
                </div>
                <mat-divider></mat-divider>
                
                <div class="flex items-center justify-between py-2">
                  <div class="flex items-center space-x-3">
                    <mat-icon class="text-gray-400">update</mat-icon>
                    <span class="font-medium text-gray-600">Last Updated</span>
                  </div>
                  <span class="text-gray-900 font-semibold">{{ pickup.updatedAt | date:'short' }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Assignment & Details Card -->
          <mat-card class="border-0 shadow-lg overflow-hidden">
            <div class="bg-gradient-to-r from-purple-500 to-purple-600 p-4 text-white">
              <div class="flex items-center space-x-3">
                <mat-icon class="text-2xl">assignment_ind</mat-icon>
                <h3 class="text-lg font-semibold m-0">Assignment & Details</h3>
              </div>
            </div>
            <mat-card-content class="p-6">
              <div class="space-y-4">
                <div class="flex items-center justify-between py-2">
                  <div class="flex items-center space-x-3">
                    <mat-icon class="text-gray-400">person_pin</mat-icon>
                    <span class="font-medium text-gray-600">Assigned Staff</span>
                  </div>
                  <span class="text-gray-900 font-semibold">{{ pickup.assignedStaff || 'Not assigned' }}</span>
                </div>
                <mat-divider></mat-divider>
                
                <div class="flex items-center justify-between py-2">
                  <div class="flex items-center space-x-3">
                    <mat-icon class="text-gray-400">scale</mat-icon>
                    <span class="font-medium text-gray-600">Total Weight</span>
                  </div>
                  <span class="text-gray-900 font-semibold">{{ pickup.totalWeight || 0 }} kg</span>
                </div>
                <mat-divider></mat-divider>
                
                <div class="flex items-center justify-between py-2">
                  <div class="flex items-center space-x-3">
                    <mat-icon class="text-gray-400">local_shipping</mat-icon>
                    <span class="font-medium text-gray-600">Carrier</span>
                  </div>
                  <span class="text-gray-900 font-semibold">{{ pickup.carrierId || 'Not specified' }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Address Card - Full Width -->
        <mat-card class="border-0 shadow-lg overflow-hidden">
          <div class="bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white">
            <div class="flex items-center space-x-3">
              <mat-icon class="text-2xl">location_on</mat-icon>
              <h3 class="text-lg font-semibold m-0">Pickup Location</h3>
            </div>
          </div>
          <mat-card-content class="p-6">
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div class="flex items-start space-x-3">
                <mat-icon class="text-gray-400 mt-1">place</mat-icon>
                <p class="text-gray-800 leading-relaxed m-0 flex-1">{{ pickup.pickupAddress }}</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Enhanced Footer Actions -->
      <div mat-dialog-actions class="flex justify-between items-center p-6 bg-gray-50 border-t border-gray-200 -m-6 mt-6">
        <div class="flex items-center space-x-2 text-sm text-gray-500">
          <mat-icon class="text-xs">info</mat-icon>
          <span>ID: {{ pickup.pickupId }}</span>
        </div>
        
        <div class="flex space-x-3">
          <button 
            mat-stroked-button 
            (click)="onClose()" 
            class="border-gray-300 text-gray-700 hover:bg-gray-50">
            <mat-icon class="mr-2">close</mat-icon>
            Close
          </button>
          <button 
            mat-flat-button 
            color="primary" 
            (click)="onEdit()" 
            class="bg-blue-600 hover:bg-blue-700 shadow-lg">
            <mat-icon class="mr-2">edit</mat-icon>
            Edit Pickup
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pickup-view-modal {
      min-width: 800px;
      max-width: 1000px;
      max-height: 90vh;
      overflow: hidden;
    }
    
    .pickup-details-content {
      max-height: 60vh;
      overflow-y: auto;
      padding: 0 24px;
    }

    .mat-mdc-chip {
      font-size: 0.75rem;
      font-weight: 600;
      border: none;
    }

    mat-card {
      border-radius: 12px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    mat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    }

    .mat-mdc-dialog-title {
      padding: 0 !important;
      margin: 0 !important;
    }

    .bg-gradient-to-br {
      transition: all 0.3s ease;
    }

    .bg-gradient-to-br:hover {
      transform: scale(1.02);
    }

    /* Custom scrollbar */
    .pickup-details-content::-webkit-scrollbar {
      width: 6px;
    }

    .pickup-details-content::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }

    .pickup-details-content::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
    }

    .pickup-details-content::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
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

  getStatusChipClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getTypeChipClass(type: string): string {
    switch (type?.toLowerCase()) {
      case 'vendor':
        return 'bg-purple-100 text-purple-800';
      case 'direct':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusIcon(status: string): string {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return 'schedule';
      case 'in_progress':
        return 'hourglass_empty';
      case 'completed':
        return 'check_circle';
      case 'cancelled':
        return 'cancel';
      default:
        return 'help_outline';
    }
  }

  getTypeIcon(type: string): string {
    switch (type?.toLowerCase()) {
      case 'vendor':
        return 'business';
      case 'direct':
        return 'person';
      default:
        return 'category';
    }
  }
}
