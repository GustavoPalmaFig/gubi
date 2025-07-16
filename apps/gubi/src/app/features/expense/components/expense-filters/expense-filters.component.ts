import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, Input, input, signal } from '@angular/core';
import { DatePickerModule } from 'primeng/datepicker';
import { Dialog } from 'primeng/dialog';
import { ExpenseCategory } from '@features/expense/enums/expenseCategory.enum';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { iExpense } from '@features/expense/interfaces/expense.interface';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Slider } from 'primeng/slider';
import Utils from '@shared/utils/utils';

interface SortOption {
  label: string;
  key: string;
  icon: string;
  sortOrder: 'asc' | 'desc';
}

interface FilterProps {
  search: string;
  maxValue: number | null;
  paymentMethodId: number | null;
  dateRange: [Date, Date] | null;
  categoryId: number | null;
}

@Component({
  selector: 'app-expense-filters',
  imports: [CommonModule, FormsModule, IconFieldModule, InputIconModule, InputTextModule, Button, Select, Dialog, Slider, DatePickerModule],
  templateUrl: './expense-filters.component.html',
  styleUrl: './expense-filters.component.scss'
})
export class ExpenseFiltersComponent {
  fullExpenses = input.required<iExpense[]>();
  @Input() filteredExpenses = signal<iExpense[]>([]);

  protected isFilterDialogOpen = signal(false);

  protected filters = signal<FilterProps>({
    search: '',
    maxValue: null,
    paymentMethodId: null,
    dateRange: null,
    categoryId: null
  });

  protected sliderValues = computed(() => {
    const values = this.fullExpenses()
      .map(expense => expense.value)
      .filter(value => value !== undefined);
    return {
      min: values.length > 0 ? Math.min(...values) : 0,
      max: values.length > 0 ? Math.max(...values) : 0
    };
  });

  protected paymentMethods = computed(() => {
    const allMethods = this.filteredExpenses().map(expense => expense.payment_method);
    return allMethods.length > 0 ? Utils.getDistinctValues(allMethods, 'id') : [];
  });

  protected categories = computed(() => {
    const allCategoriesIds = this.filteredExpenses()
      .map(expense => expense.category_id)
      .filter(id => id !== undefined && id !== null);
    const uniqueCategories = Utils.getDistinctValues(allCategoriesIds);
    if (uniqueCategories.length === 0) {
      return [{ label: 'Outros', value: 7 }];
    }

    return uniqueCategories.map(id => ({
      label: ExpenseCategory[id] || 'Outros',
      value: id
    }));
  });

  protected sortOptions: SortOption[] = [
    { label: 'Data', key: 'date', icon: 'pi pi-sort-amount-down', sortOrder: 'asc' },
    { label: 'Data', key: 'date', icon: 'pi pi-sort-amount-up-alt', sortOrder: 'desc' },
    { label: 'Valor', key: 'value', icon: 'pi pi-sort-numeric-down', sortOrder: 'asc' },
    { label: 'Valor', key: 'value', icon: 'pi pi-sort-numeric-up-alt', sortOrder: 'desc' },
    { label: 'Título', key: 'title', icon: 'pi pi-sort-alpha-down', sortOrder: 'asc' },
    { label: 'Título', key: 'title', icon: 'pi pi-sort-alpha-up-alt', sortOrder: 'desc' }
  ];

  protected selectedSortOption = signal<SortOption>(this.sortOptions[0]);

  constructor() {
    effect(() => {
      if (this.fullExpenses().length === this.filteredExpenses().length) {
        this.filters.update(filters => ({
          ...filters,
          maxValue: this.sliderValues().max
        }));
      }
    });

    effect(() => {
      if (this.selectedSortOption()) {
        this.sortList();
      }
    });
  }

  protected applyFilters() {
    const { search, maxValue, paymentMethodId, dateRange, categoryId } = this.filters();
    let result = [...this.fullExpenses()];

    if (this.shouldResetFilters()) {
      result = [...this.fullExpenses()];
    } else {
      result = this.applySearchFilter(result, search);
      result = this.applyMaxValueFilter(result, maxValue);
      result = this.applyPaymentMethodFilter(result, paymentMethodId);
      result = this.applyDateRangeFilter(result, dateRange);
      result = this.applyCategoryFilter(result, categoryId);
    }

    this.filteredExpenses.set(result);
    this.sortList();
    this.closeFilterDialog();
  }

  private shouldResetFilters(): boolean {
    const { search, maxValue, paymentMethodId, dateRange, categoryId } = this.filters();
    return search === '' && maxValue === this.sliderValues().max && !paymentMethodId && !dateRange && !categoryId;
  }

  private applySearchFilter(expenses: iExpense[], searchTerm: string): iExpense[] {
    if (!searchTerm) return expenses;

    const term = searchTerm.toLowerCase();
    return expenses.filter(
      expense => expense.title?.toLowerCase().includes(term) || expense.note?.toLowerCase().includes(term) || expense.payment_method?.name?.toLowerCase().includes(term)
    );
  }

  private applyMaxValueFilter(expenses: iExpense[], maxValue: number | null): iExpense[] {
    if (maxValue === null) return expenses;
    return expenses.filter(expense => expense.value && expense.value <= maxValue);
  }

  private applyPaymentMethodFilter(expenses: iExpense[], paymentMethodId: number | null): iExpense[] {
    if (!paymentMethodId) return expenses;
    return expenses.filter(expense => expense.payment_method_id === paymentMethodId);
  }

  private applyDateRangeFilter(expenses: iExpense[], dateRange: [Date, Date] | null): iExpense[] {
    if (!dateRange) return expenses;

    return expenses.filter(expense => {
      if (!expense.date) return false;
      const expenseDate = Utils.dateToUTC(expense.date);

      if (dateRange[1] === null) {
        const targetDate = new Date(dateRange[0]);
        return expenseDate.toDateString() === targetDate.toDateString();
      }
      return Utils.isDateInRange(expenseDate, dateRange[0], dateRange[1]);
    });
  }

  private applyCategoryFilter(expenses: iExpense[], categoryId: number | null): iExpense[] {
    if (!categoryId) return expenses;
    return expenses.filter(expense => expense.category_id === categoryId);
  }

  protected openFilterDialog() {
    this.isFilterDialogOpen.set(true);
  }

  protected closeFilterDialog() {
    this.isFilterDialogOpen.set(false);
  }

  protected sortList() {
    const sortOption = this.selectedSortOption();
    if (!sortOption) return;

    Utils.sortListByProperty(this.filteredExpenses(), sortOption.key as keyof iExpense, sortOption.sortOrder);
  }

  protected resetFilters() {
    this.filters.set({
      search: '',
      maxValue: null,
      paymentMethodId: null,
      dateRange: null,
      categoryId: null
    });
    this.filteredExpenses.set([...this.fullExpenses()]);
    this.isFilterDialogOpen.set(false);
  }
}
