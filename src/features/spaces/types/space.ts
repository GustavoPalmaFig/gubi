import type { PaymentMethodWithOwner } from '@/features/payment-methods/types/paymentMethodWithOwner';
import type { SpaceIcon } from './spaceIcon';
import type { SpaceMember } from './spaceMember';

export type Space = {
  id?: number;
  name: string;
  description: string | null;
  bill_tab: boolean;
  expense_tab: boolean;
  default_payment_method_id: number | null;
  default_payment_method?: PaymentMethodWithOwner | null;
  icon: SpaceIcon;
  color: string;

  members: SpaceMember[];
};
