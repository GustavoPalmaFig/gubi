import { iExpense } from './expense.interface';

export interface iExpenseView extends iExpense {
  payment_method_name?: string;
  payment_method_owner_id?: string;
  payment_method_owner_fullname?: string;
}
