import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ExpenseApiService } from '@features/expense/services/expense-api.service';
import { iExpense } from '@features/expense/interfaces/expense.interface';
import { iSpace } from '@features/spaces/interfaces/space.interface';
import { iUser } from '@features/auth/interfaces/user.interface';
import { MessageService } from '@shared/services/message.service';
import { Skeleton } from 'primeng/skeleton';
import { Tooltip } from 'primeng/tooltip';
import { UserAvatarComponent } from '@shared/components/user-avatar/user-avatar.component';
import Utils from '@shared/utils/utils';
import { ExpenseBalanceDialogComponent } from '../expense-balance-dialog/expense-balance-dialog.component';
import { ExpenseDetailsDialogComponent } from '../expense-details-dialog/expense-details-dialog.component';
import { ExpenseFiltersComponent } from '../expense-filters/expense-filters.component';
import { ExpenseFormDialogComponent } from '../expense-form-dialog/expense-form-dialog.component';
import { ExpenseSplitDialogComponent } from '../expense-split-dialog/expense-split-dialog.component';
import { ExpensesSummaryDialogComponent } from '../expenses-summary-dialog/expenses-summary-dialog.component';

interface Debt {
  from: iUser;
  to: iUser;
  amount: number;
}

@Component({
  selector: 'app-expense-list',
  imports: [
    CommonModule,
    Button,
    Skeleton,
    Tooltip,
    ExpenseFormDialogComponent,
    ExpensesSummaryDialogComponent,
    ExpenseDetailsDialogComponent,
    ExpenseFiltersComponent,
    ExpenseSplitDialogComponent,
    UserAvatarComponent,
    ExpenseBalanceDialogComponent
  ],
  templateUrl: './expense-list.component.html',
  styleUrl: './expense-list.component.scss'
})
export class ExpenseListComponent {
  protected expenseApiService = inject(ExpenseApiService);
  protected messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  protected getAbbreviatedName = Utils.getAbbreviatedName;

  space = input.required<iSpace>();
  referenceDate = input.required<Date>();

  protected isLoading = signal(true);
  protected expenses = signal<iExpense[]>(Array(3).fill({}));
  protected spaceUsers = signal<iUser[]>([]);
  protected filteredExpenses = signal<iExpense[]>([]);
  protected totalValue = signal(0);
  protected splitedValue = signal(0);
  protected isFormDialogOpen = signal(false);
  protected selectedExpense = signal<iExpense | null>(null);
  protected netDebts: Debt[] = [];
  protected isSummaryDialogOpen = signal(false);
  protected isDetailsDialogOpen = signal(false);
  protected isExpenseSplitFormDialogOpen = signal(false);
  protected isBalanceDialogOpen = signal(false);

  constructor() {
    effect(() => {
      if (this.space() && this.referenceDate()) {
        this.fetchExpenses();
        this.spaceUsers.set(this.space().members?.map(m => m.user) || []);
      }
    });

    effect(() => {
      this.filteredExpenses.set(this.expenses());
    });
  }

  protected async fetchExpenses() {
    this.isLoading.set(true);
    this.expenses.set(Array(3).fill({}));
    this.expenseApiService.getAllExpensesFromSpaceAndDate(this.space().id, this.referenceDate()).then(async expenses => {
      this.expenses.set(expenses);
      this.getTotalValue();
      this.getSplitedValue();
      this.isLoading.set(false);
      this.calculateIndividualDebts();
    });
  }

  protected getTotalValue() {
    this.totalValue.set(
      this.expenses().reduce((total, expense) => {
        if (expense.force_split && expense.expense_splits) {
          const splitValue = expense.expense_splits[0].split_value;
          const isSplitEqually = expense.expense_splits.every(split => split.split_value === splitValue);
          if (!isSplitEqually) {
            return total;
          }
        }
        if (expense.value) {
          return total + expense.value;
        }
        return total;
      }, 0)
    );
  }

  protected getSplitedValue() {
    const participants = this.space().members || [];
    return this.splitedValue.set(this.totalValue() / participants.length);
  }

