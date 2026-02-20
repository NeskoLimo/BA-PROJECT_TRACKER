import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations'; // Required for Dashboard animations

import { routes } from './app.routes';
import { GovernanceService } from './services/governance.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(), // This enables the 'staggerFade' and 'growWidth' animations in your Dashboard
    
    // Explicitly providing the service here fixes the TS-992003 build error
    GovernanceService 
  ]
};
