import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { OrderRecord } from '../../../../../libs/shared';

@Component({
  selector: 'app-order-detail-modal',
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
    MatCardModule
  ],
  template: `
    <div class="order-detail-modal">
      <!-- Header -->
      <div mat-dialog-title class="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-blue-100 rounded-lg">
            <mat-icon class="text-blue-600">receipt_long</mat-icon>
          </div>
          <div>
            <h2 class="text-xl font-semibold text-slate-800">Order Details</h2>
            <p class="text-sm text-slate-600">{{ order.order_id }}</p>
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
                <mat-icon class="text-green-600">local_shipping</mat-icon>
                <div>
                  <p class="text-xs text-green-600 font-medium uppercase tracking-wide">Status</p>
                  <p class="text-lg font-semibold text-green-700">{{ getStatusDisplayName(order.status) }}</p>
                </div>
              </div>
            </mat-card>

            <mat-card class="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
              <div class="flex items-center gap-3">
                <mat-icon class="text-blue-600">payment</mat-icon>
                <div>
                  <p class="text-xs text-blue-600 font-medium uppercase tracking-wide">Total Amount</p>
                  <p class="text-lg font-semibold text-blue-700">₹{{ formatCurrency(order.total_amount || 0) }}</p>
                </div>
              </div>
            </mat-card>

            <mat-card class="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100">
              <div class="flex items-center gap-3">
                <mat-icon class="text-purple-600">scale</mat-icon>
                <div>
                  <p class="text-xs text-purple-600 font-medium uppercase tracking-wide">Weight</p>
                  <p class="text-lg font-semibold text-purple-700">{{ order.total_weight }}kg</p>
                </div>
              </div>
            </mat-card>
          </div>

          <!-- Sender & Receiver Information -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Sender Details -->
            <mat-card class="overflow-hidden">
              <div class="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
                <div class="flex items-center gap-2">
                  <mat-icon class="text-orange-600">send</mat-icon>
                  <h3 class="font-semibold text-orange-800">Sender Information</h3>
                </div>
              </div>
              <div class="p-4 space-y-3">
                <div>
                  <p class="text-xs text-slate-500 uppercase tracking-wide">Name</p>
                  <p class="font-medium text-slate-800">{{ order.sender_name }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-500 uppercase tracking-wide">Contact</p>
                  <p class="text-slate-700">{{ order.sender_contact }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-500 uppercase tracking-wide">Address</p>
                  <p class="text-slate-700 leading-relaxed">{{ order.sender_address }}</p>
                </div>
                <div *ngIf="order.sender_pincode">
                  <p class="text-xs text-slate-500 uppercase tracking-wide">Pincode</p>
                  <p class="text-slate-700">{{ order.sender_pincode }}</p>
                </div>
              </div>
            </mat-card>

            <!-- Receiver Details -->
            <mat-card class="overflow-hidden">
              <div class="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                <div class="flex items-center gap-2">
                  <mat-icon class="text-green-600">place</mat-icon>
                  <h3 class="font-semibold text-green-800">Receiver Information</h3>
                </div>
              </div>
              <div class="p-4 space-y-3">
                <div>
                  <p class="text-xs text-slate-500 uppercase tracking-wide">Name</p>
                  <p class="font-medium text-slate-800">{{ order.receiver_name }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-500 uppercase tracking-wide">Contact</p>
                  <p class="text-slate-700">{{ order.receiver_contact }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-500 uppercase tracking-wide">Address</p>
                  <p class="text-slate-700 leading-relaxed">{{ order.receiver_address }}</p>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-xs text-slate-500 uppercase tracking-wide">City</p>
                    <p class="text-slate-700">{{ order.receiver_city }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500 uppercase tracking-wide">Pincode</p>
                    <p class="text-slate-700">{{ order.receiver_pincode }}</p>
                  </div>
                </div>
              </div>
            </mat-card>
          </div>

          <!-- Shipment Details -->
          <mat-card class="overflow-hidden">
            <div class="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100">
              <div class="flex items-center gap-2">
                <mat-icon class="text-indigo-600">inventory_2</mat-icon>
                <h3 class="font-semibold text-indigo-800">Shipment Details</h3>
              </div>
            </div>
            <div class="p-4">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <p class="text-xs text-slate-500 uppercase tracking-wide">Service Type</p>
                  <mat-chip-set>
                    <mat-chip [class]="getServiceTypeChipClass(order.service_type)">
                      {{ order.service_type }}
                    </mat-chip>
                  </mat-chip-set>
                </div>
                <div>
                  <p class="text-xs text-slate-500 uppercase tracking-wide">Carrier</p>
                  <div class="flex items-center gap-2">
                    <mat-icon class="text-slate-400">local_shipping</mat-icon>
                    <p class="font-medium text-slate-800">{{ order.carrier_name }}</p>
                  </div>
                </div>
                <div *ngIf="order.tracking_number">
                  <p class="text-xs text-slate-500 uppercase tracking-wide">Tracking Number</p>
                  <div class="flex items-center gap-2">
                    <p class="font-mono text-slate-800 bg-slate-100 px-2 py-1 rounded text-sm">{{ order.tracking_number }}</p>
                    <button mat-icon-button 
                            matTooltip="Copy tracking number"
                            (click)="copyToClipboard(order.tracking_number)"
                            class="text-slate-400 hover:text-slate-600">
                      <mat-icon class="!text-sm">content_copy</mat-icon>
                    </button>
                  </div>
                </div>
                <div>
                  <p class="text-xs text-slate-500 uppercase tracking-wide">Item Count</p>
                  <p class="text-slate-700">{{ order.item_count }} items</p>
                </div>
                <div *ngIf="order.item_description">
                  <p class="text-xs text-slate-500 uppercase tracking-wide">Description</p>
                  <p class="text-slate-700">{{ order.item_description }}</p>
                </div>
                <div *ngIf="order.declared_value">
                  <p class="text-xs text-slate-500 uppercase tracking-wide">Declared Value</p>
                  <p class="text-slate-700">₹{{ formatCurrency(order.declared_value) }}</p>
                </div>
              </div>

              <!-- Dimensions if available -->
              <div *ngIf="hasDimensions()" class="mt-4 pt-4 border-t border-slate-200">
                <p class="text-xs text-slate-500 uppercase tracking-wide mb-2">Dimensions</p>
                <div class="flex items-center gap-4 text-sm text-slate-700">
                  <span *ngIf="order.length_cm">Length: {{ order.length_cm }}cm</span>
                  <span *ngIf="order.width_cm">Width: {{ order.width_cm }}cm</span>
                  <span *ngIf="order.height_cm">Height: {{ order.height_cm }}cm</span>
                </div>
              </div>
            </div>
          </mat-card>

          <!-- Payment & Delivery Information -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Payment Details -->
            <mat-card class="overflow-hidden">
              <div class="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-teal-100">
                <div class="flex items-center gap-2">
                  <mat-icon class="text-teal-600">account_balance_wallet</mat-icon>
                  <h3 class="font-semibold text-teal-800">Payment Information</h3>
                </div>
              </div>
              <div class="p-4 space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-xs text-slate-500 uppercase tracking-wide">Payment Status</span>
                  <mat-chip [class]="getPaymentStatusChipClass(order.payment_status)">
                    {{ getPaymentStatusDisplayName(order.payment_status) }}
                  </mat-chip>
                </div>
                <div class="flex justify-between items-center" *ngIf="order.cod_amount && order.cod_amount > 0">
                  <span class="text-xs text-slate-500 uppercase tracking-wide">COD Amount</span>
                  <span class="font-medium text-slate-800">₹{{ formatCurrency(order.cod_amount) }}</span>
                </div>
                <div class="flex justify-between items-center" *ngIf="order.total_amount">
                  <span class="text-xs text-slate-500 uppercase tracking-wide">Total Amount</span>
                  <span class="font-semibold text-lg text-slate-800">₹{{ formatCurrency(order.total_amount) }}</span>
                </div>
              </div>
            </mat-card>

            <!-- Delivery Details -->
            <mat-card class="overflow-hidden">
              <div class="p-4 bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100">
                <div class="flex items-center gap-2">
                  <mat-icon class="text-pink-600">schedule</mat-icon>
                  <h3 class="font-semibold text-pink-800">Delivery Information</h3>
                </div>
              </div>
              <div class="p-4 space-y-3">
                <div *ngIf="order.estimated_delivery_date">
                  <p class="text-xs text-slate-500 uppercase tracking-wide">Estimated Delivery</p>
                  <p class="text-slate-700">{{ formatDate(order.estimated_delivery_date) }}</p>
                </div>
                <div *ngIf="order.actual_delivery_date">
                  <p class="text-xs text-slate-500 uppercase tracking-wide">Actual Delivery</p>
                  <p class="text-slate-700">{{ formatDate(order.actual_delivery_date) }}</p>
                </div>
                <div *ngIf="order.special_instructions">
                  <p class="text-xs text-slate-500 uppercase tracking-wide">Special Instructions</p>
                  <p class="text-slate-700 italic">{{ order.special_instructions }}</p>
                </div>
                <div *ngIf="order.assigned_staff_name">
                  <p class="text-xs text-slate-500 uppercase tracking-wide">Assigned Staff</p>
                  <p class="text-slate-700">{{ order.assigned_staff_name }}</p>
                </div>
              </div>
            </mat-card>
          </div>

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
                  <p class="text-slate-700">{{ formatDateTime(order.created_at) }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-500 uppercase tracking-wide">Last Updated</p>
                  <p class="text-slate-700">{{ formatDateTime(order.updated_at) }}</p>
                </div>
                <div *ngIf="order.status_updated_at">
                  <p class="text-xs text-slate-500 uppercase tracking-wide">Status Updated</p>
                  <p class="text-slate-700">{{ formatDateTime(order.status_updated_at) }}</p>
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
                *ngIf="order.tracking_number"
                (click)="onTrack()"
                class="bg-green-600 hover:bg-green-700 text-white">
          <mat-icon class="mr-1">my_location</mat-icon>
          Track Order
        </button>
      </div>
    </div>
  `,
  styles: [`
    .order-detail-modal {
      min-width: 600px;
      max-width: 900px;
      width: 90vw;
    }
    
    @media (max-width: 768px) {
      .order-detail-modal {
        min-width: 320px;
        width: 95vw;
      }
    }

    mat-chip {
      font-size: 0.75rem;
      font-weight: 500;
    }

    .service-express {
      background-color: #fef3c7;
      color: #d97706;
    }

    .service-standard {
      background-color: #dbeafe;
      color: #2563eb;
    }

    .service-economy {
      background-color: #dcfce7;
      color: #16a34a;
    }

    .payment-paid {
      background-color: #dcfce7;
      color: #16a34a;
    }

    .payment-pending {
      background-color: #fef3c7;
      color: #d97706;
    }

    .payment-failed {
      background-color: #fee2e2;
      color: #dc2626;
    }
  `]
})
export class OrderDetailModalComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<OrderDetailModalComponent>,
    @Inject(MAT_DIALOG_DATA) public order: OrderRecord
  ) {}

  ngOnInit(): void {
    console.log('📋 Order details modal opened for:', this.order);
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onTrack(): void {
    this.dialogRef.close({ action: 'track', order: this.order });
  }

  getStatusDisplayName(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Pending',
      'CONFIRMED': 'Confirmed',
      'IN_TRANSIT': 'In Transit',
      'OUT_FOR_DELIVERY': 'Out for Delivery',
      'DELIVERED': 'Delivered',
      'CANCELLED': 'Cancelled',
      'RETURNED': 'Returned'
    };
    return statusMap[status] || status;
  }

  getPaymentStatusDisplayName(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PAID': 'Paid',
      'PENDING': 'Pending',
      'FAILED': 'Failed',
      'REFUNDED': 'Refunded'
    };
    return statusMap[status] || status;
  }

  getServiceTypeChipClass(serviceType: string): string {
    const typeMap: { [key: string]: string } = {
      'EXPRESS': 'service-express',
      'STANDARD': 'service-standard',
      'ECONOMY': 'service-economy'
    };
    return typeMap[serviceType] || 'service-standard';
  }

  getPaymentStatusChipClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PAID': 'payment-paid',
      'PENDING': 'payment-pending',
      'FAILED': 'payment-failed'
    };
    return statusMap[status] || 'payment-pending';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  hasDimensions(): boolean {
    return !!(this.order.length_cm || this.order.width_cm || this.order.height_cm);
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      console.log('✅ Tracking number copied to clipboard');
    }).catch(() => {
      console.log('❌ Failed to copy tracking number');
    });
  }
}
