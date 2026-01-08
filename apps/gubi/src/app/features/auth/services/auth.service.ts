import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '@shared/services/supabase/supabase.service';
import Utils from '@shared/utils/utils';
import { iUser } from '../interfaces/user.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
  public currentUser = signal<iUser | null>(null);

  private supabase = inject(SupabaseService).client;
  private router = inject(Router);

  constructor() {
    this.restoreUserFromStorage();
    this.initializeAuthListener();
  }

  private restoreUserFromStorage(): void {
    const raw = localStorage.getItem('currentUser');
    if (raw) this.currentUser.set(JSON.parse(raw));
  }

  private initializeAuthListener(): void {
    this.supabase.auth.onAuthStateChange(async (_event, session) => {
      const userId = session?.user?.id;
      const hasUser = !!this.currentUser();

      if (userId && !hasUser) {
        await this.fetchAndStoreUser(userId);
        this.router.navigate(['']);
      } else if (!userId && hasUser) {
        this.clearUser();
        this.router.navigate(['auth/login']);
      } else if (userId && hasUser) {
        await this.fetchAndStoreUser(userId);
      }
    });
  }

  public async fetchAndStoreUser(userId: string) {
    const { data } = await this.supabase.from('user').select('*').eq('id', userId).single();
    if (data) this.setUser(data);
  }

  private setUser(user: iUser): void {
    this.currentUser.set(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  private clearUser(): void {
    this.currentUser.set(null);
    localStorage.removeItem('currentUser');
  }

  async login(email: string, password: string): Promise<{ error?: string }> {
    const { error } = await this.supabase.auth.signInWithPassword({ email, password });
    return { error: Utils.handleErrorMessage(error) };
  }

  async register(name: string, email: string, password: string): Promise<{ error?: string }> {
    if (await this.isEmailTaken(email)) {
      return { error: 'Este e-mail já está cadastrado' };
    }

    const { error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });

    return { error: Utils.handleErrorMessage(error) };
  }

  private async isEmailTaken(email: string): Promise<boolean> {
    const { data } = await this.supabase.rpc('email_registered', { email_address: email });
    return data;
  }

  async signInWithGoogle(): Promise<{ error?: string }> {
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/spaces` }
    });

    return { error: Utils.handleErrorMessage(error) };
  }

  async logout() {
    await this.supabase.auth.signOut();
    this.clearUser();
    this.router.navigate(['auth/login']);
  }
}
