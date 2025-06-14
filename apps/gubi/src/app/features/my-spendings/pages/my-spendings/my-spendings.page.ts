import { AuthService } from '@features/auth/services/auth.service';
import { BillApiService } from '@features/bill/services/bill-api.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ExpenseApiService } from '@features/expense/services/expense-api.service';
import { iBill } from '@features/bill/interfaces/bill.interface';
import { iExpense } from '@features/expense/interfaces/expense.interface';
import { iSpace } from '@features/spaces/interfaces/space.interface';
import { Skeleton } from 'primeng/skeleton';
import { SpaceApiService } from '@features/spaces/services/space-api.service';
import { Tag } from 'primeng/tag';

interface iSpendingsCard {
  title: string;
  icon: string;
  content: string;
  details: string;
}

@Component({
  selector: 'app-my-spendings',
  imports: [CommonModule, Skeleton, Tag],
  templateUrl: './my-spendings.page.html',
  styleUrl: './my-spendings.page.scss',
  providers: [CurrencyPipe]
})
export class MySpendingsPage {
  protected billApiService = inject(BillApiService);
  protected expenseApiService = inject(ExpenseApiService);
  protected spaceApiService = inject(SpaceApiService);
  protected authService = inject(AuthService);
  private currencyPipe = inject(CurrencyPipe);

  private userId = this.authService.currentUser()?.id;
  protected isLoading = signal(false);
  protected referenceDate = signal<Date>(this.currentMonth);
  protected bills = signal<iBill[]>([]);
  protected expenses = signal<iExpense[]>([]);
  protected allSpendings = computed<(iBill | iExpense)[]>(() => [...this.bills(), ...this.expenses()]);
  protected cards = computed<iSpendingsCard[]>(() => this.populateCards());

  constructor() {
    this.fetchSpendings();
  }

  private get currentMonth() {
    const today = new Date();
    return new Date(today.getUTCFullYear(), today.getUTCMonth(), 1);
  }

  protected billGuard(bill: iBill | iExpense): bill is iBill {
    return (bill as iBill).space_id !== undefined;
  }

  protected expenseGuard(bill: iBill | iExpense): bill is iExpense {
    return (bill as iExpense).expense_splits !== undefined;
  }

  private async fetchSpendings() {
    this.isLoading.set(true);
    const spaces = await this.spaceApiService.getUserSpaces();
    const [bills, expenses] = await Promise.all([
      this.billApiService.getAllBillsFromSpaceAndDate(null, this.referenceDate()),
      this.expenseApiService.getAllExpensesFromSpaceAndDate(null, this.referenceDate())
    ]);
    this.populateSpaces(bills, expenses, spaces);
    this.bills.set(bills ?? []);
    this.expenses.set(expenses ?? []);
    this.isLoading.set(false);
  }

  populateSpaces(bills: iBill[], expenses: iExpense[], spaces: iSpace[]) {
    const spaceMap: Record<string, iSpace> = {};
    spaces.forEach(space => {
      spaceMap[space.id] = space;
    });

    bills.forEach(bill => {
      bill.space = spaceMap[bill.space_id] || null;
    });

    expenses.forEach(expense => {
      expense.space = spaceMap[expense.space_id] || null;
    });
  }

  userTotalBillValue(bills: iBill[]): number {
    return bills.reduce((sum, b) => sum + (b.value && b.space?.members?.length ? b.value / b.space.members.length : 0), 0);
  }

  userTotalExpenseValue(expenses: iExpense[]): number {
    return expenses.reduce((sum, e) => {
      let userValue = e.value && e.space?.members?.length ? e.value / e.space.members.length : 0;

      if (e.expense_splits) {
        const userSplit = e.expense_splits.find(split => split.user_id === this.userId);
        userValue = userSplit ? userSplit.split_value : 0;
      }

      return sum + userValue;
    }, 0);
  }

  getUserSpending(item: iBill | iExpense): number {
    const value = item.value;
    let userValue = 0;

    if (this.billGuard(item)) {
      const spaceMembersLength = item.space?.members?.length || 1;
      userValue = value ? value / spaceMembersLength : 0;
    } else if (this.expenseGuard(item)) {
      const spaceMembersLength = item.space?.members?.length || 1;
      userValue = value ? value / spaceMembersLength : 0;

      if (item.expense_splits) {
        const userSplit = item.expense_splits.find(split => split.user_id === this.userId);
        userValue = userSplit ? userSplit.split_value : userValue;
      }
    }

    return userValue || 0;
  }

  spaceWithMostSpendings(): { space: iSpace; total: number } {
    const allSpendings = this.allSpendings();
    const spaceTotals: Record<string, { space: iSpace; total: number }> = {};

    allSpendings.forEach(item => {
      const spaceId = item.space?.id || 'desconhecido';
      const spaceMembersLength = item.space?.members?.length || 1;
      let userValue = item.value ? item.value / spaceMembersLength : 0;

      if (!spaceTotals[spaceId]) {
        spaceTotals[spaceId] = { space: item.space, total: 0 };
      }

      if ('expense_splits' in item && item.expense_splits) {
        const userSplit = item.expense_splits.find(split => split.user_id === this.userId);
        userValue = userSplit ? userSplit.split_value : userValue;
      }

      spaceTotals[spaceId].total += userValue || 0;
    });

    return Object.values(spaceTotals).sort((a, b) => b.total - a.total)[0] || { space: null, total: 0 };
  }

  populateCards() {
    const bills = this.bills();
    const expenses = this.expenses();
    const totalBills = this.userTotalBillValue(bills);
    const totalExpenses = this.userTotalExpenseValue(expenses);
    const total = totalBills + totalExpenses;
    const topSpace = this.spaceWithMostSpendings();

    return [
      {
        title: 'Total',
        icon: 'pi pi-dollar',
        content: this.currencyPipe.transform(total, 'BRL') ?? '-',
        details: `${expenses.length} despesas + ${bills.length} contas`
      },
      {
        title: 'Despesas',
        icon: 'pi pi-wallet',
        content: this.currencyPipe.transform(totalExpenses, 'BRL') ?? '-',
        details: `${expenses.length} despesas registradas`
      },
      {
        title: 'Contas',
        icon: 'pi pi-money-bill',
        content: this.currencyPipe.transform(totalBills, 'BRL') ?? '-',
        details: `${bills.length} contas registradas`
      },
      {
        title: 'Espaço com mais gastos',
        icon: 'pi pi-chart-line',
        content: topSpace.space.name,
        details: this.currencyPipe.transform(topSpace.total, 'BRL') ?? '-'
      }
    ];
  }

  protected isNaN(value: string): boolean {
    return isNaN(Number(value)) || value === null || value === undefined;
  }
}
