import { AutoCompleteCompleteEvent, AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { iSpaceMember } from '@features/spaces/interfaces/space_member.interface';
import { iUser } from '@features/auth/interfaces/user.interface';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { MessageService } from '@shared/services/message.service';
import { SpaceApiService } from '@features/spaces/services/space-api.service';
import { SpaceService } from '@features/spaces/services/space.service';
import { TooltipModule } from 'primeng/tooltip';
import { UserAvatarComponent } from '@shared/components/user-avatar/user-avatar.component';

@Component({
  selector: 'app-manage-space-members',
  imports: [DialogModule, Button, FormsModule, AutoCompleteModule, CommonModule, TooltipModule, LoadingComponent, UserAvatarComponent],
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

  protected searchValue: iUser | null = null;
  protected members: (iSpaceMember | iUser)[] = [];
  protected filteredUsers: iUser[] = [];
  protected newSelectedUsers: iUser[] = [];
  protected isLoading = signal(false);
  protected isLoadingMembers = signal(true);
  protected isCreator = false;

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
    this.isLoadingMembers.set(false);
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

  isNewMember(member: iSpaceMember | iUser): member is iUser {
    return 'id' in member;
  }

  resetState(): void {
    this.searchValue = null;
    this.newSelectedUsers = [];
    this.members = [];
    this.filteredUsers = [];
    this.isLoading.set(false);
    this.isLoadingMembers.set(true);
  }

  close(): void {
    this.resetState();
    this.spaceService.toggleMembersDialog(false);
  }

  async handleSubmit(): Promise<void> {
    if (this.newSelectedUsers.length === 0) {
      return;
    }

    this.isLoading.set(true);
    const spaceId = this.spaceId();
    if (!spaceId) return;
    const { error } = await this.spaceApiService.addMembersToSpace(spaceId, this.newSelectedUsers);

    if (error) {
      this.messageService.showMessage('error', 'Erro', error);
      this.isLoading.set(false);
      return;
    }

    const detailMessage = this.newSelectedUsers.length > 1 ? 'Usuários adicionados ao Espaço' : 'Usuário adicionado ao Espaço';
    this.messageService.showMessage('success', 'Sucesso', detailMessage);
    this.close();
  }

  memberCanBeRemoved(member: iSpaceMember): boolean {
    return this.isCreator && !member.is_owner;
  }

  handleRemoveMember(member: iSpaceMember | iUser) {
    if (this.isNewMember(member)) {
      this.newSelectedUsers = this.newSelectedUsers.filter(selectedUser => selectedUser.id !== member.id);
      this.members = this.members.filter(m => (this.isNewMember(m) && m.id !== member.id) || !this.isNewMember(m));
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
      accept: () => this.removeMember(member),
      reject: () => this.messageService.showMessage('warn', 'Cancelado', 'Operação cancelada')
    });
  }

  async removeMember(member: iSpaceMember): Promise<void> {
    this.isLoading.set(true);
    const spaceId = this.spaceId();
    if (!spaceId) return;
    const { error } = await this.spaceApiService.removeMemberFromSpace(spaceId, member.user_id);

    if (error) {
      this.messageService.showMessage('error', 'Erro', error);
      this.isLoading.set(false);
      return;
    }

    this.messageService.showMessage('success', 'Sucesso', 'Usuário removido do Espaço');
    this.members = this.members.filter(m => !this.isNewMember(m) && m.user_id !== member.user_id);
    this.isLoading.set(false);
  }
}
