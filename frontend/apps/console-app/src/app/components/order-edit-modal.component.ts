import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, of } from 'rxjs';
import { map, startWith, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { OrderRecord, OrderService } from '../../../../../libs/shared';

// Client interface for autocomplete
interface Client {
  id?: number;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
}

@Component({
  selector: 'app-order-edit-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatAutocompleteModule
  ],
  template: `
    <!-- Modal Header -->
    <div mat-dialog-title class="flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-100 p-6 m-[-24px_-24px_0_-24px]">
      <div class="flex items-center gap-3">
        <mat-icon class="text-blue-600">edit</mat-icon>
        <div>
          <h2 class="text-xl font-semibold text-slate-900 m-0">Edit Order</h2>
          <p class="text-sm text-slate-600 m-0 mt-1">Update order details and delivery information</p>
        </div>
      </div>
      <button mat-icon-button (click)="onCancel()" class="text-slate-500 hover:text-slate-700">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <!-- Modal Content -->
    <mat-dialog-content class="py-6 max-h-[70vh] overflow-y-auto">
      
      <!-- Loading State -->
      <div *ngIf="loading" class="flex justify-center py-8">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div class="flex items-center gap-2 text-red-800">
          <mat-icon class="text-red-600">error</mat-icon>
          <span class="font-medium">Error loading order</span>
        </div>
        <p class="text-red-700 mt-1">{{error}}</p>
      </div>

      <!-- Edit Form -->
      <form *ngIf="isFormReady && !loading" [formGroup]="orderForm!" class="space-y-4">
        
        <!-- Basic Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Client Name</mat-label>
            <input 
              matInput 
              formControlName="clientName" 
              [matAutocomplete]="clientAuto"
              placeholder="Search or enter client name..."
              required />
            <mat-autocomplete #clientAuto="matAutocomplete" [displayWith]="displayClientName">
              <mat-option *ngFor="let client of filteredClients | async" [value]="client">
                <div class="flex items-center gap-3">
                  <mat-icon class="text-blue-500">business</mat-icon>
                  <div>
                    <div class="font-medium">{{client.name}}</div>
                    <div class="text-sm text-gray-500" *ngIf="client.company">{{client.company}}</div>
                    <div class="text-xs text-gray-400" *ngIf="client.email">{{client.email}}</div>
                  </div>
                </div>
              </mat-option>
              <mat-option *ngIf="(filteredClients | async)?.length === 0 && clientNameControl?.value" 
                         [value]="{name: clientNameControl?.value, company: '', email: ''}">
                <div class="flex items-center gap-3">
                  <mat-icon class="text-green-500">add</mat-icon>
                  <div>
                    <div class="font-medium">Add "{{clientNameControl?.value}}" as new client</div>
                    <div class="text-sm text-gray-500">Create new client entry</div>
                  </div>
                </div>
              </mat-option>
            </mat-autocomplete>
            <mat-hint>Search existing clients or add new one</mat-hint>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Contact Number</mat-label>
            <input matInput formControlName="contactNumber" />
          </mat-form-field>
        </div>

        <!-- Receiver Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Receiver Name</mat-label>
            <input matInput formControlName="receiverName" required />
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Receiver City</mat-label>
            <input matInput formControlName="receiverCity" required />
          </mat-form-field>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Receiver Address</mat-label>
            <textarea matInput formControlName="receiverAddress" rows="2" required></textarea>
          </mat-form-field>
        </div>

        <!-- Special Instructions -->
        <div class="grid grid-cols-1 gap-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Special Instructions</mat-label>
            <textarea matInput formControlName="specialInstructions" rows="2" placeholder="Add any special delivery instructions..."></textarea>
          </mat-form-field>
        </div>

        <!-- Financial Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    </mat-dialog-content>

    <!-- Modal Actions -->
    <mat-dialog-actions class="flex gap-3 justify-end p-6 bg-slate-50 border-t m-[0_-24px_-24px_-24px]">
      <button mat-stroked-button type="button" (click)="onCancel()" [disabled]="submitting">
        <mat-icon>close</mat-icon>
        Cancel
      </button>
      <button mat-flat-button color="primary" (click)="onSave()" [disabled]="!isFormReady || !isFormValid || submitting">
        <mat-spinner *ngIf="submitting" diameter="20" class="mr-2"></mat-spinner>
        <mat-icon *ngIf="!submitting">save</mat-icon>
        <span class="ml-2">{{submitting ? 'Saving...' : 'Save Changes'}}</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .mat-mdc-form-field {
      font-size: 14px;
    }
    
    ::ng-deep .mat-mdc-dialog-container {
      border-radius: 12px;
    }
    
    .mat-mdc-dialog-content {
      max-height: 70vh;
      overflow-y: auto;
    }
  `]
})
export class OrderEditModalComponent implements OnInit {
  orderForm: FormGroup | null = null;
  loading = false;
  submitting = false;
  error: string | null = null;
  order: OrderRecord;

