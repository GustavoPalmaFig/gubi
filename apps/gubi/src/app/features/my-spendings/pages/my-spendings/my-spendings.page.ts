import { AccordionModule } from 'primeng/accordion';
import { AuthService } from '@features/auth/services/auth.service';
import { BillApiService } from '@features/bill/services/bill-api.service';
import { Button } from 'primeng/button';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { ExpenseApiService } from '@features/expense/services/expense-api.service';
import { ExpenseDetailsDialogComponent } from '@features/expense/components/expense-details-dialog/expense-details-dialog.component';
import { FormsModule } from '@angular/forms';
import { iBill } from '@features/bill/interfaces/bill.interface';
import { iExpense } from '@features/expense/interfaces/expense.interface';
import { InputText } from 'primeng/inputtext';
import { iSpace } from '@features/spaces/interfaces/space.interface';
import { MultiSelect } from 'primeng/multiselect';
import { Paginator, PaginatorState } from 'primeng/paginator';
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

interface iTypeTag {
  value: number;
  label: string;
  isSelected: boolean;
}

interface iFilterProps {
  search: string;
  selectedTypes: number[];
  selectedPeriod: Date;
  selectedSpacesIds: number[];
  selectedPaymentMethodsIds: number[];
}

interface SortOption {
  label: string;
  key: string;
  icon: string;
  sortOrder: 'asc' | 'desc';
}

