import { Component } from '@angular/core';

@Component({
  selector: 'app-billing',
  standalone: true,
  template: `
    <div class="page">
      <div class="page-header">
        <h2>📊 Billing & Invoice</h2>
        <p class="page-description">Manage your billing, invoices, and financial reports</p>
      </div>
      
      <div class="coming-soon-container">
        <div class="coming-soon-card">
          <div class="icon-section">
            <div class="icon-circle">
              <span class="icon">💰</span>
            </div>
          </div>
          
          <div class="content-section">
            <h3>Billing & Invoice Module</h3>
            <p class="description">
              Comprehensive billing and invoice management system coming soon!
            </p>
            
            <div class="features-preview">
              <h4>Upcoming Features:</h4>
              <div class="features-grid">
                <div class="feature-item">
                  <span class="feature-icon">📋</span>
                  <span class="feature-text">Invoice Generation</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">💳</span>
                  <span class="feature-text">Payment Tracking</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">📈</span>
                  <span class="feature-text">Revenue Analytics</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">🧾</span>
                  <span class="feature-text">Tax Management</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">📊</span>
                  <span class="feature-text">Financial Reports</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">🔔</span>
                  <span class="feature-text">Payment Reminders</span>
                </div>
              </div>
            </div>
            
            <div class="timeline-info">
              <div class="timeline-badge">
                <span class="badge-icon">🚀</span>
                <span class="badge-text">Coming Q4 2025</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      min-height: calc(100vh - 120px);
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
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
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
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

    .coming-soon-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    .coming-soon-card {
      background: white;
      border-radius: 20px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
      padding: 3rem;
      max-width: 800px;
      width: 100%;
      border: 1px solid #e2e8f0;
      position: relative;
      overflow: hidden;
    }

    .coming-soon-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
    }

    .icon-section {
      text-align: center;
      margin-bottom: 2rem;
    }

    .icon-circle {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #dbeafe, #e0e7ff);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      border: 3px solid #e2e8f0;
    }

    .icon {
      font-size: 2.5rem;
    }

    .content-section {
      text-align: center;
    }

    .content-section h3 {
      font-size: 1.875rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 1rem;
    }

    .description {
      font-size: 1.125rem;
      color: #64748b;
      margin-bottom: 2.5rem;
      line-height: 1.6;
    }

    .features-preview {
      text-align: left;
      margin-bottom: 2.5rem;
    }

    .features-preview h4 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .feature-item {
      display: flex;
      align-items: center;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      transition: all 0.2s ease;
    }

    .feature-item:hover {
      background: #f1f5f9;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .feature-icon {
      font-size: 1.25rem;
      margin-right: 0.75rem;
    }

    .feature-text {
      font-weight: 500;
      color: #374151;
    }

    .timeline-info {
      display: flex;
      justify-content: center;
      margin-top: 2rem;
    }

    .timeline-badge {
      display: flex;
      align-items: center;
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 50px;
      font-weight: 600;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
    }

    .badge-icon {
      margin-right: 0.5rem;
      font-size: 1.125rem;
    }

    .badge-text {
      font-size: 1rem;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .page {
        padding: 1rem;
      }

      .page-header h2 {
        font-size: 2rem;
      }

      .coming-soon-card {
        padding: 2rem;
      }

      .features-grid {
        grid-template-columns: 1fr;
      }

      .feature-item {
        padding: 0.75rem;
      }
    }

    @media (max-width: 480px) {
      .page-header h2 {
        font-size: 1.75rem;
      }

      .content-section h3 {
        font-size: 1.5rem;
      }

      .coming-soon-card {
        padding: 1.5rem;
      }

      .icon-circle {
        width: 60px;
        height: 60px;
      }

      .icon {
        font-size: 2rem;
      }
    }
  `]
})
export class BillingComponent {}