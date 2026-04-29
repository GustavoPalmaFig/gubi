import type { SystemLocale } from '@/features/types/systemLocale';

export function getNumberDecimalSeparator(locale: SystemLocale) {
  const parts = new Intl.NumberFormat(locale).formatToParts(1234.5);
  return parts.find(p => p.type === 'decimal')?.value ?? '.';
}
