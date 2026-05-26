import { Card, Group, Progress, Stack, Text } from '@mantine/core';
import { IconChartPieFilled } from '@tabler/icons-react';
import { useLocalizationFormatters } from '@/hooks/useLocalizationFormatters';
import { useTranslation } from 'react-i18next';
import type { BillPaymentSummary } from '@/features/bills/types/billTabContent';

export function PaymentSummaryCard({ paymentSummary }: { paymentSummary: BillPaymentSummary }) {
  const { formatCurrency } = useLocalizationFormatters();
  const { t } = useTranslation('translation', { keyPrefix: 'spaces.tabs.bills.paymentSummary' });

  return (
    <Card radius="lg" padding="lg" shadow="md" className="h-36">
      <Stack gap="0">
        <Group align="center" justify="space-between">
          <Text className="text-foreground/80 font-medium">{t('title')}</Text>
          <IconChartPieFilled className="text-blue size-5" />
        </Group>

        <Group align="center" gap="5" mt="xs">
          <Text className="text-positive text-2xl font-bold">
            {formatCurrency(paymentSummary.paidValue)}
          </Text>
          <Text className="text-muted-foreground font-bold">/</Text>
          <Text className="text-orange text-xl font-bold">
            {formatCurrency(paymentSummary.pendingValue)}
          </Text>
        </Group>

        <Progress value={paymentSummary.paidPercentage} color="positive" className="my-1" />

        <Text className="text-muted-foreground text-sm font-medium">
          {t('paidBillsCount', {
            paidBillsCount: paymentSummary.paidBillsCount,
            totalBillsCount: paymentSummary.totalBillsCount
          })}
        </Text>
      </Stack>
    </Card>
  );
}
