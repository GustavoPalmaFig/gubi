import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '@shared/services/supabase/supabase.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabaseService = inject(SupabaseService);

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabaseService.client.auth.signInWithPassword({ email, password });

      if (error) throw error.message;
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as any).message };
    }
  }

  async register(name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const isEmailRegistered = await this.checkEmail(email);

      if (isEmailRegistered) {
        return { success: false, error: 'Este e-mail já está cadastrado' };
      }

      const { error } = await this.supabaseService.client.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });

      if (error) throw error.message;
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as any).message };
    }
  }

  async checkEmail(email: string): Promise<boolean> {
    const { data } = await this.supabaseService.client.rpc('email_registered', { email_address: email });
    return data;
  }
}
