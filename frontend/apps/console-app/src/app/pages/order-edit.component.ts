import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
        <div *ngIf="loading && !isFormReady" class="flex justify-center py-12">
          <mat-spinner diameter="40"></mat-spinner>
        </div>

        <!-- Error State -->
        <div *ngIf="error && !isFormReady" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
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
        <mat-card *ngIf="isFormReady && !loading" class="shadow-lg">
          <mat-card-header class="pb-4">
            <mat-card-title class="text-xl font-semibold text-slate-900">
              Order Information
            </mat-card-title>
            <mat-card-subtitle class="text-slate-600">
              Update order details below
            </mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <form [formGroup]="orderForm!" (ngSubmit)="onSave()" class="space-y-6">
              
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
                    <mat-option value="PENDING">Pending</mat-option>
                    <mat-option value="CONFIRMED">Confirmed</mat-option>
                    <mat-option value="PICKED_UP">Picked Up</mat-option>
                    <mat-option value="IN_TRANSIT">In Transit</mat-option>
                    <mat-option value="DELIVERED">Delivered</mat-option>
                    <mat-option value="CANCELLED">Cancelled</mat-option>
                    <mat-option value="RETURNED">Returned</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <!-- Service Information -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Service Type</mat-label>
                  <mat-select formControlName="serviceType" required>
                    <mat-option value="EXPRESS">Express</mat-option>
                    <mat-option value="STANDARD">Standard</mat-option>
                    <mat-option value="ECONOMY">Economy</mat-option>
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

              <!-- Financial Information -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Declared Value (₹)</mat-label>
                  <input matInput formControlName="declaredValue" type="number" min="0" step="0.01" />
                  <mat-hint>Value of the items being shipped</mat-hint>
                </mat-form-field>
                
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Total Amount (₹)</mat-label>
                  <input matInput formControlName="totalAmount" type="number" min="0" step="0.01" />
                  <mat-hint>Total shipping cost</mat-hint>
                </mat-form-field>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>COD Amount (₹)</mat-label>
                  <input matInput formControlName="codAmount" type="number" min="0" step="0.01" />
                  <mat-hint>Cash on Delivery amount</mat-hint>
                </mat-form-field>
                
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Payment Status</mat-label>
                  <mat-select formControlName="paymentStatus" required>
                    <mat-option value="PENDING">Pending</mat-option>
                    <mat-option value="PAID">Paid</mat-option>
                    <mat-option value="COD">Cash on Delivery</mat-option>
                    <mat-option value="FAILED">Failed</mat-option>
                  </mat-select>
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
              <button mat-flat-button color="primary" (click)="onSave()" [disabled]="!isFormReady || !isFormValid || submitting">
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
  orderForm: FormGroup | null = null;
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
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  get isFormValid(): boolean {
    return this.orderForm ? this.orderForm.valid : false;
  }

  get isFormReady(): boolean {
    return !!this.orderForm;
  }

  ngOnInit(): void {
    // Only load data in browser, not during SSR
    if (isPlatformBrowser(this.platformId)) {
      this.route.params.subscribe(params => {
        this.orderId = params['id'];
        if (this.orderId) {
          this.loadOrder();
        } else {
          this.error = 'Order ID not found';
        }
      });
    }
  }

  loadOrder(): void {
    this.loading = true;
    this.error = null;
    
    console.log('🔄 Loading order with ID:', this.orderId);
    
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (order) => {
        console.log('✅ Order loaded successfully:', order);
        if (order) {
          this.order = order;
          this.initializeForm(order);
          this.loading = false;
          this.cdr.detectChanges(); // Force change detection
          console.log('🔄 Component state after loading:', {
            loading: this.loading,
            hasOrderForm: !!this.orderForm,
            hasError: !!this.error
          });
        } else {
          this.error = 'Order not found';
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('❌ Error loading order:', error);
        this.error = 'Failed to load order details. Please try again.';
        this.loading = false;
      }
    });
  }

  initializeForm(order: OrderRecord): void {
    console.log('🔧 Initializing form with order:', order);
    
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
      // Financial Fields
      declaredValue: [order.declared_value || 0, [Validators.min(0)]],
      totalAmount: [order.total_amount || 0, [Validators.min(0)]],
      codAmount: [order.cod_amount || 0, [Validators.min(0)]],
      paymentStatus: [order.payment_status || 'PENDING', Validators.required],
    });
    
    console.log('✅ Form initialized:', this.orderForm.value);
    console.log('📝 Form valid:', this.orderForm.valid);
  }

  onSave(): void {
    // Only save in browser, not during SSR
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Early return if form is not available or invalid
    if (!this.orderForm) {
      console.error('❌ Form not initialized');
      return;
    }

    if (this.orderForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.submitting = true;
    this.error = null;

    const formValue = this.orderForm.getRawValue();
    
    console.log('🔧 Form Value:', formValue);
    console.log('🔧 Original Order:', this.order);
    
    // Only send fields that have actually changed (partial update)
    // NOTE: Backend expects snake_case field names due to @JsonProperty annotations
    const updateData: any = {};
    
    // Check each field and only add it if it's different from original
    if (formValue.status !== this.order?.status) {
      updateData.status = formValue.status;
    }
    
    if (formValue.serviceType !== this.order?.service_type) {
      updateData.service_type = formValue.serviceType;
    }
    
    const formDate = this.formatDateForBackend(formValue.estimatedDeliveryDate);
    const originalDate = this.order?.estimated_delivery_date;
    if (formDate !== originalDate) {
      updateData.estimated_delivery_date = formDate;
    }
    
    if (formValue.clientName !== this.order?.client_name) {
      updateData.client_name = formValue.clientName;
    }
    
    if (formValue.contactNumber !== (this.order?.contact_number || '')) {
      updateData.contact_number = formValue.contactNumber;
    }
    
    if (formValue.receiverName !== this.order?.receiver_name) {
      updateData.receiver_name = formValue.receiverName;
    }
    
    if (formValue.receiverCity !== this.order?.receiver_city) {
      updateData.receiver_city = formValue.receiverCity;
    }
    
    if (formValue.receiverAddress !== this.order?.receiver_address) {
      updateData.receiver_address = formValue.receiverAddress;
    }
    
    if (formValue.specialInstructions !== (this.order?.special_instructions || '')) {
      updateData.special_instructions = formValue.specialInstructions;
    }
    
    if (formValue.declaredValue !== (this.order?.declared_value || 0)) {
      updateData.declared_value = formValue.declaredValue;
    }
    
    if (formValue.totalAmount !== (this.order?.total_amount || 0)) {
      updateData.total_amount = formValue.totalAmount;
    }
    
    if (formValue.codAmount !== (this.order?.cod_amount || 0)) {
      updateData.cod_amount = formValue.codAmount;
    }
    
    if (formValue.paymentStatus !== this.order?.payment_status) {
      updateData.payment_status = formValue.paymentStatus;
    }
    
    // Check if any fields were actually changed
    const changedFields = Object.keys(updateData);
    
    if (changedFields.length === 0) {
      console.log('⚠️ No changes detected, skipping update');
      this.submitting = false;
      this.snackBar.open('No changes to save.', 'Close', {
        duration: 3000,
        panelClass: ['info-snackbar']
      });
      return;
    }
    
    console.log('🚀 Sending updateData (changed fields):', changedFields);
    console.log('🚀 Full updateData:', updateData);

    this.orderService.patchOrder(this.orderId, updateData).subscribe({
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
    if (!this.orderForm) return;
    
    Object.keys(this.orderForm.controls).forEach(key => {
      const control = this.orderForm!.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Formats a Date object to ISO date string (YYYY-MM-DD) for backend API.
   * Returns null if the date is null or undefined.
   * 
   * @param date - The date to format
   * @returns ISO date string (YYYY-MM-DD) or null
   */
  private formatDateForBackend(date: Date | null): string | null {
    if (!date) {
      return null;
    }
    return date.toISOString().split('T')[0];
  }
}
