import { Component } from '@angular/core';

@Component({
  selector: 'app-places',
  standalone: true,
  template: `
    <div class="page">
      <h2>Places</h2>
      <p>Manage your fleet locations and points of interest.</p>
      <div class="coming-soon">
        📍 Places management features coming soon!
      </div>
    </div>
  `,
  styles: [`
    .page {
      max-width: 1200px;
      margin: 0 auto;
    }

    .page h2 {
      margin-bottom: 2rem;
      color: #2c3e50;
    }

    .coming-soon {
      background: #f8f9fa;
      border: 2px dashed #dee2e6;
      border-radius: 8px;
      padding: 3rem;
      text-align: center;
      font-size: 1.2rem;
      color: #6c757d;
      margin-top: 2rem;
    }
  `]
})
export class PlacesComponent {}