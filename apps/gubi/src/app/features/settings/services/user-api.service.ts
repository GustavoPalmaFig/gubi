import { inject, Injectable } from '@angular/core';
import { iUser } from '@features/auth/interfaces/user.interface';
import { SupabaseService } from '@shared/services/supabase/supabase.service';
import Utils from '@shared/utils/utils';

@Injectable({
  providedIn: 'root'
})
export class UserApiService {
  private supabaseService = inject(SupabaseService);

  async updateUser(user: iUser): Promise<{ data: iUser; error?: string }> {
    const { data, error } = await this.supabaseService.client.from('user').update(user).eq('id', user.id).select().single();
    return { data: data as iUser, error: Utils.handleErrorMessage(error) };
  }
}
