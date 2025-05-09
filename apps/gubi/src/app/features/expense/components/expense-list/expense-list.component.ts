import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, signal } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ExpenseApiService } from '@features/expense/services/expense-api.service';
import { iExpense } from '@features/expense/interfaces/expense.interface';
import { iExpenseView } from '@features/expense/interfaces/expenseView.interface';
import { MessageService } from '@shared/services/message.service';
import { Skeleton } from 'primeng/skeleton';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-expense-list',
  imports: [CommonModule, Button, Skeleton, Tooltip],
  templateUrl: './expense-list.component.html',
  styleUrl: './expense-list.component.scss'
})
export class ExpenseListComponent {
  protected expenseApiService = inject(ExpenseApiService);
  protected messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  spaceId = input.required<number>();
  referenceDate = input.required<Date>();

  protected isLoading = signal(true);
  protected expenses: iExpenseView[] = Array(3).fill({});
  protected totalValue = 0;
  protected isFormDialogOpen = signal(false);
  protected selectedExpense = signal<iExpense | null>(null);

  constructor() {
    effect(() => {
      if (this.spaceId() && this.referenceDate()) {
        this.fetchExpenses();
      }
    });
  }

  private async fetchExpenses() {
    this.isLoading.set(true);
    this.expenses = Array(3).fill({});
    this.expenseApiService.getAllExpensesFromSpaceAndDate(this.spaceId(), this.referenceDate()).then(async expenses => {
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
}
