import { AutoCompleteCompleteEvent, AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { iUser } from '@features/auth/interfaces/user.interface';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { MessageService } from '@shared/services/message.service';
import { SpaceApiService } from '@features/spaces/services/space-api.service';
import { SpaceService } from '@features/spaces/services/space.service';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-manage-space-members',
  imports: [DialogModule, Button, FormsModule, AutoCompleteModule, CommonModule, TooltipModule, LoadingComponent],
  templateUrl: './manage-space-members.component.html',
  styleUrl: './manage-space-members.component.scss'
})
export class ManageSpaceMembersComponent {
  protected spaceService = inject(SpaceService);
  protected spaceApiService = inject(SpaceApiService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  protected isDialogOpen = this.spaceService.isMembersDialogOpen;
  protected selectedSpace = this.spaceService.selectedSpace;
  protected spaceId = computed(() => this.spaceService.selectedSpace()?.id);

  searchValue: iUser | null = null;
  members: iUser[] = [];
  filteredUsers: iUser[] = [];
  newSelectedUsers: iUser[] = [];
  isLoading = false;
  isLoadingMembers = true;
  isCreator = false;

  constructor() {
    effect(() => this.setUpMembers());
  }

  setUpMembers() {
    const selectedSpace = this.selectedSpace();

    if (this.isDialogOpen() && selectedSpace) {
      this.isCreator = this.spaceService.checkIfCurrentUserIsCreator(selectedSpace);
      this.getSpaceMembers();
    }
  }

  async getSpaceMembers() {
    const spaceId = this.spaceId();
    if (!spaceId) return;
    this.members = await this.spaceApiService.getSpaceMembers(spaceId);
    this.isLoadingMembers = false;
  }

  async searchUsers(event: AutoCompleteCompleteEvent) {
    const spaceId = this.spaceId();
    if (!spaceId) return;
    const availableUsers = await this.spaceApiService.getMembersToInvite(spaceId, event.query);
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
    this.spaceService.toggleMembersDialog(false);
  }

  async handleSubmit(): Promise<void> {
    if (this.newSelectedUsers.length === 0) {
      return;
    }

    this.isLoading = true;
    const spaceId = this.spaceId();
    if (!spaceId) return;
    const { error } = await this.spaceApiService.addMembersToSpace(spaceId, this.newSelectedUsers);

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
    return this.isCreator && this.selectedSpace()?.creator_id !== member.id;
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
    const spaceId = this.spaceId();
    if (!spaceId) return;
    const { error } = await this.spaceApiService.removeMemberFromSpace(spaceId, user.id);

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
