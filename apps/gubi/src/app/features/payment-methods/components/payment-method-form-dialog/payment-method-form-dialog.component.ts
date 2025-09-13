import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, EventEmitter, inject, Input, Output, signal, WritableSignal } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { iPaymentMethod } from '@features/payment-methods/interfaces/payment-method';
import { MessageService } from '@shared/services/message.service';
import { PaymentMethodApiService } from '@features/payment-methods/services/payment-method-api.service';

@Component({
  selector: 'app-payment-method-form-dialog',
  imports: [CommonModule, DialogModule, ButtonModule, InputTextModule, CheckboxModule, ReactiveFormsModule],
  templateUrl: './payment-method-form-dialog.component.html',
  styleUrl: './payment-method-form-dialog.component.scss'
})
export class PaymentMethodFormDialogComponent {
  private messageService = inject(MessageService);
  protected paymentMethodApiService = inject(PaymentMethodApiService);

  @Input() isDialogOpen = signal(false);
  @Input() selectedMethod = signal<iPaymentMethod | null>(null);
  @Output() touchPaymentMethod = new EventEmitter<iPaymentMethod>();

  protected isEditMode = computed(() => !!this.selectedMethod);
  protected isLoading = signal(false);
  protected showSplitInfo = signal(false);
  protected showExcludedFromTotalsInfo = signal(false);
  protected paymentMethodForm: FormGroup;

  constructor() {
    this.paymentMethodForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      split_by_default: new FormControl(false),
      is_excluded_from_totals: new FormControl(false)
    });

    effect(() => this.initializeForm());
  }

  initializeForm() {
    const selectedMethod = this.selectedMethod();

    if (this.isDialogOpen() && selectedMethod) {
      this.paymentMethodForm.patchValue(selectedMethod);
    } else {
      this.paymentMethodForm.reset();
    }
  }

  close(): void {
    this.isLoading.set(false);
    this.isDialogOpen.set(false);
    this.selectedMethod.set(null);
    this.paymentMethodForm.reset();
  }

  async handleSubmit(): Promise<void> {
    this.isLoading.set(true);
    const paymentMethodId = this.selectedMethod()?.id;

    const { data, error } = paymentMethodId
      ? await this.paymentMethodApiService.updatePaymentMethod(this.paymentMethodForm.value, paymentMethodId)
      : await this.paymentMethodApiService.createPaymentMethod(this.paymentMethodForm.value);

    if (error) {
      this.messageService.showMessage('error', 'Erro', error);
      this.isLoading.set(false);
      return;
    }

    this.messageService.showMessage('success', 'Sucesso', paymentMethodId ? 'Método de pagamento atualizado com sucesso!' : 'Método de pagamento criado com sucesso!');

    this.touchPaymentMethod.emit(data);
    this.close();
  }

  toggleInfos(info: WritableSignal<boolean>) {
    info.update(value => !value);
  }
}
