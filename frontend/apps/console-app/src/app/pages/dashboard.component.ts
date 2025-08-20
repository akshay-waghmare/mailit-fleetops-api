import { Component, OnInit, ViewChild } from '@angular/core';
import { MapComponent } from '@libs/map-widgets/map.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MapComponent],
  template: `
    <div class="dashboard">
      <h2>Fleet Operations Dashboard</h2>
      <div class="dashboard-content">
        <div class="map-section">
          <div class="map-header">
            <h3>Live Fleet Map</h3>
            <div class="map-controls">
              <button class="btn btn-sm" (click)="addSampleVehicles()">Show Sample Fleet</button>
              <button class="btn btn-sm" (click)="clearMap()">Clear Map</button>
            </div>
          </div>
          <app-map 
            #fleetMap 
            height="600px" 
            [center]="mapCenter"
            [zoom]="mapZoom">
          </app-map>
        </div>
        <div class="stats-section">
          <div class="stat-card active">
            <h4>Active Vehicles</h4>
            <div class="stat-value">23</div>
            <div class="stat-change">+2 from yesterday</div>
          </div>
          <div class="stat-card">
            <h4>Total Organizations</h4>
            <div class="stat-value">5</div>
            <div class="stat-change">No change</div>
          </div>
          <div class="stat-card">
            <h4>Geofences</h4>
            <div class="stat-value">12</div>
            <div class="stat-change">+1 this week</div>
          </div>
          <div class="stat-card">
            <h4>Places</h4>
            <div class="stat-value">45</div>
            <div class="stat-change">+3 this week</div>
          </div>
          
          <div class="fleet-legend">
            <h4>Map Legend</h4>
            <div class="legend-item">
              <span class="legend-dot vehicle"></span>
              <span>Active Vehicles</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot place"></span>
              <span>Places of Interest</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot geofence"></span>
              <span>Geofence Areas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1400px;
      margin: 0 auto;
    }

    .dashboard h2 {
      margin-bottom: 2rem;
      color: #2c3e50;
      font-size: 2rem;
      font-weight: 600;
    }

    .dashboard-content {
      display: grid;
      gap: 2rem;
      grid-template-columns: 2fr 1fr;
    }

    .map-section {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .map-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .map-header h3 {
      margin: 0;
      color: #34495e;
      font-size: 1.25rem;
    }

    .map-controls {
      display: flex;
      gap: 0.5rem;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      background: white;
      color: #495057;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .btn:hover {
      background: #f8f9fa;
      border-color: #adb5bd;
    }

    .btn-sm {
      padding: 0.375rem 0.75rem;
      font-size: 0.8rem;
    }

    .stats-section {
      display: grid;
      gap: 1rem;
      grid-template-columns: 1fr 1fr;
      align-content: start;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      text-align: center;
      border-left: 4px solid #e9ecef;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    }

    .stat-card.active {
      border-left-color: #28a745;
    }

    .stat-card h4 {
      margin: 0 0 1rem 0;
      color: #6c757d;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .stat-change {
      font-size: 0.75rem;
      color: #28a745;
      font-weight: 500;
    }

    .fleet-legend {
      grid-column: 1 / -1;
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    .fleet-legend h4 {
      margin: 0 0 1rem 0;
      color: #495057;
      font-size: 1rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0;
      font-size: 0.875rem;
      color: #495057;
    }

    .legend-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 0 1px rgba(0,0,0,0.1);
    }

    .legend-dot.vehicle {
      background-color: #28a745;
    }

    .legend-dot.place {
      background-color: #007cbf;
    }

    .legend-dot.geofence {
      background-color: #ffc107;
    }

    @media (max-width: 1024px) {
      .dashboard-content {
        grid-template-columns: 1fr;
      }
      
      .stats-section {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .stats-section {
        grid-template-columns: 1fr;
      }

      .map-header {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }

      .map-controls {
        justify-content: center;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  @ViewChild('fleetMap') fleetMap!: MapComponent;
  
  mapCenter: [number, number] = [-74.0059, 40.7128]; // New York City
  mapZoom = 12;

  // Sample fleet data
  private sampleVehicles = [
    { id: 'VH001', name: 'Delivery Truck 1', status: 'active', coordinates: [-74.0059, 40.7128] },
    { id: 'VH002', name: 'Delivery Van 2', status: 'active', coordinates: [-74.0089, 40.7150] },
    { id: 'VH003', name: 'Service Vehicle 3', status: 'inactive', coordinates: [-74.0020, 40.7100] },
    { id: 'VH004', name: 'Delivery Truck 4', status: 'active', coordinates: [-74.0100, 40.7180] },
    { id: 'VH005', name: 'Emergency Vehicle 5', status: 'active', coordinates: [-74.0030, 40.7160] }
  ];

  private samplePlaces = [
    { name: 'Warehouse Central', coordinates: [-74.0045, 40.7140] },
    { name: 'Customer Location A', coordinates: [-74.0075, 40.7165] },
    { name: 'Service Center', coordinates: [-74.0015, 40.7115] }
  ];

  ngOnInit(): void {
    // Map will initialize automatically
  }

  addSampleVehicles(): void {
    if (this.fleetMap && this.fleetMap.getMap()) {
      // Clear existing markers first
      this.clearMap();

      // Add sample vehicles
      this.sampleVehicles.forEach(vehicle => {
        this.fleetMap.addVehicleMarker(
          vehicle.coordinates as [number, number],
          vehicle
        );
      });

      // Add sample places
      this.samplePlaces.forEach(place => {
        this.fleetMap.addMarker(
          place.coordinates as [number, number],
          `<strong>${place.name}</strong><br><small>Place of Interest</small>`,
          'place'
        );
      });

      // Add a sample geofence marker
      this.fleetMap.addMarker(
        [-74.0060, 40.7145],
        '<strong>Downtown Zone</strong><br><small>Geofence Area</small>',
        'geofence'
      );
    }
  }

  clearMap(): void {
    if (this.fleetMap && this.fleetMap.getMap()) {
      this.fleetMap.clearMarkers();
    }
  }
}