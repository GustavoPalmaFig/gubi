import { supabase } from '@/services/supabase.service';
import type { Bill } from '../types/bill';

export const createBill = async (p_bill: Bill): Promise<number> => {
  const { data, error } = await supabase.rpc('create_bill', { p_bill });

  if (error) throw error;

  return data;
};

export const updateBill = async (p_bill: Bill): Promise<void> => {
  const { error } = await supabase.rpc('update_bill', { p_bill });

  if (error) throw error;
};

export const deleteBill = async (id: number): Promise<void> => {
  const { error } = await supabase.from('bill').delete().eq('id', id);

  if (error) throw error;
};

export const fetchBillsBySpace = async (spaceId: number): Promise<Bill[]> => {
  const { data, error } = await supabase.from('bill').select('*').eq('space_id', spaceId);

  if (error) throw error;

  return data;
};

export const fetchBillFormById = async (id: number): Promise<Bill> => {
  const { data, error } = await supabase.rpc('get_bill_form', { p_bill_id: id });

  if (error) throw error;

  return data;
};
