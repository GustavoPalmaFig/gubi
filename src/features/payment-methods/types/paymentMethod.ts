import type { PaymentMethodType } from './paymentMethodType';

export interface PaymentMethod {
  id?: number;
  name: string;
  affects_balance: boolean;
  type: PaymentMethodType | null;
}
