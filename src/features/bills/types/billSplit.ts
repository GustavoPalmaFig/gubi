import type { User } from '@/features/auth/types/user';

export interface BillSplit {
  bill_id?: number;
  user_id: string;
  split_value: number;
  paid_at?: string | null;

  user?: User;
}
