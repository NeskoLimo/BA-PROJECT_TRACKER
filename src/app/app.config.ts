import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// Import the services to provide their "values" to the compiler
import { GovernanceService } from './services/governance.service';
import { AuthService } from './services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    
    // Explicitly provide these services to fix TS-992003
    GovernanceService,
    AuthService
  ]
};
