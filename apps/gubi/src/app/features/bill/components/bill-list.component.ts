import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Component, inject, signal, effect, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InplaceModule } from 'primeng/inplace';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from '@shared/services/message.service';
import { Skeleton } from 'primeng/skeleton';
import { Tooltip } from 'primeng/tooltip';
import { BillApiService } from '../services/bill-api.service';
import { iBillView } from '../interfaces/billView.interface';

@Component({
  selector: 'app-bill-list',
  imports: [CommonModule, Button, Skeleton, Tooltip, InplaceModule, FormsModule, InputNumberModule],
  templateUrl: './bill-list.component.html',
  styleUrl: './bill-list.component.scss'
})
export class BillListComponent {
  protected billApiService = inject(BillApiService);
  protected messageService = inject(MessageService);

  spaceId = input.required<number>();
  referenceDate = input.required<Date>();

  protected isLoading = signal(true);
  protected bills: iBillView[] = Array(3).fill({});
  protected billIdToEditValue = signal<number | null>(null);
  protected editValue: number | null = null;
  protected totalValue = 0;
  protected paidValue = 0;

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
    this.billApiService.getAllBillsFromSpaceAndDate(this.spaceId(), this.referenceDate()).then(bills => {
      this.bills = bills;
      this.getTotalValue();
      this.getTotalPaid();
      this.isLoading.set(false);
    });
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
      const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

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
}
