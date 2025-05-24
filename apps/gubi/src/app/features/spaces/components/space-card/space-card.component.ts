import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Component, effect, inject, input } from '@angular/core';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { iSpace } from '@features/spaces/interfaces/space.interface';
import { MenuModule } from 'primeng/menu';
import { MessageService } from '@shared/services/message.service';
import { RouterLink } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';
import { SpaceService } from '@features/spaces/services/space.service';
import { UserAvatarComponent } from '@shared/components/user-avatar/user-avatar.component';

@Component({
  selector: 'app-space-card',
  imports: [MenuModule, RouterLink, Button, SkeletonModule, CommonModule, UserAvatarComponent],
  templateUrl: './space-card.component.html',
  styleUrl: './space-card.component.scss'
})
export class SpaceCardComponent {
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  protected spaceService = inject(SpaceService);

  space = input.required<iSpace>();

  protected items!: MenuItem[];
  protected isAddMembersOpen = false;
  protected isCreator = false;

  constructor() {
    effect(() => {
      if (this.space()) {
        this.buildMenuItems();
      }
    });
  }

  buildMenuItems() {
    this.isCreator = this.spaceService.checkIfCurrentUserIsCreator(this.space());
    this.items = [
      {
        label: 'Ações do Espaço',
        styleClass: 'font-bold ',
        items: [
          {
            separator: true
          },
          {
            label: 'Membros',
            icon: 'pi pi-user-plus',
            iconClass: 'mr-2',
            styleClass: 'mt-1',
            command: () => {
              this.spaceService.toggleMembersDialog(true);
            }
          },
          {
            label: 'Editar',
            icon: 'pi pi-pen-to-square',
            iconClass: 'mr-2',
            styleClass: 'mb-1',
            command: () => {
              this.spaceService.toggleFormDialog(true);
            }
          },
          {
            visible: this.isCreator,
            separator: this.isCreator
          },
          {
            label: 'Excluir',
            icon: 'pi pi-trash',
            iconClass: 'mr-2',
            styleClass: 'my-1',
            visible: this.isCreator,
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

  openDeleteConfirmDialog(event: Event) {
    this.confirmationService.confirm({
      target: event?.target || undefined,
      message: 'Tem certeza que deseja excluir este Espaço?\n\nEssa ação não pode ser desfeita.',
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
    const { error } = await this.spaceService.deleteSelectedSpace();

    if (error) {
      this.messageService.showMessage('error', 'Erro', error);
      return;
    }

    this.messageService.showMessage('success', 'Excluído', 'Espaço excluído com sucesso');
  }
}
