import { AppAvatar } from '@/components/shared/AppAvatar';
import { cn } from '@/lib/utils';
import { Divider, Group, Stack, Text } from '@mantine/core';
import { useLocalizationFormatters } from '@/hooks/useLocalizationFormatters';
import { useTranslation } from 'react-i18next';
import type { BillSplit } from '@/features/bills/types/billSplit';

export default function SplitsTab({
  splits,
  totalValue
}: {
  splits: BillSplit[];
  totalValue: number;
}) {
  const { formatCurrency } = useLocalizationFormatters();

  const { t } = useTranslation('translation', { keyPrefix: 'bills.card.detailsModal.tabs.splits' });

  return (
    <Stack>
      {splits.map(split => (
        <Group
          key={split.user_id}
          justify="space-between"
          className={cn(
            'rounded-md border p-2',
            split.paid_at ? 'border-positive bg-positive/5' : 'border-warning bg-warning/5'
          )}
        >
          <AppAvatar user={split.user!} size="sm" yourself showEmail={false} className="w-fit" />

          <Stack gap="0" align="flex-end">
            <Text className="font-medium">{formatCurrency(split.split_value)}</Text>
            <Text className="text-xs">
              {t('percentageFromTotalValue', {
                percentage: (split.split_value / totalValue) * 100
              })}
            </Text>
          </Stack>
        </Group>
      ))}

      <Divider />

      <Group justify="space-between">
        <Text>{t('totalValue')}</Text>
        <Text className="font-semibold">{formatCurrency(totalValue)}</Text>
      </Group>
    </Stack>
  );
}
