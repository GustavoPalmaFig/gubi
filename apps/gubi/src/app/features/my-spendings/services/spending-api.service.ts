import { iBill } from '@features/bill/interfaces/bill.interface';
import { iExpense } from '@features/expense/interfaces/expense.interface';
import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '@shared/services/supabase/supabase.service';

export type iSpending = iBill | iExpense;

@Injectable({
  providedIn: 'root'
})
export class SpendingApiService {
  private supabaseService = inject(SupabaseService);

  async getAllSpendingsPaginated(page_number: number, page_size: number): Promise<{ spendings: iSpending[]; totalCount: number; totalPages?: number }> {
    const { data } = await this.supabaseService.client.rpc('get_all_spendings_paginated', { page_number, page_size });
    return data;
  }
}
