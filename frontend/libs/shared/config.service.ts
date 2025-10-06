import { Injectable } from '@angular/core';
import { LoggingService } from './logging.service';
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

  constructor(private http: HttpClient, private logger: LoggingService) {
    // Only try to load config if we might be in Docker environment
    if (this.mightBeDockerEnvironment()) {
      this.loadConfig().catch(error => {
        this.logger.warn('Config loading failed, using defaults', (error as any)?.message);
      });
    } else {
      this.logger.debug('Local development detected, using default config');
    }
  }

  private mightBeDockerEnvironment(): boolean {
    if (typeof window === 'undefined') return true;
    
    // Check if we're likely in Docker (port 80, 4200 with nginx, or not localhost)
    return window.location.port === '80' || 
           window.location.port === '' ||
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
    // SSR / non-browser fallback - check NODE_ENV or assume local dev
    if (typeof window === 'undefined') {
      // During SSR in dev server (ng serve), use localhost:8081
      // In production/docker SSR, use relative /api
      const nodeEnv = typeof process !== 'undefined' ? process.env['NODE_ENV'] : undefined;
      if (nodeEnv === 'production' || nodeEnv === 'docker') {
        return '/api';
      }
      // Default to localhost:8081 for local SSR dev
      return 'http://localhost:8081/api';
    }

    const isDockerEnvironment =
      window.location.port === '80' ||
      window.location.port === '' ||
      window.location.hostname !== 'localhost';

    return isDockerEnvironment ? '/api' : 'http://localhost:8081/api';
  }

  private getEnvironment(): 'development' | 'production' | 'staging' | 'docker' {
    if (typeof window === 'undefined') return 'docker';
    
    if (window.location.port === '4200' && window.location.hostname === 'localhost') {
      return 'development';
    } else if (window.location.port === '80' || window.location.port === '') {
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
        this.logger.info('Loaded config from nginx', config);
        return config;
      }
    } catch (error) {
      this.logger.warn('Failed to load config from nginx, using defaults');
    }

    // Fallback to default config
    const defaultConfig = this.getDefaultConfig();
    this.configSubject.next(defaultConfig);
    this.configLoaded = true;
    this.logger.debug('Using default config', defaultConfig);
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