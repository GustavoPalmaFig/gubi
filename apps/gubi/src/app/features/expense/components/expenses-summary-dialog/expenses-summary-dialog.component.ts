import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, Input, signal } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { iExpense } from '@features/expense/interfaces/expense.interface';
import { iPaymentMethod } from '@features/payment-methods/interfaces/payment-method';
import { iSpace } from '@features/spaces/interfaces/space.interface';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { PaymentMethodApiService } from '@features/payment-methods/services/payment-method-api.service';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-expenses-summary-dialog',
  imports: [CommonModule, DialogModule, ButtonModule, TableModule, LoadingComponent],
  templateUrl: './expenses-summary-dialog.component.html',
  styleUrl: './expenses-summary-dialog.component.scss'
})
export class ExpensesSummaryDialogComponent {
  protected paymentMethodApiService = inject(PaymentMethodApiService);

  @Input() isOpen = signal(false);

  space = input.required<iSpace>();
  referencePeriod = input.required<Date>();

  protected isLoading = signal(false);
  protected paymentMethods!: iPaymentMethod[];

  constructor() {
    effect(() => {
      if (this.referencePeriod()) {
        this.fetchPaymentMethods();
      }
    });
  }

  protected async fetchPaymentMethods() {
    this.isLoading.set(true);
    this.paymentMethodApiService.getPaymentMethodsWithExpenses(this.space().id, this.referencePeriod()).then(async paymentMethod => {
      this.paymentMethods = paymentMethod;
      this.isLoading.set(false);
    });
  }

  protected calculateTotalValue(expenses: iExpense[]): number {
    return expenses.reduce((acc, expense) => acc + (expense.value || 0), 0);
  }

  protected close(): void {
    this.isLoading.set(false);
    this.isOpen.set(false);
  }
}
