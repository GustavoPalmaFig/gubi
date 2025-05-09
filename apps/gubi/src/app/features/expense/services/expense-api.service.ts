import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '@shared/services/supabase/supabase.service';
import Utils from '@shared/utils/utils';
import { iExpense } from '../interfaces/expense.interface';
import { iExpenseView } from '../interfaces/expenseView.interface';

@Injectable({
  providedIn: 'root'
})
export class ExpenseApiService {
  private supabaseService = inject(SupabaseService);

  async getAllExpensesFromSpaceAndDate(spaceId: number, referenceDate: Date): Promise<iExpenseView[]> {
    const { data } = await this.supabaseService.client
      .from('expense_with_details')
      .select('*')
      .eq('space_id', spaceId)
      .eq('reference_period', Utils.formatToDateOnly(referenceDate))
      .order('date', { ascending: true });
    return data as iExpenseView[];
  }

  async getExpenseById(expenseId: number): Promise<iExpense | null> {
    const { data } = await this.supabaseService.client.from('expense').select('*').eq('id', expenseId).single();
    return data as iExpense | null;
  }

  async createExpense(expense: iExpense): Promise<{ data: iExpense; error?: string }> {
    const { data, error } = await this.supabaseService.client.from('expense').insert([expense]).select().single();
    return { data: data as iExpense, error: Utils.handleErrorMessage(error) };
  }

  async updateExpense(expense: iExpense): Promise<{ data: iExpense; error?: string }> {
    const { data, error } = await this.supabaseService.client.from('expense').update(expense).eq('id', expense.id).select().single();
    return { data: data as iExpense, error: Utils.handleErrorMessage(error) };
  }

  async deleteExpense(expenseId: number): Promise<{ error?: string }> {
    const { error } = await this.supabaseService.client.from('expense').delete().eq('id', expenseId);
    return { error: Utils.handleErrorMessage(error) };
  }
}
