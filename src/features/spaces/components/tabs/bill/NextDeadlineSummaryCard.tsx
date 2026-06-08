import { Card, Group, Stack, Text } from '@mantine/core';
import { formatRelativeDate } from '@/utils/formatDate';
import { IconCalendarTime, IconExclamationCircleFilled } from '@tabler/icons-react';
import { useLocalizationFormatters } from '@/hooks/useLocalizationFormatters';
import { useTranslation } from 'react-i18next';
import type { Bill } from '@/features/bills/types/bill';

export function NextDeadlineSummaryCard({ nextDeadline }: { nextDeadline: Bill }) {
  const { formatCurrency } = useLocalizationFormatters();

  const { t: tDate } = useTranslation('translation', { keyPrefix: 'date' });
  const { t } = useTranslation('translation', {
    keyPrefix: 'spaces.tabs.bills.nextDeadlineSummary'
  });

  return (
    <Card radius="lg" padding="lg" shadow="md" className="h-36">
      <Stack gap="0">
        <Group align="center" justify="space-between">
          <Text className="text-foreground/80 font-medium">{t('title')}</Text>
          <IconCalendarTime className="text-negative size-5" />
        </Group>

        <Group align="center" justify="space-between" mt="xs">
          <Stack gap="0">
            <Group align="center" gap="5">
              <IconExclamationCircleFilled size={16} className="text-orange shrink-0" />
              <Text className="font-bold">{nextDeadline.title}</Text>
            </Group>

            <Text className="text-muted-foreground text-sm font-medium">
              {t('deadline', {
                date: nextDeadline.deadline ? formatRelativeDate(nextDeadline.deadline, tDate) : '-'
              })}
            </Text>
          </Stack>

          <Text className="text-xl font-bold">{formatCurrency(nextDeadline.value)}</Text>
        </Group>
      </Stack>
    </Card>
  );
}
