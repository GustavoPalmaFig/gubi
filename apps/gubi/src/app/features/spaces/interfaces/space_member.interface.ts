import { iUser } from '@features/auth/interfaces/user.interface';

export interface iSpaceMember {
  space_id: number;
  user_id: string;
  added_at: Date;
  is_owner: boolean;

  user: iUser;
}
