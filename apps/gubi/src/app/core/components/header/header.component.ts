import { AuthService } from '@features/auth/services/auth.service';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { Component, inject } from '@angular/core';
import { LayoutService } from '@core/services/layout.service';
import { Menu } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { Router, RouterLink } from '@angular/router';
import { UserAvatarComponent } from '@shared/components/user-avatar/user-avatar.component';

@Component({
  selector: 'app-header',
  imports: [MenubarModule, ButtonModule, Menu, BreadcrumbModule, RouterLink, UserAvatarComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  protected authService = inject(AuthService);
  protected layoutService = inject(LayoutService);
  protected router = inject(Router);

  protected home: MenuItem = { icon: 'pi pi-home', label: 'Página Inicial', routerLink: '/spaces' };
  protected crumbItems: MenuItem[] = [];

  protected isMobile = this.layoutService.isMobile;
  protected openMobileSidebar = this.layoutService.toggleSidebarVisibility.bind(this.layoutService);

  constructor() {
    this.router.events.subscribe(() => {
      this.crumbItems = [
        { label: 'Espaços', styleClass: 'text-md font-medium', visible: this.isActive('/spaces') },
        { label: 'Métodos de Pagamento', styleClass: 'text-md font-medium', visible: this.isActive('/payment-methods') },
        { label: 'Detalhes do Espaço', styleClass: 'text-md font-medium', visible: this.isSpaceDetail() },
        { label: 'Meus Gastos', styleClass: 'text-md font-medium', visible: this.isActive('/my-spendings') }
      ];
    });
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  private isSpaceDetail(): boolean {
    return /^\/spaces\/\d+/.test(this.router.url);
  }

  get visibleCrumbItems(): MenuItem[] {
    return this.crumbItems.filter(item => item.visible);
  }
}
