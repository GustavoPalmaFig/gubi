import { getCurrencySymbol } from '@/utils/formatCurrency';
import { getNumberDecimalSeparator } from '@/utils/formatNumber';
import { NumberInput, type NumberInputProps } from '@mantine/core';
import { useAuthenticatedUser } from '@/features/auth/hooks/useAuthenticatedUser';
import { useTranslation } from 'react-i18next';

type AppNumberInputProps = Omit<NumberInputProps, 'onChange'> & {
  isCurrency?: boolean;
  onChange: (value: number | string | null) => void;
};

export default function AppNumberInput({
  isCurrency = false,
  onChange,
  ...rest
}: AppNumberInputProps) {
  const { locale, currency } = useAuthenticatedUser();

  const { t } = useTranslation('translation', { keyPrefix: 'forms.numberInput' });

  const currencyProps = isCurrency && {
    leftSection: getCurrencySymbol(locale, currency),
    decimalSeparator: getNumberDecimalSeparator(locale),
    min: 0,
    decimalScale: 2,
    fixedDecimalScale: true,
    allowNegative: false
  };

  return (
    <NumberInput
      {...rest}
      {...currencyProps}
      placeholder={rest.placeholder ?? t('placeholder')}
      onChange={value => {
        if (typeof value === 'string') {
          const parsed = Number(value.replace(getNumberDecimalSeparator(locale), '.'));

          if (!isNaN(parsed)) {
            onChange(parsed);
          }

          return;
        }

        onChange(value);
      }}
      hideControls
    />
  );
}
