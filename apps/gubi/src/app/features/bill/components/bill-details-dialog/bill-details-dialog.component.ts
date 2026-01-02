import { CommonModule } from '@angular/common';
import { Component, computed, Input, input, signal } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { iBill } from '@features/bill/interfaces/bill.interface';
import { iBillSplit } from '@features/bill/interfaces/bill_split.interface';
import { iSpace } from '@features/spaces/interfaces/space.interface';
import { TabsModule } from 'primeng/tabs';
import { UserAvatarComponent } from '@shared/components/user-avatar/user-avatar.component';
import Utils from '@shared/utils/utils';
import { BillFileComponent } from '../bill-file/bill-file.component';

@Component({
  selector: 'app-bill-details-dialog',
  imports: [CommonModule, Dialog, UserAvatarComponent, TabsModule, BillFileComponent],
  templateUrl: './bill-details-dialog.component.html',
  styleUrl: './bill-details-dialog.component.scss'
})
export class BillDetailsDialogComponent {
  @Input() isOpen = signal(false);
  space = input<iSpace>();
  bill = input.required<iBill | null>();

  protected getAbbreviatedName = Utils.getAbbreviatedName;

  protected spaceMembers = computed(() => {
    const space = this.space();
    return space?.members || [];
  });

  protected billSplits = computed<iBillSplit[]>(() => {
    const bill = this.bill();
    const spaceMembers = this.spaceMembers();

    if (!bill) return [];

    const splitValue = (bill.value || 0) / spaceMembers.length;

    return (
      bill.bill_splits ??
      spaceMembers.map(member => ({
        bill_id: bill.id,
        user_id: member.user?.id || '',
        split_value: splitValue,
        user: member.user
      }))
    ).sort((a, b) => {
      const aUser = a.user?.fullname || '';
      const bUser = b.user?.fullname || '';
      return aUser.localeCompare(bUser);
    });
  });

  protected close(): void {
    this.isOpen.set(false);
  }

  getSplitPercentage(value: number): string {
    const totalBill = this.bill()?.value || 0;
    const percentage = Math.abs(value / totalBill) * 100;
    return `${percentage.toFixed(0)}% do total`;
  }
}
