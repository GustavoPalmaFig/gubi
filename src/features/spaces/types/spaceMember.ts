import type { User } from '@/features/auth/types/user';
import type { SpaceMemberRole } from './spaceMemberRole';
import type { SpaceMemberStatus } from './spaceMemberStatus';

export type SpaceMember = {
  user_id: string;
  role: SpaceMemberRole;
  status: SpaceMemberStatus;
  invited_by?: string;
  invited_at?: Date;
  responded_at?: Date;
  default_split_percentage: number | null;

  user: User;
};
