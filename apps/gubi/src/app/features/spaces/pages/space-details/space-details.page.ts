import { ActivatedRoute, Router } from '@angular/router';
import { BillListComponent } from '@features/bill/components/bill-list.component';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { iSpace } from '@features/spaces/interfaces/space.interface';
import { MessageService } from '@shared/services/message.service';
import { Select } from 'primeng/select';
import { Skeleton } from 'primeng/skeleton';
import { SpaceApiService } from '@features/spaces/services/space-api.service';
import Utils from '@shared/utils/utils';

@Component({
  selector: 'app-space-details',
  imports: [BillListComponent, Select, FormsModule, Skeleton],
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
  protected referenceDates: { label: string; value: Date }[] = [];
  protected selectedReferenceDate = signal<Date>(new Date());

  constructor() {
    this.activatedRoute.paramMap.subscribe(params => {
      const id = params.get('id');
      const spaceId = id ? Number(id) : null;

      if (!spaceId) {
        this.navigateToSpaces();
        return;
      }
      this.loadSpace(spaceId);
      this.getReferenceDates();
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

  private async getReferenceDates() {
    this.referenceDates = [
      { label: 'Janeiro 2025', value: new Date('2025-01-01') },
      { label: 'Fevereiro 2025', value: new Date('2025-02-01') },
      { label: 'Março 2025', value: new Date('2025-03-01') },
      { label: 'Abril 2025', value: new Date('2025-04-01') },
      { label: 'Maio 2025', value: new Date('2025-05-01') },
      { label: 'Junho 2025', value: new Date('2025-06-01') },
      { label: 'Julho 2025', value: new Date('2025-07-01') },
      { label: 'Agosto 2025', value: new Date('2025-08-01') },
      { label: 'Setembro 2025', value: new Date('2025-09-01') },
      { label: 'Outubro 2025', value: new Date('2025-10-01') },
      { label: 'Novembro 2025', value: new Date('2025-11-01') },
      { label: 'Dezembro 2025', value: new Date('2025-12-01') }
    ];

    const currentDate = Utils.dateToUTC(new Date());
    const currentMonth =
      this.referenceDates.find(date => date.value.getUTCMonth() === currentDate.getUTCMonth() && date.value.getUTCFullYear() === currentDate.getUTCFullYear()) ||
      this.referenceDates[0];
    this.selectedReferenceDate.set(currentMonth.value);
  }

  setReferenceDate(date: Date) {
    this.selectedReferenceDate.set(date);
  }
}
