import { iBill } from '@features/bill/interfaces/bill.interface';
import { iExpense } from '@features/expense/interfaces/expense.interface';

export default class MySpendingUtils {
  static billGuard(bill: iBill | iExpense): bill is iBill {
    return 'payer_id' in bill;
  }

  static expenseGuard(expense: iBill | iExpense): expense is iExpense {
    return 'payment_method_id' in expense;
  }
}
