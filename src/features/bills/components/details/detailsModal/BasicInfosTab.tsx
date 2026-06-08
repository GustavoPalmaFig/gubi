import { IconWallet, IconCalendar, IconUserCircle, IconClock } from '@tabler/icons-react';
import { SimpleGrid, Stack, Group, Text } from '@mantine/core';
import { useLocalizationFormatters } from '@/hooks/useLocalizationFormatters';
import { useTranslation } from 'react-i18next';
import type { Bill } from '../../../types/bill';

const numericDateOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric'
};

export default function BasicInfosTab({ bill }: { bill: Bill }) {
  const { formatCurrency, formatDate } = useLocalizationFormatters();

  const { t } = useTranslation('translation', {
    keyPrefix: 'bills.card.detailsModal.tabs.basicInfos'
  });

  const basicInfosContent = [
    {
      label: t('value'),
      icon: <IconWallet size={18} />,
      value: formatCurrency(bill.value)
    },
    {
      label: t('deadline'),
      icon: <IconCalendar size={18} />,
      value: bill.deadline ? formatDate(bill.deadline, numericDateOptions) : '-'
    },
    {
      label: bill.payer ? t('paidBy') : t('createdBy'),
      icon: <IconUserCircle size={18} />,
      value: bill.payer ? bill.payer.full_name : bill.creator?.full_name
    },
    {
      label: bill.paid_at ? t('paidAt') : t('createdAt'),
      icon: <IconClock size={18} />,
      value: formatDate(bill.paid_at ? bill.paid_at : bill.created_at, numericDateOptions)
    }
  ];

  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
      {basicInfosContent.map(item => (
        <Stack key={item.label} gap="2">
          <Group align="center" gap="5" className="text-secondary">
            {item.icon}
            <Text className="text-sm">{item.label}</Text>
          </Group>
          <Text className="font-medium">{item.value}</Text>
        </Stack>
      ))}
    </SimpleGrid>
  );
}
