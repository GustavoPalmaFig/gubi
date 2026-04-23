import { Badge } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { memberRoleBadgeColorsMap } from '../constants/memberRoleBadgeColorsMap';
import type { SpaceMemberRole } from '../types/spaceMemberRole';

export function MemberRoleBadge({ role }: { role: SpaceMemberRole }) {
  const { t } = useTranslation('translation', { keyPrefix: 'spaces.membersForm.roles' });
  const color = memberRoleBadgeColorsMap[role];

  return (
    <Badge variant="outline" color={color} className="py-3">
      {t(role)}
    </Badge>
  );
}
