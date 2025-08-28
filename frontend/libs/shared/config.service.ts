import { Injectable } from '@angular/core';

export interface AppConfig {
  apiBaseUrl: string;
  mapStyle: string;
  defaultMapCenter: [number, number];
  defaultMapZoom: number;
  enableSSR: boolean;
  environment: 'development' | 'production' | 'staging';
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: AppConfig = {
  apiBaseUrl: 'http://localhost:8080/api',
    mapStyle: 'https://api.maptiler.com/maps/streets/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL',
    defaultMapCenter: [-74.0059, 40.7128], // New York City
    defaultMapZoom: 12,
    enableSSR: true,
    environment: 'development'
  };

  getConfig(): AppConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<AppConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  get apiBaseUrl(): string {
    return this.config.apiBaseUrl;
  }

  get mapStyle(): string {
    return this.config.mapStyle;
  }

  get defaultMapCenter(): [number, number] {
    return this.config.defaultMapCenter;
  }

  get defaultMapZoom(): number {
    return this.config.defaultMapZoom;
  }

  get environment(): 'development' | 'production' | 'staging' {
    return this.config.environment;
  }

  get isProduction(): boolean {
    return this.config.environment === 'production';
  }

  get isDevelopment(): boolean {
    return this.config.environment === 'development';
  }
}