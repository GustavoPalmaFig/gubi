import { AuthService } from '@features/auth/services/auth.service';
import { ButtonModule } from 'primeng/button';
import { Component, inject } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';

@Component({
  selector: 'app-header',
  imports: [MenubarModule, ButtonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private authService = inject(AuthService);

  async logout() {
    await this.authService.logout();
  }
}
