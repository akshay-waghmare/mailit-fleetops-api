/**
 * Delivery Sheet Form Dialog
 * Epic E10: Minimal RBAC (User Management)
 * Task T032: Add agent dropdown to DS creation form
 */

import { Component, OnInit, inject, ChangeDetectorRef, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, DateAdapter, MAT_DATE_FORMATS, MAT_NATIVE_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { finalize, debounceTime, distinctUntilChanged, switchMap, startWith } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { DeliverySheetService } from '../../services/delivery-sheet.service';
import { UserService } from '../../services/user.service';
import { UserResponse } from '../../models/user.model';
import { CreateDeliverySheetRequest, DeliverySheetSummary } from '../../models/delivery-sheet.model';
import { OrderService, OrderRecord, toIsoDate } from '../../../../../../libs/shared';

export interface DeliverySheetFormResult {
  created: boolean;
}

@Component({
  selector: 'app-delivery-sheet-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatAutocompleteModule,
    MatChipsModule
  ],
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS }
  ],
  template: `
    <h2 mat-dialog-title>{{ editMode ? 'Edit' : 'Create' }} Delivery Sheet</h2>

    <form
      id="delivery-sheet-form"
      [formGroup]="form"
      (ngSubmit)="handleSubmit()"
      class="space-y-4"
      mat-dialog-content>
      <style>
        .field-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: rgba(0, 0, 0, 0.87);
          margin-bottom: 6px;
        }
        .required {
          color: #f44336;
          margin-left: 2px;
        }
        .order-chip {
          margin: 4px;
        }
        .order-chip-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .order-chip-title {
          font-weight: 500;
        }
        .order-chip-subtitle {
          font-size: 11px;
          opacity: 0.7;
        }
      </style>
      <div class="text-sm text-gray-600">
        Assign an agent to ensure only that agent can access the delivery sheet from the field app.
      </div>

      <div>
        <label class="field-label">Title <span class="required">*</span></label>
        <mat-form-field appearance="outline" class="w-full">
          <input matInput placeholder="e.g. Mumbai West Route - Jan 8, 2025" formControlName="title" />
          <mat-hint>A descriptive name for this delivery sheet</mat-hint>
          <mat-error *ngIf="form.get('title')?.hasError('required')">Title is required.</mat-error>
          <mat-error *ngIf="form.get('title')?.hasError('minlength')">Title must be at least 3 characters.</mat-error>
        </mat-form-field>
      </div>

      <div>
        <label class="field-label">Assign Agent <span class="required">*</span></label>
        <mat-form-field appearance="outline" class="w-full">
          <mat-select formControlName="assignedAgentId" placeholder="Select a delivery agent">
            <mat-option *ngIf="isLoadingAgents" disabled>
              <mat-progress-spinner diameter="20" mode="indeterminate"></mat-progress-spinner>
              &nbsp;Loading agents...
            </mat-option>
            <mat-option *ngFor="let agent of agents" [value]="agent.id">
              {{ agent.fullName }} ({{ agent.username }})
            </mat-option>
          </mat-select>
          <mat-hint>Only this agent will see this delivery sheet</mat-hint>
          <mat-error *ngIf="form.get('assignedAgentId')?.hasError('required')">
            Selecting an agent is required.
          </mat-error>
        </mat-form-field>
      </div>

      <div>
        <label class="field-label">Scheduled Date</label>
        <mat-form-field appearance="outline" class="w-full">
          <input matInput [matDatepicker]="picker" formControlName="scheduledDate" placeholder="Select delivery date" />
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
          <mat-hint>Optional: Target delivery date</mat-hint>
        </mat-form-field>
      </div>

      <div>
        <label class="field-label">Notes</label>
        <mat-form-field appearance="outline" class="w-full">
          <textarea matInput rows="3" formControlName="notes" placeholder="e.g. Deliver before 5 PM, contact customer first, fragile items"></textarea>
          <mat-hint>Optional special instructions for the agent</mat-hint>
        </mat-form-field>
      </div>

      <!-- Enhanced Order Selection with Autocomplete -->
      <div>
        <label class="field-label">Add Orders</label>
        
        <!-- Selected Orders Chips -->
        <mat-chip-set *ngIf="selectedOrders.length > 0" class="mb-2">
          <mat-chip *ngFor="let order of selectedOrders" 
                    (removed)="removeOrder(order)"
                    class="order-chip">
            <div class="order-chip-content">
              <span class="order-chip-title">{{ order.order_id }}</span>
              <span class="order-chip-subtitle">{{ order.receiver_name }} • {{ order.receiver_city }}</span>
            </div>
            <button matChipRemove>
              <mat-icon>cancel</mat-icon>
            </button>
          </mat-chip>
        </mat-chip-set>

        <!-- Autocomplete Input -->
        <mat-form-field appearance="outline" class="w-full">
          <input matInput
                 placeholder="Search orders by ID, receiver name, or city"
                 [formControl]="orderSearchControl"
                 [matAutocomplete]="autoOrders">
          <mat-icon matSuffix>search</mat-icon>
          <mat-hint>Start typing to search available orders</mat-hint>
          <mat-autocomplete #autoOrders="matAutocomplete" 
                           (optionSelected)="onOrderSelected($event)"
                           [displayWith]="displayOrder">
            <mat-option *ngIf="isLoadingOrders" disabled>
              <mat-progress-spinner diameter="20" mode="indeterminate"></mat-progress-spinner>
              &nbsp;Searching orders...
            </mat-option>
            <mat-option *ngFor="let order of filteredOrders" [value]="order">
              <div class="flex flex-col py-1">
                <span class="font-medium">{{ order.order_id }}</span>
                <span class="text-xs text-gray-600">
                  {{ order.receiver_name }} • {{ order.receiver_city }} • {{ order.status }}
                </span>
              </div>
            </mat-option>
            <mat-option *ngIf="!isLoadingOrders && filteredOrders.length === 0" disabled>
              No orders found
            </mat-option>
          </mat-autocomplete>
        </mat-form-field>
      </div>

      <div class="text-xs text-gray-500">
        You can update orders and item statuses after creation.
      </div>

      <div *ngIf="submissionError" class="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
        {{ submissionError }}
      </div>
    </form>

    <mat-dialog-actions align="end" class="space-x-2">
      <button mat-button type="button" (click)="close(false)" [disabled]="isSubmitting">Cancel</button>
      <button mat-flat-button color="primary" type="button" (click)="handleSubmit()" [disabled]="form.invalid || isSubmitting">
        <span *ngIf="!isSubmitting">{{ editMode ? 'Update' : 'Create' }}</span>
        <mat-progress-spinner *ngIf="isSubmitting" diameter="20" mode="indeterminate"></mat-progress-spinner>
      </button>
    </mat-dialog-actions>
  `,
  host: {
    id: 'delivery-sheet-form'
  }
})
export class DeliverySheetFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<DeliverySheetFormComponent, DeliverySheetFormResult>);
  private deliverySheetService = inject(DeliverySheetService);
  private userService = inject(UserService);
  private orderService = inject(OrderService);
  private cdr = inject(ChangeDetectorRef);

  // Edit mode support
  editMode = false;
  sheetId?: number;

  form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    assignedAgentId: [null, Validators.required],
    scheduledDate: [null],
    notes: ['']
  });

  // Order selection
  orderSearchControl = new FormControl('');
  selectedOrders: OrderRecord[] = [];
  filteredOrders: OrderRecord[] = [];
  isLoadingOrders = false;

  agents: UserResponse[] = [];
  isLoadingAgents = false;
  isSubmitting = false;
  submissionError = '';

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: DeliverySheetSummary
  ) {
    // If data is provided, we're in edit mode
    if (data) {
      this.editMode = true;
      this.sheetId = data.id;
      console.log('Edit mode activated for sheet:', data);
    }
  }

  ngOnInit(): void {
    this.loadAgents();
    this.setupOrderSearch();
    
    // Pre-fill form if editing
    if (this.editMode && this.data) {
      this.form.patchValue({
        title: this.data.title || '',
        assignedAgentId: this.data.assignedAgentId,
        scheduledDate: this.data.scheduledDate ? new Date(this.data.scheduledDate) : null,
        notes: '' // Notes not available in summary, would need full detail endpoint
      });
    }
  }

  setupOrderSearch(): void {
    this.orderSearchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(searchTerm => {
        if (typeof searchTerm !== 'string' || searchTerm.length < 2) {
          return of({ content: [], totalElements: 0, totalPages: 0, size: 0, number: 0 });
        }
        
        this.isLoadingOrders = true;
        return this.orderService.getOrders({
          search: searchTerm,
          size: 20,
          status: 'PENDING' // Only show pending orders
        }).pipe(
          finalize(() => {
            this.isLoadingOrders = false;
            this.cdr.detectChanges();
          })
        );
      })
    ).subscribe({
      next: (response) => {
        this.filteredOrders = response.content || [];
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error searching orders:', error);
        this.filteredOrders = [];
        this.cdr.detectChanges();
      }
    });
  }

  onOrderSelected(event: any): void {
    const order = event.option.value as OrderRecord;
    
    // Check if already added
    if (!this.selectedOrders.find(o => o.id === order.id)) {
      this.selectedOrders.push(order);
      console.log('Order added:', order.order_id);
    }
    
    // Clear the input
    this.orderSearchControl.setValue('');
    this.cdr.detectChanges();
  }

  removeOrder(order: OrderRecord): void {
    this.selectedOrders = this.selectedOrders.filter(o => o.id !== order.id);
    console.log('Order removed:', order.order_id);
    this.cdr.detectChanges();
  }

  displayOrder(order: OrderRecord | string): string {
    // Return empty string for display (we handle display in template)
    return '';
  }

  handleSubmit(): void {
    console.log('=== DELIVERY SHEET FORM SUBMIT ===');
    console.log('Button clicked!');
    console.log('Form valid:', this.form.valid);
    console.log('Form value:', this.form.value);
    console.log('Selected orders:', this.selectedOrders.length);
    
    if (this.form.invalid) {
      console.error('❌ Form is INVALID. Cannot submit.');
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control?.invalid) {
          console.error(`  - ${key} is invalid:`, control.errors);
        }
      });
      return;
    }

    if (this.isSubmitting) {
      console.warn('Already submitting, ignoring duplicate submit');
      return;
    }

    this.isSubmitting = true;
    this.submissionError = '';

    const formValue = this.form.value;
    const payload: CreateDeliverySheetRequest = {
      title: formValue.title,
      assignedAgentId: formValue.assignedAgentId,
      scheduledDate: formValue.scheduledDate ? toIsoDate(formValue.scheduledDate) : undefined,
      notes: formValue.notes?.trim() ? formValue.notes.trim() : undefined,
      orderIds: this.selectedOrders.map(order => order.id)
    };

    console.log('Submitting payload:', payload);

    // Use create or update based on edit mode
    const operation = this.editMode && this.sheetId
      ? this.deliverySheetService.updateDeliverySheet(this.sheetId, payload)
      : this.deliverySheetService.createDeliverySheet(payload);

    operation
      .pipe(finalize(() => {
        console.log('Submission complete, setting isSubmitting to false');
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (response) => {
          console.log('✅ Delivery sheet saved successfully:', response);
          this.close(true);
        },
        error: (error) => {
          console.error('❌ Failed to save delivery sheet:', error);
          console.error('Error status:', error.status);
          console.error('Error body:', error.error);
          this.submissionError = error?.error?.message || `Failed to ${this.editMode ? 'update' : 'create'} delivery sheet. Please try again.`;
          this.cdr.detectChanges();
        }
      });
  }

  close(created: boolean): void {
    this.dialogRef.close({ created });
  }

  private loadAgents(): void {
    console.log('=== LOADING AGENTS ===');
    this.isLoadingAgents = true;
    
    // Disable the control during loading
    const agentControl = this.form.get('assignedAgentId');
    agentControl?.disable();
    this.cdr.detectChanges(); // Trigger change detection before async operation
    
    this.userService.getActiveAgents()
      .pipe(finalize(() => {
        console.log('Agent loading complete');
        this.isLoadingAgents = false;
        agentControl?.enable(); // Re-enable after loading
        this.cdr.detectChanges(); // Trigger change detection after state change
      }))
      .subscribe({
        next: agents => {
          console.log('✅ Agents loaded:', agents);
          this.agents = agents;
          if (agents.length === 1) {
            console.log('Auto-selecting single agent:', agents[0]);
            this.form.patchValue({ assignedAgentId: agents[0].id });
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('❌ Failed to load agents:', error);
          console.error('Error status:', error.status);
          console.error('Error body:', error.error);
          this.submissionError = 'Unable to load agents. Please verify you have agent users configured.';
          this.cdr.detectChanges();
        }
      });
  }

}
