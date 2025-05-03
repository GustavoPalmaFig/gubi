import { effect, inject, Injectable, signal } from '@angular/core';
import { iSpace } from '../interfaces/space.interface';
import { SpaceApiService } from './space-api.service';

@Injectable({
  providedIn: 'root'
})
export class SpaceService {
  private spaceApiService = inject(SpaceApiService);

  private readonly _spaces = signal<iSpace[]>(Array(6).fill({}));
  private readonly _isFormDialogOpen = signal(false);
  private readonly _isMembersDialogOpen = signal(false);
  private readonly _selectedSpace = signal<iSpace | null>(null);

  public readonly spaces = this._spaces.asReadonly();
  public readonly isFormDialogOpen = this._isFormDialogOpen.asReadonly();
  public readonly isMembersDialogOpen = this._isMembersDialogOpen.asReadonly();
  public readonly selectedSpace = this._selectedSpace.asReadonly();

  constructor() {
    effect(() => this._selectedSpace.set(this._isFormDialogOpen() || this._isMembersDialogOpen() ? this._selectedSpace() : null));
  }

  async getAvailableSpaces() {
    const spaces = await this.spaceApiService.getUserSpaces();
    this._spaces.update(() => spaces);
  }

  toggleFormDialog(isOpen: boolean): void {
    this._isFormDialogOpen.set(isOpen);
  }

  toggleMembersDialog(isOpen: boolean): void {
    this._isMembersDialogOpen.set(isOpen);
  }

  selectSpace(space: iSpace | null): void {
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
      this._spaces().push(space);
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
    return space.creator_id === this.spaceApiService.userId;
  }
}
