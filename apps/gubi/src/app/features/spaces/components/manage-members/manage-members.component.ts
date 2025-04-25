import { AutoCompleteModule } from 'primeng/autocomplete';
import { Button } from 'primeng/button';
import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { iSpace } from '@features/spaces/interfaces/space.interface';
import { iUser } from '@features/auth/interfaces/user.interface';
import { MessageService } from 'primeng/api';
import { SpaceService } from '@features/spaces/services/space.service';
import { SupabaseService } from '@shared/services/supabase/supabase.service';

@Component({
  selector: 'app-manage-members',
  imports: [DialogModule, Button, FormsModule, AutoCompleteModule],
  templateUrl: './manage-members.component.html',
  styleUrl: './manage-members.component.scss'
})
export class ManageMembersComponent {
  private supabaseService = inject(SupabaseService);
  private spaceService = inject(SpaceService);
  private messageService = inject(MessageService);

  @Input() visible = false;
  @Input() spaceTomanage: iSpace | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();

  selectedUser: iUser | null = null;
  filteredUsers: iUser[] = [];
  isLoading = false;

  async searchUsers(event: any) {
    if (this.spaceTomanage === null) return;
    const query = event.query;
    this.filteredUsers = await this.spaceService.getMembersToInvite(this.spaceTomanage.id, query);
  }

  close(): void {
    this.selectedUser = null;
    this.filteredUsers = [];
    this.isLoading = false;
    this.visibleChange.emit(false);
  }

  async handleSubmit(): Promise<void> {
    if (this.selectedUser === null || this.spaceTomanage === null) {
      return;
    }

    this.isLoading = true;
    const { error } = await this.spaceService.addMemberToSpace(this.spaceTomanage.id, this.selectedUser.id);

    if (error) {
      const errorMessage = typeof error === 'string' ? error : (error as any).message;
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: errorMessage, life: 10000 });
      this.isLoading = false;
      return;
    }

    this.messageService.add({ severity: 'success', summary: 'Sucessos', detail: 'Usuário adicionado ao Espaço', life: 10000 });
    this.close();
  }
}
