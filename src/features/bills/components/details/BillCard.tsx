import {
  IconCheck,
  IconCircleCheckFilled,
  IconExclamationCircleFilled,
  IconUserCircle
} from '@tabler/icons-react';
import { AppAvatar } from '@/components/shared/AppAvatar';
import { Badge, Button, Card, Group, Stack, Text } from '@mantine/core';
import { cn } from '@/lib/utils';
import { dayjs } from '@/lib/dayjs';
import { formatRelativeDate } from '@/utils/formatDate';
import { showErrorNotification } from '@/utils/errors';
import { showNotification } from '@/utils/showNotification';
import { useLocalizationFormatters } from '@/hooks/useLocalizationFormatters';
import { useTranslation } from 'react-i18next';
import { BillCardMenu } from './BillCardMenu';
import { useMarkAsPaidMutation } from '../../hooks/useBill';
import type { Bill } from '../../types/bill';

type DeadlineUrgency = 'negative' | 'warning' | 'positive' | 'default';

function getDeadlineUrgency(deadline: string | null | undefined): DeadlineUrgency {
  if (!deadline) return 'default';

  const daysUntil = dayjs(deadline).startOf('day').diff(dayjs().startOf('day'), 'day');

  if (daysUntil <= 3) return 'negative';
  if (daysUntil <= 7) return 'warning';
  return 'default';
}

const borderUrgencyClass: Record<DeadlineUrgency, string> = {
  negative: 'border-l-negative',
  warning: 'border-l-warning',
  positive: 'border-l-positive',
  default: 'border-l-transparent'
};

export default function BillCard({ bill, onEdit }: { bill: Bill; onEdit: (bill: Bill) => void }) {
  const { mutate: markAsPaid, isPending: isMarkingAsPaid } = useMarkAsPaidMutation();

  const { formatCurrency } = useLocalizationFormatters();

  const { t: tDate } = useTranslation('translation', { keyPrefix: 'date' });
  const { t: tBills } = useTranslation('translation', { keyPrefix: 'bills.details.card' });

  const handleMarkAsPaid = () => {
    if (!bill.id) return;

    markAsPaid(bill.id, {
      onSuccess: () => {
        showNotification({
          title: tBills('markAsPaid_success'),
          message: tBills('markAsPaid_success_description'),
          type: 'positive'
        });
      },
      onError: showErrorNotification
    });
  };

  const urgency = bill.paid_at ? 'positive' : getDeadlineUrgency(bill.deadline);

  return (
    <Card
      radius="lg"
      padding="lg"
      shadow="md"
      classNames={{ root: cn('h-full border-l-4', borderUrgencyClass[urgency]) }}
    >
      <Stack gap="sm" h="100%" justify="space-between">
        <Group align="start" justify="space-between">
          <Text className="font-semibold">{bill.title}</Text>
          <BillCardMenu bill={bill} onEdit={onEdit} />
        </Group>
        <div className="bg-background grid grid-cols-2 gap-5 rounded-lg p-4">
          <div>
            <Text className="text-muted-foreground text-sm">{tBills('value')}</Text>
            <Text className="font-bold">{formatCurrency(bill.value)}</Text>
          </div>
          <div className="flex flex-col items-end">
            <Text className="text-muted-foreground text-sm">{tBills('deadline')}</Text>
            <Group gap={4} justify="flex-end" wrap="nowrap">
              {urgency === 'negative' && (
                <IconExclamationCircleFilled size={16} className="text-negative shrink-0" />
              )}
              <Text
                className={cn(
                  'font-bold',
                  urgency === 'negative' && 'text-negative',
                  urgency === 'warning' && 'text-warning'
                )}
              >
                {bill.deadline ? formatRelativeDate(bill.deadline, tDate) : '-'}
              </Text>
            </Group>
          </div>

          <div className="col-span-2 flex flex-col gap-3">
            {bill.splits.map(split => (
              <div className="flex items-center justify-between gap-2">
                <div key={split.user_id} className="flex items-center gap-2">
                  <AppAvatar
                    user={split.user!}
                    size="sm"
                    yourself
                    showName={false}
                    showEmail={false}
                    className="w-fit"
                  />
                  <Text className="text-sm font-medium">{formatCurrency(split.split_value)}</Text>
                </div>
                <Badge
                  color={split.paid_at ? 'positive' : 'warning'}
                  variant="light"
                  className="ml-auto"
                >
                  {split.paid_at ? tBills('paid') : tBills('pending')}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {bill.paid_at && bill.payer ? (
          <Group className="text-green gap-1">
            <IconCircleCheckFilled size={16} />
            <Text className="font-bold">{formatRelativeDate(bill.paid_at, tDate)}</Text>
            <Group className="text-muted-foreground ml-auto gap-1">
              <IconUserCircle size={16} />
              <Text className="text-sm">{tBills('responsible')}:</Text>
              <Text className="text-foreground font-medium">{bill.payer.full_name}</Text>
            </Group>
          </Group>
        ) : (
          <Button
            variant="light"
            color="cyan"
            fullWidth
            leftSection={<IconCheck size={16} />}
            onClick={handleMarkAsPaid}
            loading={isMarkingAsPaid}
            loaderProps={{ type: 'dots' }}
          >
            <Text className="text-sm font-bold">{tBills('markAsPaid')}</Text>
          </Button>
        )}
      </Stack>
    </Card>
  );
}
