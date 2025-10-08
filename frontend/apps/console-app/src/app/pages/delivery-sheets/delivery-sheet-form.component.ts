/**
 * Delivery Sheet Form Dialog
 * Epic E10: Minimal RBAC (User Management)
 * Task T032: Add agent dropdown to DS creation form
 */

import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, DateAdapter, MAT_DATE_FORMATS, MAT_NATIVE_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { finalize } from 'rxjs/operators';
import { DeliverySheetService } from '../../services/delivery-sheet.service';
import { UserService } from '../../services/user.service';
import { UserResponse } from '../../models/user.model';
import { CreateDeliverySheetRequest } from '../../models/delivery-sheet.model';

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
    MatIconModule
  ],
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS }
  ],
  template: `
    <h2 mat-dialog-title>Create Delivery Sheet</h2>

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

      <div>
        <label class="field-label">Order IDs (comma separated)</label>
        <mat-form-field appearance="outline" class="w-full">
          <textarea matInput rows="2" formControlName="orderIds" placeholder="e.g. 101, 102, 103, 104"></textarea>
          <mat-hint>Optional: Enter order IDs separated by commas</mat-hint>
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
        <span *ngIf="!isSubmitting">Create</span>
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
  private cdr = inject(ChangeDetectorRef);

  form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    assignedAgentId: [null, Validators.required],
    scheduledDate: [null],
    notes: [''],
    orderIds: ['']
  });

  agents: UserResponse[] = [];
  isLoadingAgents = false;
  isSubmitting = false;
  submissionError = '';

  ngOnInit(): void {
    this.loadAgents();
  }

  handleSubmit(): void {
    console.log('=== DELIVERY SHEET FORM SUBMIT ===');
    console.log('Button clicked!');
    console.log('Form valid:', this.form.valid);
    console.log('Form value:', this.form.value);
    console.log('Form errors:', this.form.errors);
    
    // Log each control's state
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      console.log(`  - ${key}: valid=${control?.valid}, value=${JSON.stringify(control?.value)}, errors=`, control?.errors);
    });
    
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
      scheduledDate: formValue.scheduledDate ? this.toIsoDate(formValue.scheduledDate) : undefined,
      notes: formValue.notes?.trim() ? formValue.notes.trim() : undefined,
      orderIds: this.parseOrderIds(formValue.orderIds)
    };

    console.log('Submitting payload:', payload);

    this.deliverySheetService.createDeliverySheet(payload)
      .pipe(finalize(() => {
        console.log('Submission complete, setting isSubmitting to false');
        this.isSubmitting = false;
        this.cdr.detectChanges(); // Manually trigger change detection
      }))
      .subscribe({
        next: (response) => {
          console.log('✅ Delivery sheet created successfully:', response);
          this.close(true);
        },
        error: (error) => {
          console.error('❌ Failed to create delivery sheet:', error);
          console.error('Error status:', error.status);
          console.error('Error body:', error.error);
          this.submissionError = error?.error?.message || 'Failed to create delivery sheet. Please try again.';
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

  private toIsoDate(date: unknown): string | undefined {
    if (!(date instanceof Date)) {
      return undefined;
    }
    // Return YYYY-MM-DD to match backend expectation
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private parseOrderIds(raw: unknown): number[] | undefined {
    if (typeof raw !== 'string' || !raw.trim()) {
      return undefined;
    }

    const tokens = raw
      .split(',')
      .map(token => token.trim())
      .filter(token => token.length > 0);

    const ids = tokens
      .map(token => Number(token))
      .filter(id => !Number.isNaN(id));

    return ids.length ? ids : undefined;
  }
}
