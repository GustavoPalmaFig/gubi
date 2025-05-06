import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { iPaymentMethod } from '@features/payment-methods/interfaces/payment-method';
import { MessageService } from '@shared/services/message.service';
import { PaymentMethodApiService } from '@features/payment-methods/services/payment-method-api.service';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-payment-method-form-dialog',
  imports: [CommonModule, DialogModule, ButtonModule, InputTextModule, CheckboxModule, Tooltip, ReactiveFormsModule],
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
  protected isLoading = false;
  protected paymentMethodForm: FormGroup;

  constructor() {
    this.paymentMethodForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      split_by_default: new FormControl(false)
    });

    effect(() => this.initializeForm());
  }

  initializeForm() {
    const selectedMethod = this.selectedMethod();

    if (this.isDialogOpen() && selectedMethod) {
      this.paymentMethodForm.patchValue({
        name: selectedMethod.name,
        split_by_default: selectedMethod.split_by_default
      });
    } else {
      this.paymentMethodForm.reset();
    }
  }

  close(): void {
    this.isLoading = false;
    this.isDialogOpen.set(false);
    this.selectedMethod.set(null);
    this.paymentMethodForm.reset();
  }

  async handleSubmit(): Promise<void> {
    if (this.paymentMethodForm.invalid) return;

    this.isLoading = true;
    const { name, split_by_default } = this.paymentMethodForm.value;
    const paymentMethodId = this.selectedMethod()?.id || null;

    const { data, error } = paymentMethodId
      ? await this.paymentMethodApiService.updatePaymentMethod(paymentMethodId, name, split_by_default)
      : await this.paymentMethodApiService.createPaymentMethod(name, split_by_default);

    if (error) {
      this.messageService.showMessage('error', 'Erro', error);
      this.isLoading = false;
      return;
    }

    this.messageService.showMessage('success', 'Sucesso', paymentMethodId ? 'Método de pagamento atualizado com sucesso!' : 'Método de pagamento criado com sucesso!');

    this.touchPaymentMethod.emit(data);
    this.close();
  }
}
