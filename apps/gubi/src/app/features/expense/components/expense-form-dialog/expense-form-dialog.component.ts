import { ButtonModule } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, EventEmitter, inject, Input, input, Output, signal, WritableSignal } from '@angular/core';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { ExpenseApiService } from '@features/expense/services/expense-api.service';
import { ExpenseCategory } from '@features/expense/enums/expenseCategory.enum';
import { ExpenseRecurringType } from '@features/expense/enums/expenseRecurringType.enum';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { iExpense, RecurringType } from '@features/expense/interfaces/expense.interface';
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
import { Tag } from 'primeng/tag';
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
    UserAvatarComponent,
    Checkbox,
    Tag
  ],
  templateUrl: './expense-form-dialog.component.html',
  styleUrl: './expense-form-dialog.component.scss'
})
export class ExpenseFormDialogComponent {
  protected messageService = inject(MessageService);
  protected expenseApiService = inject(ExpenseApiService);
  protected spaceApiService = inject(SpaceApiService);
  protected paymentMethodApiService = inject(PaymentMethodApiService);
  protected getAbbreviatedName = Utils.getAbbreviatedName;

  @Input() isOpen = signal(false);
  @Output() touchExpense = new EventEmitter<iExpense>();

  selectedExpense = input<iExpense | null>();
  referencePeriod = input.required<Date>();
  space = input.required<iSpace>();

  protected isEditMode = computed(() => !!this.selectedExpense());
  protected isLoading = signal(false);
  protected isPaymentMethodDialogOpen = signal(false);
  protected showSplitInfo = signal(false);
  protected showRecurringInfo = signal(false);

  protected expenseForm!: FormGroup;
  protected paymentMethods: iPaymentMethod[] = [];
  protected expenseCategories: { label: string; value: number }[] = [];
  protected expenseRecurringTypes: { label: string; value: string }[] = [
    { label: ExpenseRecurringType.Date, value: 'date' },
    { label: ExpenseRecurringType.Installments, value: 'installments' }
  ];

  constructor() {
    this.expenseForm = new FormGroup({
      space_id: new FormControl(),
      title: new FormControl('', Validators.required),
      value: new FormControl<number | null>(null),
      date: new FormControl<Date | null>(null),
      note: new FormControl<string | null>(null),
      payment_method_id: new FormControl<number | null>(null),
      category_id: new FormControl<number | null>(null),
      reference_period: new FormControl<Date | null>(null),
      force_split: new FormControl<boolean>(false),
      is_recurring: new FormControl<boolean>(false),
      recurring_type: new FormControl<RecurringType | null>(null),
      recurring_end_date: new FormControl<Date | null>(null),
      recurring_end_installments: new FormControl<number | null>(null)
    });

    this.listenToIsRecurring();
    this.listenToRecurringType();

    effect(() => {
      this.loadPaymentMethods();
      this.expenseCategories = Utils.enumToArray(ExpenseCategory);
    });

    effect(() => {
      this.initializeForm();
    });
  }

  private listenToIsRecurring() {
    this.expenseForm.get('is_recurring')?.valueChanges.subscribe(isRecurring => {
      if (isRecurring) {
        this.expenseForm.get('recurring_type')?.addValidators(Validators.required);
      } else {
        this.expenseForm.patchValue(
          {
            recurring_type: null,
            recurring_end_date: null,
            recurring_end_installments: null
          },
          { emitEvent: false }
        );

        this.expenseForm.get('recurring_type')?.removeValidators(Validators.required);
        this.expenseForm.get('recurring_end_date')?.removeValidators(Validators.required);
        this.expenseForm.get('recurring_end_installments')?.removeValidators(Validators.required);
      }

      this.expenseForm.updateValueAndValidity();
    });
  }

  private listenToRecurringType() {
    this.expenseForm.get('recurring_type')?.valueChanges.subscribe(recurringType => {
      if (!recurringType) return;

      if (recurringType == 'date') {
        this.expenseForm.get('recurring_end_date')?.addValidators(Validators.required);
        this.expenseForm.get('recurring_end_installments')?.clearValidators();
        this.expenseForm.get('recurring_end_installments')?.setValue(null, { emitEvent: false });
      } else {
        this.expenseForm.get('recurring_end_installments')?.addValidators(Validators.required);
        this.expenseForm.get('recurring_end_date')?.removeValidators(Validators.required);
        this.expenseForm.get('recurring_end_date')?.setValue(null, { emitEvent: false });
      }

      this.expenseForm.get('recurring_end_date')?.updateValueAndValidity();
      this.expenseForm.get('recurring_end_installments')?.updateValueAndValidity();
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

    const sortedGroups = Array.from(groupsMap.values()).sort((a, b) => a.owner.fullname.localeCompare(b.owner.fullname));
    return sortedGroups;
  }

  getPaymentOwner(selectedPayment: iPaymentMethod): iUser {
    const selectedGroup = this.groupedPaymentMethods.find(group => group.items.some(item => item.id === selectedPayment.id));
    return selectedGroup?.owner || ({} as iUser);
  }

  toggleInfos(info: WritableSignal<boolean>) {
    info.update(value => !value);
  }
}
