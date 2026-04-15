import type { PaymentMethodType } from '../PaymentMethodType';

export interface PaymentMethodCard {
  id: number;
  name: string;
  affects_balance: boolean;
  type: PaymentMethodType | null;
  last_expense_at: string | null;
  last_expense_space_name: string | null;
  is_default_for_any_space: boolean;
}
