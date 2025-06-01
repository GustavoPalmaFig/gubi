import { CommonModule } from '@angular/common';
import { Component, computed, Input, input, signal } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { ExpenseCategory } from '@features/expense/enums/expenseCategory.enum';
import { iExpense } from '@features/expense/interfaces/expense.interface';
import { TabsModule } from 'primeng/tabs';
import { UserAvatarComponent } from '@shared/components/user-avatar/user-avatar.component';

@Component({
  selector: 'app-expense-details-dialog',
  imports: [CommonModule, Dialog, UserAvatarComponent, TabsModule],
  templateUrl: './expense-details-dialog.component.html',
  styleUrl: './expense-details-dialog.component.scss'
})
export class ExpenseDetailsDialogComponent {
  @Input() isOpen = signal(false);
  expense = input.required<iExpense | null>();

  protected expenseSplits = computed(() => {
    const expense = this.expense();
    if (!expense || !expense.expense_splits) return null;

    return expense.expense_splits.sort((a, b) => {
      const aUser = a.user?.fullname || '';
      const bUser = b.user?.fullname || '';
      return aUser.localeCompare(bUser);
    });
  });

  protected close(): void {
    this.isOpen.set(false);
  }

  get categoryName(): string {
    const categoryId = this.expense()?.category_id;
    return categoryId ? ExpenseCategory[categoryId] || 'Outros' : 'Outros';
  }
}
