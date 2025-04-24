import { AddMembersComponent } from '@features/spaces/components/add-members/add-members.component';
import { AuthService } from '@features/auth/services/auth.service';
import { ButtonModule } from 'primeng/button';
import { Component, inject } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { iSpace } from '@features/spaces/interfaces/space.interface';
import { MenuModule } from 'primeng/menu';
import { RouterModule } from '@angular/router';
import { SpaceCardComponent } from '@features/spaces/components/space-card/space-card.component';
import { SpaceDialogComponent } from '@features/spaces/components/space-dialog/space-dialog.component';
import { SpaceService } from '@features/spaces/services/space.service';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-spaces',
  imports: [ButtonModule, InputTextModule, TextareaModule, RouterModule, MenuModule, SpaceDialogComponent, SpaceCardComponent, AddMembersComponent],
  templateUrl: './spaces.page.html',
  styleUrl: './spaces.page.scss'
})
export class SpacesPage {
  protected authService = inject(AuthService);
  private spaceService = inject(SpaceService);

  protected isOpenDialog = false;
  protected isAddMemberOpenDialog = false;
  protected isLoading = true;
  protected spaces: iSpace[] = [];
  protected selectedSpace: iSpace | null = null;

  ngOnInit() {
    this.getAvailableSpaces();
  }

  async getAvailableSpaces() {
    this.spaces = await this.spaceService.getUserSpaces();
    this.isLoading = false;
  }

  handleUpdateDialogVisibility(visible: boolean, isEdit = true) {
    if (!isEdit) {
      this.selectedSpace = null;
    }

    this.isOpenDialog = visible;
  }

  setSelectedSpace(space: iSpace) {
    this.selectedSpace = space;
  }

  handleSpaceSaved(space: iSpace) {
    if (this.selectedSpace) {
      const index = this.spaces.findIndex(s => s.id === space.id);
      if (index !== -1) {
        this.spaces[index] = space;
      }
    } else this.spaces.push(space);
  }

  handleSpaceDeleted(spaceId: number) {
    this.spaces = this.spaces.filter(space => space.id !== spaceId);
  }

  handleAddMemberDialogVisibility(visible: boolean) {
    this.isAddMemberOpenDialog = visible;
  }
}
