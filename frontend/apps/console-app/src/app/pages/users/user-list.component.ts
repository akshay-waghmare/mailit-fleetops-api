/**
 * User List Component
 * Epic E10: Minimal RBAC (User Management)
 * Task T028-T029: Create user management UI
 * 
 * Features:
 * - List all users with pagination
 * - Create new user (dialog)
 * - Edit user (dialog)
 * - Delete user
 * - Reset password
 */

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserService } from '../../services/user.service';
import { UserResponse } from '../../models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>User Management</h1>
          <p class="text-muted">Manage system users and their roles</p>
        </div>
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>person_add</mat-icon>
          Add User
        </button>
      </div>

      <div class="table-container">
        <table mat-table [dataSource]="users()" class="mat-elevation-z2">
          <ng-container matColumnDef="username">
            <th mat-header-cell *matHeaderCellDef>Username</th>
            <td mat-cell *matCellDef="let user">{{ user.username }}</td>
          </ng-container>

          <ng-container matColumnDef="fullName">
            <th mat-header-cell *matHeaderCellDef>Full Name</th>
            <td mat-cell *matCellDef="let user">{{ user.fullName }}</td>
          </ng-container>

          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let user">{{ user.email }}</td>
          </ng-container>

          <ng-container matColumnDef="roles">
            <th mat-header-cell *matHeaderCellDef>Roles</th>
            <td mat-cell *matCellDef="let user">
              @for (role of user.roles; track role) {
                <mat-chip [class]="'role-chip role-' + role.toLowerCase()">
                  {{ role }}
                </mat-chip>
              }
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let user">
              <mat-chip [class]="user.isActive ? 'status-active' : 'status-inactive'">
                {{ user.isActive ? 'Active' : 'Inactive' }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="lastLogin">
            <th mat-header-cell *matHeaderCellDef>Last Login</th>
            <td mat-cell *matCellDef="let user">
              {{ user.lastLogin ? (user.lastLogin | date:'short') : 'Never' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let user">
              <button mat-icon-button [matTooltip]="'Edit user'" (click)="editUser(user)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button [matTooltip]="'Reset password'" (click)="resetPassword(user)">
                <mat-icon>lock_reset</mat-icon>
              </button>
              <button mat-icon-button [matTooltip]="'Delete user'" color="warn" (click)="deleteUser(user)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <mat-paginator
          [length]="totalElements()"
          [pageSize]="pageSize()"
          [pageSizeOptions]="[10, 25, 50, 100]"
          (page)="onPageChange($event)"
          showFirstLastButtons>
        </mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .page-header h1 {
      margin: 0 0 4px 0;
      font-size: 24px;
      font-weight: 500;
    }

    .text-muted {
      color: #666;
      font-size: 14px;
      margin: 0;
    }

    .table-container {
      background: white;
      border-radius: 8px;
      overflow: hidden;
    }

    table {
      width: 100%;
    }

    .role-chip, .status-active, .status-inactive {
      font-size: 11px;
      min-height: 24px;
      padding: 4px 8px;
      margin-right: 4px;
    }

    .role-admin {
      background-color: #ff5722;
      color: white;
    }

    .role-staff {
      background-color: #2196f3;
      color: white;
    }

    .role-agent {
      background-color: #4caf50;
      color: white;
    }

    .status-active {
      background-color: #4caf50;
      color: white;
    }

    .status-inactive {
      background-color: #9e9e9e;
      color: white;
    }
  `]
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  users = signal<UserResponse[]>([]);
  totalElements = signal(0);
  pageSize = signal(10);
  pageNumber = signal(0);
  loading = signal(false);

  displayedColumns = ['username', 'fullName', 'email', 'roles', 'status', 'lastLogin', 'actions'];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.userService.getAllUsers({
      page: this.pageNumber(),
      size: this.pageSize()
    }).subscribe({
      next: (response) => {
        this.users.set(response.content);
        this.totalElements.set(response.totalElements);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load users:', error);
        this.snackBar.open('Failed to load users', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageNumber.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadUsers();
  }

  openCreateDialog(): void {
    this.snackBar.open('User creation dialog coming soon...', 'Close', { duration: 3000 });
    // TODO: Open dialog for creating user
  }

  editUser(user: UserResponse): void {
    this.snackBar.open(`Edit user: ${user.username} - Coming soon...`, 'Close', { duration: 3000 });
    // TODO: Open dialog for editing user
  }

  resetPassword(user: UserResponse): void {
    this.snackBar.open(`Reset password for: ${user.username} - Coming soon...`, 'Close', { duration: 3000 });
    // TODO: Open dialog for resetting password
  }

  deleteUser(user: UserResponse): void {
    if (confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
          this.loadUsers();
        },
        error: (error) => {
          console.error('Failed to delete user:', error);
          this.snackBar.open('Failed to delete user', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
