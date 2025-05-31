import { iUser } from '@features/auth/interfaces/user.interface';

export interface iExpenseSplit {
  expense_id: number;
  user_id: string;
  split_value: number;

  user: iUser;
}
