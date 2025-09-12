import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '@shared/services/supabase/supabase.service';
import Utils from '@shared/utils/utils';
import { iBill } from '../interfaces/bill.interface';
import { iBillSplit } from '../interfaces/bill_split.interface';

@Injectable({
  providedIn: 'root'
})
export class BillApiService {
  private supabaseService = inject(SupabaseService);

  async getAllBillsFromSpaceAndDate(target_space_id: number | null, target_reference_period: Date): Promise<iBill[]> {
    const { data } = await this.supabaseService.client.rpc('get_bills_with_details', { target_space_id, target_reference_period });
    return data as iBill[];
  }

  async getBillById(billId: number): Promise<iBill | null> {
    const { data } = await this.supabaseService.client.from('bill').select('*').eq('id', billId).single();
    return data as iBill | null;
  }

  async createBill(bill: iBill): Promise<{ data: iBill; error?: string }> {
    const { data, error } = await this.supabaseService.client.from('bill').insert([bill]).select().single();
    return { data: data as iBill, error: Utils.handleErrorMessage(error) };
  }

  async bulkCreateBills(bills: iBill[]): Promise<{ error?: string }> {
    const formatedBills = bills.map(bill => ({
      space_id: bill.space_id,
      name: bill.name,
      value: bill.value,
      deadline: bill.deadline ? Utils.adjustDateByMonths(bill.deadline, 1) : null,
      reference_period: Utils.adjustDateByMonths(bill.reference_period, 1)
    }));

    const { data, error } = await this.supabaseService.client.from('bill').insert(formatedBills).select();
    if (error) return { error: Utils.handleErrorMessage(error) };

    const billsSplit = bills.filter(bill => bill.force_split);
    if (billsSplit && data) await this.handleBillSplitsAfterBulkCreate(bills, data);

    return { error: Utils.handleErrorMessage(error) };
  }

  async handleBillSplitsAfterBulkCreate(originalBills: iBill[], createdBills: iBill[]) {
    const splitsToCreate = originalBills.flatMap(originalBill => {
      const createdBill = createdBills.find(bill => bill.name === originalBill.name && bill.value === originalBill.value);
      if (!createdBill || !originalBill.bill_splits) return [];

      return originalBill.bill_splits.map(({ user, ...split }) => ({
        ...split,
        bill_id: createdBill.id
      }));
    });

    if (splitsToCreate.length > 0) {
      await this.supabaseService.client.from('bill_split').insert(splitsToCreate);
    }
  }

  async updateBill(bill: iBill): Promise<{ data: iBill; error?: string }> {
    const { data, error } = await this.supabaseService.client.from('bill').update(bill).eq('id', bill.id).select().single();
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

  async createBillSplit(bill_id: number, bill_splits: iBillSplit[]): Promise<{ error?: string }> {
    const split_data = bill_splits.map(({ user, ...split }) => split);
    await this.supabaseService.client.from('bill_split').delete().eq('bill_id', bill_id);
    const { error } = await this.supabaseService.client.from('bill_split').insert(split_data);
    return { error: Utils.handleErrorMessage(error) };
  }
}
