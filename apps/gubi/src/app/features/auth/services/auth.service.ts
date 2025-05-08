import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '@shared/services/supabase/supabase.service';
import { User } from '@supabase/supabase-js';
import Utils from '@shared/utils/utils';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public currentUser = signal<User | null>(null);

  private supabaseService = inject(SupabaseService);
  private router = inject(Router);

  constructor() {
    this.supabaseService.client.auth.onAuthStateChange((event, session) => {
      if (session) {
        this.currentUser.set(session.user);
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
      this.currentUser.set(data.user);
    }
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

  async logout() {
    await this.supabaseService.client.auth.signOut();
  }

  get userFirstName() {
    const userName = this.currentUser()?.user_metadata?.['name'];
    return userName.split(' ')[0] || userName;
  }
}
