import { BillApiService } from '@features/bill/services/bill-api.service';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, signal } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { eBucketName } from '@shared/enums/bucketName.enum';
import { FileSelectEvent, FileUpload } from 'primeng/fileupload';
import { HttpClientModule } from '@angular/common/http';
import { iBill } from '@features/bill/interfaces/bill.interface';
import { iBillFile } from '@features/bill/interfaces/bill_file.interface';
import { MessageService } from '@shared/services/message.service';
import { StorageService } from '@shared/services/supabase/storage.service';
import Utils from '@shared/utils/utils';

@Component({
  selector: 'app-bill-file',
  imports: [CommonModule, ButtonModule, FileUpload, HttpClientModule],
  templateUrl: './bill-file.component.html',
  styleUrl: './bill-file.component.scss'
})
export class BillFileComponent {
  bill = input.required<iBill | null>();

  protected storageService = inject(StorageService);
  protected billApiService = inject(BillApiService);
  protected messageService = inject(MessageService);
  protected confirmationService = inject(ConfirmationService);

  protected billBucket = eBucketName.bill;

  protected billFiles = signal<iBillFile[]>([]);

  constructor() {
    effect(() => {
      const bill = this.bill();

      if (bill) {
        this.billFiles.set([]);
        if (bill.bill_files) {
          this.billFiles.set(
            bill.bill_files.sort((a, b) => {
              const aDate = typeof b.created_at == 'string' ? new Date(a.created_at).toDateString() : a.created_at.toDateString();
              const bDate = typeof b.created_at == 'string' ? new Date(b.created_at).toDateString() : b.created_at.toDateString();
              return aDate.localeCompare(bDate);
            })
          );
        }
      }
    });
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

  confirmDeleteFile(filePath: string) {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja remover este arquivo?',
      header: 'remover arquivo',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      rejectButtonProps: {
        severity: 'danger',
        outlined: true
      },
      acceptButtonProps: {
        severity: 'success',
        outlined: true
      },
      accept: async () => {
        await this.onDeleteFile(filePath);
      }
    });
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
