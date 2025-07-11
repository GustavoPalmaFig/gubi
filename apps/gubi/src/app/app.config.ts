import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { MessageService } from '@shared/services/message.service';
import { MessageService as PrimeNGMessageService } from 'primeng/api';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHighcharts } from 'highcharts-angular';
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
    provideHighcharts(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
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
