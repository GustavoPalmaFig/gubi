import type { SystemLocale } from '@/types/systemLocale';

export function getNumberDecimalSeparator(locale: SystemLocale) {
  const parts = new Intl.NumberFormat(locale).formatToParts(1234.5);
  return parts.find(p => p.type === 'decimal')?.value ?? '.';
}

export function roundValue(value: number) {
  return Math.round(value * 100) / 100;
}
