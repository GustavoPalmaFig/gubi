import { IconCalendar } from '@tabler/icons-react';
import { MonthPickerInput, type DatesRangeValue, type MonthPickerInputProps } from '@mantine/dates';
import { useAuthenticatedUser } from '@/features/auth/hooks/useAuthenticatedUser';
import { useTranslation } from 'react-i18next';

export type AppMonthPickerInputProps = Omit<MonthPickerInputProps, 'onChange'> & {
  onChange: (value: string | string[] | DatesRangeValue<string> | null) => void;
};

export default function AppMonthPickerInput({ onChange, ...rest }: AppMonthPickerInputProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'forms.monthPickerInput' });
  const { locale } = useAuthenticatedUser();

  return (
    <MonthPickerInput
      {...rest}
      placeholder={rest.placeholder ?? t('placeholder')}
      onChange={onChange}
      leftSection={<IconCalendar size={18} stroke={1.5} />}
      locale={locale}
    />
  );
}
