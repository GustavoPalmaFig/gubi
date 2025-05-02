import { AuthService } from '@features/auth/services/auth.service';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { LayoutService } from '@core/services/layout.service';
import { Menu } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [MenubarModule, ButtonModule, Menu, BreadcrumbModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  public authService = inject(AuthService);
  protected readonly layoutService = inject(LayoutService);

  userItems: MenuItem[] = [
    {
      label: 'Sair',
      icon: 'pi pi-power-off',
      command: () => this.logout()
    }
  ];

  home: MenuItem = { icon: 'pi pi-home', label: 'Página Inicial', routerLink: '/spaces' };
  crumbItems: MenuItem[] = [{ label: 'Espaços', styleClass: 'text-md font-medium' }];

  openMobileSidebar() {
    this.layoutService.toggleSidebarVisibility();
  }

  async logout() {
    await this.authService.logout();
  }
}
