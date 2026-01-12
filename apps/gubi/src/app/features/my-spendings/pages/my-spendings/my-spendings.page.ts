import { AuthService } from '@features/auth/services/auth.service';
import { BillApiService } from '@features/bill/services/bill-api.service';
import { BillDetailsDialogComponent } from '@features/bill/components/bill-details-dialog/bill-details-dialog.component';
import { CheckboxChangeEvent, CheckboxModule } from 'primeng/checkbox';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, computed, effect, inject, signal, ViewChild } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ExpenseApiService } from '@features/expense/services/expense-api.service';
import { ExpenseDetailsDialogComponent } from '@features/expense/components/expense-details-dialog/expense-details-dialog.component';
import { FormsModule } from '@angular/forms';
import { iBill } from '@features/bill/interfaces/bill.interface';
import { iExpense } from '@features/expense/interfaces/expense.interface';
import { iSpace } from '@features/spaces/interfaces/space.interface';
import { MySpendingsChartsComponent } from '@features/my-spendings/components/my-spendings-charts/my-spendings-charts.component';
import { MySpendingsFiltersComponent } from '@features/my-spendings/components/my-spendings-filters/my-spendings-filters.component';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { Router } from '@angular/router';
import { Skeleton } from 'primeng/skeleton';
import { SpaceApiService } from '@features/spaces/services/space-api.service';
import { Tag } from 'primeng/tag';
import { UserAvatarComponent } from '@shared/components/user-avatar/user-avatar.component';
import MySpendingUtils from '@features/my-spendings/utils/utils';
import Utils from '@shared/utils/utils';

interface iSpendingsCard {
  title: string;
  icon: string;
  value: string;
  subValue?: string;
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
  imports: [
    CommonModule,
    Skeleton,
    Tag,
    FormsModule,
    MySpendingsFiltersComponent,
    Paginator,
    ExpenseDetailsDialogComponent,
    UserAvatarComponent,
    MySpendingsChartsComponent,
    DialogModule,
    BillDetailsDialogComponent,
    CheckboxModule
  ],
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
  protected billGuard = MySpendingUtils.billGuard;
  protected expenseGuard = MySpendingUtils.expenseGuard;

  private userId = this.authService.currentUser()?.id;
  protected isLoading = signal(false);
  protected referenceDate = signal<Date>(Utils.currentMonth);
  protected bills = signal<iBill[]>([]);
  protected expenses = signal<iExpense[]>([]);
  protected first = signal(0);
  protected rows = signal(10);
  protected isExpenseDetailsDialogOpen = signal(false);
  protected selectedExpense = signal<iExpense | null>(null);
  protected isBillDetailsDialogOpen = signal(false);
  protected selectedBill = signal<iBill | null>(null);
  protected allSpendings = computed<(iBill | iExpense)[]>(() => [...this.bills(), ...this.expenses()]);
  protected filteredSpendings = signal<(iBill | iExpense)[]>(this.allSpendings());
  protected cards = computed<iSpendingsCard[]>(() => this.populateCards());
  protected typeTags = computed<iTypeTag[]>(() => this.buildTags());
  protected pagedSpendings = computed<(iBill | iExpense)[]>(() => {
    const startIndex = this.first();
    const endIndex = startIndex + this.rows();
    return this.filteredSpendings().slice(startIndex, endIndex);
  });
  protected isChartDialogOpen = signal(false);
  protected isCalculatorMode = signal(false);
  protected selectedSpendings = computed<(iBill | iExpense)[]>(() => this.pagedSpendings().filter(item => item.is_selected));
  protected totalSelectedValue = computed<number>(() => this.userTotalValue(this.selectedSpendings()));
  protected rowsPerPageOptions = computed<number[]>(() => {
    if (this.isCalculatorMode()) {
      return [this.filteredSpendings().length || 1];
    }

    const options = new Set([5, 10, 20, 30, this.filteredSpendings().length].sort((a, b) => a - b));

    return Array.from(options);
  });

