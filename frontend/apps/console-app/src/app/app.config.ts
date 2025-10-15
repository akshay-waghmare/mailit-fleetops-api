import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withPreloading, NoPreloading } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { jwtInterceptor } from './interceptors/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    // Explicitly disable preloading to avoid eager loading of lazy routes
    provideRouter(routes, withPreloading(NoPreloading)),
    provideClientHydration(),
    provideHttpClient(
      withFetch(),
      withInterceptors([jwtInterceptor])
    ),
    provideAnimationsAsync() // Add animations support for ngx-charts
  ]
};
