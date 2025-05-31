import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '@shared/services/supabase/supabase.service';
import Utils from '@shared/utils/utils';
import { iExpense } from '../interfaces/expense.interface';
import { iExpenseSplit } from '../interfaces/expense_split.interface';

@Injectable({
  providedIn: 'root'
})
export class ExpenseApiService {
  private supabaseService = inject(SupabaseService);

  async getAllExpensesFromSpaceAndDate(target_space_id: number, target_reference_period: Date): Promise<iExpense[]> {
    const { data } = await this.supabaseService.client.rpc('get_expenses_with_details', { target_space_id, target_reference_period });
    return data as iExpense[];
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

  async createExpenseSplit(expense_id: number, expense_splits: iExpenseSplit[]): Promise<{ error?: string }> {
    const split_data = expense_splits.map(({ user, ...split }) => split);
    await this.supabaseService.client.from('expense_split').delete().eq('expense_id', expense_id);
    const { error } = await this.supabaseService.client.from('expense_split').insert(split_data);
    return { error: Utils.handleErrorMessage(error) };
  }
}
