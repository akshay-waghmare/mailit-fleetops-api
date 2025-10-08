/**
 * Password Reset Dialog Component
 * Epic E10: Minimal RBAC (User Management)
 * 
 * Features:
 * - Admin can reset user password
 * - Password strength validation
 * - Password confirmation matching
 */

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../services/user.service';
import { UserResponse } from '../../models/user.model';

export interface PasswordResetDialogData {
  user: UserResponse;
}

// Password strength validator
function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  
  if (!value) {
    return null;
  }

  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumeric = /[0-9]/.test(value);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(value);
  const isLengthValid = value.length >= 8;

  const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar && isLengthValid;

  return !passwordValid ? {
    passwordStrength: {
      hasUpperCase,
      hasLowerCase,
      hasNumeric,
      hasSpecialChar,
      isLengthValid
    }
  } : null;
}

// Password match validator
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword) {
    return null;
  }

  return password.value === confirmPassword.value ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-password-reset-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>Reset Password</h2>

    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <p class="user-info">
          <strong>User:</strong> {{ data.user.fullName }} ({{ data.user.username }})
        </p>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>New Password</mat-label>
          <input 
            matInput 
            [type]="hidePassword ? 'password' : 'text'" 
            formControlName="password" 
            autocomplete="new-password" 
          />
          <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
            <mat-icon>{{ hidePassword ? 'visibility' : 'visibility_off' }}</mat-icon>
          </button>
          <mat-error *ngIf="form.get('password')?.hasError('required')">
            Password is required
          </mat-error>
          <mat-error *ngIf="form.get('password')?.hasError('passwordStrength')">
            Password does not meet strength requirements
          </mat-error>
        </mat-form-field>

        <!-- Password Strength Indicator -->
        <div class="password-requirements" *ngIf="form.get('password')?.touched || form.get('password')?.dirty">
          <div class="requirement" [class.met]="hasUpperCase()">
            <mat-icon>{{ hasUpperCase() ? 'check_circle' : 'cancel' }}</mat-icon>
            <span>At least one uppercase letter</span>
          </div>
          <div class="requirement" [class.met]="hasLowerCase()">
            <mat-icon>{{ hasLowerCase() ? 'check_circle' : 'cancel' }}</mat-icon>
            <span>At least one lowercase letter</span>
          </div>
          <div class="requirement" [class.met]="hasNumeric()">
            <mat-icon>{{ hasNumeric() ? 'check_circle' : 'cancel' }}</mat-icon>
            <span>At least one number</span>
          </div>
          <div class="requirement" [class.met]="hasSpecialChar()">
            <mat-icon>{{ hasSpecialChar() ? 'check_circle' : 'cancel' }}</mat-icon>
            <span>At least one special character</span>
          </div>
          <div class="requirement" [class.met]="isLengthValid()">
            <mat-icon>{{ isLengthValid() ? 'check_circle' : 'cancel' }}</mat-icon>
            <span>At least 8 characters long</span>
          </div>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Confirm New Password</mat-label>
          <input 
            matInput 
            [type]="hideConfirmPassword ? 'password' : 'text'" 
            formControlName="confirmPassword" 
            autocomplete="new-password" 
          />
          <button mat-icon-button matSuffix type="button" (click)="hideConfirmPassword = !hideConfirmPassword">
            <mat-icon>{{ hideConfirmPassword ? 'visibility' : 'visibility_off' }}</mat-icon>
          </button>
          <mat-error *ngIf="form.get('confirmPassword')?.hasError('required')">
            Please confirm the password
          </mat-error>
          <mat-error *ngIf="form.hasError('passwordMismatch') && form.get('confirmPassword')?.touched">
            Passwords do not match
          </mat-error>
        </mat-form-field>

        <div class="error" *ngIf="submissionError()">{{ submissionError() }}</div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="onCancel()" [disabled]="loading()">Cancel</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="loading() || form.invalid">
          <ng-container *ngIf="!loading(); else loadingTpl">Reset Password</ng-container>
        </button>
      </mat-dialog-actions>
    </form>

    <ng-template #loadingTpl>
      <mat-progress-spinner diameter="20" mode="indeterminate"></mat-progress-spinner>
    </ng-template>
  `,
  styles: [`
    .user-info {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 20px;
      color: #555;
    }

    .full-width {
      width: 100%;
      margin-bottom: 8px;
    }

    .password-requirements {
      margin: 16px 0 24px 0;
      padding: 12px;
      background: #f9f9f9;
      border-radius: 4px;
      border-left: 3px solid #2196f3;
    }

    .requirement {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 0;
      font-size: 13px;
      color: #666;
    }

    .requirement mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #f44336;
    }

    .requirement.met {
      color: #333;
    }

    .requirement.met mat-icon {
      color: #4caf50;
    }

    .error {
      color: #d32f2f;
      margin-top: 8px;
      padding: 8px;
      background: #ffebee;
      border-radius: 4px;
      font-size: 14px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PasswordResetDialogComponent {
  private dialogRef = inject(MatDialogRef<PasswordResetDialogComponent>);
  readonly data = inject<PasswordResetDialogData>(MAT_DIALOG_DATA);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly submissionError = signal<string | null>(null);

  hidePassword = true;
  hideConfirmPassword = true;

  readonly form: FormGroup = this.fb.group({
    password: ['', [Validators.required, passwordStrengthValidator]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordMatchValidator });

  hasUpperCase(): boolean {
    const value = this.form.get('password')?.value || '';
    return /[A-Z]/.test(value);
  }

  hasLowerCase(): boolean {
    const value = this.form.get('password')?.value || '';
    return /[a-z]/.test(value);
  }

  hasNumeric(): boolean {
    const value = this.form.get('password')?.value || '';
    return /[0-9]/.test(value);
  }

  hasSpecialChar(): boolean {
    const value = this.form.get('password')?.value || '';
    return /[^A-Za-z0-9]/.test(value);
  }

  isLengthValid(): boolean {
    const value = this.form.get('password')?.value || '';
    return value.length >= 8;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.submissionError.set(null);

    const password = this.form.get('password')?.value;

    this.userService.resetPassword(this.data.user.id, password).subscribe({
      next: () => {
        this.loading.set(false);
        this.snackBar.open('Password reset successfully', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.loading.set(false);
        const message = this.extractErrorMessage(error);
        this.submissionError.set(message);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
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

    return 'Failed to reset password. Please try again.';
  }
}
