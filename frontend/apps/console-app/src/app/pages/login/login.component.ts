/**
 * Login Component
 * Epic E10: Minimal RBAC (User Management)
 * Task T026: Create login component
 */

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-content">
          <h1 class="login-title">Login</h1>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label class="form-label">Username</label>
              <div class="input-wrapper">
                <mat-icon class="input-icon">person</mat-icon>
                <input 
                  type="text"
                  class="form-input"
                  formControlName="username" 
                  placeholder="Type your username"
                  autocomplete="username">
              </div>
              @if (loginForm.get('username')?.hasError('required') && loginForm.get('username')?.touched) {
                <div class="error-text">Username is required</div>
              }
            </div>

            <div class="form-group">
              <label class="form-label">Password</label>
              <div class="input-wrapper">
                <mat-icon class="input-icon">lock</mat-icon>
                <input 
                  [type]="hidePassword ? 'password' : 'text'"
                  class="form-input"
                  formControlName="password" 
                  placeholder="Type your password"
                  autocomplete="current-password">
                <button 
                  type="button"
                  class="toggle-password"
                  (click)="hidePassword = !hidePassword"
                  [attr.aria-label]="'Toggle password visibility'">
                  <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                </button>
              </div>
              @if (loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched) {
                <div class="error-text">Password is required</div>
              }
            </div>

            <div class="forgot-password">
              <a href="javascript:void(0)">Forgot password?</a>
            </div>

            @if (errorMessage) {
              <div class="error-message">
                <mat-icon>error</mat-icon>
                <span>{{ errorMessage }}</span>
              </div>
            }

            <button 
              type="submit" 
              class="login-button"
              [disabled]="loading || loginForm.invalid">
              @if (loading) {
                <mat-spinner diameter="20"></mat-spinner>
                <span>Signing in...</span>
              } @else {
                <span>LOGIN</span>
              }
            </button>
          </form>

          <div class="signup-link">
            <p>Or Sign Up Using</p>
            <a href="javascript:void(0)" class="signup-link-text">SIGN UP</a>
          </div>

          <div class="default-credentials">
            <p class="text-muted">Default credentials: admin / Admin@123</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      position: relative;
      overflow: hidden;
    }

    .login-container::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(135deg, 
        rgba(102, 126, 234, 0.3) 0%, 
        rgba(118, 75, 162, 0.3) 50%,
        rgba(219, 39, 119, 0.3) 100%);
      animation: gradientShift 15s ease infinite;
    }

    @keyframes gradientShift {
      0%, 100% { transform: translate(0, 0); }
      50% { transform: translate(-10%, -10%); }
    }

    .login-card {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 420px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      overflow: hidden;
    }

    .login-content {
      padding: 50px 40px 40px;
    }

    .login-title {
      text-align: center;
      font-size: 32px;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0 0 40px 0;
      letter-spacing: -0.5px;
    }

    .form-group {
      margin-bottom: 24px;
    }

    .form-label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: #4a4a4a;
      margin-bottom: 8px;
      letter-spacing: 0.2px;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 12px;
      color: #999;
      font-size: 20px;
      width: 20px;
      height: 20px;
      pointer-events: none;
    }

    .form-input {
      width: 100%;
      height: 48px;
      padding: 12px 40px 12px 44px;
      border: none;
      border-bottom: 2px solid #e0e0e0;
      font-size: 14px;
      color: #333;
      transition: all 0.3s ease;
      outline: none;
      background: transparent;
    }

    .form-input::placeholder {
      color: #aaa;
      font-size: 13px;
    }

    .form-input:focus {
      border-bottom-color: #667eea;
    }

    .toggle-password {
      position: absolute;
      right: 8px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
      transition: color 0.2s ease;
    }

    .toggle-password:hover {
      color: #667eea;
    }

    .toggle-password mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .error-text {
      font-size: 12px;
      color: #f44336;
      margin-top: 6px;
      padding-left: 2px;
    }

    .forgot-password {
      text-align: right;
      margin-bottom: 24px;
    }

    .forgot-password a {
      font-size: 12px;
      color: #999;
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .forgot-password a:hover {
      color: #667eea;
    }

    .error-message {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      margin-bottom: 20px;
      background-color: #ffebee;
      border-left: 4px solid #f44336;
      border-radius: 4px;
      color: #c62828;
      font-size: 13px;
    }

    .error-message mat-icon {
      margin-right: 8px;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .login-button {
      width: 100%;
      height: 52px;
      border: none;
      border-radius: 26px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 1px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 30px;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }

    .login-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }

    .login-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .login-button mat-spinner {
      display: inline-block;
    }

    .signup-link {
      text-align: center;
      padding: 20px 0;
      border-top: 1px solid #f0f0f0;
    }

    .signup-link p {
      font-size: 13px;
      color: #999;
      margin: 0 0 12px 0;
    }

    .signup-link-text {
      font-size: 13px;
      font-weight: 600;
      color: #667eea;
      text-decoration: none;
      transition: color 0.2s ease;
      letter-spacing: 0.5px;
    }

    .signup-link-text:hover {
      color: #764ba2;
    }

    .default-credentials {
      text-align: center;
      padding-top: 16px;
    }

    .text-muted {
      color: #999;
      font-size: 12px;
      margin: 0;
    }

    @media (max-width: 480px) {
      .login-content {
        padding: 40px 30px 30px;
      }

      .login-title {
        font-size: 28px;
      }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  loginForm: FormGroup;
  loading = false;
  hidePassword = true;
  errorMessage = '';

  constructor() {
    // Initialize form
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });

    // Check if already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.loading = false;
        this.snackBar.open(`Welcome ${response.user.fullName}!`, 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });

        // Navigate to return URL or dashboard
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigate([returnUrl]);
      },
      error: (error) => {
        this.loading = false;
        console.error('Login error:', error);
        
        if (error.status === 401) {
          this.errorMessage = 'Invalid username or password';
        } else if (error.status === 0) {
          this.errorMessage = 'Cannot connect to server. Please try again later.';
        } else {
          this.errorMessage = 'An error occurred during login. Please try again.';
        }
      }
    });
  }
}
