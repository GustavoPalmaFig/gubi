import type { SystemCurrency } from '@/types/systemCurrency';
import type { SystemLocale } from '@/types/systemLocale';

export interface User {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  locale: SystemLocale;
  currency: SystemCurrency;
  updated_at?: Date;
}
