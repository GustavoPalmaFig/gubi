import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { iSpace } from '@features/spaces/interfaces/space.interface';
import { MenuModule } from 'primeng/menu';
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
  private spaceService = inject(SpaceService);

  @Input() space!: iSpace;
  @Output() spaceSelected = new EventEmitter<iSpace>();
  @Output() updateDialogVisibleChange = new EventEmitter<boolean>();
  @Output() membersDialogVisibleChange = new EventEmitter<boolean>();
  @Output() spaceDeleted = new EventEmitter<number>();

  protected items: MenuItem[];
  protected isAddMembersOpen = false;

  constructor() {
    this.items = [
      {
        label: 'Gerenciar Membros',
        icon: 'pi pi-plus',
        command: () => {
          this.membersDialogVisibleChange.emit(true);
        }
      },
      {
        label: 'Editar',
        icon: 'pi pi-pencil',
        command: () => {
          this.updateDialogVisibleChange.emit(true);
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

  addMembers() {
    if (this.space) {
      this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Funcionalidade em desenvolvimento', life: 30000 });
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

      accept: () => {
        this.deleteSelectedSpace();
      },
      reject: () => {
        this.messageService.add({ severity: 'warn', summary: 'Cancelado', detail: 'Operação cancelada' });
      }
    });
  }

  async deleteSelectedSpace() {
    const { error } = await this.spaceService.deleteSpace(this.space.id);
    if (error) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error, life: 10000 });
      return;
    }

    this.spaceDeleted.emit(this.space.id);
    this.messageService.add({ severity: 'info', summary: 'Excluído', detail: 'Espaço excluído com sucesso' });
  }
}
