import { ActivatedRoute, Router } from '@angular/router';
import { Component, inject, signal } from '@angular/core';
import { iSpace } from '@features/spaces/interfaces/space.interface';
import { MessageService } from '@shared/services/message.service';
import { SpaceApiService } from '@features/spaces/services/space-api.service';

@Component({
  selector: 'app-space-details',
  imports: [],
  templateUrl: './space-details.page.html',
  styleUrl: './space-details.page.scss'
})
export class SpaceDetailsPage {
  protected spaceApiService = inject(SpaceApiService);
  protected activatedRoute = inject(ActivatedRoute);
  protected router = inject(Router);
  protected messageService = inject(MessageService);

  protected space!: iSpace;
  protected isLoading = signal(true);

  constructor() {
    this.activatedRoute.paramMap.subscribe(params => {
      const id = params.get('id');
      const spaceId = id ? Number(id) : null;

      if (!spaceId) {
        this.navigateToSpaces();
        return;
      }
      this.loadSpace(spaceId);
    });
  }

  private navigateToSpaces() {
    this.router.navigate(['/spaces']);
  }

  private async loadSpace(spaceId: number) {
    const space = await this.spaceApiService.getSpaceById(spaceId);
    if (space) {
      this.space = space;
      this.isLoading.set(false);
    } else {
      this.handleSpaceNotFound();
    }
  }

  private handleSpaceNotFound() {
    this.messageService.showMessage('error', 'Espaço não encontrado', 'Erro ao carregar espaço');
    this.navigateToSpaces();
  }
}
