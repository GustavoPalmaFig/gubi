import { AutoCompleteModule } from 'primeng/autocomplete';
import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { iSpace } from '@features/spaces/interfaces/space.interface';
import { iUser } from '@features/auth/interfaces/user.interface';
import { SpaceService } from '@features/spaces/services/space.service';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-manage-members',
  imports: [DialogModule, Button, FormsModule, AutoCompleteModule, CommonModule, TooltipModule],
  templateUrl: './manage-members.component.html',
  styleUrl: './manage-members.component.scss'
})
export class ManageMembersComponent {
  private spaceService = inject(SpaceService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  @Input() visible = false;
  @Input() spaceToManage: iSpace | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();

  searchValue: iUser | null = null;
  members: iUser[] = [];
  filteredUsers: iUser[] = [];
  newSelectedUsers: iUser[] = [];
  isLoading = false;
  isCreator = false;

  ngOnChanges() {
    if (!this.spaceToManage) return;
    this.isCreator = this.spaceService.checkIfCurrentUserIsCreator(this.spaceToManage);
    this.getSpaceMembers();
  }

  async getSpaceMembers() {
    if (!this.spaceToManage) return;
    this.members = await this.spaceService.getSpaceMembers(this.spaceToManage.id);
  }

  async searchUsers(event: any) {
    if (!this.spaceToManage) return;
    const query = event.query;
    const availableUsers = await this.spaceService.getMembersToInvite(this.spaceToManage.id, query);
    this.filteredUsers = availableUsers.filter(user => !this.newSelectedUsers.some(selectedUser => selectedUser.id === user.id));
  }

  setNewUsers(event: any) {
    this.newSelectedUsers.push(event.value);
    this.searchValue = null;
    this.members.push(event.value);
  }

  isNewMember(user: iUser): boolean {
    return this.newSelectedUsers.some(selectedUser => selectedUser.id === user.id);
  }

  close(): void {
    this.searchValue = null;
    this.newSelectedUsers = [];
    this.filteredUsers = [];
    this.isLoading = false;
    this.visibleChange.emit(false);
  }

  async handleSubmit(): Promise<void> {
    if (this.newSelectedUsers.length === 0 || !this.spaceToManage) {
      return;
    }

    this.isLoading = true;
    const { error } = await this.spaceService.addMembersToSpace(this.spaceToManage.id, this.newSelectedUsers);

    if (error) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error, life: 10000 });
      this.isLoading = false;
      return;
    }

    const detailMessage = this.newSelectedUsers.length > 1 ? 'Usuários adicionados ao Espaço' : 'Usuário adicionado ao Espaço';
    this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: detailMessage, life: 10000 });
    this.close();
  }

  memberCanBeRemoved(member: iUser): boolean {
    return this.isCreator && !!this.spaceToManage && this.spaceToManage.creator_id !== member.id;
  }

  handleRemoveMember(user: iUser) {
    if (!this.spaceToManage) return;
    if (this.isNewMember(user)) {
      this.newSelectedUsers = this.newSelectedUsers.filter(selectedUser => selectedUser.id !== user.id);
      this.members = this.members.filter(member => member.id !== user.id);
      return;
    }

    this.confirmationService.confirm({
      target: event?.target || undefined,
      message: 'Tem certeza que deseja remover este usuário do Espaço?',
      header: 'Aviso',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancelar',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true
      },
      acceptButtonProps: {
        label: 'Remover',
        severity: 'danger'
      },

      accept: () => {
        this.removeMember(user);
      },
      reject: () => {
        this.messageService.add({ severity: 'warn', summary: 'Cancelado', detail: 'Operação cancelada' });
      }
    });
  }

  async removeMember(user: iUser): Promise<void> {
    this.isLoading = true;
    const { error } = await this.spaceService.removeMemberFromSpace(this.spaceToManage!.id, user.id);

    if (error) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error, life: 10000 });
      this.isLoading = false;
      return;
    }

    this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuário removido do Espaço', life: 10000 });
    this.members = this.members.filter(member => member.id !== user.id);
    this.isLoading = false;
  }
}
