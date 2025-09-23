import { CommonModule } from '@angular/common';
import { Component, computed, Input, input, signal } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { iExpense } from '@features/expense/interfaces/expense.interface';
import { TabsModule } from 'primeng/tabs';
import { Tag } from 'primeng/tag';
import { UserAvatarComponent } from '@shared/components/user-avatar/user-avatar.component';
import Utils from '@shared/utils/utils';

@Component({
  selector: 'app-expense-details-dialog',
  imports: [CommonModule, Dialog, UserAvatarComponent, TabsModule, Tag],
  templateUrl: './expense-details-dialog.component.html',
  styleUrl: './expense-details-dialog.component.scss'
})
export class ExpenseDetailsDialogComponent {
  @Input() isOpen = signal(false);
  expense = input.required<iExpense | null>();

  protected getAbbreviatedName = Utils.getAbbreviatedName;

  protected expenseSplits = computed(() => {
    const expense = this.expense();
    if (!expense || !expense.expense_splits) return null;

    return expense.expense_splits.sort((a, b) => {
      const aUser = a.user?.fullname || '';
      const bUser = b.user?.fullname || '';
      return aUser.localeCompare(bUser);
    });
  });

  protected categoy = computed(() => {
    const expense = this.expense();
    return expense?.category;
  });

  protected close(): void {
    this.isOpen.set(false);
  }

  getSplitPercentage(value: number): string {
    const totalExpense = this.expense()?.value || 0;
    const percentage = Math.abs(value / totalExpense) * 100;
    return `${percentage.toFixed(0)}% do total`;
  }
}
