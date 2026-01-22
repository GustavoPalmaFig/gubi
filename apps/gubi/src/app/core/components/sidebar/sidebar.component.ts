import { AuthService } from '@features/auth/services/auth.service';
import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Drawer } from 'primeng/drawer';
import { iSpace } from '@features/spaces/interfaces/space.interface';
import { LayoutService } from '@core/services/layout.service';
import { Menu } from 'primeng/menu';
import { Router, RouterLink } from '@angular/router';
import { SpaceApiService } from '@features/spaces/services/space-api.service';
import { TooltipModule } from 'primeng/tooltip';
import { UserAvatarComponent } from '@shared/components/user-avatar/user-avatar.component';
import Utils from '@shared/utils/utils';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  subMenu?: MenuItem[];
  isExpanded?: boolean;
  spaceObj?: iSpace;
}

@Component({
  selector: 'app-sidebar',
  imports: [Drawer, Button, RouterLink, CommonModule, TooltipModule, UserAvatarComponent, Menu, UserAvatarComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  standalone: true
})
export class SidebarComponent {
  private router = inject(Router);
  protected authService = inject(AuthService);
  protected layoutService = inject(LayoutService);
  protected spaceApiService = inject(SpaceApiService);

  protected getusersFromMembers = Utils.getusersFromMembers;

  protected isSidebarOpen = this.layoutService.isSidebarOpen;
  protected isMobile = this.layoutService.isMobile;
  protected isSidebarExpanded = this.layoutService.isSidebarExpanded;
  protected sidebarClass = this.layoutService.sidebarClass;

  constructor() {
    this.addSpacesToMenu();
    this.router.events.subscribe(() => {
      if (this.isMobile()) {
        this.layoutService.setIsSidebarOpen(false);
      }
    });
  }

  protected menuItems: MenuItem[] = [
    { label: 'Início', icon: 'pi pi-home', route: '/home' },
    { label: 'Espaços', icon: 'pi pi-building', route: '/spaces' },
    { label: 'Pagamentos', icon: 'pi pi-credit-card', route: '/payment-methods' },
    { label: 'Meus Gastos', icon: 'pi pi-dollar', route: '/my-spendings' },
    { label: 'Configurações', icon: 'pi pi-cog', route: '/settings' }
  ];

  isActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }

  hasActiveSubMenu(item: MenuItem): boolean {
    return (item.isExpanded && item.subMenu?.some(subItem => this.isActive(subItem.route))) || false;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  async addSpacesToMenu(): Promise<void> {
    const spaces = await this.spaceApiService.getUserSpaces();
    const spacesMenuIndex = this.menuItems.findIndex(item => item.route === '/spaces');
    if (spacesMenuIndex !== -1) {
      const spacesSubMenu = spaces.map(space => ({
        label: space.name,
        icon: 'pi pi-building',
        route: `/spaces/${space.id}`,
        spaceObj: space
      }));
      this.menuItems[spacesMenuIndex].subMenu = [...(this.menuItems[spacesMenuIndex].subMenu || []), ...spacesSubMenu];
    }
  }
}
