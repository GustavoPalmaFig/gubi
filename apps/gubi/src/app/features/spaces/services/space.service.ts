import { AuthService } from '@features/auth/services/auth.service';
import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '@shared/services/supabase/supabase.service';
import { iSpace } from '../interfaces/space.interface';

@Injectable({
  providedIn: 'root'
})
export class SpaceService {
  protected authService = inject(AuthService);
  private supabaseService = inject(SupabaseService);
  protected userId = this.authService.currentUser()?.id;

  async getUserSpaces(): Promise<iSpace[]> {
    const { data } = await this.supabaseService.client.rpc('get_user_spaces');
    return data as iSpace[];
  }

  async getSpaceById(spaceId: number): Promise<iSpace | null> {
    const { data } = await this.supabaseService.client.from('spaces').select('*').eq('id', spaceId).single();
    return data as iSpace | null;
  }

  async createSpace(name: string, description: string): Promise<{ data: iSpace; error?: string }> {
    const { data, error } = await this.supabaseService.client
      .from('space')
      .insert([{ name, description, creator_id: this.userId }])
      .select()
      .single();

    return { data: data as iSpace, error: error?.message };
  }

  async updateSpace(spaceId: number, name: string, description: string): Promise<{ data: iSpace; error?: string }> {
    const updated_at = new Date().toISOString();
    const { data, error } = await this.supabaseService.client.from('space').update({ name, description, creator_id: this.userId, updated_at }).eq('id', spaceId).select().single();

    return { data: data as iSpace, error: error?.message };
  }

  async deleteSpace(spaceId: number): Promise<{ error?: string }> {
    const { error } = await this.supabaseService.client.from('space').delete().eq('id', spaceId);
    return { error: error?.message };
  }

  checkIfUserIsCreator(space: iSpace): boolean {
    return space.creator_id === this.userId;
  }
}
