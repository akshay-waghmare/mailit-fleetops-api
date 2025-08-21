import { Component } from '@angular/core';

@Component({
  selector: 'app-mis-reports',
  standalone: true,
  template: `
    <div class="page">
      <div class="page-header">
        <h2>📈 MIS Reports</h2>
        <p class="page-description">Comprehensive management information system and analytics</p>
      </div>
      
      <div class="coming-soon-container">
        <div class="coming-soon-card">
          <div class="icon-section">
            <div class="icon-circle">
              <span class="icon">📊</span>
            </div>
          </div>
          
          <div class="content-section">
            <h3>Management Information System</h3>
            <p class="description">
              Advanced analytics and reporting dashboard for comprehensive business insights!
            </p>
            
            <div class="features-preview">
              <h4>Upcoming Report Categories:</h4>
              <div class="features-grid">
                <div class="feature-item">
                  <span class="feature-icon">📦</span>
                  <span class="feature-text">Shipment Analytics</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">💰</span>
                  <span class="feature-text">Revenue Reports</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">🚚</span>
                  <span class="feature-text">Carrier Performance</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">👥</span>
                  <span class="feature-text">Customer Analytics</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">📍</span>
                  <span class="feature-text">Route Optimization</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">⏱️</span>
                  <span class="feature-text">Delivery Performance</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">📋</span>
                  <span class="feature-text">Operational KPIs</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">🎯</span>
                  <span class="feature-text">Business Intelligence</span>
                </div>
              </div>
            </div>

            <div class="report-types">
              <h4>Report Types:</h4>
              <div class="report-badges">
                <span class="report-badge daily">📅 Daily Reports</span>
                <span class="report-badge weekly">📊 Weekly Summary</span>
                <span class="report-badge monthly">📈 Monthly Analysis</span>
                <span class="report-badge custom">⚙️ Custom Reports</span>
              </div>
            </div>
            
            <div class="timeline-info">
              <div class="timeline-badge">
                <span class="badge-icon">🔍</span>
                <span class="badge-text">Coming Q1 2026</span>
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
      background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%);
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
      background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
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
      max-width: 900px;
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
      background: linear-gradient(90deg, #0ea5e9, #8b5cf6, #ec4899);
    }

    .icon-section {
      text-align: center;
      margin-bottom: 2rem;
    }

    .icon-circle {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #dbeafe, #f0f9ff);
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
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

    .report-types {
      margin-bottom: 2.5rem;
    }

    .report-types h4 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 1.5rem;
    }

    .report-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
    }

    .report-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.75rem 1.25rem;
      border-radius: 25px;
      font-weight: 600;
      font-size: 0.875rem;
      transition: transform 0.2s ease;
    }

    .report-badge:hover {
      transform: translateY(-2px);
    }

    .report-badge.daily {
      background: linear-gradient(135deg, #fef3c7, #fbbf24);
      color: #92400e;
    }

    .report-badge.weekly {
      background: linear-gradient(135deg, #dbeafe, #3b82f6);
      color: #1e40af;
    }

    .report-badge.monthly {
      background: linear-gradient(135deg, #dcfce7, #10b981);
      color: #047857;
    }

    .report-badge.custom {
      background: linear-gradient(135deg, #fae8ff, #a855f7);
      color: #7c2d12;
    }

    .timeline-info {
      display: flex;
      justify-content: center;
      margin-top: 2rem;
    }

    .timeline-badge {
      display: flex;
      align-items: center;
      background: linear-gradient(135deg, #0ea5e9, #0284c7);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 50px;
      font-weight: 600;
      box-shadow: 0 4px 14px rgba(14, 165, 233, 0.3);
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

      .report-badges {
        flex-direction: column;
        align-items: center;
      }

      .report-badge {
        width: 100%;
        max-width: 200px;
        justify-content: center;
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
export class MisReportsComponent {}