import { AuthService } from '@features/auth/services/auth.service';
import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '@shared/services/supabase/supabase.service';
import Utils from '@shared/utils/utils';
import { iCategory } from '../interfaces/category.interface';

@Injectable({
  providedIn: 'root'
})
export class CategoryApiService {
  protected authService = inject(AuthService);
  private supabaseService = inject(SupabaseService);

  async getCategories(): Promise<iCategory[]> {
    const { data } = await this.supabaseService.client.from('category').select('*');
    return data as iCategory[];
  }

  async createCategory(category: iCategory): Promise<{ data: iCategory; error?: string }> {
    const { data, error } = await this.supabaseService.client.from('category').insert([category]).select().single();
    return { data: data as iCategory, error: Utils.handleErrorMessage(error) };
  }

  async updateCategory(category: iCategory): Promise<{ data: iCategory; error?: string }> {
    const { data, error } = await this.supabaseService.client.from('category').update(category).eq('id', category.id).select().single();
    return { data: data as iCategory, error: Utils.handleErrorMessage(error) };
  }
}
