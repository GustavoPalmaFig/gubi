import { AuthService } from '@features/auth/services/auth.service';
import { BillApiService } from '@features/bill/services/bill-api.service';
import { Button } from 'primeng/button';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { ExpenseApiService } from '@features/expense/services/expense-api.service';
import { FormsModule } from '@angular/forms';
import { iBill } from '@features/bill/interfaces/bill.interface';
import { IconFieldModule } from 'primeng/iconfield';
import { iExpense } from '@features/expense/interfaces/expense.interface';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { iSpace } from '@features/spaces/interfaces/space.interface';
import { MultiSelect } from 'primeng/multiselect';
import { Router } from '@angular/router';
import { Select } from 'primeng/select';
import { Skeleton } from 'primeng/skeleton';
import { SpaceApiService } from '@features/spaces/services/space-api.service';
import { Tag } from 'primeng/tag';
import Utils from '@shared/utils/utils';

interface iSpendingsCard {
  title: string;
  icon: string;
  content: string;
  details: string;
  onClick: () => void;
}

interface iFilterTypeOptions {
  value: number;
  label: string;
  isSelected: boolean;
  list: iBill[] | iExpense[];
}

interface iFilterProps {
  search: string;
  selectedPeriod: Date;
  selectedSpacesIds: number[];
  selectedPaymentMethodsIds: number[];
}

