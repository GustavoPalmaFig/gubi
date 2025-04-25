import { AutoCompleteCompleteEvent, AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, SimpleChanges } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { iSpace } from '@features/spaces/interfaces/space.interface';
import { iUser } from '@features/auth/interfaces/user.interface';
import { MessageService } from '@shared/services/message.service';
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
  @Input() spaceToManage!: iSpace;
  @Output() visibleChange = new EventEmitter<boolean>();

  searchValue: iUser | null = null;
  members: iUser[] = [];
  filteredUsers: iUser[] = [];
  newSelectedUsers: iUser[] = [];
  isLoading = false;
  isLoadingMembers = true;
  isCreator = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible']?.currentValue) {
      this.isCreator = this.spaceService.checkIfCurrentUserIsCreator(this.spaceToManage);
      this.getSpaceMembers();
    }
  }

  private get spaceId(): number {
    return this.spaceToManage.id;
  }

  async getSpaceMembers() {
    this.members = await this.spaceService.getSpaceMembers(this.spaceId);
    this.isLoadingMembers = false;
  }

  async searchUsers(event: AutoCompleteCompleteEvent) {
    const availableUsers = await this.spaceService.getMembersToInvite(this.spaceId, event.query);
    this.filteredUsers = availableUsers.filter(user => !this.newSelectedUsers.some(selectedUser => selectedUser.id === user.id));
  }

  setNewUsers(event: AutoCompleteSelectEvent) {
    this.newSelectedUsers.push(event.value);
    this.searchValue = null;
    this.members.push(event.value);
  }

  isNewMember(user: iUser): boolean {
    return this.newSelectedUsers.some(selectedUser => selectedUser.id === user.id);
  }

  resetState(): void {
    this.searchValue = null;
    this.newSelectedUsers = [];
    this.members = [];
    this.filteredUsers = [];
    this.isLoading = false;
    this.isLoadingMembers = true;
  }

  close(): void {
    this.resetState();
    this.visibleChange.emit(false);
  }

  async handleSubmit(): Promise<void> {
    if (this.newSelectedUsers.length === 0) {
      return;
    }

    this.isLoading = true;
    const { error } = await this.spaceService.addMembersToSpace(this.spaceId, this.newSelectedUsers);

    if (error) {
      this.messageService.showMessage('error', 'Erro', error);
      this.isLoading = false;
      return;
    }

    const detailMessage = this.newSelectedUsers.length > 1 ? 'Usuários adicionados ao Espaço' : 'Usuário adicionado ao Espaço';
    this.messageService.showMessage('success', 'Sucesso', detailMessage);
    this.close();
  }

  memberCanBeRemoved(member: iUser): boolean {
    return this.isCreator && this.spaceToManage.creator_id !== member.id;
  }

  handleRemoveMember(user: iUser) {
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
      accept: () => this.removeMember(user),
      reject: () => this.messageService.showMessage('warn', 'Cancelado', 'Operação cancelada')
    });
  }

  async removeMember(user: iUser): Promise<void> {
    this.isLoading = true;
    const { error } = await this.spaceService.removeMemberFromSpace(this.spaceId, user.id);

    if (error) {
      this.messageService.showMessage('error', 'Erro', error);
      this.isLoading = false;
      return;
    }

    this.messageService.showMessage('success', 'Sucesso', 'Usuário removido do Espaço');
    this.members = this.members.filter(member => member.id !== user.id);
    this.isLoading = false;
  }
}
