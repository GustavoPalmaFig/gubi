import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Component, inject, Input } from '@angular/core';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { iSpace } from '@features/spaces/interfaces/space.interface';
import { MenuModule } from 'primeng/menu';
import { MessageService } from '@shared/services/message.service';
import { RouterLink } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';
import { SpaceService } from '@features/spaces/services/space.service';

@Component({
  selector: 'app-space-card',
  imports: [MenuModule, RouterLink, Button, SkeletonModule, Card],
  templateUrl: './space-card.component.html',
  styleUrl: './space-card.component.scss'
})
export class SpaceCardComponent {
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  protected spaceService = inject(SpaceService);

  @Input() space!: iSpace;

  protected items: MenuItem[];
  protected isAddMembersOpen = false;

  constructor() {
    this.items = [
      {
        label: 'Gerenciar Membros',
        icon: 'pi pi-plus',
        command: () => {
          this.spaceService.toggleMembersDialog(true);
        }
      },
      {
        label: 'Editar',
        icon: 'pi pi-pencil',
        command: () => {
          this.spaceService.toggleFormDialog(true);
        }
      }
    ];
  }

  ngOnInit() {
    if (this.space) this.setItemsForCreator();
  }

  setItemsForCreator() {
    const isCreator = this.spaceService.checkIfCurrentUserIsCreator(this.space);

    if (isCreator) {
      this.items.push({
        label: 'Excluir',
        icon: 'pi pi-trash',
        styleClass: 'danger',
        command: event => {
          if (event.originalEvent) {
            this.openDeleteConfirmDialog(event.originalEvent);
          }
        }
      });
    }
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
