import { AuthService } from '@features/auth/services/auth.service';
import { ButtonModule } from 'primeng/button';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-spaces',
  imports: [ButtonModule],
  templateUrl: './spaces.page.html',
  styleUrl: './spaces.page.scss'
})
export class SpacesPage {
  protected authService = inject(AuthService);

  createSpace() {
    console.log('clicked');
  }
}
