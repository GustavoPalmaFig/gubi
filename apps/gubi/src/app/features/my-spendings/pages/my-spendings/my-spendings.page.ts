import { AuthService } from '@features/auth/services/auth.service';
import { BillApiService } from '@features/bill/services/bill-api.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, computed, effect, inject, signal, ViewChild } from '@angular/core';
import { ExpenseApiService } from '@features/expense/services/expense-api.service';
import { ExpenseDetailsDialogComponent } from '@features/expense/components/expense-details-dialog/expense-details-dialog.component';
import { FormsModule } from '@angular/forms';
import { iBill } from '@features/bill/interfaces/bill.interface';
import { iExpense } from '@features/expense/interfaces/expense.interface';
import { iSpace } from '@features/spaces/interfaces/space.interface';
import { MySpendingsFiltersComponent } from '@features/my-spendings/components/my-spendings-filters/my-spendings-filters.component';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { Router } from '@angular/router';
import { Skeleton } from 'primeng/skeleton';
import { SpaceApiService } from '@features/spaces/services/space-api.service';
import { Tag } from 'primeng/tag';
import { UserAvatarComponent } from '@shared/components/user-avatar/user-avatar.component';
import MyExpendingUtils from '@features/my-spendings/utils/utils';
import Utils from '@shared/utils/utils';

interface iSpendingsCard {
  title: string;
  icon: string;
  content: string;
  details: string;
  onClick: () => void;
}

interface iTypeTag {
  value: number;
  label: string;
  isSelected: boolean;
}

@Component({
  selector: 'app-my-spendings',
  imports: [CommonModule, Skeleton, Tag, FormsModule, MySpendingsFiltersComponent, Paginator, ExpenseDetailsDialogComponent, UserAvatarComponent],
  templateUrl: './my-spendings.page.html',
  styleUrl: './my-spendings.page.scss',
  providers: [CurrencyPipe]
})
export class MySpendingsPage {
  @ViewChild(MySpendingsFiltersComponent) filtersComponent!: MySpendingsFiltersComponent;

  protected billApiService = inject(BillApiService);
  protected expenseApiService = inject(ExpenseApiService);
  protected spaceApiService = inject(SpaceApiService);
  protected authService = inject(AuthService);
  private currencyPipe = inject(CurrencyPipe);
  private router = inject(Router);
  protected getusersFromMembers = Utils.getusersFromMembers;
  protected billGuard = MyExpendingUtils.billGuard;
  protected expenseGuard = MyExpendingUtils.expenseGuard;

  private userId = this.authService.currentUser()?.id;
  protected isLoading = signal(false);
  protected referenceDate = signal<Date>(Utils.currentMonth);
  protected bills = signal<iBill[]>([]);
  protected expenses = signal<iExpense[]>([]);
  protected first = signal(0);
  protected rows = signal(10);
  protected isExpenseDetailsDialogOpen = signal(false);
  protected selectedExpense = signal<iExpense | null>(null);
  protected allSpendings = computed<(iBill | iExpense)[]>(() => [...this.bills(), ...this.expenses()]);
  protected filteredSpendings = signal<(iBill | iExpense)[]>(this.allSpendings());
  protected cards = computed<iSpendingsCard[]>(() => this.populateCards());
  protected typeTags = computed<iTypeTag[]>(() => this.buildTags());
  protected pagedSpendings = computed<(iBill | iExpense)[]>(() => {
    const startIndex = this.first();
    const endIndex = startIndex + this.rows();
    return this.filteredSpendings().slice(startIndex, endIndex);
  });

  constructor() {
    effect(() => {
      const refPeriod = this.referenceDate();
      this.fetchSpendings(refPeriod);
    });
  }

  private async fetchSpendings(refPeriod: Date) {
    this.isLoading.set(true);
    const spaces = await this.spaceApiService.getUserSpaces();
    const [bills, expenses] = await Promise.all([
      this.billApiService.getAllBillsFromSpaceAndDate(null, refPeriod),
      this.expenseApiService.getAllExpensesFromSpaceAndDate(null, refPeriod)
    ]);
    this.populateSpaces(bills, expenses, spaces);
    this.bills.set(bills ?? []);
    this.expenses.set(expenses ?? []);
    this.onPageChange();
    this.isLoading.set(false);
  }

  private populateSpaces(bills: iBill[], expenses: iExpense[], spaces: iSpace[]) {
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

  private userTotalBillValue(bills: iBill[]): number {
    return bills.reduce((sum, b) => sum + (b.value && b.space?.members?.length ? b.value / b.space.members.length : 0), 0);
  }

  private userTotalExpenseValue(expenses: iExpense[]): number {
    return expenses.reduce((sum, e) => {
      let userValue = e.value && e.space?.members?.length ? e.value / e.space.members.length : 0;

      if (e.expense_splits) {
        const userSplit = e.expense_splits.find(split => split.user_id === this.userId);
        userValue = userSplit ? userSplit.split_value : 0;
      }

      return sum + userValue;
    }, 0);
  }

  protected getUserSpending(item: iBill | iExpense): number {
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

  private spaceWithMostSpendings(): { space: iSpace; total: number } {
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

  private populateCards(): iSpendingsCard[] {
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
        details: `${expenses.length} despesas + ${bills.length} contas`,
        onClick: () => this.scrollToList(0)
      },
      {
        title: 'Contas',
        icon: 'pi pi-money-bill',
        content: this.currencyPipe.transform(totalBills, 'BRL') ?? '-',
        details: `${bills.length} contas registradas`,
        onClick: () => this.scrollToList(1)
      },
      {
        title: 'Despesas',
        icon: 'pi pi-wallet',
        content: this.currencyPipe.transform(totalExpenses, 'BRL') ?? '-',
        details: `${expenses.length} despesas registradas`,
        onClick: () => this.scrollToList(2)
      },
      {
        title: 'Espaço com mais gastos',
        icon: 'pi pi-chart-line',
        content: topSpace.space?.name,
        details: this.currencyPipe.transform(topSpace.total, 'BRL') ?? '-',
        onClick: () => this.router.navigate(['/spaces', topSpace.space?.id])
      }
    ];
  }

  protected buildTags() {
    const filteredSpendings = this.filteredSpendings();
    const filteredBills = filteredSpendings.filter(this.billGuard);
    const filteredExpenses = filteredSpendings.filter(this.expenseGuard);

    return [
      {
        value: 1,
        label: `${filteredBills.length} Contas`,
        isSelected: filteredBills.length > 0
      },
      {
        value: 2,
        label: `${filteredExpenses.length} Despesas`,
        isSelected: filteredExpenses.length > 0
      }
    ];
  }

  protected scrollToList(filterType: number) {
    const element = document.getElementById('spendingList');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const types = filterType === 0 ? [1, 2] : [filterType];
      this.filtersComponent.setSelectedTypes(types);
    }
  }

  protected isNaN(value: string): boolean {
    return isNaN(Number(value)) || value === null || value === undefined;
  }

  protected onFilteredSpendingsChange(filtered: (iBill | iExpense)[]) {
    this.filteredSpendings.set(filtered);
  }

  protected changePeriodEvent(newReferenceDate: Date) {
    this.referenceDate.set(newReferenceDate);
  }

  protected onPageChange(event?: PaginatorState) {
    this.first.set(event?.first ?? 0);
    this.rows.set(event?.rows ?? 10);
  }

  protected openDetailsDialog(item: iExpense | iBill) {
    if (this.expenseGuard(item)) {
      this.selectedExpense.set(item);
      this.isExpenseDetailsDialogOpen.set(true);
    }
  }
}
