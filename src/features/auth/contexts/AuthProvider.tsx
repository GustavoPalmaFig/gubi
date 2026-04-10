import { supabase } from '@/services/supabase.service';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { Provider, User as SupabaseUser } from '@supabase/supabase-js';
import { AuthContext } from './AuthContext';
import { isEmailTaken } from '../services/auth.service';
import { useCurrentUserQuery } from '../hooks/useCurrentUserQuery';
import type { User } from '../types/user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation('translation', { keyPrefix: 'auth' });
  const queryClient = useQueryClient();

  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  const isInitialized = useRef(false);

  const { data: user, isLoading: isUserLoading } = useCurrentUserQuery(supabaseUser);
  const isLoading = isSessionLoading || (!!supabaseUser && isUserLoading);

  useEffect(() => {
    const init = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error) {
          throw error;
        }

        setSupabaseUser(data.user ?? null);
      } catch {
        setSupabaseUser(null);
      } finally {
        isInitialized.current = true;
        setIsSessionLoading(false);
      }
    };

    void init();
  }, []);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => {
        if (!isInitialized.current) return;

        const nextUser = session?.user ?? null;
        setSupabaseUser(nextUser);

        if (!nextUser) {
          void queryClient.removeQueries({ queryKey: ['auth-user'] });
        }
      }, 0);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [queryClient]);

  const register = async (user: Omit<User, 'id'>, password: string) => {
    const { email, full_name, locale, currency } = user;

    if (await isEmailTaken(email)) {
      throw new Error(t('error.email_already_taken'));
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name, locale, currency }
      }
    });

    if (error) throw error;
  };

  const simpleLogin = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
  };

  const loginWithOAuth = async (provider: Provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/home`
      }
    });

    if (error) throw error;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    queryClient.removeQueries({ queryKey: ['auth-user'] });
  };

  return (
    <AuthContext
      value={{
        isAuthenticated: !!supabaseUser && !!user,
        user: user ?? null,
        supabaseUser,
        isLoading,
        register,
        simpleLogin,
        loginWithOAuth,
        logout
      }}
    >
      {children}
    </AuthContext>
  );
}
