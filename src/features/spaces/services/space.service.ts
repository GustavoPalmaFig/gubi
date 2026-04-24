import { supabase } from '@/services/supabase.service';
import type { User } from '@/features/auth/types/user';
import type { Space } from '../types/space';

export const createSpace = async (p_space: Space): Promise<number> => {
  const { data, error } = await supabase.rpc('create_space', { p_space });

  if (error) throw error;

  return data;
};

export const updateSpace = async (p_space: Space): Promise<void> => {
  const { error } = await supabase.rpc('update_space', { p_space });

  if (error) throw error;
};

export const deleteSpace = async (id: number): Promise<void> => {
  const { error } = await supabase.from('space').delete().eq('id', id);

  if (error) throw error;
};

export const fetchSpaces = async (): Promise<Space[]> => {
  const { data, error } = await supabase.from('space').select('*');

  if (error) throw error;

  return data;
};

export const fetchSpaceFormById = async (id: number): Promise<Space> => {
  const { data, error } = await supabase.rpc('get_space_form', { p_space_id: id });

  if (error) throw error;

  return data;
};

export const searchUsersForSpace = async (
  query: string,
  spaceId: number | null
): Promise<User[]> => {
  const { data, error } = await supabase.rpc('search_users_for_space', {
    query,
    p_space_id: spaceId
  });

  if (error) throw error;

  return data;
};
