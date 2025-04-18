import { inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from '@shared/services/supabase/supabase.service';
import { User } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public currentUser = signal<User | null>(null);

  private supabaseService = inject(SupabaseService);

  constructor() {
    this.supabaseService.client.auth.onAuthStateChange((event, session) => {
      if (session) {
        this.currentUser.set(session.user);
      } else {
        this.currentUser.set(null);
      }
    });

    this.loadUser();
  }

  async loadUser() {
    const { data } = await this.supabaseService.client.auth.getSession();
    if (data.session) {
      this.currentUser.set(data.session.user);
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabaseService.client.auth.signInWithPassword({ email, password });

      if (error) throw error.message;
      return { success: true };
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : (error as any).message;
      return { success: false, error: errorMessage };
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
      const errorMessage = typeof error === 'string' ? error : (error as any).message;
      return { success: false, error: errorMessage };
    }
  }

  async checkEmail(email: string): Promise<boolean> {
    const { data } = await this.supabaseService.client.rpc('email_registered', { email_address: email });
    return data;
  }
}
