import { ButtonModule } from 'primeng/button';
import { CategoryApiService } from '@features/category/services/category-api.service';
import { CategoryFormDialogComponent } from '@features/category/components/category-form-dialog/category-form-dialog.component';
import { Checkbox } from 'primeng/checkbox';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, EventEmitter, inject, Input, input, Output, signal, WritableSignal } from '@angular/core';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { ExpenseApiService } from '@features/expense/services/expense-api.service';
import { ExpenseRecurringType } from '@features/expense/enums/expenseRecurringType.enum';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { iCategory } from '@features/category/interfaces/category.interface';
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
    CategoryFormDialogComponent,
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
  protected categoryApiService = inject(CategoryApiService);
  protected getAbbreviatedName = Utils.getAbbreviatedName;

  @Input() isOpen = signal(false);
  @Output() touchExpense = new EventEmitter<iExpense>();

  selectedExpense = input<iExpense | null>();
  referencePeriod = input.required<Date>();
  space = input.required<iSpace>();

  protected selectedCategory = signal<iCategory | null>(null);
  protected isEditMode = computed(() => !!this.selectedExpense());
  protected isLoading = signal(false);
  protected isPaymentMethodDialogOpen = signal(false);
  protected isCategoryDialogOpen = signal(false);
  protected showSplitInfo = signal(false);
  protected showRecurringInfo = signal(false);

  protected expenseForm!: FormGroup;
  protected paymentMethods: iPaymentMethod[] = [];
  protected categories: iCategory[] = [];
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

    this.listenToTitle();
    this.listenToIsRecurring();
    this.listenToRecurringType();

    effect(() => {
      this.loadPaymentMethods();
      this.loadCategories();
    });

    effect(() => {
      if (this.isOpen()) {
        this.initializeForm();
      } else {
        this.resetForm();
      }
    });
  }

  private listenToTitle() {
    this.expenseForm.get('title')?.valueChanges.subscribe(title => {
      if (!title || !title.trim()) return;

      const matchedCategory = this.findCategoryByTitle(title);

      if (matchedCategory) {
        this.expenseForm.get('category_id')?.setValue(matchedCategory.id, { emitEvent: false });
      }
    });
  }

  private findCategoryByTitle(title: string) {
    const lowerTitle = title.toLowerCase();

    for (const category of this.categories) {
      if (!category.pattern_matching) continue;

      const patterns = category.pattern_matching
        .split(',')
        .map(p => p.trim().toLowerCase())
        .filter(Boolean);

      if (patterns.some(p => lowerTitle.includes(p))) {
        return category;
      }
    }

    return null;
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

      this.expenseForm.updateValueAndValidity({ emitEvent: false });
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

      this.expenseForm.updateValueAndValidity({ emitEvent: false });
    });
  }

  private async loadPaymentMethods() {
    this.paymentMethods = await this.paymentMethodApiService.getAvailablePaymentMethods(this.space().id);
  }

  private async loadCategories() {
    this.categories = await this.categoryApiService.getCategories();
  }

  private initializeForm() {
    this.expenseForm.patchValue(
      {
        space_id: this.space().id,
        reference_period: this.referencePeriod()
      },
      { emitEvent: false }
    );

    const expense = this.selectedExpense();

    if (expense && this.expenseForm.untouched) {
      this.patchFormWithExpense(expense);
    }
  }

  private patchFormWithExpense(expense: iExpense) {
    this.expenseForm.addControl('id', new FormControl(), { emitEvent: false });
    expense = Utils.formatAllStrToDatePattern(expense);
    this.expenseForm.patchValue(expense, { emitEvent: false });
  }

  private resetForm() {
    this.expenseForm.removeControl('id', { emitEvent: false });
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

  openCategoryDialog(options?: { editMode: boolean }) {
    this.selectedCategory.set(null);
    const categoryId = this.expenseForm.get('category_id')?.value;
    const { editMode = false } = options || {};

    if (editMode) {
      const category = this.categories.find(cat => cat.id === categoryId) || null;
      this.selectedCategory.set(category);
    }
    this.isCategoryDialogOpen.set(true);
  }

  async handlePaymentMethodCreated(method: iPaymentMethod) {
    await this.loadPaymentMethods();
    this.expenseForm.patchValue({ payment_method_id: method.id });
    this.isPaymentMethodDialogOpen.set(false);
  }

  async handleCategoryCreated(category: iCategory) {
    if (!this.selectedCategory()) {
      this.categories.push(category);
    } else {
      await this.loadCategories();
    }
    this.expenseForm.patchValue({ category_id: category.id });
    this.isCategoryDialogOpen.set(false);
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
