import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Client } from '../../../models/client.model';

@Component({
  selector: 'app-client-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEdit ? 'Edit Client' : 'Add Client' }}</h2>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-dialog-content class="mat-typography flex flex-col gap-4 min-w-[600px] max-h-[80vh]">
        <p class="text-sm text-slate-500 mb-2">Fields marked with <span class="text-red-500">*</span> are mandatory.</p>
        
        <!-- Basic Info -->
        <div class="grid grid-cols-1 gap-4">
          <mat-form-field>
            <mat-label>Client Name</mat-label>
            <input matInput formControlName="name" required>
            <mat-error *ngIf="form.get('name')?.hasError('required')">Name is required</mat-error>
          </mat-form-field>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <mat-form-field>
            <mat-label>Contract No</mat-label>
            <input matInput formControlName="contractNo" required>
            <mat-error *ngIf="form.get('contractNo')?.hasError('required')">Contract No is required</mat-error>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Sub Contract Code</mat-label>
            <input matInput formControlName="subContractCode" required>
            <mat-error *ngIf="form.get('subContractCode')?.hasError('required')">Sub Contract Code is required</mat-error>
          </mat-form-field>
        </div>

        <mat-form-field>
          <mat-label>Address</mat-label>
          <textarea matInput formControlName="address" rows="2" required></textarea>
          <mat-error *ngIf="form.get('address')?.hasError('required')">Address is required</mat-error>
        </mat-form-field>

        <div class="grid grid-cols-3 gap-4">
          <mat-form-field>
            <mat-label>Contact Person</mat-label>
            <input matInput formControlName="contactPerson" required>
            <mat-error *ngIf="form.get('contactPerson')?.hasError('required')">Required</mat-error>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Email</mat-label>
            <input matInput formControlName="vcontactEmail">
            <mat-error *ngIf="form.get('vcontactEmail')?.hasError('email')">Invalid email</mat-error>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Mobile</mat-label>
            <input matInput formControlName="vcontactMobile">
          </mat-form-field>
        </div>

        <!-- Location Details -->
        <h3 class="text-lg font-medium text-slate-700 mt-2 border-b pb-1">Location Details</h3>
        <div class="grid grid-cols-2 gap-4">
          <mat-form-field>
            <mat-label>City</mat-label>
            <input matInput formControlName="vcity">
          </mat-form-field>

          <mat-form-field>
            <mat-label>Pincode</mat-label>
            <input matInput formControlName="vpincode">
          </mat-form-field>

          <mat-form-field>
            <mat-label>State</mat-label>
            <input matInput formControlName="vstate">
          </mat-form-field>

          <mat-form-field>
            <mat-label>Country</mat-label>
            <input matInput formControlName="vcountry">
          </mat-form-field>
        </div>

        <!-- Billing Details -->
        <h3 class="text-lg font-medium text-slate-700 mt-2 border-b pb-1">Billing Details</h3>
        <div class="grid grid-cols-2 gap-4">
          <mat-form-field>
            <mat-label>Billing Name</mat-label>
            <input matInput formControlName="vbillingName">
          </mat-form-field>

          <mat-form-field>
            <mat-label>GST No</mat-label>
            <input matInput formControlName="vbillGstNo">
          </mat-form-field>
        </div>

        <mat-form-field>
          <mat-label>Department Name</mat-label>
          <input matInput formControlName="vdeptName">
        </mat-form-field>

        <div class="grid grid-cols-2 gap-4">
          <mat-form-field>
            <mat-label>Billing Address 1</mat-label>
            <textarea matInput formControlName="vbillAddress1" rows="2"></textarea>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Billing Address 2</mat-label>
            <textarea matInput formControlName="vbillAddress2" rows="2"></textarea>
          </mat-form-field>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <mat-form-field>
            <mat-label>Billing City</mat-label>
            <input matInput formControlName="vbillCity">
          </mat-form-field>

          <mat-form-field>
            <mat-label>Billing Pincode</mat-label>
            <input matInput formControlName="vbillPincode">
          </mat-form-field>

          <mat-form-field>
            <mat-label>Billing State</mat-label>
            <input matInput formControlName="vbillState">
          </mat-form-field>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <mat-form-field>
            <mat-label>Billing Country</mat-label>
            <input matInput formControlName="vbillCountry">
          </mat-form-field>

          <mat-form-field>
            <mat-label>State Code</mat-label>
            <input matInput formControlName="vbillStaeCode">
          </mat-form-field>
        </div>

        <!-- Billing Contact -->
        <h3 class="text-lg font-medium text-slate-700 mt-2 border-b pb-1">Billing Contact</h3>
        <div class="grid grid-cols-2 gap-4">
          <mat-form-field>
            <mat-label>Kind Attn</mat-label>
            <input matInput formControlName="vbillKindAttn">
          </mat-form-field>

          <mat-form-field>
            <mat-label>CC Name</mat-label>
            <input matInput formControlName="vccName">
          </mat-form-field>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <mat-form-field>
            <mat-label>Billing Email</mat-label>
            <input matInput formControlName="vbillEmail">
            <mat-error *ngIf="form.get('vbillEmail')?.hasError('email')">Invalid email</mat-error>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Billing Mobile</mat-label>
            <input matInput formControlName="vbillMobile">
          </mat-form-field>
        </div>

        <mat-form-field>
          <mat-label>Intimation Email IDs</mat-label>
          <input matInput formControlName="vintimationEmailIds">
        </mat-form-field>

      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
          {{ isEdit ? 'Update' : 'Create' }}
        </button>
      </mat-dialog-actions>
    </form>
  `
})
export class ClientDialogComponent {
  form: FormGroup;
  isEdit: boolean;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ClientDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { client?: Client }
  ) {
    this.isEdit = !!data?.client;
    this.form = this.fb.group({
      id: [data?.client?.id],
      name: [data?.client?.name || '', Validators.required],
      contractNo: [{ value: data?.client?.contractNo || '', disabled: this.isEdit }, Validators.required],
      subContractCode: [{ value: data?.client?.subContractCode || '', disabled: this.isEdit }, Validators.required],
      address: [data?.client?.address || '', Validators.required],
      contactPerson: [data?.client?.contactPerson || '', Validators.required],
      vcontactEmail: [data?.client?.vcontactEmail || '', Validators.email],
      vcontactMobile: [data?.client?.vcontactMobile || ''],
      
      // Location Details
      vpincode: [data?.client?.vpincode || ''],
      vcity: [data?.client?.vcity || ''],
      vstate: [data?.client?.vstate || ''],
      vcountry: [data?.client?.vcountry || ''],

      // Billing Details
      vbillGstNo: [data?.client?.vbillGstNo || ''],
      vbillingName: [data?.client?.vbillingName || ''],
      vdeptName: [data?.client?.vdeptName || ''],
      vbillAddress1: [data?.client?.vbillAddress1 || ''],
      vbillAddress2: [data?.client?.vbillAddress2 || ''],
      vbillPincode: [data?.client?.vbillPincode || ''],
      vbillCity: [data?.client?.vbillCity || ''],
      vbillState: [data?.client?.vbillState || ''],
      vbillCountry: [data?.client?.vbillCountry || ''],
      vbillStaeCode: [data?.client?.vbillStaeCode || ''],

      // Billing Contact
      vccName: [data?.client?.vccName || ''],
      vbillKindAttn: [data?.client?.vbillKindAttn || ''],
      vbillEmail: [data?.client?.vbillEmail || '', Validators.email],
      vbillMobile: [data?.client?.vbillMobile || ''],
      vintimationEmailIds: [data?.client?.vintimationEmailIds || '']
    });
  }

  onSubmit() {
    if (this.form.valid) {
      // Get raw value to include disabled fields
      this.dialogRef.close(this.form.getRawValue());
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
