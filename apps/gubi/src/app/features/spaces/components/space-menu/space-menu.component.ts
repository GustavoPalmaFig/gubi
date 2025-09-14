import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Component, effect, inject, input } from '@angular/core';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { iSpace } from '@features/spaces/interfaces/space.interface';
import { Menu } from 'primeng/menu';
import { MessageService } from '@shared/services/message.service';
import { SpaceService } from '@features/spaces/services/space.service';

@Component({
  selector: 'app-space-menu',
  imports: [CommonModule, Button, Menu],
  templateUrl: './space-menu.component.html',
  styleUrl: './space-menu.component.scss'
})
export class SpaceMenuComponent {
  protected spaceService = inject(SpaceService);
  protected confirmationService = inject(ConfirmationService);
  protected messageService = inject(MessageService);

  protected items!: MenuItem[];

  space = input<iSpace>();

  constructor() {
    effect(() => {
      const space = this.space();
      if (space) {
        this.buildMenuItems(space);
      }
    });
  }

  buildMenuItems(space: iSpace) {
    const isCreator = this.spaceService.checkIfCurrentUserIsCreator(space);

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
            visible: isCreator,
            separator: isCreator
          },
          {
            label: 'Excluir',
            icon: 'pi pi-trash',
            iconClass: 'mr-2',
            styleClass: 'my-1',
            visible: isCreator,
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

  toggleMenu(event: Event) {
    const space = this.space();
    if (space) this.spaceService.selectSpace(event, space);
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
