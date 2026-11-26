import type { SystemLocale } from '@/features/types/systemLocale';
import type { SystemCurrency } from '@/features/types/systemCurrency';

export const CURRENCY_OPTIONS = ['BRL', 'USD'] as const;

export const CURRENCY_OPTIONS_SELECT = [
  { value: 'BRL', label: 'Real brasileiro (BRL)' },
  { value: 'USD', label: 'American Dollar (USD)' }
] as const;

export const LOCALE_CURRENCY_MAP: Record<SystemLocale, SystemCurrency> = {
  'pt-BR': 'BRL',
  'en-US': 'USD'
};
