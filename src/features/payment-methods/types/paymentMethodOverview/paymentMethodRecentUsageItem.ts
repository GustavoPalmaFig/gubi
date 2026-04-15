import type { paymentMethodTypeOptions } from '../../constants/paymentMethodTypeOptions';

export type PaymentMethodType = (typeof paymentMethodTypeOptions)[number];

export interface PaymentMethodRecentUsageItem {
  id: number;
  name: string;
  type: PaymentMethodType | null;
  value: number;
}
