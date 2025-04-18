import { ApplicationConfig, inject, LOCALE_ID, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { AuthService } from '@features/auth/services/auth.service';
import { MessageService } from 'primeng/api';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { provideRouter } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import Aura from '@primeng/themes/aura';
import pt from '@angular/common/locales/pt';
import { appRoutes } from './app.routes';

registerLocaleData(pt);

export const appConfig: ApplicationConfig = {
  providers: [
    MessageService,
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideAppInitializer(() => inject(AuthService).loadUser()),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura
      }
    }),
    { provide: LOCALE_ID, useValue: 'pt-BR' }
  ]
};
