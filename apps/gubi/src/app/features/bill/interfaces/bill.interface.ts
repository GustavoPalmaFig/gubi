import { iSpace } from '@features/spaces/interfaces/space.interface';
import { iUser } from '@features/auth/interfaces/user.interface';
import { iBillFile } from './bill_file.interface';
import { iBillSplit } from './bill_split.interface';

export interface iBill {
  id: number;
  space_id: number;
  name: string;
  value?: number;
  deadline?: string;
  force_split?: boolean;
  reference_period: Date;
  payer_id?: string;
  paid_at?: string;
  creator_id: string;
  created_at: Date;
  updated_at?: Date;
  updated_by?: string;

  is_selected?: boolean;

  space: iSpace;
  bill_splits?: iBillSplit[];
  payer: iUser;
  bill_files?: iBillFile[];
  creator: iUser;
  updated_by_user: iUser;
}
