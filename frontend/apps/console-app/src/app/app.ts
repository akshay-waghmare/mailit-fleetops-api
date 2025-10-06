import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './services/auth.service';
import { UserInfo } from './models/auth.model';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private authService = inject(AuthService);
  
  title = 'FleetOps Console';
  isMobileMenuOpen = false;
  currentUser = signal<UserInfo | null>(null);
  isAuthenticated = signal(false);

  ngOnInit(): void {
    // Subscribe to authentication state
    this.authService.currentUser$.subscribe(user => {
      this.currentUser.set(user);
    });
    
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated.set(isAuth);
    });
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
  }

  // Role check helpers
  hasRole(role: string): boolean {
    return this.authService.hasRole(role);
  }

  hasAnyRole(roles: string[]): boolean {
    return this.authService.hasAnyRole(roles);
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  isStaffOrAdmin(): boolean {
    return this.authService.hasAnyRole(['ADMIN', 'STAFF']);
  }

  isAgent(): boolean {
    return this.authService.isAgent();
  }

  onTestClick(event: Event) {
    console.log('FleetButton clicked!', event);
  }
}
