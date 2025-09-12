import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Component, inject, signal, effect, input, computed } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { iSpace } from '@features/spaces/interfaces/space.interface';
import { MessageService } from '@shared/services/message.service';
import { ProgressBar } from 'primeng/progressbar';
import { Skeleton } from 'primeng/skeleton';
import { Tooltip } from 'primeng/tooltip';
import Utils from '@shared/utils/utils';
import { BillApiService } from '../../services/bill-api.service';
import { BillDetailsDialogComponent } from '../bill-details-dialog/bill-details-dialog.component';
import { BillFormDialogComponent } from '../bill-form-dialog/bill-form-dialog.component';
import { BillSplitDialogComponent } from '../bill-split-dialog/bill-split-dialog.component';
import { iBill } from '../../interfaces/bill.interface';

@Component({
  selector: 'app-bill-list',
  imports: [CommonModule, Button, Skeleton, Tooltip, FormsModule, InputNumberModule, BillFormDialogComponent, ProgressBar, BillSplitDialogComponent, BillDetailsDialogComponent],
  templateUrl: './bill-list.component.html',
  styleUrl: './bill-list.component.scss'
})
export class BillListComponent {
  protected billApiService = inject(BillApiService);
  protected messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  space = input.required<iSpace>();
  referenceDate = input.required<Date>();

  protected isLoading = signal(true);
  protected bills = signal<iBill[]>(Array(3).fill({}));
  protected previousMonthBills = signal<iBill[]>([]);
  protected previousMonthDate = computed<Date>(() => Utils.adjustDateByMonths(this.referenceDate(), -1));
  protected previousMonthComparePercentage = computed<number>(() => this.getComparePercentage());
  protected billIdToEditValue = signal<number | null>(null);
  protected editValue: number | null = null;
  protected totalValue = computed<number>(() => this.accumulateValue(this.bills(), 'value'));
  protected paidValue = computed<number>(() => this.accumulateValue(this.bills(), 'payer'));
  protected paidPercentage = computed<number>(() => this.getPaidValuePercentage());
  protected isFormDialogOpen = signal(false);
  protected isDetailsDialogOpen = signal(false);
  protected isBillSplitFormDialogOpen = signal(false);
  protected selectedBill = signal<iBill | null>(null);

  constructor() {
    effect(() => {
      if (this.space() && this.referenceDate()) {
        this.fetchBills();
      }
    });
  }

  protected async fetchBills() {
    this.isLoading.set(true);
    this.bills.set(Array(3).fill({}));
    this.billApiService.getAllBillsFromSpaceAndDate(this.space().id, this.referenceDate()).then(async bills => {
      this.bills.set(bills);
      this.previousMonthBills.set(await this.getBillsFromPreviousMonth());

      if (bills.length === 0 && this.previousMonthBills().length > 0) {
        await this.showCopyTemplateDialog();
      }

      this.isLoading.set(false);
    });
  }

  protected async showCopyTemplateDialog() {
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

  private async getBillsFromPreviousMonth() {
    return await this.billApiService.getAllBillsFromSpaceAndDate(this.space().id, this.previousMonthDate());
  }

  private async onBulkCreationFromPreviousMonth() {
    const { error } = await this.billApiService.bulkCreateBills(this.previousMonthBills());

    if (error) {
      this.messageService.showMessage('error', error, 'Erro ao copiar contas');
      return;
    }

    this.messageService.showMessage('success', 'Contas copiadas com sucesso', 'Sucesso');
    this.fetchBills();
  }

  protected accumulateValue(bills: iBill[], key: keyof iBill): number {
    return bills.reduce((total, bill) => {
      if (bill[key] && bill.value) {
        return total + bill.value;
      }
      return total;
    }, 0);
  }

  protected getPaidValuePercentage(): number {
    return this.totalValue() > 0 ? this.paidValue() / this.totalValue() : 0;
  }

  protected getComparePercentage(): number {
    const previousTotal = this.accumulateValue(this.previousMonthBills(), 'value');
    const currentTotal = this.totalValue();

    if (previousTotal === 0) {
      return currentTotal === 0 ? 0 : 1;
    }

    if (currentTotal === previousTotal) {
      return 0;
    }

    return +((currentTotal - previousTotal) / previousTotal);
  }

  protected getCardStyle(bill: iBill): string {
    const today = new Date();
    const deadline = bill.deadline ? new Date(bill.deadline) : null;

    if (bill.payer) {
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

    return 'bg-white border-gray-200';
  }

  protected openValueEdit(bill: iBill) {
    this.billIdToEditValue.set(bill.id);
    this.editValue = bill.value || 0;
  }

  protected getPayerFirstName(fullName: string | undefined): string {
    if (!fullName) {
      return 'Desconhecido';
    }
    const [firstName, lastNameInitial] = fullName.split(' ');

    const hasDuplicateFirstName = this.space()
      .members?.filter(member => member.user.fullname !== fullName)
      .some(member => member.user.fullname.startsWith(firstName));

    return hasDuplicateFirstName && lastNameInitial ? `${firstName} ${lastNameInitial[0]}.` : firstName;
  }

  getPayerInitials(payerName: string): string {
    return this.getPayerFirstName(payerName)
      .split(' ')
      .map(p => p.charAt(0))
      .join('');
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

  protected async markAsPaid(bill: iBill) {
    const { error } = await this.billApiService.markBillAsPaid(bill.id);

    if (error) {
      this.messageService.showMessage('error', error, 'Erro ao atualizar valor');
      return;
    }

    this.messageService.showMessage('success', 'Conta marcada como paga com sucesso', 'Sucesso');
    await this.fetchBills();
  }

  protected openDetailsDialog(bill: iBill) {
    this.selectedBill.set(bill);
    this.isDetailsDialogOpen.set(true);
  }

  protected openFormDialog(bill: iBill | null = null) {
    this.selectedBill.set(bill);
    this.isFormDialogOpen.set(true);
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

    this.messageService.showMessage('success', 'Excluído', 'Conta Excluída com sucesso');
    this.bills.update(bills => bills.filter(b => b.id !== bill.id));
  }

  protected billHasBeenSaved(bill: iBill) {
    const selected = this.selectedBill();
    const nowHasForceSplit = !selected?.force_split && bill.force_split;
    if (nowHasForceSplit) {
      this.isBillSplitFormDialogOpen.set(true);
      this.selectedBill.set(bill);
    } else {
      this.isFormDialogOpen.set(false);
      this.fetchBills();
    }
  }
}
