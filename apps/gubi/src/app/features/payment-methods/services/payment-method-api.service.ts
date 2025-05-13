import { AuthService } from '@features/auth/services/auth.service';
import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '@shared/services/supabase/supabase.service';
import Utils from '@shared/utils/utils';
import { iPaymentMethod } from '../interfaces/payment-method';

@Injectable({
  providedIn: 'root'
})
export class PaymentMethodApiService {
  protected authService = inject(AuthService);
  private supabaseService = inject(SupabaseService);
  public userId = this.authService.currentUser()?.id;

  async getUserPaymentMethods(): Promise<iPaymentMethod[]> {
    const { data } = await this.supabaseService.client.from('payment_method').select('*').eq('owner_id', this.userId);
    return data as iPaymentMethod[];
  }

  async getAvailablePaymentMethods(): Promise<iPaymentMethod[]> {
    const { data } = await this.supabaseService.client.from('payment_method').select('*');
    return data as iPaymentMethod[];
  }

  async getPaymentMethodsWithExpenses(target_space_id: number, target_reference_month: Date): Promise<iPaymentMethod[]> {
    const { data } = await this.supabaseService.client.rpc('get_payment_methods_with_expenses', {
      target_space_id,
      target_reference_month
    });
    return data as iPaymentMethod[];
  }

  async getPaymentMethodById(paymentMethodId: number): Promise<iPaymentMethod | null> {
    const { data } = await this.supabaseService.client.from('payment_method').select('*').eq('id', paymentMethodId).single();
    return data as iPaymentMethod | null;
  }

  async createPaymentMethod(name: string, split_by_default: boolean): Promise<{ data: iPaymentMethod; error?: string }> {
    const { data, error } = await this.supabaseService.client.from('payment_method').insert([{ name, split_by_default }]).select().single();
    return { data: data as iPaymentMethod, error: Utils.handleErrorMessage(error) };
  }

  async updatePaymentMethod(paymentMethodId: number, name: string, split_by_default: string): Promise<{ data: iPaymentMethod; error?: string }> {
    const { data, error } = await this.supabaseService.client.from('payment_method').update({ name, split_by_default }).eq('id', paymentMethodId).select().single();
    return { data: data as iPaymentMethod, error: Utils.handleErrorMessage(error) };
  }

  async deletePaymentMethod(paymentMethodId: number): Promise<{ error?: string }> {
    const { error } = await this.supabaseService.client.from('payment_method').delete().eq('id', paymentMethodId);
    return { error: Utils.handleErrorMessage(error) };
  }
}
