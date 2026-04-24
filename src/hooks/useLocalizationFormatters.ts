import { formatCurrency } from '@/utils/formatCurrency';
import { type DateInput, formatDate, formatDateTime } from '@/utils/formatDate';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { SystemLocale } from '@/features/types/systemLocale';

export function useLocalizationFormatters() {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const selectedLocale = i18n.language as SystemLocale;
  const selectedCurrency = user?.currency;

  return useMemo(
    () => ({
      formatDate: (value: DateInput, options?: Intl.DateTimeFormatOptions) =>
        formatDate(value, selectedLocale, options),

      formatDateTime: (value: DateInput) => formatDateTime(value, selectedLocale),

      formatCurrency: (amount: number) =>
        formatCurrency(amount, selectedLocale, selectedCurrency ?? 'BRL')
    }),
    [selectedLocale, selectedCurrency]
  );
}
