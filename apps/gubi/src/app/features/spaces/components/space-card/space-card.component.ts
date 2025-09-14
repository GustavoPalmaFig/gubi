import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { iSpace } from '@features/spaces/interfaces/space.interface';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { RouterLink } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';
import { SpaceService } from '@features/spaces/services/space.service';
import { UserAvatarComponent } from '@shared/components/user-avatar/user-avatar.component';
import { SpaceMenuComponent } from '../space-menu/space-menu.component';

@Component({
  selector: 'app-space-card',
  imports: [MenuModule, RouterLink, SkeletonModule, CommonModule, UserAvatarComponent, SpaceMenuComponent],
  templateUrl: './space-card.component.html',
  styleUrl: './space-card.component.scss'
})
export class SpaceCardComponent {
  protected spaceService = inject(SpaceService);

  space = input.required<iSpace>();

  protected items!: MenuItem[];
  protected isAddMembersOpen = false;
  protected isCreator = false;
}
