import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Component, inject, signal, effect, input } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { InplaceModule } from 'primeng/inplace';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from '@shared/services/message.service';
import { Skeleton } from 'primeng/skeleton';
import { Tooltip } from 'primeng/tooltip';
import Utils from '@shared/utils/utils';
import { BillApiService } from '../../services/bill-api.service';
import { BillFormDialogComponent } from '../bill-form-dialog/bill-form-dialog.component';
import { iBill } from '../../interfaces/bill.interface';
import { iBillView } from '../../interfaces/billView.interface';

@Component({
  selector: 'app-bill-list',
  imports: [CommonModule, Button, Skeleton, Tooltip, InplaceModule, FormsModule, InputNumberModule, BillFormDialogComponent],
  templateUrl: './bill-list.component.html',
  styleUrl: './bill-list.component.scss'
})
export class BillListComponent {
  protected billApiService = inject(BillApiService);
  protected messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  spaceId = input.required<number>();
  referenceDate = input.required<Date>();

  protected isLoading = signal(true);
  protected bills: iBillView[] = Array(3).fill({});
  protected billIdToEditValue = signal<number | null>(null);
  protected editValue: number | null = null;
  protected totalValue = 0;
  protected paidValue = 0;
  protected isFormDialogOpen = signal(false);
  protected selectedBill = signal<iBill | null>(null);

  constructor() {
    effect(() => {
      if (this.spaceId() && this.referenceDate()) {
        this.fetchBills();
      }
    });
  }

  private async fetchBills() {
    this.isLoading.set(true);
    this.bills = Array(3).fill({});
    this.billApiService.getAllBillsFromSpaceAndDate(this.spaceId(), this.referenceDate()).then(async bills => {
      this.bills = bills;
      if (bills.length === 0) {
        this.bills = [];
        await this.showCopyTemplateDialog();
      }
      this.getTotalValue();
      this.getTotalPaid();
      this.isLoading.set(false);
    });
  }

  async showCopyTemplateDialog() {
    this.confirmationService.confirm({
      message: 'Você não possui contas cadastradas para este mês. Deseja copiar as contas do mês anterior?',
      header: 'Copiar contas',
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
        await this.onBulkCreationFromPreviousMonth();
      },
      reject: () => {
        this.isLoading.set(false);
      }
    });
  }

  private async onBulkCreationFromPreviousMonth() {
    const previousMonth = Utils.adjustDateByMonths(this.referenceDate(), -1);
    const bills = await this.billApiService.getAllBillsFromSpaceAndDate(this.spaceId(), previousMonth);

    if (bills.length > 0) {
      const { error } = await this.billApiService.bulkCreateBills(bills);

      if (error) {
        this.messageService.showMessage('error', error, 'Erro ao copiar contas');
        return;
      }
    } else {
      this.messageService.showMessage('error', 'Nenhuma conta encontrada para o mês anterior', 'Contas não encontradas');
      return;
    }

    this.messageService.showMessage('success', 'Contas copiadas com sucesso', 'Sucesso');
    this.fetchBills();
  }

  protected getTotalValue() {
    this.totalValue = this.bills.reduce((total, bill) => {
      if (bill.value) {
        return total + bill.value;
      }
      return total;
    }, 0);
  }

  protected getTotalPaid() {
    this.paidValue = this.bills.reduce((total, bill) => {
      if (bill.value && bill.paid_at) {
        return total + bill.value;
      }
      return total;
    }, 0);
  }

  protected getPercentage(): string {
    return this.totalValue > 0 ? `${Math.round((this.paidValue / this.totalValue) * 100)}% do total` : '0% do total';
  }

  protected getCardStyle(bill: iBillView): string {
    const today = new Date();
    const deadline = bill.deadline ? new Date(bill.deadline) : null;

    if (bill.paid_at) {
      return 'bg-green-50 border-green-200';
    }

    if (deadline) {
      const oneWeekFromNow = Utils.addOneWeekToDate(today);

      if (deadline < today) {
        return 'bg-red-50 border-red-200';
      }

      if (deadline <= oneWeekFromNow) {
        return 'bg-yellow-50 border-yellow-200';
      }
    }

    return 'bg-gray-50 border-gray-200';
  }

  protected openValueEdit(bill: iBillView) {
    this.billIdToEditValue.set(bill.id);
    this.editValue = bill.value || 0;
  }

  protected getPayerFirstName(payer_name: string): string {
    return payer_name.split(' ')[0];
  }

  protected closeValueEdit() {
    this.billIdToEditValue.set(null);
    this.editValue = null;
  }

  protected async onUpdateBillValue() {
    const id = this.billIdToEditValue();
    if (id && this.editValue) {
      const { error } = await this.billApiService.updateBillValue(id, this.editValue);

      if (error) {
        this.messageService.showMessage('error', error, 'Erro ao atualizar valor');
        return;
      }

      this.billIdToEditValue.set(null);
      this.editValue = null;
      this.messageService.showMessage('success', 'Valor atualizado com sucesso', 'Sucesso');
      await this.fetchBills();
    }
  }

  protected async markAsPaid(bill: iBillView) {
    const { error } = await this.billApiService.markBillAsPaid(bill.id);

    if (error) {
      this.messageService.showMessage('error', error, 'Erro ao atualizar valor');
      return;
    }

    this.messageService.showMessage('success', 'Conta marcada como paga com sucesso', 'Sucesso');
    await this.fetchBills();
  }

  protected openFormDialog(bill: iBill | null = null) {
    this.selectedBill.set(bill);
    this.isFormDialogOpen.set(true);
  }

  protected updateBillList(bill: iBill) {
    const index = this.bills.findIndex(b => b.id === bill.id);
    if (index !== -1) {
      this.bills[index] = bill;
    } else {
      this.bills.push(bill);
    }
  }

  protected openDeleteConfirmDialog(event: Event, bill: iBill) {
    this.confirmationService.confirm({
      target: event?.target || undefined,
      message: 'Você tem certeza que deseja excluir esta Conta?\n\nEssa ação não pode ser desfeita.',
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

      accept: async () => this.handleDelete(bill),
      reject: () => this.messageService.showMessage('warn', 'Cancelado', 'Operação cancelada')
    });
  }

  private async handleDelete(bill: iBill) {
    const { error } = await this.billApiService.deleteBill(bill.id);

    if (error) {
      this.messageService.showMessage('error', 'Erro', error);
      return;
    }

    this.messageService.showMessage('success', 'Excluído', 'Método de Pagamento excluído com sucesso');
    this.bills = this.bills.filter(b => b.id !== bill.id);
  }
}
