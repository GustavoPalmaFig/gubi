import { AuthService } from '@features/auth/services/auth.service';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { Component, inject } from '@angular/core';
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
  protected authService = inject(AuthService);
  protected layoutService = inject(LayoutService);

  protected userItems: MenuItem[] = [
    {
      label: 'Sair',
      icon: 'pi pi-power-off',
      command: () => this.authService.logout
    }
  ];

  protected home: MenuItem = { icon: 'pi pi-home', label: 'Página Inicial', routerLink: '/spaces' };
  protected crumbItems: MenuItem[] = [{ label: 'Espaços', styleClass: 'text-md font-medium' }];

  protected isMobile = this.layoutService.isMobile;
  protected openMobileSidebar = this.layoutService.toggleSidebarVisibility.bind(this.layoutService);
}
