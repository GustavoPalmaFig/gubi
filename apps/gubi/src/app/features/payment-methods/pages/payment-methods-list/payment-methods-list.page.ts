import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { iPaymentMethod } from '@features/payment-methods/interfaces/payment-method';
import { Menu } from 'primeng/menu';
import { MessageService } from '@shared/services/message.service';
import { PaymentMethodApiService } from '@features/payment-methods/services/payment-method-api.service';
import { PaymentMethodFormDialogComponent } from '@features/payment-methods/components/payment-method-form-dialog/payment-method-form-dialog.component';
import { Skeleton } from 'primeng/skeleton';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-payment-methods-list',
  imports: [CommonModule, ButtonModule, InputTextModule, Menu, TextareaModule, Skeleton, PaymentMethodFormDialogComponent],
  templateUrl: './payment-methods-list.page.html',
  styleUrl: './payment-methods-list.page.scss'
})
export class PaymentMethodsListPage implements OnInit {
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private paymentMethodApiService = inject(PaymentMethodApiService);

  isLoading = signal(true);
  isFormDialogOpen = signal(false);
  selectedMethod = signal<iPaymentMethod | null>(null);
  menuItems: MenuItem[] = [];
  paymentMethods: iPaymentMethod[] = Array(4).fill({});

  constructor() {
    this.menuItems = [
      {
        label: 'Ações',
        styleClass: 'font-bold ',
        items: [
          {
            separator: true
          },
          {
            label: 'Editar',
            icon: 'pi pi-pen-to-square',
            iconClass: 'mr-2',
            styleClass: 'mb-1',
            command: () => {
              this.isFormDialogOpen.set(true);
            }
          },
          {
            label: 'Excluir',
            icon: 'pi pi-trash',
            iconClass: 'mr-2',
            styleClass: 'my-1',
            command: event => {
              if (event.originalEvent) {
                this.openDeleteConfirmDialog(event.originalEvent);
              }
            }
          }
        ]
      }
    ];
  }

  async ngOnInit() {
    this.getData();
  }

  async getData() {
    this.paymentMethods = await this.paymentMethodApiService.getUserPaymentMethods();
    this.isLoading.set(false);
  }

  openFormDialog(method: iPaymentMethod | null = null) {
    this.selectedMethod.set(method);
    this.isFormDialogOpen.set(true);
  }

  updateList(method: iPaymentMethod) {
    const index = this.paymentMethods.findIndex(item => item.id === method.id);
    if (index !== -1) {
      this.paymentMethods[index] = method;
    } else {
      this.paymentMethods.push(method);
    }
  }

  openDeleteConfirmDialog(event: Event, method?: iPaymentMethod) {
    if (method) this.selectedMethod.set(method);

    this.confirmationService.confirm({
      target: event?.target || undefined,
      message: 'Você tem certeza que deseja excluir este método de pagamento?\n\nEssa ação não pode ser desfeita.',
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

      accept: async () => this.handleDelete(),
      reject: () => this.messageService.showMessage('warn', 'Cancelado', 'Operação cancelada')
    });
  }

  async handleDelete() {
    const paymentMethodId = this.selectedMethod()?.id as number;
    const { error } = await this.paymentMethodApiService.deletePaymentMethod(paymentMethodId);

    if (error) {
      this.messageService.showMessage('error', 'Erro', error);
      return;
    }

    this.messageService.showMessage('success', 'Excluído', 'Método de Pagamento excluído com sucesso');
    this.paymentMethods = this.paymentMethods.filter(method => method.id !== paymentMethodId);
    this.selectedMethod.set(null);
  }
}
