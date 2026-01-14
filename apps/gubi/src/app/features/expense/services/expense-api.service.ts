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

  async getAllExpensesFromSpaceAndDate(target_space_id: number | null, target_reference_period: Date): Promise<iExpense[]> {
    const { data } = await this.supabaseService.client.rpc('get_expenses_with_details', { target_space_id, target_reference_period });
    return data as iExpense[];
  }

  async getAllExpensesPaginated(page_number: number, page_size: number): Promise<{ expenses: iExpense[]; totalCount: number; totalPages?: number }> {
    const { data } = await this.supabaseService.client.rpc('get_all_expenses_with_details_paginated', { page_number, page_size });
    const total = data?.[0]?.total_count ?? 0;
    const totalPages = Math.ceil(total / 20);
    return { expenses: data as iExpense[], totalCount: total, totalPages };
  }

  async getExpenseById(expenseId: number): Promise<iExpense | null> {
    const { data } = await this.supabaseService.client.from('expense').select('*').eq('id', expenseId).single();
    return data as iExpense | null;
  }

  async createExpense(expense: iExpense): Promise<{ data: iExpense; error?: string }> {
    const isRecurring = expense.is_recurring;
    const isInstallments = expense.recurring_type === 'installments';

    if (isRecurring && isInstallments) {
      const totalInstallments = expense.recurring_end_installments || 2;
      const title = `${expense.title} (1/${totalInstallments})`;
      expense = { ...expense, title, recurring_current_installment: 1 };
    }

    const { data, error } = await this.supabaseService.client.from('expense').insert(expense).select().single();
    if (error || !data) return { data: {} as iExpense, error: Utils.handleErrorMessage(error) };

    const parentExpense = data as iExpense;
    if (isRecurring) {
      const recurringResponse = await this.createRecurringExpenses(parentExpense);
      if (recurringResponse.error) {
        return { data, error: recurringResponse.error };
      }
    }
    return { data: parentExpense, error: Utils.handleErrorMessage(error) };
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
    const { data: recurringExpenses } = await this.supabaseService.client.from('expense').select('id').eq('recurring_parent_id', expense_id);

    const expenseIdsToDelete = [expense_id];
    if (recurringExpenses && recurringExpenses.length > 0) {
      expenseIdsToDelete.push(...recurringExpenses.map(e => e.id));
    }

    const splitToInsert: Omit<iExpenseSplit, 'user'>[] = [];
    for (const { user, ...split } of expense_splits) {
      splitToInsert.push({ ...split, expense_id });
    }

    if (recurringExpenses && recurringExpenses.length > 0) {
      for (const recurringExpense of recurringExpenses) {
        for (const { user, ...split } of expense_splits) {
          splitToInsert.push({ ...split, expense_id: recurringExpense.id });
        }
      }
    }

    await this.supabaseService.client.from('expense_split').delete().in('expense_id', expenseIdsToDelete);
    const { error } = await this.supabaseService.client.from('expense_split').insert(splitToInsert);
    return { error: Utils.handleErrorMessage(error) };
  }

  async getTotalExpenseValueFromSpaceAndDate(target_space_id: number, target_reference_period: Date): Promise<number> {
    const { data } = await this.supabaseService.client.rpc('get_total_expense_by_month', { target_space_id, target_reference_period });
    return data ? parseFloat(data.toFixed(2)) : 0;
  }

  private async createRecurringExpenses(parentExpense: iExpense): Promise<{ error?: string }> {
    if (!parentExpense.reference_period) {
      return { error: 'Missing reference_period on parent expense' };
    }

    const bulkExpenses: iExpense[] = [];
    let currentDate = Utils.toLocalMidnight(parentExpense.reference_period);

    if (parentExpense.recurring_type === 'date') {
      if (!parentExpense.recurring_end_date) {
        return { error: 'recurring_end_date is required for type "date"' };
      }

      const endDate = Utils.toLocalMidnight(parentExpense.recurring_end_date);

      while (currentDate < endDate) {
        currentDate = Utils.adjustDateByMonths(currentDate, 1);
        if (currentDate > endDate) break;

        bulkExpenses.push({
          ...parentExpense,
          reference_period: currentDate,
          recurring_parent_id: parentExpense.id
        });
      }
    } else {
      if (!parentExpense.recurring_end_installments || parentExpense.recurring_end_installments < 2) {
        return { error: 'recurring_end_installments must be >= 2 for type "installments"' };
      }

      const totalInstallments = parentExpense.recurring_end_installments;
      const mainTitle = parentExpense.title.replace(` (1/${totalInstallments})`, '');

      for (let installment = 2; installment <= totalInstallments; installment++) {
        const period = new Date(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 1);
        currentDate = Utils.adjustDateByMonths(period, 1);
        const title = `${mainTitle} (${installment}/${totalInstallments})`;

        bulkExpenses.push({
          ...parentExpense,
          title,
          reference_period: currentDate,
          recurring_current_installment: installment,
          recurring_parent_id: parentExpense.id
        });
      }
    }

    const expenses = bulkExpenses.map(expense => {
      const { id, ...rest } = expense;
      return rest;
    });

    const { error } = await this.supabaseService.client.from('expense').insert(expenses);
    return { error: Utils.handleErrorMessage(error) };
  }
}
