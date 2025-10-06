/**
 * Unauthorized Page Component
 * Shown when user tries to access a page without required permissions
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="unauthorized-container">
      <mat-card class="unauthorized-card">
        <mat-icon class="error-icon">block</mat-icon>
        <h1>Access Denied</h1>
        <p>You don't have permission to access this page.</p>
        <p class="text-muted">Contact your administrator if you believe this is an error.</p>
        <div class="actions">
          <button mat-raised-button color="primary" routerLink="/">
            <mat-icon>home</mat-icon>
            Go to Dashboard
          </button>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
      background-color: #f5f5f5;
    }

    .unauthorized-card {
      max-width: 500px;
      text-align: center;
      padding: 40px;
    }

    .error-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #f44336;
      margin-bottom: 20px;
    }

    h1 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 32px;
    }

    p {
      margin: 10px 0;
      color: #666;
      font-size: 16px;
    }

    .text-muted {
      font-size: 14px;
      color: #999;
    }

    .actions {
      margin-top: 30px;
    }

    button {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class UnauthorizedComponent {}
