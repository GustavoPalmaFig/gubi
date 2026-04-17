import { Card, Stack, Group, Badge, Divider, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { PaymentMethodMenu } from './PaymentMethodMenu';
import { PaymentMethodTypeIcon } from './PaymentMethodTypeIcon';
import type { PaymentMethodCard } from '../types/paymentMethodOverview/paymentMethodCard';
import type { PaymentMethodFormData } from '../types/paymentMethodFormData';

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethodCard;
  onEdit: (paymentMethod: PaymentMethodFormData) => void;
}

export function PaymentMethodCard({ paymentMethod, onEdit }: PaymentMethodCardProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'paymentMethod' });

  return (
    <Card radius="lg" padding="lg" shadow="md" h={220}>
      <Stack gap="md" justify="space-between" h="100%">
        <Group align="start" justify="space-between">
          <PaymentMethodTypeIcon type={paymentMethod.type} />
          <Group>
            {paymentMethod.is_default_for_any_space && (
              <Badge variant="light" color="cyan" radius="md" size="sm" className="py-3">
                {t('card.default')}
              </Badge>
            )}

            <PaymentMethodMenu paymentMethod={paymentMethod} onEdit={onEdit} />
          </Group>
        </Group>

        <Stack gap="0">
          <Text className="font-semibold">{paymentMethod.name}</Text>
          {paymentMethod.type && (
            <Text className="text-muted-foreground text-sm">
              {t(`paymentMethodType.${paymentMethod.type}`)}
            </Text>
          )}
        </Stack>

        <Divider />

        <Group align="end" justify="space-between">
          <Stack gap="0">
            <Text className="text-gray text-sm">{t('card.last_expense')}</Text>
            <Text className="text-xs">
              {paymentMethod.last_expense_at
                ? dayjs(paymentMethod.last_expense_at).fromNow()
                : t('card.no_expense')}
            </Text>
          </Stack>

          <Badge
            variant="light"
            color={paymentMethod.affects_balance ? 'positive' : 'gray'}
            radius="md"
            size="sm"
            className="py-3"
          >
            {paymentMethod.affects_balance
              ? t('card.affects_balance')
              : t('card.does_not_affect_balance')}
          </Badge>
        </Group>
      </Stack>
    </Card>
  );
}
