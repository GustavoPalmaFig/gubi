import { DatePickerInput, type DatePickerInputProps, type DatesRangeValue } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';
import { useAuthenticatedUser } from '@/features/auth/hooks/useAuthenticatedUser';
import { useMediaQuery } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(localizedFormat);

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
  const isTablet = useMediaQuery('(max-width: 768px)');

  const valueFormat = dayjs().format('L');

  const yesterdayPreset = {
    value: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    label: t('yesterday')
  };
  const todayPreset = { value: dayjs().format('YYYY-MM-DD'), label: t('today') };
  const clearPreset = { value: null, label: t('clear') };

  return (
    <DatePickerInput
      {...rest}
      placeholder={rest.placeholder ?? t('placeholder')}
      onChange={onChange}
      locale={locale}
      firstDayOfWeek={0}
      leftSection={<IconCalendar size={18} stroke={1.5} />}
      valueFormat={valueFormat}
      popoverProps={{ position: isTablet ? 'bottom' : 'bottom-start' }}
      presets={[
        ...(rest.presets ?? []),
        ...(yesterdayButton ? [yesterdayPreset] : []),
        ...(todayButton ? [todayPreset] : []),
        ...(clearButton ? [clearPreset] : [])
      ]}
    />
  );
}