@Component({
  selector: 'app-my-spendings',
  imports: [CommonModule, Skeleton, Tag, FormsModule, IconFieldModule, InputIconModule, InputTextModule, Select, MultiSelect, Button],
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
  private router = inject(Router);

  private userId = this.authService.currentUser()?.id;
  protected isLoading = signal(false);
  protected referenceDate = signal<Date>(this.currentMonth);
  protected bills = signal<iBill[]>([]);
  protected expenses = signal<iExpense[]>([]);
  protected allSpendings = computed<(iBill | iExpense)[]>(() => [...this.bills(), ...this.expenses()]);
  protected filteredSpendings = signal<(iBill | iExpense)[]>(this.allSpendings());
  protected cards = computed<iSpendingsCard[]>(() => this.populateCards());
  protected selectedTypes = signal<number[]>([1, 2]);
  protected filterTypeOptions = computed<iFilterTypeOptions[]>(() => [
    {
      value: 1,
      label: this.bills().length + ' Contas',
      isSelected: this.selectedTypes().includes(1),
      list: this.bills()
    },
    {
      value: 2,
      label: this.expenses().length + ' Despesas',
      isSelected: this.selectedTypes().includes(2),
      list: this.expenses()
    }
  ]);

  protected periods = computed<{ label: string; value: Date }[]>(() => this.getAvailablePeriods());

  protected spaces = computed((getAll = false) => {
    const spendingsToConsider = getAll ? this.allSpendings() : this.filteredSpendings();
    const allSpaces = spendingsToConsider.map(spending => spending.space);
    return allSpaces.length > 0 ? Utils.getDistinctValues(allSpaces, 'id') : [];
  });

  protected paymentMethods = computed(() => {
    const allMethods = this.filteredSpendings()
      .filter(s => this.expenseGuard(s))
      .filter(s => s.payment_method_id)
      .map(expense => expense.payment_method);
    return allMethods.length > 0 ? Utils.getDistinctValues(allMethods, 'id') : [];
  });

  protected filters = signal<iFilterProps>({
    search: '',
    selectedPeriod: this.referenceDate(),
    selectedSpacesIds: [],
    selectedPaymentMethodsIds: []
  });

  constructor() {
    effect(() => {
      const refPeriod = this.referenceDate();
      this.fetchSpendings(refPeriod);
    });

    effect(() => {
      this.filterSpendingsByType();
    });

    effect(() => {
      this.populateFilters();
    });
  }

  private get currentMonth() {
    const today = new Date();
    return new Date(today.getUTCFullYear(), today.getUTCMonth(), 1);
  }

  protected billGuard(bill: iBill | iExpense): bill is iBill {
    return 'payer_id' in bill;
  }

  protected expenseGuard(expense: iBill | iExpense): expense is iExpense {
    return 'payment_method_id' in expense;
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

  populateCards(): iSpendingsCard[] {
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

  protected isNaN(value: string): boolean {
    return isNaN(Number(value)) || value === null || value === undefined;
  }

  protected toggleType(type: number) {
    const current = this.selectedTypes();
    let newTypes: number[] = [];

    if (current.includes(type)) {
      newTypes = current.filter(t => t !== type);
    } else {
      newTypes = [...current, type];
    }

    if (newTypes.length === 0) return; // Não permite desmarcar todos os tipos
    this.selectedTypes.set(newTypes);
  }

  protected filterSpendingsByType() {
    const currentFilters = this.filterTypeOptions().filter(option => option.isSelected);
    this.filteredSpendings.set(currentFilters.map(option => option.list).flat());
  }

  protected scrollToList(filterType: number) {
    const element = document.getElementById('spendingList');
    if (element) {
      this.selectedTypes.set(filterType === 0 ? [1, 2] : [filterType]);
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  protected getAvailablePeriods(): { label: string; value: Date }[] {
    const start = new Date(2025, 0, 1); // Janeiro 2025
    const today = new Date();
    const end = new Date(today.getUTCFullYear(), today.getUTCMonth() + 6, 1); // Seis meses a frente

    const months: { label: string; value: Date }[] = [];

    const iter = new Date(start);
    while (iter <= end) {
      const monthName = iter.toLocaleString('default', { month: 'long' });
      const label = `${monthName} ${iter.getFullYear()}`;
      months.push({
        label: label.charAt(0).toUpperCase() + label.slice(1),
        value: new Date(iter)
      });
      iter.setMonth(iter.getMonth() + 1);
    }
    return months;
  }

  protected populateFilters() {
    const spaces = this.spaces();
    const payment_methods = this.paymentMethods();

    this.filters.set({
      search: '',
      selectedPeriod: this.referenceDate(),
      selectedSpacesIds: spaces.map(space => space.id),
      selectedPaymentMethodsIds: payment_methods.map(payment_method => payment_method.id)
    });
  }

  protected applyFilters(filterPaymentMethods = false) {
    const { search, selectedPeriod, selectedSpacesIds, selectedPaymentMethodsIds } = this.filters();
    let result = [...this.allSpendings()];

    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        item =>
          (this.billGuard(item) ? item.name : item.title)?.toLowerCase().includes(term) ||
          item.space.name?.toLowerCase().includes(term) ||
          (this.expenseGuard(item) ? item.note : '')?.toLowerCase().includes(term) ||
          (this.expenseGuard(item) && item.payment_method?.name?.toLowerCase().includes(term))
      );
    }

    if (selectedPeriod) {
      result = result.filter(item => {
        const itemDate = Utils.dateToUTC(item.reference_period || new Date());
        return itemDate.getUTCFullYear() === selectedPeriod.getUTCFullYear() && itemDate.getUTCMonth() === selectedPeriod.getUTCMonth();
      });
    }

    if (selectedSpacesIds && selectedSpacesIds.length > 0) {
      result = result.filter(item => selectedSpacesIds.includes(item.space_id));
    }

    if (selectedPaymentMethodsIds && selectedPaymentMethodsIds.length > 0 && filterPaymentMethods) {
      result = result.filter(item => this.expenseGuard(item) && item.payment_method_id && selectedPaymentMethodsIds.includes(item.payment_method_id));
    }

    this.filteredSpendings.set(result);
  }

  protected changePeriod(newReferenceDate: Date) {
    this.referenceDate.set(newReferenceDate);
  }

  protected resetFilters() {
    this.filteredSpendings.set([...this.allSpendings()]);
  }
}
