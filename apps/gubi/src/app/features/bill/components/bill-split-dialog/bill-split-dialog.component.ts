import { BillApiService } from '@features/bill/services/bill-api.service';
import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, Input, input, signal, Output, EventEmitter } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { iBill } from '@features/bill/interfaces/bill.interface';
import { iBillSplit } from '@features/bill/interfaces/bill_split.interface';
import { InputNumber } from 'primeng/inputnumber';
import { iSpaceMember } from '@features/spaces/interfaces/space_member.interface';
import { MessageService } from '@shared/services/message.service';
import { UserAvatarComponent } from '@shared/components/user-avatar/user-avatar.component';

@Component({
  selector: 'app-bill-split-dialog',
  imports: [CommonModule, FormsModule, Dialog, Button, UserAvatarComponent, InputNumber],
  templateUrl: './bill-split-dialog.component.html',
  styleUrl: './bill-split-dialog.component.scss'
})
export class BillSplitDialogComponent {
  protected billApiService = inject(BillApiService);
  protected messageService = inject(MessageService);

  bill = input.required<iBill>();
  spaceMembers = input.required<iSpaceMember[]>();

  @Input() isDialogOpen = signal(true);
  @Output() finishedSplitting = new EventEmitter<void>();

  protected totalValue = computed(() => this.bill().value || 0);

  protected residualValue = computed(() => {
    const splits = this.splitList();
    const totalSplitValue = splits.reduce((sum, split) => sum + (split.split_value || 0), 0);

    return (this.totalValue() - totalSplitValue).toFixed(2);
  });

  protected splitList = signal<iBillSplit[]>([]);

  constructor() {
    effect(() => {
      this.splitEqually();
    });
  }

  splitEqually(): void {
    const bill = this.bill();
    const members = this.spaceMembers();
    const totalValue = this.totalValue();

    this.splitList.set(
      members
        .filter(member => member.user !== undefined)
        .map(member => {
          return {
            bill_id: bill.id,
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
    const { error } = await this.billApiService.createBillSplit(this.bill().id, this.splitList());

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
    return `${firstName} ${lastNameInitial[0]}.`;
  }
}
