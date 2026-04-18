import type { User } from '@/features/auth/types/user';
import type { PaymentMethod } from './paymentMethod';

export interface PaymentMethodWithOwner extends PaymentMethod {
  owner: User;
}
