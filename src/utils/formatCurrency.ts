import type { SystemCurrency } from '@/features/types/systemCurrency';
import type { SystemLocale } from '@/features/types/systemLocale';

const formatterCache = new Map<string, Intl.NumberFormat>();

function getCurrencyFormatter(locale: SystemLocale, currency: SystemCurrency) {
  const key = `${locale}:${currency}`;

  if (!formatterCache.has(key)) {
    formatterCache.set(key, new Intl.NumberFormat(locale, { style: 'currency', currency }));
  }

  return formatterCache.get(key)!;
}

export function formatCurrency(
  amount: number,
  locale: SystemLocale,
  currency: SystemCurrency
): string {
  return getCurrencyFormatter(locale, currency).format(amount);
}
