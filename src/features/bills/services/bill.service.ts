import { supabase } from '@/services/supabase.service';
import type { Bill } from '../types/bill';
import type { BillFile } from '../types/billFile';

export const saveBill = async ({
  bill,
  removed_files = []
}: {
  bill: Bill;
  removed_files: BillFile[];
}): Promise<void> => {
  const { error } = await supabase.functions.invoke('save-bill', {
    body: { bill, removed_files }
  });

  if (error) throw error;
};

export const deleteBill = async (id: number): Promise<void> => {
  const { error } = await supabase.from('bill').delete().eq('id', id);

  if (error) throw error;
};

export const fetchBillsBySpace = async (
  p_space_id: number,
  p_reference_period: string
): Promise<Bill[]> => {
  const { data, error } = await supabase.rpc('get_bills_tab_data', {
    p_space_id,
    p_reference_period
  });

  if (error) throw error;

  return data;
};

export const fetchBillFormById = async (id: number): Promise<Bill> => {
  const { data, error } = await supabase.rpc('get_bill_form', { p_bill_id: id });

  if (error) throw error;

  return data;
};
