import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '@shared/services/supabase/supabase.service';
import { User } from '@supabase/supabase-js';
import Utils from '@shared/utils/utils';
import { iUser } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public currentUser = signal<iUser | null>(null);

  private supabaseService = inject(SupabaseService);
  private router = inject(Router);

  constructor() {
    this.supabaseService.client.auth.onAuthStateChange((event, session) => {
      if (session) {
        const user = this.buildUser(session.user);
        this.currentUser.set(user);
      } else {
        this.currentUser.set(null);
        this.router.navigate(['auth/login']);
      }
    });

    this.loadUser();
  }

  async loadUser() {
    const { data } = await this.supabaseService.client.auth.getUser();
    if (data) {
      const user = this.buildUser(data.user);
      this.currentUser.set(user);
    }
  }

  buildUser(user: User | null): iUser | null {
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email as string,
      fullname: user.user_metadata?.['name'],
      avatar_url: user.user_metadata?.['picture'],
      updated_at: user.updated_at ? new Date(user.updated_at) : undefined
    };
  }

  async login(email: string, password: string): Promise<{ error?: string }> {
    const { error } = await this.supabaseService.client.auth.signInWithPassword({ email, password });
    return { error: Utils.handleErrorMessage(error) };
  }

  async register(name: string, email: string, password: string): Promise<{ error?: string }> {
    const isEmailRegistered = await this.checkEmail(email);

    if (isEmailRegistered) {
      return { error: 'Este e-mail já está cadastrado' };
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

    return { error: Utils.handleErrorMessage(error) };
  }

  async checkEmail(email: string): Promise<boolean> {
    const { data } = await this.supabaseService.client.rpc('email_registered', { email_address: email });
    return data;
  }

  async signInWithGoogle(): Promise<{ error?: string }> {
    const { error } = await this.supabaseService.client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/spaces`
      }
    });

    return { error: Utils.handleErrorMessage(error) };
  }

  async logout() {
    await this.supabaseService.client.auth.signOut();
  }
}
