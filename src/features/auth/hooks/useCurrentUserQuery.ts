import { useQuery } from '@tanstack/react-query';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { fetchUserById } from '../services/auth.service';

export function useCurrentUserQuery(supabaseUser: SupabaseUser | null) {
  return useQuery({
    queryKey: ['auth-user', supabaseUser?.id],
    queryFn: async () => fetchUserById(supabaseUser!.id),
    enabled: !!supabaseUser
  });
}
