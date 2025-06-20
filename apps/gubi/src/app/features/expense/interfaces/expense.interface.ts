import { iPaymentMethod } from '@features/payment-methods/interfaces/payment-method';
import { iSpace } from '@features/spaces/interfaces/space.interface';
import { iUser } from '@features/auth/interfaces/user.interface';
import { iExpenseSplit } from './expense_split.interface';

export interface iExpense {
  id: number;
  space_id: number;
  title: string;
  value?: number;
  date?: string;
  note?: string;
  reference_period: Date;
  payment_method_id?: number;
  category_id?: number;
  force_split?: boolean;
  creator_id: string;
  created_at: Date;
  updated_at?: Date;
  updated_by?: string;

  space: iSpace;
  expense_splits?: iExpenseSplit[];
  creator: iUser;
  updated_by_user: iUser;
  payment_method: iPaymentMethod;
}
