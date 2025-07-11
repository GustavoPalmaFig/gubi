import { AccordionModule } from 'primeng/accordion';
import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { iBill } from '@features/bill/interfaces/bill.interface';
import { iExpense } from '@features/expense/interfaces/expense.interface';
import { InputText } from 'primeng/inputtext';
import { iPaymentMethod } from '@features/payment-methods/interfaces/payment-method';
import { iUser } from '@features/auth/interfaces/user.interface';
import { MultiSelect } from 'primeng/multiselect';
import { Select } from 'primeng/select';
import { Tag } from 'primeng/tag';
import { UserAvatarComponent } from '@shared/components/user-avatar/user-avatar.component';
import MySpendingUtils from '@features/my-spendings/utils/utils';
import Utils from '@shared/utils/utils';

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
  selector: 'app-my-spendings-filters',
  imports: [CommonModule, FormsModule, InputText, Select, MultiSelect, Button, AccordionModule, UserAvatarComponent, Tag],
  templateUrl: './my-spendings-filters.component.html',
  styleUrl: './my-spendings-filters.component.scss'
})
export class MySpendingsFiltersComponent {
  referenceDate = input<Date>(new Date());
  allSpendings = input<(iBill | iExpense)[]>([]);
  changePeriod = output<Date>();
  changeFilteredList = output<(iBill | iExpense)[]>();

  private billGuard = MySpendingUtils.billGuard;
  private expenseGuard = MySpendingUtils.expenseGuard;
  protected getAbbreviatedName = Utils.getAbbreviatedName;

  private filteredSpendings = computed<(iBill | iExpense)[]>(() => {
    const filtered = this.filterSpendings();
    return this.sortList(filtered);
  });

  protected filters = signal<iFilterProps>({
    search: '',
    selectedTypes: [1, 2],
    selectedPeriod: this.referenceDate(),
    selectedSpacesIds: [],
    selectedPaymentMethodsIds: []
  });

  protected paymentMethodsTouched = signal(false);

  protected periods = computed<{ label: string; value: Date }[]>(() => Utils.getAvailablePeriods());

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
      this.populateFilters();
    });

    effect(() => {
      this.changeFilteredList.emit(this.filteredSpendings());
    });
  }

  protected populateFilters() {
    this.filters.set({
      search: '',
      selectedTypes: [],
      selectedPeriod: this.referenceDate(),
      selectedSpacesIds: [],
      selectedPaymentMethodsIds: []
    });
  }

  protected onFiltersChange(isPaymentTouched = false) {
    this.filters.update(f => ({
      ...f
    }));
    this.paymentMethodsTouched.set(isPaymentTouched);
  }

  protected filterSpendings() {
    let result = [...this.allSpendings()];
    const { search, selectedTypes, selectedSpacesIds, selectedPaymentMethodsIds } = this.filters();

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

  protected resetFilters() {
    this.populateFilters();
    this.filterSpendings();
    this.selectedSortOption.set(this.sortOptions[0]);
  }

  protected sortList(list: (iBill | iExpense)[]): (iBill | iExpense)[] {
    const sortOption = this.selectedSortOption();

    const sorted = list.sort((a: iBill | iExpense, b: iBill | iExpense) => {
      let valueA: string | Date | number | undefined;
      let valueB: string | Date | number | undefined;

      if (sortOption.key === 'title') {
        valueA = this.billGuard(a) ? a.name : this.expenseGuard(a) ? a.title : '';
        valueB = this.billGuard(b) ? b.name : this.expenseGuard(b) ? b.title : '';
      } else if (sortOption.key === 'date') {
        valueA = this.billGuard(a) ? a.paid_at : this.expenseGuard(a) ? a.date : '';
        valueB = this.billGuard(b) ? b.paid_at : this.expenseGuard(b) ? b.date : '';
      } else if (sortOption.key === 'value') {
        valueA = a.value;
        valueB = b.value;
      } else {
        valueA = '';
        valueB = '';
      }

      if (valueA && valueB && valueA < valueB) {
        return sortOption.sortOrder == 'asc' ? -1 : 1;
      }
      if (valueA && valueB && valueA > valueB) {
        return sortOption.sortOrder == 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }

  public setSelectedTypes(types: number[]) {
    this.filters.update(f => ({ ...f, selectedTypes: types }));
  }

  get groupedPaymentMethods() {
    const groupsMap = new Map<string, { owner: iUser; items: iPaymentMethod[] }>();

    for (const method of this.paymentMethods()) {
      const owner = method.owner;

      if (!groupsMap.has(owner.id)) {
        groupsMap.set(owner.id, {
          owner,
          items: []
        });
      }

      const group = groupsMap.get(owner.id);
      if (group) {
        group.items.push(method);
      }
    }

    const sortedGroups = Array.from(groupsMap.values()).sort((a, b) => a.owner.fullname.localeCompare(b.owner.fullname));
    return sortedGroups;
  }
}
