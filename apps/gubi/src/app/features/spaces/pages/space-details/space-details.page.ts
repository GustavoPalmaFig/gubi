import { ActivatedRoute, Router } from '@angular/router';
import { BillListComponent } from '@features/bill/components/bill-list/bill-list.component';
import { Component, inject, signal } from '@angular/core';
import { ExpenseListComponent } from '@features/expense/components/expense-list/expense-list.component';
import { FormsModule } from '@angular/forms';
import { iSpace } from '@features/spaces/interfaces/space.interface';
import { ManageSpaceMembersComponent } from '@features/spaces/components/manage-space-members/manage-space-members.component';
import { MessageService } from '@shared/services/message.service';
import { Select } from 'primeng/select';
import { Skeleton } from 'primeng/skeleton';
import { SpaceApiService } from '@features/spaces/services/space-api.service';
import { SpaceFormDialogComponent } from '@features/spaces/components/space-form-dialog/space-form-dialog.component';
import { SpaceMenuComponent } from '@features/spaces/components/space-menu/space-menu.component';
import { SpaceService } from '@features/spaces/services/space.service';
import { TabsModule } from 'primeng/tabs';
import { UserAvatarComponent } from '@shared/components/user-avatar/user-avatar.component';
import Utils from '@shared/utils/utils';

@Component({
  selector: 'app-space-details',
  imports: [
    BillListComponent,
    ExpenseListComponent,
    Select,
    FormsModule,
    Skeleton,
    TabsModule,
    UserAvatarComponent,
    SpaceMenuComponent,
    SpaceFormDialogComponent,
    ManageSpaceMembersComponent
  ],
  templateUrl: './space-details.page.html',
  styleUrl: './space-details.page.scss'
})
export class SpaceDetailsPage {
  protected spaceService = inject(SpaceService);
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
      await this.loadMembers();
      this.isLoading.set(false);
    } else {
      this.handleSpaceNotFound();
    }
  }

  private async loadMembers() {
    this.space.members = await this.spaceApiService.getSpaceMembers(this.space.id);
  }

  private handleSpaceNotFound() {
    this.messageService.showMessage('error', 'Espaço não encontrado', 'Erro ao carregar espaço');
    this.navigateToSpaces();
  }

  private async getReferenceDates() {
    const start = new Date(2025, 0, 1); // Janeiro 2025
    const today = new Date();
    const end = new Date(today.getUTCFullYear(), today.getUTCMonth() + 6, 1); // Seis meses a frente

    const months: { label: string; value: Date }[] = [];

    const iter = new Date(start);
    while (iter <= end) {
      const monthName = iter.toLocaleString('default', { month: 'long' });
      const label = `${monthName} ${iter.getFullYear()}`;
      months.push({
        label: label.charAt(0).toUpperCase() + label.slice(1),
        value: new Date(iter)
      });
      iter.setMonth(iter.getMonth() + 1);
    }

    this.referenceDates = months;

    // Seleciona o mês atual por padrão
    const found = months.find(m => m.value.getFullYear() === today.getFullYear() && m.value.getMonth() === today.getMonth());
    this.selectedReferenceDate.set(found ? found.value : months[0].value);
  }

  protected setReferenceDate(date: Date) {
    this.selectedReferenceDate.set(date);
  }

  protected getAvatarColor(name: string): string {
    return Utils.stringToColor(name);
  }
}
