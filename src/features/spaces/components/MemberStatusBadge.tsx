import { Badge } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { memberStatusBadgeColorsMap } from '../constants/memberStatusBadgeColorsMap';
import type { SpaceMemberStatus } from '../types/spaceMemberStatus';

export function MemberStatusBadge({ status }: { status: SpaceMemberStatus }) {
  const { t } = useTranslation('translation', { keyPrefix: 'spaces.membersForm.statuses' });
  const color = memberStatusBadgeColorsMap[status];

  return (
    <Badge variant="filled" color={color} className="py-3">
      {t(status)}
    </Badge>
  );
}