  protected calculateIndividualDebts() {
    const debtMap = new Map<string, Map<string, number>>();
    const userMap = new Map(this.spaceUsers().map(u => [u.id, u]));

    for (const expense of this.expenses()) {
      const receiverId = expense.payment_method?.owner_id ?? expense.creator_id;
      const splits = expense.expense_splits;
      const hasCustomSplits = Array.isArray(splits) && splits.length > 0;

      if (hasCustomSplits) {
        // Cada split indica quanto o usuário contribuiu
        for (const split of splits!) {
          const payerId = split.user_id;
          const amount = split.split_value;
          if (payerId === receiverId || amount === 0) continue;

          if (!debtMap.has(payerId)) debtMap.set(payerId, new Map());

          const current = debtMap.get(payerId)!.get(receiverId) || 0;
          debtMap.get(payerId)!.set(receiverId, +(current + amount).toFixed(2));
        }
      } else {
        // Divisão igualitária entre todos os membros
        const total = expense.value ?? 0;
        const equalShare = +(total / this.spaceUsers().length).toFixed(2);

        for (const user of this.spaceUsers()) {
          if (user.id === receiverId) continue;

          if (!debtMap.has(user.id)) debtMap.set(user.id, new Map());

          const current = debtMap.get(user.id)!.get(receiverId) || 0;
          debtMap.get(user.id)!.set(receiverId, +(current + equalShare).toFixed(2));
        }
      }
    }

    const results: Debt[] = [];
    const processed = new Set();

    for (const [fromId, debts] of debtMap.entries()) {
      for (const [toId, valueFromTo] of debts.entries()) {
        const reverse = debtMap.get(toId)?.get(fromId) || 0;
        const key = [fromId, toId].sort().join('-');
        if (processed.has(key)) continue;
        const diff = +(valueFromTo - reverse).toFixed(2);

        if (diff > 0) {
          results.push({
            from: userMap.get(fromId)!,
            to: userMap.get(toId)!,
            amount: diff
          });
        } else if (diff < 0) {
          results.push({
            from: userMap.get(toId)!,
            to: userMap.get(fromId)!,
            amount: -diff
          });
        }

        processed.add(key);
      }
    }

    this.netDebts = results;
  }

  protected openDetailsDialog(expense: iExpense) {
    this.selectedExpense.set(expense);
    this.isDetailsDialogOpen.set(true);
  }

  protected openFormDialog(event: Event, expense: iExpense | null = null) {
    event.stopPropagation();
    event.preventDefault();

    this.selectedExpense.set(expense);
    this.isFormDialogOpen.set(true);
  }

  protected openDeleteConfirmDialog(event: Event, expense: iExpense) {
    event.stopPropagation();
    event.preventDefault();

    this.confirmationService.confirm({
      target: event?.target || undefined,
      message: 'Você tem certeza que deseja excluir esta Despesa?\n\nEssa ação não pode ser desfeita.',
      header: 'Aviso',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancelar',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true
      },
      acceptButtonProps: {
        label: 'Excluir',
        severity: 'danger'
      },

      accept: async () => this.handleDelete(expense),
      reject: () => this.messageService.showMessage('warn', 'Cancelado', 'Operação cancelada')
    });
  }

  private async handleDelete(expense: iExpense) {
    const { error } = await this.expenseApiService.deleteExpense(expense.id);

    if (error) {
      this.messageService.showMessage('error', 'Erro', error);
      return;
    }

    this.messageService.showMessage('success', 'Excluído', 'Despesa excluída com sucesso');
    this.fetchExpenses();
  }

  protected expenseHasBeenSaved(expense: iExpense) {
    const selected = this.selectedExpense();
    const nowHasForceSplit = !selected?.force_split && expense.force_split;
    if (nowHasForceSplit) {
      this.isExpenseSplitFormDialogOpen.set(true);
      this.selectedExpense.set(expense);
    } else {
      this.isFormDialogOpen.set(false);
      this.fetchExpenses();
    }
  }
}
