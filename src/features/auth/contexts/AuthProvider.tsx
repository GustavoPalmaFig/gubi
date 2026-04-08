import { supabase } from '@/services/supabase.service';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { Provider, User as SupabaseUser } from '@supabase/supabase-js';
import { AuthContext } from './AuthContext';
import { fetchUserById, isEmailTaken } from '../services/auth.service';
import type { User } from '../types/user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation('auth');

  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isInitialized = useRef(false);

  const handleUserLoad = async (supabaseUser: SupabaseUser | null) => {
    setSupabaseUser(supabaseUser);

    try {
      if (supabaseUser) {
        const dbUser = await fetchUserById(supabaseUser.id);
        setUser(dbUser);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const { data } = await supabase.auth.getUser();
      await handleUserLoad(data.user ?? null);

      isInitialized.current = true;
      setIsLoading(false);
    };

    init();
  }, []);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isInitialized.current) return;

      setIsLoading(true);
      await handleUserLoad(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const register = async (user: User, password: string) => {
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
  };

  return (
    <AuthContext
      value={{
        isAuthenticated: !!supabaseUser && !!user,
        user,
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
