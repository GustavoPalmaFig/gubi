import { AccordionModule } from 'primeng/accordion';
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
import { TabsModule } from 'primeng/tabs';
import { Tag } from 'primeng/tag';
import { ExpenseDetailsDialogComponent } from '../expense-details-dialog/expense-details-dialog.component';
import { ExpenseFormDialogComponent } from '../expense-form-dialog/expense-form-dialog.component';

type GroupedByUserAndSplit = {
  name: string;
  paymentMethods: iPaymentMethod[];
  expenses: iExpense[];
};

@Component({
  selector: 'app-expenses-summary-dialog',
  imports: [CommonModule, DialogModule, ButtonModule, TableModule, Tag, AccordionModule, TabsModule, LoadingComponent, ExpenseDetailsDialogComponent, ExpenseFormDialogComponent],
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
  protected membersExpenses: GroupedByUserAndSplit[] = [];
  protected selectedExpense = signal<iExpense | null>(null);
  protected isDetailsDialogOpen = signal(false);
  protected isFormDialogOpen = signal(false);

  constructor() {
    effect(() => {
      if (this.referencePeriod() && this.referencePeriod() && this.isOpen()) {
        this.fetchPaymentMethods();
      }
    });
  }

  protected async fetchPaymentMethods() {
    this.isLoading.set(true);
    this.paymentMethodApiService.getPaymentMethodsWithExpenses(this.space().id, this.referencePeriod()).then(async paymentMethod => {
      this.paymentMethods = paymentMethod;
      this.getMembersValues();
      this.isLoading.set(false);
    });
  }

  protected getMembersValues() {
    this.membersExpenses = this.paymentMethods.reduce((acc, paymentMethod) => {
      const paymentMethods = [paymentMethod];
      const expenses = paymentMethod.expenses;
      const name = paymentMethod.split_by_default ? 'Compartilhado' : paymentMethod.owner.fullname;
      const existingGroup = acc.find(group => group.name === name);

      if (existingGroup) {
        existingGroup.paymentMethods = [...existingGroup.paymentMethods, paymentMethod];
        existingGroup.expenses = [...existingGroup.expenses, ...paymentMethod.expenses];
      } else {
        acc.push({ name, paymentMethods, expenses });
      }
      return acc;
    }, [] as { name: string; paymentMethods: iPaymentMethod[]; expenses: iExpense[] }[]);
  }

  protected getPaymentMethodName(expense: iExpense): string {
    const paymentMethod = this.paymentMethods.find(pm => pm.id === expense.payment_method_id);
    return paymentMethod ? paymentMethod.name : 'Desconhecido';
  }

  protected calculateTotalValue(expenses: iExpense[]): number {
    return expenses.reduce((acc, expense) => acc + (expense.value || 0), 0);
  }

  protected openDetailsDialog(expense: iExpense) {
    this.selectedExpense.set(expense);
    this.isDetailsDialogOpen.set(true);
  }

  protected openFormDialog(event: Event, expense: iExpense | null = null) {
    event.stopPropagation();
    event.preventDefault();

    this.selectedExpense.set(expense);
    this.isFormDialogOpen.set(true);
  }

  protected close(): void {
    this.isLoading.set(false);
    this.isOpen.set(false);
    this.paymentMethods = [];
    this.membersExpenses = [];
  }
}
