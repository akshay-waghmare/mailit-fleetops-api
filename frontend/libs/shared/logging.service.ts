import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoggingService {
  private readonly debugEnabled = this.computeDebug();

  private computeDebug(): boolean {
    try {
      if (typeof window !== 'undefined' && (window as any).__FLEETOPS_DEBUG__ !== undefined) {
        return !!(window as any).__FLEETOPS_DEBUG__;
      }
      if (typeof process !== 'undefined' && process.env && (process.env as any)['FLEETOPS_DEBUG']) {
        return (process.env as any)['FLEETOPS_DEBUG'] === 'true';
      }
    } catch { /* ignore */ }
  return !(typeof process !== 'undefined' && process.env && (process.env as any)['NODE_ENV'] === 'production');
  }

  debug(message: string, ...data: any[]): void {
    if (!this.debugEnabled) return;
    // eslint-disable-next-line no-console
    console.debug(this.prefix('DEBUG'), message, ...data);
  }
  info(message: string, ...data: any[]): void {
    // eslint-disable-next-line no-console
    console.info(this.prefix('INFO'), message, ...data);
  }
  warn(message: string, ...data: any[]): void {
    // eslint-disable-next-line no-console
    console.warn(this.prefix('WARN'), message, ...data);
  }
  error(message: string, error?: any, ...data: any[]): void {
    // eslint-disable-next-line no-console
    console.error(this.prefix('ERROR'), message, error, ...data);
  }

  private prefix(level: string): string {
    return `[${new Date().toISOString()}][${level}]`;
  }
}
