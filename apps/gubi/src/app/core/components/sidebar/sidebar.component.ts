import { AuthService } from '@features/auth/services/auth.service';
import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Component, effect, inject, Input, signal } from '@angular/core';
import { Drawer } from 'primeng/drawer';
import { LayoutService } from '@core/services/layout.service';
import { Router, RouterLink } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [Drawer, Button, RouterLink, CommonModule, TooltipModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  standalone: true
})
export class SidebarComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  protected readonly layoutService = inject(LayoutService);

  protected menuItems: MenuItem[] = [
    { label: 'Espaços', icon: 'pi pi-home', route: '/spaces' },
    { label: 'Pagamentos', icon: 'pi pi-credit-card', route: '/pagamentos' }
  ];

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  async logout(): Promise<void> {
    await this.authService.logout();
  }
}
