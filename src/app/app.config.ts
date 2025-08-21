import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptors, withInterceptorsFromDi} from '@angular/common/http';
import {jwtInterceptorInterceptor} from './core/interceptors/jwt-interceptor-interceptor';
import { ErrorInterceptor, ErrorInterceptorProvider } from '@core/interceptors/error-interceptor';
import { pendingRequestsInterceptor$ } from 'ng-http-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([jwtInterceptorInterceptor,pendingRequestsInterceptor$]),
      withFetch(),
      withInterceptorsFromDi(),
    ),
   ErrorInterceptorProvider
  ]
};
