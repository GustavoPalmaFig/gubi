import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, EventEmitter, inject, Input, input, Output, signal } from '@angular/core';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { ExpenseApiService } from '@features/expense/services/expense-api.service';
import { ExpenseCategory } from '@features/expense/enums/expenseCategory.enum';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { iExpense } from '@features/expense/interfaces/expense.interface';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { iPaymentMethod } from '@features/payment-methods/interfaces/payment-method';
import { iSpace } from '@features/spaces/interfaces/space.interface';
import { iUser } from '@features/auth/interfaces/user.interface';
import { MessageService } from '@shared/services/message.service';
import { PaymentMethodApiService } from '@features/payment-methods/services/payment-method-api.service';
import { PaymentMethodFormDialogComponent } from '@features/payment-methods/components/payment-method-form-dialog/payment-method-form-dialog.component';
import { Select } from 'primeng/select';
import { SpaceApiService } from '@features/spaces/services/space-api.service';
import { TextareaModule } from 'primeng/textarea';
import { UserAvatarComponent } from '@shared/components/user-avatar/user-avatar.component';
import Utils from '@shared/utils/utils';

@Component({
  selector: 'app-expense-form-dialog',
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    DatePickerModule,
    Select,
    ReactiveFormsModule,
    PaymentMethodFormDialogComponent,
    UserAvatarComponent
  ],
  templateUrl: './expense-form-dialog.component.html',
  styleUrl: './expense-form-dialog.component.scss'
})
export class ExpenseFormDialogComponent {
  protected messageService = inject(MessageService);
  protected expenseApiService = inject(ExpenseApiService);
  protected spaceApiService = inject(SpaceApiService);
  protected paymentMethodApiService = inject(PaymentMethodApiService);

  @Input() isOpen = signal(false);
  @Output() touchExpense = new EventEmitter<iExpense>();

  selectedExpense = input<iExpense | null>();
  referencePeriod = input.required<Date>();
  space = input.required<iSpace>();

  protected isEditMode = computed(() => !!this.selectedExpense());
  protected isLoading = signal(false);
  protected isPaymentMethodDialogOpen = signal(false);

  protected expenseForm!: FormGroup;
  protected paymentMethods: iPaymentMethod[] = [];
  protected expenseCategories: { label: string; value: number }[] = [];

  constructor() {
    this.expenseForm = new FormGroup({
      space_id: new FormControl(),
      title: new FormControl('', Validators.required),
      value: new FormControl<number | null>(null),
      date: new FormControl<Date | null>(null),
      note: new FormControl<string | null>(null),
      payment_method_id: new FormControl<number | null>(null),
      category_id: new FormControl<number | null>(null),
      reference_period: new FormControl<Date | null>(null)
    });

    effect(() => {
      this.loadPaymentMethods();
      this.expenseCategories = Utils.enumToArray(ExpenseCategory);
    });

    effect(() => {
      this.initializeForm();
    });
  }

  private async loadPaymentMethods() {
    this.paymentMethods = await this.paymentMethodApiService.getAvailablePaymentMethods(this.space().id);
  }

  private initializeForm() {
    this.expenseForm.patchValue({
      space_id: this.space().id,
      reference_period: this.referencePeriod()
    });

    const expense = this.selectedExpense();

    if (this.isOpen() && expense && this.expenseForm.untouched) {
      this.patchFormWithExpense(expense);
    } else if (!this.isOpen()) {
      this.resetForm();
    }
  }

  private patchFormWithExpense(expense: iExpense) {
    this.expenseForm.addControl('id', new FormControl());
    expense = Utils.formatAllStrToDatePattern(expense);
    this.expenseForm.patchValue(expense);
  }

  private resetForm() {
    this.expenseForm.removeControl('id');
    this.expenseForm.reset();
  }

  protected close(): void {
    this.isLoading.set(false);
    this.isOpen.set(false);
    this.expenseForm.reset();
  }

  async handleSubmit(): Promise<void> {
    if (this.expenseForm.invalid) return;

    this.isLoading.set(true);
    const expense = this.expenseForm.value;
    Utils.formatAllStrToDatePattern(expense);

    const { data, error } = expense.id ? await this.expenseApiService.updateExpense(expense) : await this.expenseApiService.createExpense(expense);

    if (error) {
      this.messageService.showMessage('error', 'Erro', error);
      this.isLoading.set(false);
      return;
    }

    this.touchExpense.emit(data);
    this.close();
  }

  openPaymentMethodDialog() {
    this.isPaymentMethodDialogOpen.set(true);
  }

  async handlePaymentMethodCreated(method: iPaymentMethod) {
    await this.loadPaymentMethods();
    this.expenseForm.patchValue({ payment_method_id: method.id });
    this.isPaymentMethodDialogOpen.set(false);
  }

  get groupedPaymentMethods() {
    const groupsMap = new Map<string, { owner: iUser; items: iPaymentMethod[] }>();

    for (const method of this.paymentMethods) {
      const owner = method.owner;

      if (!groupsMap.has(owner.id)) {
        groupsMap.set(owner.id, {
          owner,
          items: []
        });
      }

      const group = groupsMap.get(owner.id);
      if (group) {
        group.items.push(method);
      }
    }

    return Array.from(groupsMap.values());
  }

  getPaymentOwner(selectedPayment: iPaymentMethod): iUser {
    const selectedGroup = this.groupedPaymentMethods.find(group => group.items.some(item => item.id === selectedPayment.id));
    return selectedGroup?.owner || ({} as iUser);
  }
}
