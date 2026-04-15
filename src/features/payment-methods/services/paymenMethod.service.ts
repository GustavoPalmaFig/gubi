import { supabase } from '@/services/supabase.service';
import type { PaymentMethodFormData } from '../types/paymentMethodFormData';
import type { PaymentMethodOverview } from '../types/paymentMethodOverview';

export const createPaymentMethod = async (paymentMethod: PaymentMethodFormData): Promise<void> => {
  const { error } = await supabase.from('payment_method').insert(paymentMethod);

  if (error) throw error;
};

export const updatePaymentMethod = async (paymentMethod: PaymentMethodFormData): Promise<void> => {
  const { error } = await supabase
    .from('payment_method')
    .update(paymentMethod)
    .eq('id', paymentMethod.id);

  if (error) throw error;
};

export const deletePaymentMethod = async (id: number): Promise<void> => {
  const { error } = await supabase.from('payment_method').delete().eq('id', id);

  if (error) throw error;
};

export const fetchPaymentMethodOverview = async (): Promise<PaymentMethodOverview> => {
  const { data, error } = await supabase.rpc('get_payment_methods_page_data');

  if (error) throw error;

  return data;
};
