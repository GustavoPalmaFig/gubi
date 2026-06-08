import { Badge } from '@mantine/core';
import { useTranslation } from 'react-i18next';

export function BillPaidBadge({ isPaid, size = 'md' }: { isPaid: boolean; size?: 'md' | 'lg' }) {
  const { t } = useTranslation('translation', { keyPrefix: 'bills.card' });

  return (
    <Badge color={isPaid ? 'positive' : 'warning'} variant="light" size={size} className="ml-auto">
      {isPaid ? t('paid') : t('pending')}
    </Badge>
  );
}
