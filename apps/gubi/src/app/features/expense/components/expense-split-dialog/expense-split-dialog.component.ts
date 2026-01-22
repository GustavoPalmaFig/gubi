import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, Input, input, signal, Output, EventEmitter } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { ExpenseApiService } from '@features/expense/services/expense-api.service';
import { FormsModule } from '@angular/forms';
import { iExpense } from '@features/expense/interfaces/expense.interface';
import { iExpenseSplit } from '@features/expense/interfaces/expense_split.interface';
import { InputNumber } from 'primeng/inputnumber';
import { iSpaceMember } from '@features/spaces/interfaces/space_member.interface';
import { MessageService } from '@shared/services/message.service';
import { UserAvatarComponent } from '@shared/components/user-avatar/user-avatar.component';

@Component({
  selector: 'app-expense-split-dialog',
  imports: [CommonModule, FormsModule, Dialog, Button, UserAvatarComponent, InputNumber],
  templateUrl: './expense-split-dialog.component.html',
  styleUrl: './expense-split-dialog.component.scss'
})
export class ExpenseSplitDialogComponent {
  protected expenseApiService = inject(ExpenseApiService);
  protected messageService = inject(MessageService);

  expense = input.required<iExpense>();
  spaceMembers = input.required<iSpaceMember[]>();

  @Input() isDialogOpen = signal(true);
  @Output() finishedSplitting = new EventEmitter<void>();

  protected totalValue = computed(() => this.expense().value || 0);

  protected residualValue = computed(() => {
    const splits = this.splitList();
    const totalSplitValue = splits.reduce((sum, split) => sum + (split.split_value || 0), 0);

    return (this.totalValue() - totalSplitValue).toFixed(2);
  });

  protected splitList = signal<iExpenseSplit[]>([]);
  protected isLoading = signal(false);

  constructor() {
    effect(() => {
      this.splitEqually();
    });
  }

  splitEqually(): void {
    const expense = this.expense();
    const members = this.spaceMembers();
    const totalValue = this.totalValue();

    this.splitList.set(
      members
        .filter(member => member.user !== undefined)
        .map(member => {
          return {
            expense_id: expense.id,
            user_id: member.user.id,
            user: member.user,
            split_value: totalValue / members.length
          };
        }) || []
    );
  }

  closeSplitDialog(): void {
    this.finishedSplitting.emit();
    this.isDialogOpen.set(false);
  }

  async saveSplit(): Promise<void> {
    this.isLoading.set(true);
    const { error } = await this.expenseApiService.createExpenseSplit(this.expense().id, this.splitList());
    this.isLoading.set(false);

    if (error) {
      this.messageService.showMessage('error', 'Erro', error);
      return;
    }

    this.messageService.showMessage('success', 'Sucesso', 'Valores divididos com sucesso!');

    this.closeSplitDialog();
  }

  onSplitValueChange(value: number, index: number): void {
    const splits = [...this.splitList()];
    splits[index] = { ...splits[index], split_value: value || 0 };
    this.splitList.set(splits);
  }

  protected getAbbreviatedName(fullName: string | undefined): string {
    if (!fullName) {
      return 'Desconhecido';
    }
    const [firstName, lastNameInitial] = fullName.split(' ');
    return `${firstName} ${lastNameInitial && lastNameInitial[0]}.`;
  }
}
