import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, signal } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ExpenseApiService } from '@features/expense/services/expense-api.service';
import { iExpense } from '@features/expense/interfaces/expense.interface';
import { iExpenseView } from '@features/expense/interfaces/expenseView.interface';
import { iSpace } from '@features/spaces/interfaces/space.interface';
import { MessageService } from '@shared/services/message.service';
import { Skeleton } from 'primeng/skeleton';
import { Tooltip } from 'primeng/tooltip';
import { ExpenseFormDialogComponent } from '../expense-form-dialog/expense-form-dialog.component';

@Component({
  selector: 'app-expense-list',
  imports: [CommonModule, Button, Skeleton, Tooltip, ExpenseFormDialogComponent],
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
  protected expenses: iExpenseView[] = Array(3).fill({});
  protected totalValue = 0;
  protected isFormDialogOpen = signal(false);
  protected selectedExpense = signal<iExpense | null>(null);

  constructor() {
    effect(() => {
      if (this.space() && this.referenceDate()) {
        this.fetchExpenses();
      }
    });
  }

  protected async fetchExpenses() {
    this.isLoading.set(true);
    this.expenses = Array(3).fill({});
    this.expenseApiService.getAllExpensesFromSpaceAndDate(this.space().id, this.referenceDate()).then(async expenses => {
      this.expenses = expenses;
      this.getTotalValue();
      this.isLoading.set(false);
    });
  }

  protected getTotalValue() {
    this.totalValue = this.expenses.reduce((total, expense) => {
      if (expense.value) {
        return total + expense.value;
      }
      return total;
    }, 0);
  }

  protected openFormDialog(expense: iExpense | null = null) {
    this.selectedExpense.set(expense);
    this.isFormDialogOpen.set(true);
  }

  protected openDeleteConfirmDialog(event: Event, expense: iExpense) {
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
    this.expenses = this.expenses.filter(b => b.id !== expense.id);
  }
}
