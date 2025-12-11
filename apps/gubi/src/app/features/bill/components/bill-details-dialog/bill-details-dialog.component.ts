import { CommonModule } from '@angular/common';
import { Component, computed, Input, input, signal } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { iBill } from '@features/bill/interfaces/bill.interface';
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
  bill = input.required<iBill | null>();

  protected getAbbreviatedName = Utils.getAbbreviatedName;

  protected billSplits = computed(() => {
    const bill = this.bill();
    if (!bill || !bill.bill_splits) return null;

    return bill.bill_splits.sort((a, b) => {
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
