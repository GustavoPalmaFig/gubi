import type { PaymentMethodType } from './PaymentMethodType';

export interface PaymentMethodFormData {
  id?: number;
  name: string;
  affects_balance: boolean;
  type?: PaymentMethodType | null;
}
