import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '@shared/services/supabase/supabase.service';
import Utils from '@shared/utils/utils';
import { iBill } from '../interfaces/bill.interface';
import { iBillView } from '../interfaces/billView.interface';

@Injectable({
  providedIn: 'root'
})
export class BillApiService {
  private supabaseService = inject(SupabaseService);

  async getAllBillsFromSpaceAndDate(spaceId: number, referenceDate: Date): Promise<iBillView[]> {
    const formattedDate = referenceDate.toISOString().slice(0, 10);
    const { data } = await this.supabaseService.client
      .from('bill_with_details')
      .select('*')
      .eq('space_id', spaceId)
      .eq('reference_period', formattedDate)
      .order('deadline', { ascending: true });
    return data as iBillView[];
  }

  async getBillById(billId: number): Promise<iBill | null> {
    const { data } = await this.supabaseService.client.from('bill').select('*').eq('id', billId).single();
    return data as iBill | null;
  }

  async createBill(bill: iBill): Promise<{ data: iBill; error?: string }> {
    const { data, error } = await this.supabaseService.client.from('bill').insert([bill]).select().single();
    return { data: data as iBill, error: Utils.handleErrorMessage(error) };
  }

  async updateBill(billId: number, bill: iBill): Promise<{ data: iBill; error?: string }> {
    const { data, error } = await this.supabaseService.client.from('bill').update(bill).eq('id', billId).select().single();
    return { data: data as iBill, error: Utils.handleErrorMessage(error) };
  }

  async updateBillValue(billId: number, value: number): Promise<{ error?: string }> {
    const { error } = await this.supabaseService.client.from('bill').update({ value }).eq('id', billId).select().single();
    return { error: Utils.handleErrorMessage(error) };
  }

  async markBillAsPaid(target_bill_id: number): Promise<{ error?: string }> {
    const { error } = await this.supabaseService.client.rpc('mark_bill_as_paid', { target_bill_id });
    return { error: Utils.handleErrorMessage(error) };
  }

  async deleteBill(billId: number): Promise<{ error?: string }> {
    const { error } = await this.supabaseService.client.from('bill').delete().eq('id', billId);
    return { error: Utils.handleErrorMessage(error) };
  }
}
