import { AuthService } from '@features/auth/services/auth.service';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { Component, inject } from '@angular/core';
import { Menu } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-header',
  imports: [MenubarModule, ButtonModule, Menu, BreadcrumbModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  public authService = inject(AuthService);

  userItems = [
    {
      label: 'Sair',
      icon: 'pi pi-power-off',
      command: () => this.logout()
    }
  ];

  home = { icon: 'pi pi-home', label: 'Página Inicial', routerLink: '/spaces' };
  crumbItems: MenuItem[] = [{ label: 'Espaços', styleClass: 'text-md font-medium' }];

  async logout() {
    await this.authService.logout();
  }
}