  // Client autocomplete properties
  filteredClients: Observable<Client[]> = of([]);
  allClients: Client[] = [];

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    public dialogRef: MatDialogRef<OrderEditModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { order: OrderRecord }
  ) {
    this.order = data.order;
    this.loadClients();
  }

  get isFormValid(): boolean {
    return this.orderForm ? this.orderForm.valid : false;
  }

  get isFormReady(): boolean {
    return !!this.orderForm;
  }

  get clientNameControl() {
    return this.orderForm?.get('clientName');
  }

  ngOnInit(): void {
    this.initializeForm(this.order);
  }

  loadClients(): void {
    // TODO: Replace with actual API call to fetch clients
    // For now, using mock data that can be populated from existing orders
    this.allClients = [
      { id: 1, name: 'Tech Solutions Ltd', company: 'Tech Solutions Ltd', email: 'contact@techsolutions.com', phone: '+91-9876543210' },
      { id: 2, name: 'Global Enterprises', company: 'Global Enterprises Pvt Ltd', email: 'info@global.com', phone: '+91-8765432109' },
      { id: 3, name: 'StartUp Inc', company: 'StartUp Innovations Inc', email: 'hello@startup.com', phone: '+91-7654321098' },
      { id: 4, name: 'Metro Services', company: 'Metro Services Corporation', email: 'services@metro.com', phone: '+91-6543210987' },
      { id: 5, name: 'Prime Logistics', company: 'Prime Logistics Solutions', email: 'support@prime.com', phone: '+91-5432109876' },
      { id: 6, name: 'Digital Hub', company: 'Digital Hub Technologies', email: 'team@digitalhub.com', phone: '+91-4321098765' },
      { id: 7, name: 'Express Corp', company: 'Express Corporation', email: 'office@express.com', phone: '+91-3210987654' },
      { id: 8, name: 'Smart Systems', company: 'Smart Systems Pvt Ltd', email: 'contact@smart.com', phone: '+91-2109876543' }
    ];

    // If there's an existing client name that's not in our list, add it
    if (this.order.client_name && !this.allClients.find(c => c.name === this.order.client_name)) {
      this.allClients.unshift({
        name: this.order.client_name,
        company: this.order.client_name,
        email: '',
        phone: ''
      });
    }
  }

  setupClientAutocomplete(): void {
    if (!this.clientNameControl) return;

    this.filteredClients = this.clientNameControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const searchValue = typeof value === 'string' ? value : value?.name || '';
        return this.filterClients(searchValue);
      })
    );
  }

  filterClients(value: string): Client[] {
    const filterValue = value.toLowerCase();
    return this.allClients.filter(client => 
      client.name.toLowerCase().includes(filterValue) ||
      (client.company && client.company.toLowerCase().includes(filterValue)) ||
      (client.email && client.email.toLowerCase().includes(filterValue))
    );
  }

  displayClientName(client: Client | string): string {
    if (typeof client === 'string') return client;
    return client ? client.name : '';
  }

  initializeForm(order: OrderRecord): void {
    console.log('🔧 Initializing modal form with order:', order);
    
    // Find existing client or create a simple client object
    const existingClient = this.allClients.find(c => c.name === order.client_name) || {
      name: order.client_name,
      company: order.client_name,
      email: '',
      phone: ''
    };
    
    this.orderForm = this.fb.group({
      orderId: [{ value: order.order_id, disabled: true }],
      status: [order.status, Validators.required],
      serviceType: [order.service_type, Validators.required],
      estimatedDeliveryDate: [order.estimated_delivery_date ? new Date(order.estimated_delivery_date) : null, Validators.required],
      clientName: [existingClient, Validators.required],
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
    
    // Set up client autocomplete after form is created
    this.setupClientAutocomplete();
    
    console.log('✅ Modal form initialized:', this.orderForm.value);
    console.log('📝 Modal form valid:', this.orderForm.valid);
  }

  onSave(): void {
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
    
    // Extract client name from client object or string
    const clientName = typeof formValue.clientName === 'string' 
      ? formValue.clientName 
      : formValue.clientName?.name || '';
    
    console.log('🔧 Modal Form Value:', formValue);
    console.log('🔧 Extracted client name:', clientName);
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
    
    const formDate = formValue.estimatedDeliveryDate ? formValue.estimatedDeliveryDate.toISOString().split('T')[0] : null;
    const originalDate = this.order?.estimated_delivery_date;
    if (formDate !== originalDate) {
      updateData.estimated_delivery_date = formDate;
    }
    
    if (clientName !== this.order?.client_name) {
      updateData.client_name = clientName;
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
    
    console.log('🚀 Sending updateData from modal (changed fields):', changedFields);
    console.log('🚀 Full updateData from modal:', updateData);

    this.orderService.patchOrder(this.order.id.toString(), updateData).subscribe({
      next: (updatedOrder: OrderRecord) => {
        this.submitting = false;
        this.snackBar.open('Order updated successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        // Return the updated order to the parent component
        this.dialogRef.close(updatedOrder);
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

  onCancel(): void {
    this.dialogRef.close();
  }

  private markFormGroupTouched(): void {
    if (!this.orderForm) return;
    
    Object.keys(this.orderForm.controls).forEach(key => {
      const control = this.orderForm!.get(key);
      control?.markAsTouched();
    });
  }
}
