import { formatCurrency } from '@/utils/formatCurrency';
import { formatValue } from '@/utils/formatNumber';
import { type DateInput, formatDate, formatDateTime } from '@/utils/formatDate';
import { useAuthenticatedUser } from '@/features/auth/hooks/useAuthenticatedUser';
import { useMemo } from 'react';

export function useLocalizationFormatters() {
  const { currency, locale } = useAuthenticatedUser();

  return useMemo(
    () => ({
      formatDate: (value: DateInput, options?: Intl.DateTimeFormatOptions) =>
        formatDate(value, locale, options),

      formatDateTime: (value: DateInput) => formatDateTime(value, locale),

      formatCurrency: (amount: number) => formatCurrency(amount, locale, currency),

      formatValue: (
        value: number,
        options?: {
          minDecimals?: number;
          maxDecimals?: number;
        }
      ) => formatValue(value, locale, options)
    }),
    [locale, currency]
  );
}
