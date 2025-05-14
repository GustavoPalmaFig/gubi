import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DataViewModule } from 'primeng/dataview';
import { InputTextModule } from 'primeng/inputtext';
import { ManageSpaceMembersComponent } from '@features/spaces/components/manage-space-members/manage-space-members.component';
import { MenuModule } from 'primeng/menu';
import { RouterModule } from '@angular/router';
import { SpaceCardComponent } from '@features/spaces/components/space-card/space-card.component';
import { SpaceFormDialogComponent } from '@features/spaces/components/space-form-dialog/space-form-dialog.component';
import { SpaceService } from '@features/spaces/services/space.service';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-spaces',
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    RouterModule,
    MenuModule,
    SpaceFormDialogComponent,
    SpaceCardComponent,
    ManageSpaceMembersComponent,
    DataViewModule
  ],
  templateUrl: './spaces.page.html',
  styleUrl: './spaces.page.scss'
})
export class SpacesPage {
  protected spaceService = inject(SpaceService);
  protected spaces = this.spaceService.spaces;

  constructor() {
    this.spaceService.getAvailableSpaces();
  }
}
