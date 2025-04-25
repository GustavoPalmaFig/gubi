import { AuthService } from '@features/auth/services/auth.service';
import { inject, Injectable } from '@angular/core';
import { iUser } from '@features/auth/interfaces/user.interface';
import { SupabaseService } from '@shared/services/supabase/supabase.service';
import Utils from '@shared/utils/utils';
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

    return { data: data as iSpace, error: Utils.handleErrorMessage(error) };
  }

  async updateSpace(spaceId: number, name: string, description: string): Promise<{ data: iSpace; error?: string }> {
    const updated_at = new Date().toISOString();
    const { data, error } = await this.supabaseService.client.from('space').update({ name, description, updated_at }).eq('id', spaceId).select().single();

    return { data: data as iSpace, error: Utils.handleErrorMessage(error) };
  }

  async deleteSpace(spaceId: number): Promise<{ error?: string }> {
    const { error } = await this.supabaseService.client.from('space').delete().eq('id', spaceId);
    return { error: Utils.handleErrorMessage(error) };
  }

  async addMembersToSpace(spaceId: number, users: iUser[]): Promise<{ error?: string }> {
    const usersIds = users.map(user => user.id);
    const { error } = await this.supabaseService.client.from('space_membership').insert(usersIds.map(userId => ({ space_id: spaceId, user_id: userId })));
    return { error: Utils.handleErrorMessage(error) };
  }

  async removeMemberFromSpace(spaceId: number, userId: string): Promise<{ error?: string }> {
    const { error } = await this.supabaseService.client.from('space_membership').delete().eq('space_id', spaceId).eq('user_id', userId);
    return { error: Utils.handleErrorMessage(error) };
  }

  async getSpaceMembers(target_space_id: number): Promise<iUser[]> {
    const { data } = await this.supabaseService.client.rpc('get_space_members', { target_space_id });
    return data as iUser[];
  }

  async getMembersToInvite(target_space_id: number, query: string): Promise<iUser[]> {
    const { data } = await this.supabaseService.client.rpc('search_eligible_users_for_space', { target_space_id, query });
    return data as iUser[];
  }

  checkIfCurrentUserIsCreator(space: iSpace): boolean {
    return space.creator_id === this.userId;
  }
}
