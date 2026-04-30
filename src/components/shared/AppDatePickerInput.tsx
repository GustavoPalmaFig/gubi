import { DatePickerInput, type DatePickerInputProps, type DatesRangeValue } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';
import { toISODateString } from '@/utils/formatDate';
import { useAuthenticatedUser } from '@/features/auth/hooks/useAuthenticatedUser';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

type AppDatePickerInputProps = Omit<DatePickerInputProps, 'onChange'> & {
  onChange: (value: string | string[] | DatesRangeValue<string> | null) => void;
  todayButton?: boolean;
  yesterdayButton?: boolean;
  clearButton?: boolean;
};

export default function AppDatePickerInput({
  onChange,
  todayButton = true,
  yesterdayButton = true,
  clearButton = true,
  ...rest
}: AppDatePickerInputProps) {
  const { locale } = useAuthenticatedUser();
  const { t } = useTranslation('translation', { keyPrefix: 'forms.datePickerInput' });

  const today = dayjs();
  const yesterday = today.subtract(1, 'day');

  const yesterdayPreset = {
    value: toISODateString(yesterday),
    label: t('yesterday')
  };

  const todayPreset = {
    value: toISODateString(today),
    label: t('today')
  };

  const clearPreset = { value: null, label: t('clear') };

  return (
    <DatePickerInput
      {...rest}
      placeholder={rest.placeholder ?? t('placeholder')}
      onChange={onChange}
      locale={locale}
      firstDayOfWeek={0}
      leftSection={<IconCalendar size={18} stroke={1.5} />}
      valueFormat="L"
      presets={[
        ...(rest.presets ?? []),
        ...(yesterdayButton ? [yesterdayPreset] : []),
        ...(todayButton ? [todayPreset] : []),
        ...(clearButton ? [clearPreset] : [])
      ]}
    />
  );
}
