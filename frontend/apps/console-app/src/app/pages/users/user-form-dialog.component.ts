import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../services/user.service';
import { CreateUserRequest, UpdateUserRequest, UserResponse, UserRole } from '../../models/user.model';
import { PASSWORD_PATTERN } from '../../../../../../libs/shared';

export type UserFormDialogMode = 'create' | 'edit';

export interface UserFormDialogData {
  mode: UserFormDialogMode;
  user?: UserResponse;
}

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>{{ dialogTitle }}</h2>

    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="field-grid">
          <div>
            <label class="field-label">Username <span class="required">*</span></label>
            <mat-form-field appearance="outline" class="full-width">
              <input matInput formControlName="username" autocomplete="off" placeholder="e.g. john.doe" />
              <mat-hint>Used for login (min 3 characters)</mat-hint>
              <mat-error *ngIf="fieldHasError('username', 'required')">Username is required</mat-error>
              <mat-error *ngIf="fieldHasError('username', 'minlength')">Minimum 3 characters</mat-error>
            </mat-form-field>
          </div>

          <div>
            <label class="field-label">Full Name <span class="required">*</span></label>
            <mat-form-field appearance="outline" class="full-width">
              <input matInput formControlName="fullName" autocomplete="off" placeholder="e.g. John Doe" />
              <mat-error *ngIf="fieldHasError('fullName', 'required')">Full name is required</mat-error>
            </mat-form-field>
          </div>

          <div>
            <label class="field-label">Email <span class="required">*</span></label>
            <mat-form-field appearance="outline" class="full-width">
              <input matInput type="email" formControlName="email" autocomplete="off" placeholder="e.g. john.doe@fleetops.com" />
              <mat-error *ngIf="fieldHasError('email', 'required')">Email is required</mat-error>
              <mat-error *ngIf="fieldHasError('email', 'email')">Enter a valid email</mat-error>
            </mat-form-field>
          </div>

          <div>
            <label class="field-label">Phone</label>
            <mat-form-field appearance="outline" class="full-width">
              <input matInput formControlName="phone" autocomplete="off" placeholder="e.g. +1-234-567-8900" />
              <mat-hint>Optional</mat-hint>
            </mat-form-field>
          </div>

          <div>
            <label class="field-label">Roles <span class="required">*</span></label>
            <mat-form-field appearance="outline" class="full-width">
              <mat-select formControlName="roles" multiple placeholder="Select one or more roles">
                <mat-option *ngFor="let role of availableRoles" [value]="role">{{ role }}</mat-option>
              </mat-select>
              <mat-hint>Hold Ctrl/Cmd to select multiple</mat-hint>
              <mat-error *ngIf="fieldHasError('roles', 'required')">Select at least one role</mat-error>
            </mat-form-field>
          </div>

          <div>
            <label class="field-label">Status</label>
            <mat-slide-toggle formControlName="isActive">Active</mat-slide-toggle>
          </div>
        </div>

        @if (mode === 'create') {
        <div class="full-width">
          <label class="field-label">Password <span class="required">*</span></label>
          <mat-form-field appearance="outline" class="full-width">
            <input matInput type="password" formControlName="password" autocomplete="new-password" placeholder="Min 8 chars with uppercase, lowercase, number, special char" />
            <mat-hint>e.g. SecurePass123!</mat-hint>
            <mat-error *ngIf="fieldHasError('password', 'required')">Password is required</mat-error>
            <mat-error *ngIf="fieldHasError('password', 'pattern')">
              Password must be at least 8 characters and include uppercase, lowercase, number, and special character
            </mat-error>
          </mat-form-field>
        </div>
        }

        <div class="error" *ngIf="submissionError()">{{ submissionError() }}</div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="onCancel()" [disabled]="loading()">Cancel</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="loading()">
          <ng-container *ngIf="!loading(); else loadingTpl">{{ submitLabel }}</ng-container>
        </button>
      </mat-dialog-actions>
    </form>

    <ng-template #loadingTpl>
      <mat-progress-spinner diameter="20" mode="indeterminate"></mat-progress-spinner>
    </ng-template>
  `,
  styles: [`
    .field-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
    }

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

    .error {
      color: #d32f2f;
      margin-top: 8px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserFormDialogComponent {
  private dialogRef: MatDialogRef<UserFormDialogComponent, UserResponse | undefined> =
    inject(MatDialogRef<UserFormDialogComponent, UserResponse | undefined>);
  private data = inject<UserFormDialogData>(MAT_DIALOG_DATA);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  readonly mode = this.data.mode;
  readonly availableRoles = Object.values(UserRole);
  readonly loading = signal(false);
  readonly submissionError = signal<string | null>(null);

  readonly form: FormGroup = this.fb.group({
    username: [{ value: this.data.user?.username ?? '', disabled: this.mode === 'edit' }, [Validators.required, Validators.minLength(3)]],
    fullName: [this.data.user?.fullName ?? '', Validators.required],
    email: [this.data.user?.email ?? '', [Validators.required, Validators.email]],
    phone: [this.data.user?.phone ?? ''],
    roles: [this.data.user?.roles ?? [], Validators.required],
    isActive: [this.data.user?.isActive ?? true],
    password: ['', this.mode === 'create' ? [Validators.required, Validators.pattern(PASSWORD_PATTERN)] : []]
  });

  get dialogTitle(): string {
    return this.mode === 'create' ? 'Add User' : 'Edit User';
  }

  get submitLabel(): string {
    return this.mode === 'create' ? 'Create User' : 'Save Changes';
  }

  fieldHasError(control: string, error: string): boolean {
    const ctrl = this.form.get(control);
    if (!ctrl) {
      return false;
    }
    return ctrl.invalid && ctrl.hasError(error) && (ctrl.dirty || ctrl.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.submissionError.set(null);

    if (this.mode === 'create') {
      this.handleCreate();
    } else {
      this.handleUpdate();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private handleCreate(): void {
    const value = this.form.getRawValue();
    const request: CreateUserRequest = {
      username: value.username.trim(),
      email: value.email.trim(),
      fullName: value.fullName.trim(),
      phone: value.phone?.trim() || undefined,
      password: value.password,
      roles: value.roles,
      isActive: value.isActive
    };

    this.userService.createUser(request).subscribe({
      next: (user) => this.onSuccess(user, 'User created successfully'),
      error: (error) => this.onError(error)
    });
  }

  private handleUpdate(): void {
    const value = this.form.getRawValue();
    if (!this.data.user) {
      this.loading.set(false);
      return;
    }

    const request: UpdateUserRequest = {
      email: value.email?.trim(),
      fullName: value.fullName?.trim(),
      phone: value.phone?.trim() || undefined,
      roles: value.roles,
      isActive: value.isActive
    };

    this.userService.updateUser(this.data.user.id, request).subscribe({
      next: (user) => this.onSuccess(user, 'User updated successfully'),
      error: (error) => this.onError(error)
    });
  }

  private onSuccess(user: UserResponse, message: string): void {
    this.loading.set(false);
    this.snackBar.open(message, 'Close', { duration: 3000 });
    this.dialogRef.close(user);
  }

  private onError(error: unknown): void {
    this.loading.set(false);
    const message = this.extractErrorMessage(error);
    this.submissionError.set(message);
  }

  private extractErrorMessage(error: unknown): string {
    if (typeof error === 'string') {
      return error;
    }

    if (error && typeof error === 'object') {
      const err = error as { error?: any; message?: string };
      if (err.error) {
        if (typeof err.error === 'string') {
          return err.error;
        }
        if (err.error.message) {
          return err.error.message;
        }
      }
      if (err.message) {
        return err.message;
      }
    }

    return 'Something went wrong while saving the user. Please try again.';
  }
}
