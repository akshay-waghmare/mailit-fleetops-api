import { Component } from '@angular/core';

@Component({
  selector: 'app-order-list-simple',
  standalone: true,
  template: `
    <div style="padding: 40px; background: lime; color: black; font-size: 32px; font-weight: bold; text-align: center;">
      ✅ ORDER LIST COMPONENT IS WORKING! ✅
      <br><br>
      Time: {{ getCurrentTime() }}
      <br><br>
      The routing and component loading is successful!
    </div>
  `
})
export class OrderListSimpleComponent {
  getCurrentTime(): string {
    return new Date().toISOString();
  }
}