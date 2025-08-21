import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  standalone: true,
  template: `
    <div class="page">
      <div class="page-header">
        <h2>⚙️ Settings</h2>
        <p class="page-description">Configure your FleetOps system preferences and integrations</p>
      </div>
      
      <div class="settings-container">
        <!-- Settings Grid Layout -->
        <div class="settings-grid">
          
          <!-- Profile & Company Details -->
          <div class="settings-section">
            <h3 class="section-title">Profile & Company Details</h3>
            <div class="section-content">
              <div class="setting-item">
                <span class="setting-icon">🏢</span>
                <span class="setting-text">Company Name</span>
              </div>
              <div class="setting-item">
                <span class="setting-icon">📷</span>
                <span class="setting-text">Logo Upload</span>
              </div>
              <div class="setting-item">
                <span class="setting-icon">📍</span>
                <span class="setting-text">Address</span>
              </div>
            </div>
          </div>

          <!-- User Management -->
          <div class="settings-section">
            <h3 class="section-title">User Management</h3>
            <div class="section-content">
              <div class="setting-item">
                <span class="setting-icon">👥</span>
                <span class="setting-text">Add/Edit Users</span>
              </div>
              <div class="setting-item">
                <span class="setting-icon">🔐</span>
                <span class="setting-text">Assign Roles</span>
              </div>
              <div class="setting-item">
                <span class="setting-icon">🛡️</span>
                <span class="setting-text">Set Permissions</span>
              </div>
            </div>
          </div>

          <!-- Carrier API Integrations -->
          <div class="settings-section">
            <h3 class="section-title">Carrier API Integrations</h3>
            <div class="section-content">
              <div class="setting-item">
                <span class="setting-icon">🔗</span>
                <span class="setting-text">Connected Carriers</span>
              </div>
              <div class="setting-item">
                <span class="setting-icon">🔑</span>
                <span class="setting-text">API Keys & Configuration</span>
              </div>
              <div class="setting-item">
                <span class="setting-icon">📋</span>
                <span class="setting-text">Default Carrier Rules</span>
              </div>
            </div>
          </div>

          <!-- Shipment Rules & Rate Configuration -->
          <div class="settings-section">
            <h3 class="section-title">Shipment Rules & Rate Configuration</h3>
            <div class="section-content">
              <div class="setting-item">
                <span class="setting-icon">⚖️</span>
                <span class="setting-text">Weight Slabs & Pricing</span>
              </div>
              <div class="setting-item">
                <span class="setting-icon">📏</span>
                <span class="setting-text">Volumetric Weight Formula</span>
              </div>
              <div class="setting-item">
                <span class="setting-icon">💰</span>
                <span class="setting-text">Fuel Surcharge</span>
              </div>
            </div>
          </div>

          <!-- Pickup & Delivery Settings -->
          <div class="settings-section">
            <h3 class="section-title">Pickup & Delivery Settings</h3>
            <div class="section-content">
              <div class="setting-item">
                <span class="setting-icon">📍</span>
                <span class="setting-text">Default Pickup Location</span>
              </div>
              <div class="setting-item">
                <span class="setting-icon">⏰</span>
                <span class="setting-text">Operating Hours</span>
              </div>
              <div class="setting-item">
                <span class="setting-icon">📝</span>
                <span class="setting-text">Special Instructions</span>
              </div>
            </div>
          </div>

          <!-- Billing & Payment Settings -->
          <div class="settings-section">
            <h3 class="section-title">Billing & Payment Settings</h3>
            <div class="section-content">
              <div class="setting-item">
                <span class="setting-icon">🔄</span>
                <span class="setting-text">Billing Cycle Setup</span>
              </div>
              <div class="setting-item">
                <span class="setting-icon">💳</span>
                <span class="setting-text">Payment Methods</span>
              </div>
              <div class="setting-item">
                <span class="setting-icon">🏷️</span>
                <span class="setting-text">Invoice Branding</span>
              </div>
            </div>
          </div>

          <!-- Security & Access Control -->
          <div class="settings-section">
            <h3 class="section-title">Security & Access Control</h3>
            <div class="section-content">
              <div class="setting-item">
                <span class="setting-icon">🔐</span>
                <span class="setting-text">2FA Setup</span>
              </div>
              <div class="setting-item">
                <span class="setting-icon">🛡️</span>
                <span class="setting-text">Password Policy</span>
              </div>
              <div class="setting-item">
                <span class="setting-icon">📊</span>
                <span class="setting-text">Audit Logs</span>
              </div>
            </div>
          </div>

          <!-- Notifications & Alerts -->
          <div class="settings-section">
            <h3 class="section-title">Notifications & Alerts</h3>
            <div class="section-content">
              <div class="setting-item">
                <span class="setting-icon">📧</span>
                <span class="setting-text">SMS/Email Preferences</span>
              </div>
              <div class="setting-item">
                <span class="setting-icon">🔔</span>
                <span class="setting-text">Status Updates</span>
              </div>
              <div class="setting-item">
                <span class="setting-icon">⚠️</span>
                <span class="setting-text">Invoice Alerts</span>
              </div>
            </div>
          </div>

          <!-- MIS & Reports Configuration -->
          <div class="settings-section">
            <h3 class="section-title">MIS & Reports Configuration</h3>
            <div class="section-content">
              <div class="setting-item">
                <span class="setting-icon">📋</span>
                <span class="setting-text">Default Report Formats</span>
              </div>
              <div class="setting-item">
                <span class="setting-icon">⏰</span>
                <span class="setting-text">Auto-Schedule Reports</span>
              </div>
              <div class="setting-item">
                <span class="setting-icon">🔍</span>
                <span class="setting-text">Custom Filters</span>
              </div>
            </div>
          </div>

        </div>

        <!-- Coming Soon Banner -->
        <div class="coming-soon-banner">
          <div class="banner-content">
            <div class="banner-icon">
              <span class="icon">⚙️</span>
            </div>
            <div class="banner-text">
              <h3>Settings Module Coming Soon</h3>
              <p>Complete system configuration and management tools are under development</p>
            </div>
            <div class="banner-timeline">
              <div class="timeline-badge">
                <span class="badge-icon">🚀</span>
                <span class="badge-text">Coming Q3 2025</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .page {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
      min-height: calc(100vh - 120px);
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    }

    .page-header {
      margin-bottom: 3rem;
      text-align: center;
    }

    .page-header h2 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, #64748b, #475569);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .page-description {
      font-size: 1.125rem;
      color: #64748b;
      margin: 0;
      font-weight: 500;
    }

    .settings-container {
      position: relative;
    }

    .settings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .settings-section {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .settings-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #6366f1, #8b5cf6, #d946ef);
    }

    .settings-section:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    }

    .section-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .section-content {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .setting-item {
      display: flex;
      align-items: center;
      padding: 0.75rem;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .setting-item:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
      transform: translateX(4px);
    }

    .setting-icon {
      font-size: 1.125rem;
      margin-right: 0.75rem;
      width: 24px;
      text-align: center;
    }

    .setting-text {
      font-weight: 500;
      color: #374151;
      font-size: 0.9rem;
    }

    .coming-soon-banner {
      background: linear-gradient(135deg, #fef7ff, #f3e8ff);
      border: 2px solid #e9d5ff;
      border-radius: 20px;
      padding: 2rem;
      box-shadow: 0 8px 32px rgba(139, 92, 246, 0.15);
      position: relative;
      overflow: hidden;
    }

    .coming-soon-banner::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #8b5cf6, #d946ef, #f59e0b);
    }

    .banner-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1.5rem;
    }

    .banner-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #ddd6fe, #c4b5fd);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid #e9d5ff;
    }

    .banner-icon .icon {
      font-size: 1.75rem;
    }

    .banner-text {
      flex: 1;
      text-align: center;
    }

    .banner-text h3 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #581c87;
      margin-bottom: 0.5rem;
    }

    .banner-text p {
      font-size: 1rem;
      color: #7c3aed;
      margin: 0;
      line-height: 1.5;
    }

    .banner-timeline {
      display: flex;
      align-items: center;
    }

    .timeline-badge {
      display: flex;
      align-items: center;
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      color: white;
      padding: 0.75rem 1.25rem;
      border-radius: 50px;
      font-weight: 600;
      box-shadow: 0 4px 14px rgba(139, 92, 246, 0.4);
    }

    .badge-icon {
      margin-right: 0.5rem;
      font-size: 1rem;
    }

    .badge-text {
      font-size: 0.875rem;
    }

    /* Responsive Design */
    @media (max-width: 1200px) {
      .settings-grid {
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
      }
    }

    @media (max-width: 768px) {
      .page {
        padding: 1rem;
      }

      .page-header h2 {
        font-size: 2rem;
      }

      .settings-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .settings-section {
        padding: 1.25rem;
      }

      .banner-content {
        flex-direction: column;
        text-align: center;
      }

      .banner-text {
        text-align: center;
      }

      .setting-item {
        padding: 0.625rem;
      }

      .setting-text {
        font-size: 0.85rem;
      }
    }

    @media (max-width: 480px) {
      .page-header h2 {
        font-size: 1.75rem;
      }

      .banner-text h3 {
        font-size: 1.25rem;
      }

      .banner-text p {
        font-size: 0.9rem;
      }

      .settings-section {
        padding: 1rem;
      }

      .section-title {
        font-size: 1rem;
      }
    }

    /* Animation for settings items */
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .settings-section {
      animation: slideInUp 0.5s ease-out;
      animation-fill-mode: both;
    }

    /* Stagger animation for sections */
    .settings-section:nth-child(1) { animation-delay: 0.1s; }
    .settings-section:nth-child(2) { animation-delay: 0.15s; }
    .settings-section:nth-child(3) { animation-delay: 0.2s; }
    .settings-section:nth-child(4) { animation-delay: 0.25s; }
    .settings-section:nth-child(5) { animation-delay: 0.3s; }
    .settings-section:nth-child(6) { animation-delay: 0.35s; }
    .settings-section:nth-child(7) { animation-delay: 0.4s; }
    .settings-section:nth-child(8) { animation-delay: 0.45s; }
    .settings-section:nth-child(9) { animation-delay: 0.5s; }

    .coming-soon-banner {
      animation: slideInUp 0.6s ease-out;
      animation-delay: 0.6s;
      animation-fill-mode: both;
    }

    /* Hover effects for better interactivity */
    .settings-section:hover .setting-item {
      background: #f1f5f9;
    }

    .settings-section:hover .section-title {
      color: #6366f1;
    }

    /* Focus states for accessibility */
    .setting-item:focus {
      outline: 2px solid #6366f1;
      outline-offset: 2px;
    }
  `]
})
export class SettingsComponent {}