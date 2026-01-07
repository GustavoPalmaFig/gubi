import { AuthService } from '@features/auth/services/auth.service';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from '@shared/services/message.service';
import { UserApiService } from '@features/settings/services/user-api.service';
import { UserAvatarComponent } from '@shared/components/user-avatar/user-avatar.component';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, UserAvatarComponent, ReactiveFormsModule, InputIcon, IconField, InputTextModule, ButtonModule],
  templateUrl: './settings.page.html',
  styleUrl: './settings.page.scss'
})
export class SettingsPage {
  protected authService = inject(AuthService);
  protected userApiService = inject(UserApiService);
  private messageService = inject(MessageService);

  protected isLoading = signal(false);
  protected userForm!: FormGroup;

  constructor() {
    effect(() => this.initializeForm());
  }

  initializeForm() {
    const user = this.authService.currentUser();
    if (!user) return;

    this.userForm = new FormGroup({
      id: new FormControl(user.id, [Validators.required]),
      email: new FormControl({ value: user.email, disabled: true }, [Validators.required]),
      fullname: new FormControl(user.fullname, [Validators.required]),
      avatar_url: new FormControl(user.avatar_url)
    });
  }

  async handleSubmit(): Promise<void> {
    this.isLoading.set(true);
    const user = this.userForm.getRawValue();

    const { error } = await this.userApiService.updateUser(user);

    if (error) {
      this.messageService.showMessage('error', 'Erro', error);
    } else {
      this.messageService.showMessage('success', 'Sucesso', 'Usuário atualizado com sucesso!');
      await this.authService.fetchAndStoreUser(user.id);
    }

    this.isLoading.set(false);
  }
}
