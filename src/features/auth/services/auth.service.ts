import { supabase } from '@/services/supabase.service';
import type { User } from '../types/user';

export const fetchUserById = async (userId: string): Promise<User | null> => {
  const { data, error } = await supabase.from('user').select('*').eq('id', userId).single();

  if (error) throw error;

  return data;
};

export const isEmailTaken = async (email: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc('email_exists', {
    email_input: email
  });

  if (error) throw error;

  return data;
};
