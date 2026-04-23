import type { SpaceMemberStatus } from '../types/spaceMemberStatus';

export const memberStatusBadgeColorsMap: Record<SpaceMemberStatus, string> = {
  pending: 'warning',
  active: 'positive',
  declined: 'negative'
};
