import { ApplicationConfig, inject, LOCALE_ID, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { AuthService } from '@features/auth/services/auth.service';
import { MessageService } from '@shared/services/message.service';
import { MessageService as PrimeNGMessageService } from 'primeng/api';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { provideRouter } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import Aura from '@primeng/themes/aura';
import pt from '@angular/common/locales/pt';
import { appRoutes } from './app.routes';
import { ptBrTranslation } from '../ptBrTranslations';

registerLocaleData(pt);

export const appConfig: ApplicationConfig = {
  providers: [
    PrimeNGMessageService,
    MessageService,
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideAppInitializer(() => inject(AuthService).loadUser()),
    provideAnimationsAsync(),
    providePrimeNG({
      translation: ptBrTranslation,
      theme: {
        preset: Aura
      }
    }),
    { provide: LOCALE_ID, useValue: 'pt-BR' }
  ]
};
