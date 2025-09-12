import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, of } from 'rxjs';

export interface AppConfig {
  apiBaseUrl: string;
  mapStyle: string;
  defaultMapCenter: [number, number];
  defaultMapZoom: number;
  enableSSR: boolean;
  environment: 'development' | 'production' | 'staging' | 'docker';
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private configSubject = new BehaviorSubject<AppConfig>(this.getDefaultConfig());
  private configLoaded = false;

  constructor(private http: HttpClient) {
    // Only try to load config if we might be in Docker environment
    if (this.mightBeDockerEnvironment()) {
      this.loadConfig().catch(error => {
        console.log('⚠️ Config loading failed, using defaults:', error.message);
      });
    } else {
      console.log('📱 Local development detected, using default config');
    }
  }

  private mightBeDockerEnvironment(): boolean {
    if (typeof window === 'undefined') return true;
    
    // Check if we're likely in Docker (port 80, 5001, or not localhost)
    return window.location.port === '80' || 
           window.location.port === '' ||
           window.location.port === '5001' ||
           window.location.hostname !== 'localhost';
  }

  private getDefaultConfig(): AppConfig {
    return {
      apiBaseUrl: this.getApiBaseUrl(),
      mapStyle: 'https://api.maptiler.com/maps/streets/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL',
      defaultMapCenter: [72.8777, 19.0760], // Mumbai, India
      defaultMapZoom: 12,
      enableSSR: true,
      environment: this.getEnvironment()
    };
  }

  private getApiBaseUrl(): string {
    if (typeof window === 'undefined') {
      return '/api'; // SSR fallback
    }

    // Check if we're in Docker or production environment
    const isDockerEnvironment = 
      window.location.port === '80' || 
      window.location.port === '' ||
      window.location.port === '5001' || // Docker frontend port
      window.location.hostname !== 'localhost';

    if (isDockerEnvironment) {
      return '/api'; // Use nginx proxy
    } else {
      return 'http://localhost:8080/api'; // Local development - direct to backend
    }
  }

  private getEnvironment(): 'development' | 'production' | 'staging' | 'docker' {
    if (typeof window === 'undefined') return 'docker';
    
    if (window.location.port === '4200' && window.location.hostname === 'localhost') {
      return 'development';
    } else if (window.location.port === '80' || window.location.port === '' || window.location.port === '5001') {
      return 'docker';
    } else {
      return 'production';
    }
  }

  async loadConfig(): Promise<AppConfig> {
    if (this.configLoaded) {
      return this.configSubject.value;
    }

    try {
      // Only try to fetch config if we're likely in Docker
      if (!this.mightBeDockerEnvironment()) {
        throw new Error('Not in Docker environment, skipping config fetch');
      }

      // Try to fetch config from nginx-served endpoint
      const config = await this.http.get<AppConfig>('/assets/config.json').toPromise();
      if (config) {
        this.configSubject.next(config);
        this.configLoaded = true;
        console.log('✅ Loaded config from nginx:', config);
        return config;
      }
    } catch (error) {
      console.log('⚠️ Failed to load config from nginx, using defaults');
    }

    // Fallback to default config
    const defaultConfig = this.getDefaultConfig();
    this.configSubject.next(defaultConfig);
    this.configLoaded = true;
    console.log('✅ Using default config:', defaultConfig);
    return defaultConfig;
  }

  getConfig(): AppConfig {
    return this.configSubject.value;
  }

  getConfig$(): Observable<AppConfig> {
    return this.configSubject.asObservable();
  }

  updateConfig(updates: Partial<AppConfig>): void {
    const currentConfig = this.configSubject.value;
    const newConfig = { ...currentConfig, ...updates };
    this.configSubject.next(newConfig);
  }

  get apiBaseUrl(): string {
    return this.configSubject.value.apiBaseUrl;
  }

  get mapStyle(): string {
    return this.configSubject.value.mapStyle;
  }

  get defaultMapCenter(): [number, number] {
    return this.configSubject.value.defaultMapCenter;
  }

  get defaultMapZoom(): number {
    return this.configSubject.value.defaultMapZoom;
  }

  get enableSSR(): boolean {
    return this.configSubject.value.enableSSR;
  }

  get environment(): 'development' | 'production' | 'staging' | 'docker' {
    return this.configSubject.value.environment;
  }

  get isProduction(): boolean {
    return this.configSubject.value.environment === 'production';
  }

  get isDevelopment(): boolean {
    return this.configSubject.value.environment === 'development';
  }

  get isDocker(): boolean {
    return this.configSubject.value.environment === 'docker';
  }
}