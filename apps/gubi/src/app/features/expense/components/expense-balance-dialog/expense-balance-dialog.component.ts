import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, Input, input, signal } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { iExpense } from '@features/expense/interfaces/expense.interface';
import { iUser } from '@features/auth/interfaces/user.interface';
import { TableModule } from 'primeng/table';
import Utils from '@shared/utils/utils';

interface Debt {
  from: iUser;
  to?: iUser;
  value: number;
  percentage?: number;
}

interface ExpenseReport {
  expense: iExpense;
  splitDetails: Debt[];
  debt: Debt[];
}

@Component({
  selector: 'app-expense-balance-dialog',
  imports: [CommonModule, DialogModule, ButtonModule, TableModule],
  templateUrl: './expense-balance-dialog.component.html',
  styleUrl: './expense-balance-dialog.component.scss'
})
export class ExpenseBalanceDialogComponent {
  @Input() isOpen = signal(false);
  @Input() expenses = signal<iExpense[]>([]);
  spaceUsers = input.required<iUser[]>();

  protected abbreviatedName = Utils.getAbbreviatedName;

  protected expensesReport: ExpenseReport[] = [];
  protected accumulatedSplitedValue: Debt[] = [];
  protected accumulatedDebt: Debt[] = [];
  protected finalDebt: Debt[] = [];

  protected accumulatedValue = computed<number>(() => {
    return this.expenses().reduce((acc, expense) => acc + (expense.value || 0), 0);
  });

  constructor() {
    effect(() => {
      if (this.isOpen() && this.expenses()) {
        this.generateReport();
      }
    });
  }

  private filterExpenses() {
    return this.expenses().filter(expense => expense.value && expense.value > 0 && expense.payment_method);
  }

  protected close(): void {
    this.isOpen.set(false);
  }

  private generateReport() {
    this.expensesReport = [];
    this.accumulatedSplitedValue = [];
    this.accumulatedDebt = [];
    this.finalDebt = [];

    const expenses = this.filterExpenses();

    expenses.forEach(expense => {
      const splitDetails = this.getsplitDetails(expense);
      const debt = this.calculateDebt(expense);
      this.expensesReport.push({
        expense,
        splitDetails,
        debt
      });
    });

    this.accumulateSplit(this.expensesReport);
    this.accumulateDebt(this.expensesReport);
    this.calculateFinalDebt();
  }

  private getsplitDetails(expense: iExpense): Debt[] {
    const totalValue = expense.value || 0;
    const membersCount = this.spaceUsers().length;

    return expense.expense_splits
      ? expense.expense_splits.map(split => {
          return {
            from: split.user,
            value: split.split_value,
            percentage: this.getPercentage(expense.value, split.split_value)
          };
        })
      : this.spaceUsers().map(user => ({
          from: user,
          value: +(totalValue / membersCount).toFixed(2),
          percentage: this.getPercentage(expense.value, +(totalValue / membersCount))
        }));
  }

  private getPercentage(total: number | undefined, value: number): number {
    if (!total || total <= 0) {
      return 0;
    }
    const totalExpense = total || 0;
    const percentage = Math.abs(value / totalExpense) * 100;
    return +percentage.toFixed(0);
  }

  private calculateDebt(expense: iExpense): Debt[] {
    const totalValue = expense.value || 0;
    const users = this.spaceUsers();
    const payer = expense.payment_method?.owner;
    const debtors: Debt[] = [];

    if (expense.expense_splits) {
      expense.expense_splits.forEach(split => {
        if (split.user_id !== payer.id) {
          const value = split.split_value;
          debtors.push({ from: split.user, to: payer, value });
        }
      });
    } else {
      const value = +(totalValue / users.length).toFixed(2);
      users.forEach(user => {
        if (user.id !== payer.id) {
          debtors.push({ from: user, to: payer, value });
        }
      });
    }

    return debtors;
  }

  private accumulateSplit(list: ExpenseReport[]) {
    list.forEach(record => {
      record.splitDetails.forEach(split => {
        const existingSplit = this.accumulatedSplitedValue.find(s => s.from.id === split.from.id);
        if (existingSplit) {
          existingSplit.value += +split.value.toFixed(2);
        } else {
          this.accumulatedSplitedValue.push({ ...split });
        }
      });
    });
  }

  private accumulateDebt(list: ExpenseReport[]) {
    list.forEach(record => {
      record.debt.forEach(debt => {
        const existingDebt = this.accumulatedDebt.find(d => d.from.id === debt.from.id && d.to?.id === debt.to?.id);
        if (existingDebt) {
          existingDebt.value += +debt.value.toFixed(2);
        } else {
          this.accumulatedDebt.push({ ...debt });
        }
      });
    });
  }

  private calculateFinalDebt() {
    const accumulatedDebt = this.accumulatedDebt.map(debt => ({ ...debt }));
    const minDebt = accumulatedDebt.reduce((min, debt) => {
      return debt.value < min.value ? debt : min;
    }, accumulatedDebt[0]);

    accumulatedDebt.forEach(debt => {
      if (debt.from != minDebt.from) {
        debt.value = +(debt.value - minDebt.value).toFixed(2);
        this.finalDebt.push({ ...debt, to: minDebt.from });
      }
    });
  }
}
