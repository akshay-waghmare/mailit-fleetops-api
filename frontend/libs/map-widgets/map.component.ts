import { Component, ElementRef, OnInit, OnDestroy, ViewChild, Input, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import type { LngLatLike } from 'maplibre-gl';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div #mapContainer class="map-container" [style.height]="height">
      <div class="map-loading" *ngIf="!isMapLoaded()">
        <div class="loading-spinner"></div>
        <p>Loading map...</p>
      </div>
    </div>
  `,
  styles: [`
    .map-container {
      width: 100%;
      height: 100%;
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      background-color: #f8f9fa;
    }

    .map-loading {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      z-index: 1000;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e9ecef;
      border-top: 3px solid #007cbf;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .map-loading p {
      margin: 0;
      color: #6c757d;
      font-size: 0.9rem;
    }

    /* MapLibre GL custom styles */
    :host ::ng-deep .maplibregl-map {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    :host ::ng-deep .maplibregl-popup-content {
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    :host ::ng-deep .maplibregl-ctrl-group {
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    :host ::ng-deep .maplibregl-ctrl-group button {
      border-radius: 0;
    }

    :host ::ng-deep .maplibregl-ctrl-group button:first-child {
      border-top-left-radius: 6px;
      border-top-right-radius: 6px;
    }

    :host ::ng-deep .maplibregl-ctrl-group button:last-child {
      border-bottom-left-radius: 6px;
      border-bottom-right-radius: 6px;
    }
  `]
})
export class MapComponent implements OnInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;
  @Input() height = '400px';
  @Input() center: LngLatLike = [72.8777, 19.0760]; // Mumbai, India
  @Input() zoom = 12;
  @Input() style = 'https://api.maptiler.com/maps/streets/style.json?key=FqpjPjNhz5yU1vgFWeGi';

  // Use any for the runtime Map instance so we can dynamically import maplibre-gl
  private map: any | null = null;
  public mapLoaded = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  public isMapLoaded(): boolean {
    return this.mapLoaded;
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Small delay to ensure DOM is ready
  setTimeout(() => void this.initializeMap(), 100);
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private async initializeMap(): Promise<void> {
    try {
      // Multiple import strategies for better compatibility
      let maplibre: any;
      
      try {
        // Strategy 1: Dynamic import
        maplibre = await import('maplibre-gl');
        console.log('MapLibre GL imported via dynamic import:', maplibre);
      } catch (importError) {
        console.warn('Dynamic import failed, trying fallback:', importError);
        
        // Strategy 2: Window fallback (if globally available)
        if ((window as any).maplibregl) {
          maplibre = (window as any).maplibregl;
          console.log('Using window.maplibregl fallback');
        } else {
          throw new Error('MapLibre GL not available via any import method');
        }
      }

      // Handle different import formats (default vs named exports)
      const MapLibre = maplibre?.default || maplibre;
      
      // Expose to window for legacy usage
      (window as any).maplibregl = MapLibre;

      // Extract constructors with multiple fallback paths
      const Map = MapLibre?.Map || MapLibre?.default?.Map || maplibre?.Map;
      const NavigationControl = MapLibre?.NavigationControl || MapLibre?.default?.NavigationControl || maplibre?.NavigationControl;
      const GeolocateControl = MapLibre?.GeolocateControl || MapLibre?.default?.GeolocateControl || maplibre?.GeolocateControl;
      const ScaleControl = MapLibre?.ScaleControl || MapLibre?.default?.ScaleControl || maplibre?.ScaleControl;
      const FullscreenControl = MapLibre?.FullscreenControl || MapLibre?.default?.FullscreenControl || maplibre?.FullscreenControl;
      
      if (!Map) {
        console.error('Available maplibre properties:', Object.keys(MapLibre || {}));
        console.error('Available maplibre.default properties:', Object.keys(MapLibre?.default || {}));
        throw new Error('MapLibre GL Map constructor not found - check import structure');
      }
      
      console.log('Map constructor found and ready:', typeof Map);

      this.map = new Map({
        container: this.mapContainer.nativeElement,
        style: this.style,
        center: this.center,
        zoom: this.zoom,
        pitch: 0,
        bearing: 0,
        antialias: true
      });

      // Add enhanced navigation control
      if (NavigationControl) {
        this.map.addControl(new NavigationControl({
          visualizePitch: true,
          showZoom: true,
          showCompass: true
        }), 'top-right');
      }

      // Add scale control
      if (ScaleControl) {
        this.map.addControl(new ScaleControl({
          maxWidth: 100,
          unit: 'metric'
        }), 'bottom-left');
      }

      // Add fullscreen control
      if (FullscreenControl) {
        this.map.addControl(new FullscreenControl(), 'top-right');
      }

      // Add geolocate control with better options
      if (GeolocateControl) {
        this.map.addControl(
          new GeolocateControl({
            positionOptions: {
              enableHighAccuracy: true,
              timeout: 6000
            },
            trackUserLocation: true,
            showUserLocation: true
          }),
          'top-right'
        );
      }

      // Map event handlers
      this.map.on('load', () => {
        console.log('FleetOps map loaded successfully');
        this.mapLoaded = true;
        this.cdr.detectChanges(); // Force Angular to update the template
        this.setupMapStyles();
      });

      this.map.on('error', (e: any) => {
        console.error('Map error:', e);
        // Set mapLoaded = true even on error to hide spinner
        this.mapLoaded = true;
        this.cdr.detectChanges(); // Force Angular to update the template
        // Fallback to basic OpenStreetMap style
        if (this.map && e.error && e.error.message?.includes('401')) {
          console.log('Switching to fallback map style...');
          this.map.setStyle('https://demotiles.maplibre.org/style.json');
        }
      });

      this.map.on('style.load', () => {
        console.log('Map style loaded');
        this.mapLoaded = true;
        this.cdr.detectChanges(); // Force Angular to update the template
        this.setupMapStyles();
      });

      // Add timeout fallback to ensure spinner disappears
      setTimeout(() => {
        if (!this.mapLoaded) {
          console.warn('Map loading timeout - hiding spinner');
          this.mapLoaded = true;
          this.cdr.detectChanges();
        }
      }, 8000);

    } catch (error) {
      console.error('Failed to initialize map:', error);
    }
  }

  private setupMapStyles(): void {
    if (!this.map) return;

    // Add custom fleet-specific map layers and styles
    try {
      // Add traffic layer if available
      if (this.map.getSource('traffic')) {
        this.map.addLayer({
          id: 'traffic',
          type: 'line',
          source: 'traffic',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#ff4444',
            'line-width': 2,
            'line-opacity': 0.7
          }
        });
      }

      // Set up cursor styles for interactive elements
      this.map.on('mouseenter', 'places', () => {
        if (this.map) this.map.getCanvas().style.cursor = 'pointer';
      });

      this.map.on('mouseleave', 'places', () => {
        if (this.map) this.map.getCanvas().style.cursor = '';
      });

    } catch (error) {
      console.warn('Could not add custom map styles:', error);
    }
  }

  public getMap(): any | null {
    return this.map;
  }

  public flyTo(center: LngLatLike, zoom?: number): void {
    if (this.map) {
      this.map.flyTo({
        center,
        zoom: zoom || this.map.getZoom()
      });
    }
  }

  public addMarker(coordinates: LngLatLike, popup?: string, type: 'vehicle' | 'place' | 'geofence' = 'place'): void {
    if (this.map) {
      let coords: [number, number];
      
      if (Array.isArray(coordinates)) {
        coords = coordinates as [number, number];
      } else if ('lng' in coordinates && 'lat' in coordinates) {
        coords = [coordinates.lng, coordinates.lat];
      } else if ('lon' in coordinates && 'lat' in coordinates) {
        coords = [coordinates.lon, coordinates.lat];
      } else {
        // Fallback for LngLat type
        const lngLat = coordinates as any;
        coords = [lngLat.lng || lngLat.lon, lngLat.lat];
      }

      const markerId = `marker-${type}-${Date.now()}`;

      // Define colors and sizes based on marker type
      const markerStyles = {
        vehicle: { color: '#28a745', size: 8, strokeColor: '#ffffff', strokeWidth: 3 },
        place: { color: '#007cbf', size: 6, strokeColor: '#ffffff', strokeWidth: 2 },
        geofence: { color: '#ffc107', size: 7, strokeColor: '#ffffff', strokeWidth: 2 }
      };

      const style = markerStyles[type];

      // Add marker source
      this.map.addSource(markerId, {
        type: 'geojson',
        data: {
          type: 'Point',
          coordinates: coords
        }
      });

      // Add marker layer
      this.map.addLayer({
        id: markerId,
        type: 'circle',
        source: markerId,
        paint: {
          'circle-radius': style.size,
          'circle-color': style.color,
          'circle-stroke-width': style.strokeWidth,
          'circle-stroke-color': style.strokeColor,
          'circle-opacity': 0.8,
          'circle-stroke-opacity': 1
        }
      });

      // Add popup if provided
      if (popup && this.map) {
        this.map.on('click', markerId, () => {
          if (this.map) {
            // Get Popup constructor with fallback
            const maplibregl = (window as any).maplibregl;
            const Popup = maplibregl?.Popup || maplibregl?.default?.Popup;
            
            if (Popup) {
              new Popup()
                .setLngLat(coords)
                .setHTML(`<div style="padding: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                  ${popup}
                </div>`)
                .addTo(this.map);
            }
          }
        });

        // Change cursor on hover
        this.map.on('mouseenter', markerId, () => {
          if (this.map) this.map.getCanvas().style.cursor = 'pointer';
        });

        this.map.on('mouseleave', markerId, () => {
          if (this.map) this.map.getCanvas().style.cursor = '';
        });
      }
    }
  }

  public addVehicleMarker(coordinates: LngLatLike, vehicleInfo: { id: string, name: string, status: string }): void {
    const popup = `
      <strong>${vehicleInfo.name}</strong><br>
      <small>ID: ${vehicleInfo.id}</small><br>
      <span style="color: ${vehicleInfo.status === 'active' ? '#28a745' : '#dc3545'};">
        ● ${vehicleInfo.status.toUpperCase()}
      </span>
    `;
    this.addMarker(coordinates, popup, 'vehicle');
  }

  public clearMarkers(): void {
    if (this.map) {
      const style = this.map.getStyle();
      const layers = style && (style.layers as Array<{ id: string }> | undefined);
      if (layers) {
        layers.forEach((layer: { id: string }) => {
          if (layer.id.startsWith('marker-')) {
            this.map!.removeLayer(layer.id);
            this.map!.removeSource(layer.id);
          }
        });
      }
    }
  }
}