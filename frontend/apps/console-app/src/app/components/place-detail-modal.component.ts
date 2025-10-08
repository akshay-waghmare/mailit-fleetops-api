import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PlaceRecord } from '../../../../../libs/shared';

@Component({
  selector: 'app-place-detail-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule,
    MatCardModule,
    MatSnackBarModule
  ],
  template: `
    <div class="place-detail-modal">
      <!-- Header -->
      <div mat-dialog-title class="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-green-100 rounded-lg">
            <mat-icon class="text-green-600">place</mat-icon>
          </div>
          <div>
            <h2 class="text-xl font-semibold text-slate-800">Place Details</h2>
            <p class="text-sm text-slate-600">{{ place.name }}</p>
          </div>
        </div>
        <button mat-icon-button 
                (click)="onClose()" 
                class="text-slate-400 hover:text-slate-600 hover:bg-white hover:bg-opacity-50">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Content -->
      <div mat-dialog-content class="p-0 max-h-[80vh] overflow-y-auto">
        <div class="p-6 space-y-6">
          
          <!-- Status and Quick Info -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <mat-card class="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
              <div class="flex items-center gap-3">
                <mat-icon class="text-green-600">check_circle</mat-icon>
                <div>
                  <p class="text-xs text-green-600 font-medium uppercase tracking-wide">Status</p>
                  <p class="text-lg font-semibold text-green-700">{{ place.active ? 'Active' : 'Inactive' }}</p>
                </div>
              </div>
            </mat-card>

            <mat-card class="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
              <div class="flex items-center gap-3">
                <mat-icon class="text-blue-600">category</mat-icon>
                <div>
                  <p class="text-xs text-blue-600 font-medium uppercase tracking-wide">Type</p>
                  <p class="text-lg font-semibold text-blue-700">{{ place.type || 'Not Set' }}</p>
                </div>
              </div>
            </mat-card>

            <mat-card class="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100">
              <div class="flex items-center gap-3">
                <mat-icon class="text-purple-600">language</mat-icon>
                <div>
                  <p class="text-xs text-purple-600 font-medium uppercase tracking-wide">Country</p>
                  <p class="text-lg font-semibold text-purple-700">{{ place.country }}</p>
                </div>
              </div>
            </mat-card>
          </div>

          <!-- Basic Information -->
          <mat-card class="overflow-hidden">
            <div class="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100">
              <div class="flex items-center gap-2">
                <mat-icon class="text-indigo-600">info</mat-icon>
                <h3 class="font-semibold text-indigo-800">Basic Information</h3>
              </div>
            </div>
            <div class="p-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p class="text-xs text-slate-500 uppercase tracking-wide">Place ID</p>
                  <div class="flex items-center gap-2">
                    <p class="font-mono text-slate-800 bg-slate-100 px-2 py-1 rounded text-sm">{{ place.id }}</p>
                    <button mat-icon-button 
                            matTooltip="Copy ID"
                            (click)="copyToClipboard(place.id)"
                            class="text-slate-400 hover:text-slate-600">
                      <mat-icon class="!text-sm">content_copy</mat-icon>
                    </button>
                  </div>
                </div>
                <div>
                  <p class="text-xs text-slate-500 uppercase tracking-wide">Name</p>
                  <p class="font-medium text-slate-800">{{ place.name }}</p>
                </div>
                <div class="md:col-span-2" *ngIf="place.description">
                  <p class="text-xs text-slate-500 uppercase tracking-wide">Description</p>
                  <p class="text-slate-700 leading-relaxed">{{ place.description }}</p>
                </div>
              </div>
            </div>
          </mat-card>

          <!-- Address Information -->
          <mat-card class="overflow-hidden">
            <div class="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
              <div class="flex items-center gap-2">
                <mat-icon class="text-orange-600">home</mat-icon>
                <h3 class="font-semibold text-orange-800">Address Information</h3>
              </div>
            </div>
            <div class="p-4 space-y-3">
              <div>
                <p class="text-xs text-slate-500 uppercase tracking-wide">Street Address</p>
                <p class="font-medium text-slate-800">{{ place.addressLine1 }}</p>
                <p class="text-slate-700" *ngIf="place.addressLine2">{{ place.addressLine2 }}</p>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-xs text-slate-500 uppercase tracking-wide">City</p>
                  <p class="text-slate-700">{{ place.city }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-500 uppercase tracking-wide">State</p>
                  <p class="text-slate-700">{{ place.state }}</p>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-xs text-slate-500 uppercase tracking-wide">Postal Code</p>
                  <p class="text-slate-700">{{ place.postalCode }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-500 uppercase tracking-wide">Country</p>
                  <p class="text-slate-700">{{ place.country }}</p>
                </div>
              </div>
              <div *ngIf="place.displayAddress">
                <p class="text-xs text-slate-500 uppercase tracking-wide">Full Address</p>
                <p class="text-slate-700 leading-relaxed">{{ place.displayAddress }}</p>
              </div>
            </div>
          </mat-card>

          <!-- Location Coordinates -->
          <mat-card class="overflow-hidden">
            <div class="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-teal-100">
              <div class="flex items-center gap-2">
                <mat-icon class="text-teal-600">map</mat-icon>
                <h3 class="font-semibold text-teal-800">Location Coordinates</h3>
              </div>
            </div>
            <div class="p-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p class="text-xs text-slate-500 uppercase tracking-wide">Latitude</p>
                  <p class="font-mono text-slate-800">{{ place.location?.latitude || 'Not Set' }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-500 uppercase tracking-wide">Longitude</p>
                  <p class="font-mono text-slate-800">{{ place.location?.longitude || 'Not Set' }}</p>
                </div>
                <div class="md:col-span-2" *ngIf="place.coordinatesFormatted">
                  <p class="text-xs text-slate-500 uppercase tracking-wide">Coordinates</p>
                  <div class="flex items-center gap-2">
                    <p class="font-mono text-slate-800 bg-slate-100 px-2 py-1 rounded text-sm">{{ place.coordinatesFormatted }}</p>
                    <button mat-icon-button 
                            matTooltip="Copy coordinates"
                            (click)="copyToClipboard(place.coordinatesFormatted)"
                            class="text-slate-400 hover:text-slate-600">
                      <mat-icon class="!text-sm">content_copy</mat-icon>
                    </button>
                    <button mat-icon-button 
                            matTooltip="Open in Google Maps"
                            (click)="openInMaps()"
                            class="text-slate-400 hover:text-slate-600">
                      <mat-icon class="!text-sm">open_in_new</mat-icon>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </mat-card>

          <!-- Contact Information -->
          <mat-card class="overflow-hidden" *ngIf="place.phoneNumber">
            <div class="p-4 bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100">
              <div class="flex items-center gap-2">
                <mat-icon class="text-pink-600">phone</mat-icon>
                <h3 class="font-semibold text-pink-800">Contact Information</h3>
              </div>
            </div>
            <div class="p-4 space-y-3">
              <div>
                <p class="text-xs text-slate-500 uppercase tracking-wide">Phone Number</p>
                <div class="flex items-center gap-2">
                  <p class="text-slate-700">{{ place.phoneNumber }}</p>
                  <button mat-icon-button 
                          matTooltip="Copy phone number"
                          (click)="copyToClipboard(place.phoneNumber)"
                          class="text-slate-400 hover:text-slate-600">
                    <mat-icon class="!text-sm">content_copy</mat-icon>
                  </button>
                </div>
              </div>
            </div>
          </mat-card>

          <!-- Timestamps -->
          <mat-card class="overflow-hidden">
            <div class="p-4 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200">
              <div class="flex items-center gap-2">
                <mat-icon class="text-slate-600">access_time</mat-icon>
                <h3 class="font-semibold text-slate-800">Timeline</h3>
              </div>
            </div>
            <div class="p-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p class="text-xs text-slate-500 uppercase tracking-wide">Created</p>
                  <p class="text-slate-700">{{ place.createdAtFormatted || formatDateTime(place.createdAt) }}</p>
                </div>
                <div *ngIf="place.updatedAt">
                  <p class="text-xs text-slate-500 uppercase tracking-wide">Last Updated</p>
                  <p class="text-slate-700">{{ formatDateTime(place.updatedAt) }}</p>
                </div>
              </div>
            </div>
          </mat-card>

        </div>
      </div>

      <!-- Actions -->
      <div mat-dialog-actions class="flex justify-end gap-2 p-6 bg-slate-50 border-t border-slate-200">
        <button mat-button 
                (click)="onClose()" 
                class="text-slate-600 hover:bg-slate-100">
          Close
        </button>
        <button mat-raised-button 
                (click)="onEdit()"
                class="bg-blue-600 hover:bg-blue-700 text-white">
          <mat-icon class="mr-1">edit</mat-icon>
          Edit Place
        </button>
      </div>
    </div>
  `,
  styles: [`
    .place-detail-modal {
      min-width: 600px;
      max-width: 900px;
      width: 90vw;
    }
    
    @media (max-width: 768px) {
      .place-detail-modal {
        min-width: 320px;
        width: 95vw;
      }
    }

    mat-chip {
      font-size: 0.75rem;
      font-weight: 500;
    }

    ::ng-deep .mat-mdc-dialog-surface {
      border-radius: 12px !important;
    }
  `]
})
export class PlaceDetailModalComponent implements OnInit {
  place!: PlaceRecord;

  constructor(
    public dialogRef: MatDialogRef<PlaceDetailModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { place: PlaceRecord },
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.place = this.data.place;
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onEdit(): void {
    this.dialogRef.close({ action: 'edit', place: this.place });
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.snackBar.open('Copied to clipboard!', 'Close', {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
    });
  }

  openInMaps(): void {
    if (this.place.location?.latitude && this.place.location?.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${this.place.location.latitude},${this.place.location.longitude}`;
      window.open(url, '_blank');
    }
  }

  formatDateTime(date: any): string {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  }
}
