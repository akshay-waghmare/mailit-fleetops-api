/**
 * Delivery Sheet Form Dialog
 * Epic E10: Minimal RBAC (User Management)
 * Task T032: Add agent dropdown to DS creation form
 */

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
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
  template: `
    <h2 mat-dialog-title>Create Delivery Sheet</h2>

    <form
      id="delivery-sheet-form"
      [formGroup]="form"
      (ngSubmit)="handleSubmit()"
      class="space-y-4"
      mat-dialog-content>
      <div class="text-sm text-gray-600">
        Assign an agent to ensure only that agent can access the delivery sheet from the field app.
      </div>

      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Title</mat-label>
        <input matInput placeholder="e.g. Mumbai West Route" formControlName="title" />
        <mat-error *ngIf="form.get('title')?.hasError('required')">Title is required.</mat-error>
        <mat-error *ngIf="form.get('title')?.hasError('minlength')">Title must be at least 3 characters.</mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Assign Agent</mat-label>
        <mat-select formControlName="assignedAgentId" [disabled]="isLoadingAgents">
          <mat-option *ngIf="isLoadingAgents" disabled>
            <mat-progress-spinner diameter="20" mode="indeterminate"></mat-progress-spinner>
            &nbsp;Loading agents...
          </mat-option>
          <mat-option *ngFor="let agent of agents" [value]="agent.id">
            {{ agent.fullName }} ({{ agent.username }})
          </mat-option>
        </mat-select>
        <mat-error *ngIf="form.get('assignedAgentId')?.hasError('required')">
          Selecting an agent is required.
        </mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Scheduled Date</mat-label>
        <input matInput [matDatepicker]="picker" formControlName="scheduledDate" />
        <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker #picker></mat-datepicker>
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Notes</mat-label>
        <textarea matInput rows="3" formControlName="notes" placeholder="Optional instructions for the agent"></textarea>
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Order IDs (comma separated)</mat-label>
        <textarea matInput rows="2" formControlName="orderIds" placeholder="Optional: 123, 456, 789"></textarea>
      </mat-form-field>

      <div class="text-xs text-gray-500">
        You can update orders and item statuses after creation.
      </div>

      <div *ngIf="submissionError" class="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
        {{ submissionError }}
      </div>
    </form>

    <mat-dialog-actions align="end" class="space-x-2">
      <button mat-button type="button" (click)="close(false)" [disabled]="isSubmitting">Cancel</button>
      <button mat-flat-button color="primary" type="submit" form="delivery-sheet-form" [disabled]="form.invalid || isSubmitting">
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
    if (this.form.invalid || this.isSubmitting) {
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

    this.deliverySheetService.createDeliverySheet(payload)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => this.close(true),
        error: (error) => {
          this.submissionError = error?.error?.message || 'Failed to create delivery sheet. Please try again.';
        }
      });
  }

  close(created: boolean): void {
    this.dialogRef.close({ created });
  }

  private loadAgents(): void {
    this.isLoadingAgents = true;
    this.userService.getActiveAgents()
      .pipe(finalize(() => (this.isLoadingAgents = false)))
      .subscribe({
        next: agents => {
          this.agents = agents;
          if (agents.length === 1) {
            this.form.patchValue({ assignedAgentId: agents[0].id });
          }
        },
        error: () => {
          this.submissionError = 'Unable to load agents. Please verify you have agent users configured.';
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
