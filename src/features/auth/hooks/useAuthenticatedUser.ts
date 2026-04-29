import type { SystemCurrency } from '@/features/types/systemCurrency';
import type { SystemLocale } from '@/features/types/systemLocale';
import { useAuth } from './useAuth';
import type { User } from '../types/user';

export type AuthenticatedUserResult = {
  user: User;
  locale: SystemLocale;
  currency: SystemCurrency;
};

export function useAuthenticatedUser(): AuthenticatedUserResult {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    throw new Error(
      'useAuthenticatedUser must be used within an authenticated session (e.g. under ProtectedRoute).'
    );
  }

  const { locale, currency } = user;
  return { user, locale, currency };
}
