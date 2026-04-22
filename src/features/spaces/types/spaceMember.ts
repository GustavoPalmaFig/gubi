import type { User } from '@supabase/supabase-js';
import type { SpaceMemberRole } from './spaceMemberRole';
import type { SpaceMemberStatus } from './spaceMemberStatus';

export type SpaceMember = {
  user_id: string;
  role: SpaceMemberRole;
  status: SpaceMemberStatus;
  invited_by: string;
  invited_at: Date;
  responded_at: Date | null;
  default_split_percentage: number;

  user: User;
};
