import { iExpense } from '@features/expense/interfaces/expense.interface';
import { iUser } from '@features/auth/interfaces/user.interface';

export interface iPaymentMethod {
  id: number;
  owner_id: string;
  name: string;
  split_by_default: boolean;
  is_excluded_from_totals: boolean;
  created_at: Date;
  updated_at: Date;

  owner: iUser;
  expenses: iExpense[];
}
