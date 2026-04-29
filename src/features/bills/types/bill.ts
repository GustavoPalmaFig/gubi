import type { User } from '@/features/auth/types/user';
import type { BillFile } from './billFile';
import type { BillSplit } from './billSplit';

export interface Bill {
  id?: number;
  space_id: number;
  reference_period: string;
  title: string;
  value: number;
  deadline: string | null;
  payer_id: string | null;
  payer?: User;
  paid_at: string | null;

  splits: BillSplit[];
  files: BillFile[];
}
