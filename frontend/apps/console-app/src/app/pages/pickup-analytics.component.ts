import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pickup-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-semibold mb-4">Pickup Analytics (stub)</h2>
      <p class="text-sm text-slate-600">This is a placeholder for pickup analytics dashboard. Implement charts and metrics per plan.</p>
    </div>
  `
})
export class PickupAnalyticsComponent {}
