import { iUser } from '@features/auth/interfaces/user.interface';

export interface iSpace {
  id: number;
  name: string;
  description: string;
  creator_id: string;
  created_at: Date;
  updated_at: Date;
  members?: iUser[];
}