  constructor() {
    effect(() => {
      const refPeriod = this.referenceDate();
      this.fetchSpendings(refPeriod);
    });

    effect(() => {
      if (this.isCalculatorMode()) {
        this.first.set(0);
        this.rows.set(this.filteredSpendings().length || 1);
      }
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

  private userTotalValue(items: (iBill | iExpense)[]): number {
    return items.reduce((sum, item) => sum + this.getUserSpending(item), 0);
  }

  protected getUserSpending(item: iBill | iExpense): number {
    const { value, space } = item;
    const { members } = space;
    const splits = this.billGuard(item) ? item.bill_splits : item.expense_splits;

    let userValue = value && members?.length ? value / members.length : 0;

    if (splits) {
      const userSplit = splits.find(split => split.user_id === this.userId);
      userValue = userSplit ? userSplit.split_value : 0;
    }

    return userValue || 0;
  }

  private spaceWithMostSpendings(): { space: iSpace; total: number } {
    const allSpendings = this.allSpendings();
    const spaceTotals: Record<string, { space: iSpace; total: number }> = {};

    allSpendings.forEach(item => {
      const { space, space_id } = item;
      const userValue = this.getUserSpending(item);
      const currentSpaceTotal = spaceTotals[space_id];

      if (currentSpaceTotal) {
        currentSpaceTotal.total += userValue || 0;
      } else {
        spaceTotals[space_id] = { space, total: userValue };
      }
    });

    return Object.values(spaceTotals).sort((a, b) => b.total - a.total)[0] || { space: null, total: 0 };
  }

  private calculateTotalToPay(expenses: iExpense[]): number {
    const totalNoInvoice = expenses.reduce((sum, exp) => {
      if (exp.payment_method && exp.payment_method.is_excluded_from_totals) {
        return sum;
      }
      return sum + this.getUserSpending(exp);
    }, 0);

    return totalNoInvoice || 0;
  }

  private populateCards(): iSpendingsCard[] {
    const filteredSpendings = this.filteredSpendings();
    const bills = filteredSpendings.filter(this.billGuard);
    const expenses = filteredSpendings.filter(this.expenseGuard);
    const totalBills = this.userTotalValue(bills);
    const totalExpenses = this.userTotalValue(expenses);
    const total = totalBills + totalExpenses;
    const totalExpensesNoInvoice = this.calculateTotalToPay(expenses);
    const totalToPay = totalBills + totalExpensesNoInvoice;
    const topSpace = this.spaceWithMostSpendings();

    const cards: iSpendingsCard[] = [
      {
        title: 'Total',
        icon: 'pi pi-dollar',
        value: this.currencyPipe.transform(total, 'BRL') ?? '-',
        details: `${bills.length} contas + ${expenses.length} despesas`,
        onClick: () => this.scrollToList(0)
      },
      {
        title: 'Total a Pagar',
        icon: 'pi pi-exclamation-circle',
        value: this.currencyPipe.transform(totalToPay, 'BRL') ?? '-',
        subValue: totalToPay ? `(${this.currencyPipe.transform(totalBills, 'BRL')} + ${this.currencyPipe.transform(totalExpensesNoInvoice, 'BRL')})` : undefined,
        details: 'Valor a desembolsar no começo ou final do mês',
        onClick: () => this.scrollToList(0)
      },
      {
        title: 'Contas',
        icon: 'pi pi-money-bill',
        value: this.currencyPipe.transform(totalBills, 'BRL') ?? '-',
        details: `${bills.length} contas registradas`,
        onClick: () => this.scrollToList(1)
      },
      {
        title: 'Despesas',
        icon: 'pi pi-wallet',
        value: this.currencyPipe.transform(totalExpenses, 'BRL') ?? '-',
        details: `${expenses.length} despesas registradas`,
        onClick: () => this.scrollToList(2)
      },
      {
        title: 'Espaço com mais gastos',
        icon: 'pi pi-chart-line',
        value: topSpace.space?.name,
        details: this.currencyPipe.transform(topSpace.total, 'BRL') ?? '-',
        onClick: () => this.router.navigate(['/spaces', topSpace.space?.id])
      }
    ];

    if (total === totalToPay && totalToPay > 0) return cards.filter((_, idx) => idx !== 1);
    return cards.slice(0, -1);
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
      return;
    }
    this.selectedBill.set(item);
    this.isBillDetailsDialogOpen.set(true);
  }

  protected toggleSelection(event: CheckboxChangeEvent, item: iBill | iExpense) {
    event?.originalEvent?.stopPropagation();

    item.is_selected = !item.is_selected;

    this.filteredSpendings.update(list => [...list]);
  }
}
