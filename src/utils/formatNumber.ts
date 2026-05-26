import type { SystemLocale } from '@/types/systemLocale';

export function getNumberDecimalSeparator(locale: SystemLocale) {
  const parts = new Intl.NumberFormat(locale).formatToParts(1234.5);
  return parts.find(p => p.type === 'decimal')?.value ?? '.';
}

export function roundValue(value: number) {
  return Math.round(value * 100) / 100;
}

export function formatFileSize(size: number) {
  return `${(size / 1024 ** 2).toFixed(2)} MB`;
}

export function formatValue(
  value: number,
  locale: SystemLocale,
  options?: {
    minDecimals?: number;
    maxDecimals?: number;
  }
) {
  const { minDecimals = 0, maxDecimals = 2 } = options ?? {};

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals
  }).format(value);
}
