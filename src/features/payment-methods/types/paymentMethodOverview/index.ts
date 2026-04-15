import type { PaymentMethodCard } from './paymentMethodCard';
import type { PaymentMethodRecentUsageItem } from './paymentMethodRecentUsageItem';

export interface PaymentMethodOverview {
  cards: PaymentMethodCard[];
  recentUsage: PaymentMethodRecentUsageItem[];
}
