import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { PickupRecord } from '../../../../../../libs/shared/pickup.interface';
import { OrderRecord } from '../../../../../../libs/shared/order.interface';
import { OrderService } from '../../../../../../libs/shared/order.service';

export interface ViewBookingsDialogData {
  pickup: PickupRecord;
}

@Component({
  selector: 'app-view-bookings-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule
  ],
  template: `
    <div class="bg-white rounded-lg overflow-hidden max-h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="px-6 py-4 border-b bg-green-50 border-green-200 flex-shrink-0">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <mat-icon class="text-green-600">inventory_2</mat-icon>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-green-900 m-0">Orders from Pickup</h2>
              <p class="text-sm text-green-600 mt-1">{{ data.pickup.pickupId }} • {{ orders.length }} order(s) created</p>
            </div>
          </div>
          <button mat-icon-button (click)="onClose()" class="text-gray-400 hover:text-gray-600">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>

      <!-- Pickup Summary -->
      <div class="px-6 py-3 bg-gray-50 border-b flex-shrink-0">
        <div class="grid grid-cols-4 gap-4 text-sm">
          <div>
            <span class="text-gray-500">Client:</span>
            <span class="ml-1 font-medium">{{ data.pickup.clientName }}</span>
          </div>
          <div>
            <span class="text-gray-500">From:</span>
            <span class="ml-1 font-medium">{{ (data.pickup.pickupAddress || '') | slice:0:30 }}...</span>
          </div>
          <div>
            <span class="text-gray-500">Completed:</span>
            <span class="ml-1 font-medium">{{ data.pickup.completedAt | date:'short' }}</span>
          </div>
          <div>
            <span class="text-gray-500">Items Received:</span>
            <span class="ml-1 font-medium">{{ data.pickup.itemsReceived || data.pickup.itemCount }}</span>
          </div>
        </div>
      </div>

      <!-- Content - Scrollable -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- Loading State -->
        <div *ngIf="isLoading" class="flex items-center justify-center py-12">
          <mat-spinner diameter="40"></mat-spinner>
          <span class="ml-4 text-gray-500">Loading orders...</span>
        </div>

        <!-- No Orders -->
        <div *ngIf="!isLoading && orders.length === 0" class="text-center py-12">
          <mat-icon class="text-gray-300" style="font-size: 64px; width: 64px; height: 64px;">inventory_2</mat-icon>
          <p class="text-gray-500 mt-4">No orders found for this pickup.</p>
        </div>

        <!-- Orders List -->
        <div *ngIf="!isLoading && orders.length > 0" class="space-y-4">
          <div *ngFor="let order of orders; let i = index" 
               class="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
            <!-- Order Header -->
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center space-x-3">
                <span class="text-sm font-semibold text-blue-600">{{ order.order_id }}</span>
                <mat-chip-set>
                  <mat-chip [ngClass]="getStatusClass(order.status)">
                    {{ order.status }}
                  </mat-chip>
                </mat-chip-set>
              </div>
              <span class="text-sm text-gray-500">{{ order.created_at | date:'short' }}</span>
            </div>

            <!-- Order Details -->
            <div class="grid grid-cols-2 gap-4 text-sm">
              <!-- Receiver Info -->
              <div>
                <h4 class="text-xs font-medium text-gray-500 uppercase mb-1">Receiver</h4>
                <p class="font-medium">{{ order.receiver_name }}</p>
                <p class="text-gray-600">{{ order.receiver_address | slice:0:50 }}...</p>
                <p class="text-gray-600">{{ order.receiver_city }}, {{ order.receiver_pincode }}</p>
                <p class="text-gray-600">📞 {{ order.receiver_contact }}</p>
              </div>

              <!-- Package & Service Info -->
              <div>
                <h4 class="text-xs font-medium text-gray-500 uppercase mb-1">Package Details</h4>
                <p><span class="text-gray-500">Weight:</span> {{ order.total_weight }} kg</p>
                <p><span class="text-gray-500">Service:</span> {{ order.service_type }}</p>
                <p><span class="text-gray-500">Carrier:</span> {{ order.carrier_name }}</p>
                <p *ngIf="order.tracking_number">
                  <span class="text-gray-500">Tracking:</span> 
                  <span class="font-mono text-blue-600">{{ order.tracking_number }}</span>
                </p>
              </div>
            </div>

            <!-- Financial Info (if available) -->
            <div *ngIf="order.total_amount" class="mt-3 pt-3 border-t flex justify-between items-center">
              <span class="text-sm text-gray-500">Total Amount</span>
              <span class="font-semibold text-green-600">₹{{ order.total_amount | number:'1.2-2' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 bg-gray-50 border-t flex justify-between items-center flex-shrink-0">
        <div class="text-sm text-gray-600">
          <span class="font-medium text-green-600">{{ orders.length }}</span> order(s) created from this pickup
        </div>
        <button mat-stroked-button (click)="onClose()">
          Close
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 800px;
      max-width: 95vw;
    }
    
    .status-pending { background-color: #fef3c7 !important; color: #92400e !important; }
    .status-confirmed { background-color: #dbeafe !important; color: #1e40af !important; }
    .status-picked-up { background-color: #e0e7ff !important; color: #3730a3 !important; }
    .status-in-transit { background-color: #fce7f3 !important; color: #9d174d !important; }
    .status-delivered { background-color: #d1fae5 !important; color: #065f46 !important; }
    .status-cancelled { background-color: #fee2e2 !important; color: #991b1b !important; }
    .status-returned { background-color: #f3f4f6 !important; color: #374151 !important; }
  `]
})
export class ViewBookingsDialogComponent implements OnInit {
  orders: OrderRecord[] = [];
  isLoading = true;

  constructor(
    public dialogRef: MatDialogRef<ViewBookingsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ViewBookingsDialogData,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  private loadOrders() {
    this.isLoading = true;
    this.orderService.getOrdersByPickupId(this.data.pickup.pickupId).subscribe({
      next: (orders) => {
        this.orders = orders;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.orders = [];
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getStatusClass(status: string): string {
    const statusLower = status?.toLowerCase().replace('_', '-');
    return `status-${statusLower}`;
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
