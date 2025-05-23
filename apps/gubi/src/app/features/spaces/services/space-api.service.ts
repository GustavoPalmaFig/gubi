import { AuthService } from '@features/auth/services/auth.service';
import { inject, Injectable } from '@angular/core';
import { iUser } from '@features/auth/interfaces/user.interface';
import { SupabaseService } from '@shared/services/supabase/supabase.service';
import Utils from '@shared/utils/utils';
import { iSpace } from '../interfaces/space.interface';
import { iSpaceMember } from '../interfaces/space_member.interface';

@Injectable({
  providedIn: 'root'
})
export class SpaceApiService {
  protected authService = inject(AuthService);
  private supabaseService = inject(SupabaseService);
  public userId = this.authService.currentUser()?.id;

  async getUserSpaces(): Promise<iSpace[]> {
    const { data } = await this.supabaseService.client.from('space').select('*');
    return data as iSpace[];
  }

  async getSpaceById(spaceId: number): Promise<iSpace | null> {
    const { data } = await this.supabaseService.client.from('space').select('*').eq('id', spaceId).single();
    return data as iSpace | null;
  }

  async createSpace(name: string, description: string): Promise<{ data: iSpace; error?: string }> {
    const { data, error } = await this.supabaseService.client.from('space').insert([{ name, description }]).select().single();
    return { data: data as iSpace, error: Utils.handleErrorMessage(error) };
  }

  async updateSpace(spaceId: number, name: string, description: string): Promise<{ data: iSpace; error?: string }> {
    const { data, error } = await this.supabaseService.client.from('space').update({ name, description }).eq('id', spaceId).select().single();
    return { data: data as iSpace, error: Utils.handleErrorMessage(error) };
  }

  async deleteSpace(spaceId: number): Promise<{ error?: string }> {
    const { error } = await this.supabaseService.client.from('space').delete().eq('id', spaceId);
    return { error: Utils.handleErrorMessage(error) };
  }

  async addMembersToSpace(spaceId: number, users: iUser[]): Promise<{ error?: string }> {
    const space_members = users.map(({ id }) => ({ space_id: spaceId, user_id: id }));
    const { error } = await this.supabaseService.client.from('space_members').insert(space_members);
    return { error: Utils.handleErrorMessage(error) };
  }

  async removeMemberFromSpace(space_id: number, user_id: string): Promise<{ error?: string }> {
    const { error } = await this.supabaseService.client.from('space_members').delete().match({ space_id, user_id });
    return { error: Utils.handleErrorMessage(error) };
  }

  async getSpaceMembers(target_space_id: number): Promise<iSpaceMember[]> {
    const { data } = await this.supabaseService.client.rpc('get_space_members', { target_space_id });
    return data as iSpaceMember[];
  }

  async getMembersToInvite(target_space_id: number, query: string): Promise<iUser[]> {
    const { data } = await this.supabaseService.client.rpc('search_eligible_users_for_space', { target_space_id, query });
    return data as iUser[];
  }
}
