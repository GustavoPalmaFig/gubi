import { BillApiService } from '@features/bill/services/bill-api.service';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, Input, input, signal } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { eBucketName } from '@shared/enums/bucketName.enum';
import { FileSelectEvent, FileUpload } from 'primeng/fileupload';
import { HttpClientModule } from '@angular/common/http';
import { iBill } from '@features/bill/interfaces/bill.interface';
import { iBillFile } from '@features/bill/interfaces/bill_file.interface';
import { MessageService } from '@shared/services/message.service';
import { StorageService } from '@shared/services/supabase/storage.service';
import { TabsModule } from 'primeng/tabs';
import { UserAvatarComponent } from '@shared/components/user-avatar/user-avatar.component';
import Utils from '@shared/utils/utils';

@Component({
  selector: 'app-bill-details-dialog',
  imports: [CommonModule, Dialog, UserAvatarComponent, TabsModule, FileUpload, HttpClientModule],
  templateUrl: './bill-details-dialog.component.html',
  styleUrl: './bill-details-dialog.component.scss'
})
export class BillDetailsDialogComponent {
  @Input() isOpen = signal(false);
  bill = input.required<iBill | null>();

  protected getAbbreviatedName = Utils.getAbbreviatedName;
  protected storageService = inject(StorageService);
  protected billApiService = inject(BillApiService);
  protected messageService = inject(MessageService);

  protected billBucket = eBucketName.bill;

  protected billSplits = computed(() => {
    const bill = this.bill();
    if (!bill || !bill.bill_splits) return null;

    return bill.bill_splits.sort((a, b) => {
      const aUser = a.user?.fullname || '';
      const bUser = b.user?.fullname || '';
      return aUser.localeCompare(bUser);
    });
  });

  protected billFiles = signal<iBillFile[]>([]);

  constructor() {
    effect(() => {
      const bill = this.bill();

      if (bill) {
        this.billFiles.set([]);
        if (bill.bill_files) {
          this.billFiles.set(
            bill.bill_files.sort((a, b) => {
              const aDate = a.created_at.toDateString() || '';
              const bDate = b.created_at.toDateString() || '';
              return aDate.localeCompare(bDate);
            })
          );
        }
      }
    });
  }

  protected close(): void {
    this.isOpen.set(false);
  }

  getSplitPercentage(value: number): string {
    const totalBill = this.bill()?.value || 0;
    const percentage = Math.abs(value / totalBill) * 100;
    return `${percentage.toFixed(0)}% do total`;
  }

  async onUploadFile(event: FileSelectEvent): Promise<void> {
    const bill = this.bill();
    if (!bill) return;

    const period = Utils.dateToMonthYearString(bill.reference_period);
    const file = event.files[0] as File;
    const folder = `${bill.space_id}/${period}`;

    try {
      const path = await this.storageService.uploadFile(this.billBucket, folder, file);
      const bill_file = await this.billApiService.createBillFile(bill.id, file.name, path);

      this.billFiles.update(bill_files => [...(bill_files || []), bill_file]);
      this.messageService.showMessage('success', 'Sucesso', 'Arquivo enviado com sucesso!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.messageService.showMessage('error', 'Erro', errorMessage);
    }
  }

  async onDeleteFile(filePath: string): Promise<void> {
    const bill = this.bill();
    if (!bill) return;

    try {
      await this.storageService.delete(this.billBucket, filePath);
      await this.billApiService.deleteBillFile(filePath);

      if (bill.bill_files) {
        this.billFiles.update(bill_files => bill_files.filter(file => file.path !== filePath));
      }
      this.messageService.showMessage('success', 'Sucesso', 'Arquivo removido com sucesso!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.messageService.showMessage('error', 'Erro', errorMessage);
    }
  }
}
