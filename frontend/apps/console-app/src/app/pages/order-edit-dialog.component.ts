import { Component, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderRecord } from '../../../../../libs/shared/order.interface';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-order-edit-dialog',
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
    MatNativeDateModule
  ],
  template: `
    <h2 mat-dialog-title>Edit Order</h2>
    <form [formGroup]="orderForm" (ngSubmit)="onSave()" class="space-y-4">
      <mat-dialog-content>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Order ID</mat-label>
            <input matInput formControlName="orderId" />
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
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Service Type</mat-label>
            <mat-select formControlName="serviceType" required>
              <mat-option value="express">Express</mat-option>
              <mat-option value="standard">Standard</mat-option>
              <mat-option value="economy">Economy</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Client Name</mat-label>
            <input matInput formControlName="clientName" required />
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Receiver Name</mat-label>
            <input matInput formControlName="receiverName" required />
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Receiver City</mat-label>
            <input matInput formControlName="receiverCity" required />
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Delivery Date</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="estimatedDeliveryDate" required />
            <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>
        </div>
        <mat-divider class="my-4"></mat-divider>
        <div class="flex gap-2 justify-end">
          <button mat-stroked-button type="button" (click)="onCancel()">Cancel</button>
          <button mat-flat-button color="primary" type="submit" [disabled]="orderForm.invalid || loading">
            <span *ngIf="!loading">Save</span>
            <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
          </button>
        </div>
        <div *ngIf="error" class="text-red-600 mt-2">{{error}}</div>
      </mat-dialog-content>
    </form>
  `,
  styles: [``]
})
export class OrderEditDialogComponent {
  orderForm: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<OrderEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: OrderRecord
  ) {
    this.orderForm = this.fb.group({
      orderId: [{ value: data.order_id, disabled: true }],
      status: [data.status, Validators.required],
      serviceType: [data.service_type, Validators.required],
      clientName: [data.client_name, Validators.required],
      receiverName: [data.receiver_name, Validators.required],
      receiverCity: [data.receiver_city, Validators.required],
      estimatedDeliveryDate: [data.estimated_delivery_date ? new Date(data.estimated_delivery_date) : null, Validators.required],
    });
  }

  onSave() {
    if (this.orderForm.invalid) return;
    this.loading = true;
    this.error = null;
    // TODO: Call updateOrder service and handle result
    setTimeout(() => {
      this.loading = false;
      this.dialogRef.close(this.orderForm.getRawValue());
    }, 1000);
  }

  onCancel() {
    this.dialogRef.close();
  }
}
