import type { PaymentMethod } from '../paymentMethod';

export interface PaymentMethodCard extends PaymentMethod {
  id: number;
  last_expense_at: string | null;
  last_expense_space_name: string | null;
  is_default_for_any_space: boolean;
}
