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
import { ExpenseDetailsDialogComponent } from '../expense-details-dialog/expense-details-dialog.component';
import { ExpenseFormDialogComponent } from '../expense-form-dialog/expense-form-dialog.component';
import { ExpensesSummaryDialogComponent } from '../expenses-summary-dialog/expenses-summary-dialog.component';

interface Debt {
  from: string;
  to: string;
  amount: number;
}

@Component({
  selector: 'app-expense-list',
  imports: [CommonModule, Button, Skeleton, Tooltip, ExpenseFormDialogComponent, ExpensesSummaryDialogComponent, ExpenseDetailsDialogComponent],
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
  protected splitedValue = 0;
  protected isFormDialogOpen = signal(false);
  protected selectedExpense = signal<iExpense | null>(null);
  protected netDebts: Debt[] = [];
  protected isSummaryDialogOpen = signal(false);
  protected isDetailsDialogOpen = signal(false);

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
      this.getSplitedValue();
      this.isLoading.set(false);
      this.calculateIndividualDebts();
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

  protected getSplitedValue() {
    const participants = this.space().members || [];
    return (this.splitedValue = this.totalValue / participants.length);
  }

  protected getFirstName(fullName: string | undefined): string {
    if (!fullName) {
      return 'Desconhecido';
    }
    const [firstName, lastNameInitial] = fullName.split(' ');

    const hasDuplicateFirstName = this.space()
      .members?.filter(member => member.user.fullname !== fullName)
      .some(member => member.user.fullname.startsWith(firstName));

    return hasDuplicateFirstName && lastNameInitial ? `${firstName} ${lastNameInitial[0]}.` : firstName;
  }

  protected calculateIndividualDebts(): void {
    const members = this.space().members || [];

    // Gera o total gasto por membro
    const balances = members.map(member => {
      const memberExpenses = this.expenses.filter(e => e.payment_method_owner_id === member.user_id);
      const totalValue = memberExpenses.reduce((sum, e) => sum + (e.value || 0), 0);
      const balance = Number((totalValue - this.splitedValue).toFixed(2));

      return {
        ownerId: member.user_id,
        ownerName: this.getFirstName(member.user.fullname),
        balance
      };
    });

    // Separa devedores e credores
    const debtors = balances.filter(b => b.balance < 0);
    const creditors = balances.filter(b => b.balance > 0);

    const individualDebts: Debt[] = [];

    for (const debtor of debtors) {
      for (const creditor of creditors) {
        if (debtor.balance === 0 || creditor.balance === 0 || debtor.ownerId === creditor.ownerId) continue;

        const amount = Math.min(Math.abs(debtor.balance), creditor.balance);
        if (amount >= 0.01) {
          individualDebts.push({
            from: debtor.ownerName,
            to: creditor.ownerName,
            amount: Number(amount.toFixed(2))
          });

          debtor.balance += amount;
          creditor.balance -= amount;
          debtor.balance = Number(debtor.balance.toFixed(2));
          creditor.balance = Number(creditor.balance.toFixed(2));
        }
      }
    }

    this.netDebts = individualDebts;
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
    this.expenses = this.expenses.filter(b => b.id !== expense.id);
  }
}