@Component({
  selector: 'app-my-spendings',
  imports: [CommonModule, Skeleton, Tag, FormsModule, InputText, Select, MultiSelect, Button, AccordionModule, Paginator, ExpenseDetailsDialogComponent],
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
  protected filters = signal<iFilterProps>({
    search: '',
    selectedTypes: [1, 2],
    selectedPeriod: this.referenceDate(),
    selectedSpacesIds: [],
    selectedPaymentMethodsIds: []
  });
  protected paymentMethodsTouched = signal(false);
  protected sortOptions: SortOption[] = [
    { label: 'Data', key: 'date', icon: 'pi pi-sort-amount-down', sortOrder: 'asc' },
    { label: 'Data', key: 'date', icon: 'pi pi-sort-amount-up-alt', sortOrder: 'desc' },
    { label: 'Valor', key: 'value', icon: 'pi pi-sort-numeric-down', sortOrder: 'asc' },
    { label: 'Valor', key: 'value', icon: 'pi pi-sort-numeric-up-alt', sortOrder: 'desc' },
    { label: 'Título', key: 'title', icon: 'pi pi-sort-alpha-down', sortOrder: 'asc' },
    { label: 'Título', key: 'title', icon: 'pi pi-sort-alpha-up-alt', sortOrder: 'desc' }
  ];
  protected selectedSortOption = signal<SortOption>(this.sortOptions[0]);
  protected first = signal(0);
  protected rows = signal(10);
  protected isExpenseDetailsDialogOpen = signal(false);
  protected selectedExpense = signal<iExpense | null>(null);

  protected allSpendings = computed<(iBill | iExpense)[]>(() => [...this.bills(), ...this.expenses()]);

  protected filteredSpendings = computed<(iBill | iExpense)[]>(() => {
    const filtered = this.filterSpendings();
    return this.sortList(filtered);
  });

  protected pagedSpendings = computed<(iBill | iExpense)[]>(() => {
    const startIndex = this.first();
    const endIndex = startIndex + this.rows();
    return this.filteredSpendings().slice(startIndex, endIndex);
  });

  protected cards = computed<iSpendingsCard[]>(() => this.populateCards());

  protected typeTags = computed<iTypeTag[]>(() => this.buildTags());

  protected periods = computed<{ label: string; value: Date }[]>(() => this.getAvailablePeriods());

  protected types: { label: string; value: number }[] = [
    { label: 'Contas', value: 1 },
    { label: 'Despesas', value: 2 }
  ];

  protected spaces = computed(() => {
    const spendingsToConsider = this.allSpendings();
    const allSpaces = spendingsToConsider.map(spending => spending.space);
    return allSpaces.length > 0 ? Utils.getDistinctValues(allSpaces, 'id') : [];
  });

  protected paymentMethods = computed(() => {
    const allMethods = this.allSpendings()
      .filter(s => this.expenseGuard(s))
      .filter(s => s.payment_method_id)
      .map(expense => expense.payment_method);
    return allMethods.length > 0 ? Utils.getDistinctValues(allMethods, 'id') : [];
  });

  constructor() {
    effect(() => {
      const refPeriod = this.referenceDate();
      this.fetchSpendings(refPeriod);
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
    this.onPageChange();
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

  protected buildTags() {
    const filteredSpendings = this.filteredSpendings();
    const filteredBills = filteredSpendings.filter(this.billGuard);
    const filteredExpenses = filteredSpendings.filter(this.expenseGuard);

    return [
      {
        value: 1,
        label: `${filteredBills.length} Contas`,
        isSelected: filteredBills.length > 0 && this.filters().selectedTypes.includes(1)
      },
      {
        value: 2,
        label: `${filteredExpenses.length} Despesas`,
        isSelected: filteredExpenses.length > 0 && this.filters().selectedTypes.includes(2)
      }
    ];
  }

  protected scrollToList(filterType: number) {
    const element = document.getElementById('spendingList');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.filters.update(f => ({ ...f, selectedTypes: filterType === 0 ? [1, 2] : [filterType] }));
      this.filterSpendings();
    }
  }

  protected isNaN(value: string): boolean {
    return isNaN(Number(value)) || value === null || value === undefined;
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
    const types = this.types;
    const spaces = this.spaces();
    const payment_methods = this.paymentMethods();

    this.filters.set({
      search: '',
      selectedTypes: types.map(type => type.value),
      selectedPeriod: this.referenceDate(),
      selectedSpacesIds: spaces.map(space => space.id),
      selectedPaymentMethodsIds: payment_methods.map(payment_method => payment_method.id)
    });
    this.paymentMethodsTouched.set(false);
  }

  protected onFiltersChange(isPaymentTouched = false) {
    this.filters.update(f => ({
      ...f
    }));
    this.paymentMethodsTouched.set(isPaymentTouched);
  }

  protected filterSpendings() {
    let result = [...this.allSpendings()];
    const { search, selectedTypes, selectedPeriod, selectedSpacesIds, selectedPaymentMethodsIds } = this.filters();

    if (search) {
      const term = Utils.normalizeText(search);

      result = result.filter(item => {
        const title = this.billGuard(item) ? item.name : item.title;
        const spaceName = item.space.name;
        const note = this.expenseGuard(item) ? item.note : '';
        const paymentName = this.expenseGuard(item) && item.payment_method ? item.payment_method.name : '';

        return (
          Utils.normalizeText(title).includes(term) ||
          Utils.normalizeText(spaceName).includes(term) ||
          Utils.normalizeText(note).includes(term) ||
          Utils.normalizeText(paymentName).includes(term)
        );
      });
    }

    if (selectedPeriod) {
      result = result.filter(item => {
        const itemDate = Utils.dateToUTC(item.reference_period || new Date());
        return itemDate.getUTCFullYear() === selectedPeriod.getUTCFullYear() && itemDate.getUTCMonth() === selectedPeriod.getUTCMonth();
      });
    }

    if (selectedTypes && selectedTypes.length > 0) {
      result = result.filter(item => {
        if (this.billGuard(item)) {
          return selectedTypes.includes(1);
        } else if (this.expenseGuard(item)) {
          return selectedTypes.includes(2);
        }
        return false;
      });
    }

    if (selectedSpacesIds && selectedSpacesIds.length > 0) {
      result = result.filter(item => selectedSpacesIds.includes(item.space_id));
    }

    if (this.paymentMethodsTouched() && selectedPaymentMethodsIds && selectedPaymentMethodsIds.length > 0) {
      result = result.filter(item => this.expenseGuard(item) && item.payment_method_id && selectedPaymentMethodsIds.includes(item.payment_method_id));
    }

    return result;
  }

  protected changePeriod(newReferenceDate: Date) {
    this.referenceDate.set(newReferenceDate);
  }

  protected resetFilters() {
    this.populateFilters();
    this.filterSpendings();
    this.selectedSortOption.set(this.sortOptions[0]);
  }

  protected sortList(list: (iBill | iExpense)[]): (iBill | iExpense)[] {
    const sortOption = this.selectedSortOption();

    const sorted = list.sort((a: any, b: any) => {
      let propertyA = '';
      let propertyB = '';

      if (sortOption.key == 'title') {
        propertyA = this.billGuard(a) ? 'name' : 'title';
        propertyB = this.billGuard(b) ? 'name' : 'title';
      } else if (sortOption.key == 'date') {
        propertyA = this.billGuard(a) ? 'paid_at' : 'date';
        propertyB = this.billGuard(b) ? 'paid_at' : 'date';
      } else {
        propertyA = sortOption.key as keyof (iBill | iExpense);
        propertyB = sortOption.key as keyof (iBill | iExpense);
      }

      if (a[propertyA] < b[propertyB]) {
        return sortOption.sortOrder == 'asc' ? -1 : 1;
      }
      if (a[propertyA] > b[propertyB]) {
        return sortOption.sortOrder == 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
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
