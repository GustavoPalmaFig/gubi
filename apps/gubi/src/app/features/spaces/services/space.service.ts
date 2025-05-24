import { inject, Injectable, signal } from '@angular/core';
import { iUser } from '@features/auth/interfaces/user.interface';
import { Router } from '@angular/router';
import { iSpace } from '../interfaces/space.interface';
import { SpaceApiService } from './space-api.service';

@Injectable({
  providedIn: 'root'
})
export class SpaceService {
  private spaceApiService = inject(SpaceApiService);
  private router = inject(Router);

  private readonly _spaces = signal<iSpace[]>(Array(6).fill({}));
  private readonly _isFormDialogOpen = signal(false);
  private readonly _isMembersDialogOpen = signal(false);
  private readonly _selectedSpace = signal<iSpace | null>(null);

  public readonly spaces = this._spaces.asReadonly();
  public readonly isFormDialogOpen = this._isFormDialogOpen.asReadonly();
  public readonly isMembersDialogOpen = this._isMembersDialogOpen.asReadonly();
  public readonly selectedSpace = this._selectedSpace.asReadonly();

  async getAvailableSpaces() {
    const spaces = await this.spaceApiService.getUserSpaces();
    this._spaces.update(() => spaces);
  }

  toggleFormDialog(isOpen: boolean, isCreate = false): void {
    if (isCreate && this.selectedSpace()) this.unselectSpace();
    this._isFormDialogOpen.set(isOpen);
  }

  toggleMembersDialog(isOpen: boolean): void {
    this._isMembersDialogOpen.set(isOpen);
  }

  selectSpace(event: Event, space: iSpace | null): void {
    event.stopPropagation();
    event.preventDefault();
    this._selectedSpace.set(space);
  }

  unselectSpace(): void {
    this._selectedSpace.set(null);
  }

  async handleFormSubmit(name: string, description: string): Promise<{ error?: string }> {
    const selected = this.selectedSpace();
    const apiCall = selected ? this.spaceApiService.updateSpace(selected.id, name, description) : this.spaceApiService.createSpace(name, description);

    const { data, error } = await apiCall;
    if (error) return { error };

    this.updateSpaces(data);
    return {};
  }

  updateSpaces(space: iSpace) {
    const index = this.spaces().findIndex(s => s.id === space.id);
    if (index !== -1) {
      this._spaces()[index] = space;
    } else {
      this.router.navigate(['/spaces', space.id]);
    }
  }

  handleSpaceDeleted(spaceId: number) {
    this._spaces.update(spaces => spaces.filter(space => space.id !== spaceId));
  }

  async deleteSelectedSpace(): Promise<{ error?: string }> {
    const selected = this.selectedSpace();
    if (!selected) return { error: 'Espaço não selecionado' };
    const { error } = await this.spaceApiService.deleteSpace(selected.id);
    if (!error) this.removeSpaceFromList(selected.id);
    return { error };
  }

  removeSpaceFromList(spaceId: number) {
    this._spaces.update(spaces => spaces.filter(sp => sp.id !== spaceId));
  }

  checkIfCurrentUserIsCreator(space: iSpace): boolean {
    const members = space.members;
    const owner = members?.find(member => member.is_owner);
    return owner?.user_id === this.spaceApiService.userId;
  }

  setSpaceMembersAsUsers(space: iSpace): iUser[] {
    const members = space?.members;
    if (!members) {
      return [];
    }
    return members?.map(m => m.user);
  }
}
