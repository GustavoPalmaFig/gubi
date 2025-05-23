import { iPaymentMethod } from '@features/payment-methods/interfaces/payment-method';
import { iUser } from '@features/auth/interfaces/user.interface';

export interface iExpense {
  id: number;
  space_id: number;
  title: string;
  value?: number;
  date?: Date;
  note?: string;
  reference_period: Date;
  payment_method_id?: number;
  category_id?: number;
  force_split?: boolean;
  creator_id: string;
  created_at: Date;
  updated_at?: Date;
  updated_by?: string;

  creator: iUser;
  updated_by_user: iUser;
  payment_method: iPaymentMethod;
}
