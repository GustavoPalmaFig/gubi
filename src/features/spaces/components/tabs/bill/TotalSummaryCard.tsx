import {
  IconCircleArrowDownFilled,
  IconCircleArrowUpFilled,
  IconWallet
} from '@tabler/icons-react';
import { Card, Group, Stack, Text } from '@mantine/core';
import { cn } from '@/lib/utils';
import { useLocalizationFormatters } from '@/hooks/useLocalizationFormatters';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import type { BillTotalSummary } from '@/features/bills/types/billTabContent';

export function TotalSummaryCard({
  totalSummary,
  referencePeriod
}: {
  totalSummary: BillTotalSummary;
  referencePeriod: string;
}) {
  const { formatCurrency, formatValue, formatDate } = useLocalizationFormatters();
  const { t } = useTranslation('translation', { keyPrefix: 'spaces.tabs.bills.totalSummary' });

  const lastReferencePeriod = dayjs(referencePeriod).subtract(1, 'month');

  return (
    <Card radius="lg" padding="lg" shadow="md" className="h-36">
      <Stack gap="0">
        <Group align="center" justify="space-between">
          <Text className="text-foreground/80 font-medium">{t('title')}</Text>
          <IconWallet className="text-primary size-5" />
        </Group>

        <Group align="center" justify="space-between" mt="xs">
          <Text className="text-2xl font-bold">{formatCurrency(totalSummary.totalValue)}</Text>
          <div
            className={cn(
              'flex items-center gap-1',
              totalSummary.differencePercentageFromLastMonth < 0 ? 'text-positive' : 'text-negative'
            )}
          >
            {totalSummary.differencePercentageFromLastMonth < 0 ? (
              <IconCircleArrowDownFilled className="size-5" />
            ) : (
              <IconCircleArrowUpFilled className="size-5" />
            )}
            <Text className="text-sm font-semibold">
              {formatValue(totalSummary.differencePercentageFromLastMonth)}%
            </Text>
          </div>
        </Group>

        <Text className="text-muted-foreground text-sm font-medium">
          {t('comparedToDate', {
            date: formatDate(lastReferencePeriod.toDate(), { month: 'long', year: 'numeric' })
          })}
        </Text>
      </Stack>
    </Card>
  );
}
