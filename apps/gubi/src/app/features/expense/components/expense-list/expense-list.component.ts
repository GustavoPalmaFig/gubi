import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, signal } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ExpenseApiService } from '@features/expense/services/expense-api.service';
import { iExpense } from '@features/expense/interfaces/expense.interface';
import { iSpace } from '@features/spaces/interfaces/space.interface';
import { iUser } from '@features/auth/interfaces/user.interface';
import { MessageService } from '@shared/services/message.service';
import { Skeleton } from 'primeng/skeleton';
import { Tooltip } from 'primeng/tooltip';
import { UserAvatarComponent } from '@shared/components/user-avatar/user-avatar.component';
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
    UserAvatarComponent
  ],
  templateUrl: './expense-list.component.html',
  styleUrl: './expense-list.component.scss'
})
export class ExpenseListComponent {
  protected expenseApiService = inject(ExpenseApiService);
  protected messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  space = input.required<iSpace>();
  referenceDate = input.required<Date>();

  protected isLoading = signal(true);
  protected expenses = signal<iExpense[]>(Array(3).fill({}));
  protected filteredExpenses = signal<iExpense[]>([]);
  protected totalValue = signal(0);
  protected splitedValue = signal(0);
  protected isFormDialogOpen = signal(false);
  protected selectedExpense = signal<iExpense | null>(null);
  protected netDebts: Debt[] = [];
  protected isSummaryDialogOpen = signal(false);
  protected isDetailsDialogOpen = signal(false);
  protected isExpenseSplitFormDialogOpen = signal(false);

  constructor() {
    effect(() => {
      if (this.space() && this.referenceDate()) {
        this.fetchExpenses();
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

  protected getAbbreviatedName(fullName: string | undefined): string {
    if (!fullName) {
      return 'Desconhecido';
    }
    const [firstName, lastNameInitial] = fullName.split(' ');
    return `${firstName} ${lastNameInitial[0]}.`;
  }

  protected calculateIndividualDebts() {
    const debtMap = new Map<string, Map<string, number>>();
    const spaceMembers = this.space().members || [];
    const users = spaceMembers.map(m => m.user);
    const userMap = new Map(users.map(u => [u.id, u]));

    for (const expense of this.expenses()) {
      const payerId = expense.payment_method?.owner_id ?? expense.creator_id;
      const splits = expense.expense_splits;

      if (splits && splits.length > 0) {
        // Usa os valores do split manual
        for (const split of splits) {
          const userId = split.user_id;
          const amount = split.split_value;
          if (userId === payerId || amount === 0) continue;

          if (!debtMap.has(userId)) debtMap.set(userId, new Map());

          const current = debtMap.get(userId)!.get(payerId) || 0;
          debtMap.get(userId)!.set(payerId, +(current + amount).toFixed(2));
        }
      } else {
        // Divide igualmente entre todos os membros
        const total = expense.value ?? 0;
        const equalShare = +(total / users.length).toFixed(2);

        for (const user of users) {
          if (user.id === payerId) continue;

          if (!debtMap.has(user.id)) debtMap.set(user.id, new Map());

          const current = debtMap.get(user.id)!.get(payerId) || 0;
          debtMap.get(user.id)!.set(payerId, +(current + equalShare).toFixed(2));
        }
      }
    }

    const results: Debt[] = [];
    const processed = new Set<string>();

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
