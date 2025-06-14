import { AuthService } from '@features/auth/services/auth.service';
import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Drawer } from 'primeng/drawer';
import { LayoutService } from '@core/services/layout.service';
import { Menu } from 'primeng/menu';
import { Router, RouterLink } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { UserAvatarComponent } from '@shared/components/user-avatar/user-avatar.component';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [Drawer, Button, RouterLink, CommonModule, TooltipModule, UserAvatarComponent, Menu],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  standalone: true
})
export class SidebarComponent {
  private router = inject(Router);
  protected authService = inject(AuthService);
  protected layoutService = inject(LayoutService);

  protected isSidebarOpen = this.layoutService.isSidebarOpen;
  protected isMobile = this.layoutService.isMobile;
  protected isSidebarExpanded = this.layoutService.isSidebarExpanded;
  protected sidebarClass = this.layoutService.sidebarClass;

  constructor() {
    this.router.events.subscribe(() => {
      if (this.isMobile()) {
        this.layoutService.setIsSidebarOpen(false);
      }
    });
  }

  protected menuItems: MenuItem[] = [
    { label: 'Espaços', icon: 'pi pi-home', route: '/spaces' },
    { label: 'Pagamentos', icon: 'pi pi-credit-card', route: '/payment-methods' },
    { label: 'Meus Gastos', icon: 'pi pi-dollar', route: '/my-spendings' }
  ];

  isActive(route: string): boolean {
    return this.router.url === route;
  }
}
