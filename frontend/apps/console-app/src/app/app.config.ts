import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withPreloading, NoPreloading } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    // Explicitly disable preloading to avoid eager loading of lazy routes
    provideRouter(routes, withPreloading(NoPreloading)),
    provideClientHydration(),
    provideHttpClient(withFetch()),
    provideAnimationsAsync() // Add animations support for ngx-charts
  ]
};
