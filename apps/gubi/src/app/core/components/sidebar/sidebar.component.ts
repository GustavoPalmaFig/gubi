import { AuthService } from '@features/auth/services/auth.service';
import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { Drawer } from 'primeng/drawer';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [Drawer, Button, RouterLink, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Output() toggleSidebar = new EventEmitter<boolean>();

  private router = inject(Router);
  private authService = inject(AuthService);
  protected isExpanded = signal(false);

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  toggle(): void {
    this.isExpanded.set(!this.isExpanded());
    this.toggleSidebar.emit(this.isExpanded());
  }

  async logout() {
    await this.authService.logout();
  }
}
