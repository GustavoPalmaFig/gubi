import { createContext } from 'react';
import type { Provider, User as SupabaseUser } from '@supabase/supabase-js';
import type { User } from '../types/user';

type AuthContextValue = {
  isAuthenticated: boolean;
  user: User | null;
  supabaseUser: SupabaseUser | null;
  isLoading: boolean;
  register: (user: Omit<User, 'id'>, password: string) => Promise<void>;
  simpleLogin: (email: string, password: string) => Promise<void>;
  loginWithOAuth: (provider: Provider) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
