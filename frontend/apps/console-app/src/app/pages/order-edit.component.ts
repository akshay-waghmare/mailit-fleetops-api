import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { OrderRecord, OrderService } from '../../../../../libs/shared';

@Component({
  selector: 'app-order-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="min-h-screen bg-slate-50 py-8">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center gap-4 mb-4">
            <button mat-icon-button (click)="goBack()" class="text-slate-600">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <div>
              <h1 class="text-3xl font-bold text-slate-900">Edit Order</h1>
              <p class="text-slate-600 mt-1">Update order details and delivery information</p>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading && !orderForm" class="flex justify-center py-12">
          <mat-spinner diameter="40"></mat-spinner>
        </div>

        <!-- Error State -->
        <div *ngIf="error && !orderForm" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div class="flex items-center gap-2 text-red-800">
            <mat-icon class="text-red-600">error</mat-icon>
            <span class="font-medium">Error loading order</span>
          </div>
          <p class="text-red-700 mt-1">{{error}}</p>
          <button mat-button color="primary" (click)="loadOrder()" class="mt-2">
            <mat-icon>refresh</mat-icon>
            Try Again
          </button>
        </div>

        <!-- Edit Form -->
        <mat-card *ngIf="orderForm && !loading" class="shadow-lg">
          <mat-card-header class="pb-4">
            <mat-card-title class="text-xl font-semibold text-slate-900">
              Order Information
            </mat-card-title>
            <mat-card-subtitle class="text-slate-600">
              Update order details below
            </mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <form [formGroup]="orderForm" (ngSubmit)="onSave()" class="space-y-6">
              
              <!-- Basic Information -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Order ID</mat-label>
                  <input matInput formControlName="orderId" readonly />
                  <mat-icon matSuffix>lock</mat-icon>
                </mat-form-field>
                
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Status</mat-label>
                  <mat-select formControlName="status" required>
                    <mat-option value="pending">Pending</mat-option>
                    <mat-option value="confirmed">Confirmed</mat-option>
                    <mat-option value="picked-up">Picked Up</mat-option>
                    <mat-option value="in-transit">In Transit</mat-option>
                    <mat-option value="delivered">Delivered</mat-option>
                    <mat-option value="cancelled">Cancelled</mat-option>
                    <mat-option value="returned">Returned</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <!-- Service Information -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Service Type</mat-label>
                  <mat-select formControlName="serviceType" required>
                    <mat-option value="express">Express</mat-option>
                    <mat-option value="standard">Standard</mat-option>
                    <mat-option value="economy">Economy</mat-option>
                  </mat-select>
                </mat-form-field>
                
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Estimated Delivery Date</mat-label>
                  <input matInput [matDatepicker]="picker" formControlName="estimatedDeliveryDate" required />
                  <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                  <mat-datepicker #picker></mat-datepicker>
                </mat-form-field>
              </div>

              <!-- Client Information -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Client Name</mat-label>
                  <input matInput formControlName="clientName" required />
                </mat-form-field>
                
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Contact Number</mat-label>
                  <input matInput formControlName="contactNumber" />
                </mat-form-field>
              </div>

              <!-- Receiver Information -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Receiver Name</mat-label>
                  <input matInput formControlName="receiverName" required />
                </mat-form-field>
                
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Receiver City</mat-label>
                  <input matInput formControlName="receiverCity" required />
                </mat-form-field>
              </div>

              <div class="grid grid-cols-1 gap-6">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Receiver Address</mat-label>
                  <textarea matInput formControlName="receiverAddress" rows="2" required></textarea>
                </mat-form-field>
              </div>

              <!-- Special Instructions -->
              <div class="grid grid-cols-1 gap-6">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Special Instructions</mat-label>
                  <textarea matInput formControlName="specialInstructions" rows="3" placeholder="Add any special delivery instructions..."></textarea>
                </mat-form-field>
              </div>

            </form>
          </mat-card-content>

          <!-- Action Buttons -->
          <mat-card-actions class="p-6 bg-slate-50 border-t">
            <div class="flex gap-4 justify-end">
              <button mat-stroked-button type="button" (click)="goBack()" [disabled]="submitting">
                <mat-icon>close</mat-icon>
                Cancel
              </button>
              <button mat-flat-button color="primary" (click)="onSave()" [disabled]="orderForm.invalid || submitting">
                <mat-spinner *ngIf="submitting" diameter="20" class="mr-2"></mat-spinner>
                <mat-icon *ngIf="!submitting">save</mat-icon>
                <span class="ml-2">{{submitting ? 'Saving...' : 'Save Changes'}}</span>
              </button>
            </div>
          </mat-card-actions>
        </mat-card>

      </div>
    </div>
  `,
  styles: [`
    .mat-mdc-form-field {
      font-size: 14px;
    }
    
    .mat-mdc-card {
      border-radius: 12px;
    }
    
    .mat-mdc-card-header {
      padding-bottom: 16px;
    }
  `]
})
export class OrderEditComponent implements OnInit {
  orderForm!: FormGroup;
  loading = false;
  submitting = false;
  error: string | null = null;
  orderId!: string;
  order: OrderRecord | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.orderId = params['id'];
      if (this.orderId) {
        this.loadOrder();
      } else {
        this.error = 'Order ID not found';
      }
    });
  }

  loadOrder(): void {
    this.loading = true;
    this.error = null;
    
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (order) => {
        if (order) {
          this.order = order;
          this.initializeForm(order);
          this.loading = false;
        } else {
          this.error = 'Order not found';
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error loading order:', error);
        this.error = 'Failed to load order details. Please try again.';
        this.loading = false;
      }
    });
  }

  initializeForm(order: OrderRecord): void {
    this.orderForm = this.fb.group({
      orderId: [{ value: order.order_id, disabled: true }],
      status: [order.status, Validators.required],
      serviceType: [order.service_type, Validators.required],
      estimatedDeliveryDate: [order.estimated_delivery_date ? new Date(order.estimated_delivery_date) : null, Validators.required],
      clientName: [order.client_name, Validators.required],
      contactNumber: [order.contact_number || ''],
      receiverName: [order.receiver_name, Validators.required],
      receiverCity: [order.receiver_city, Validators.required],
      receiverAddress: [order.receiver_address, Validators.required],
      specialInstructions: [order.special_instructions || ''],
    });
  }

  onSave(): void {
    if (this.orderForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.submitting = true;
    this.error = null;

    const formValue = this.orderForm.getRawValue();
    const updateData = {
      status: formValue.status,
      serviceType: formValue.serviceType,
      estimatedDeliveryDate: formValue.estimatedDeliveryDate ? formValue.estimatedDeliveryDate.toISOString().split('T')[0] : null,
      clientName: formValue.clientName,
      contactNumber: formValue.contactNumber,
      receiverName: formValue.receiverName,
      receiverCity: formValue.receiverCity,
      receiverAddress: formValue.receiverAddress,
      specialInstructions: formValue.specialInstructions,
    };

    this.orderService.updateOrder(this.orderId, updateData).subscribe({
      next: (updatedOrder: OrderRecord) => {
        this.submitting = false;
        this.snackBar.open('Order updated successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/order-list']);
      },
      error: (error: any) => {
        console.error('Error updating order:', error);
        this.submitting = false;
        this.error = 'Failed to update order. Please try again.';
        this.snackBar.open('Failed to update order. Please try again.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/order-list']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.orderForm.controls).forEach(key => {
      const control = this.orderForm.get(key);
      control?.markAsTouched();
    });
  }
}
