import type { SpaceMemberRole } from '../types/spaceMemberRole';

export const memberRoleBadgeColorsMap: Record<SpaceMemberRole, string> = {
  owner: 'primary',
  admin: 'blue',
  member: 'gray'
};
