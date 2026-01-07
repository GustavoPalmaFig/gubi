import { AuthService } from '@features/auth/services/auth.service';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { UserAvatarComponent } from '@shared/components/user-avatar/user-avatar.component';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, UserAvatarComponent, ReactiveFormsModule, InputIcon, IconField, InputTextModule, ButtonModule],
  templateUrl: './settings.page.html',
  styleUrl: './settings.page.scss'
})
export class SettingsPage {
  protected authService = inject(AuthService);

  protected isLoading = signal(false);
  protected userForm: FormGroup;

  constructor() {
    this.userForm = new FormGroup({
      email: new FormControl({ value: '', disabled: true }, [Validators.required]),
      fullname: new FormControl('', [Validators.required]),
      avatar_url: new FormControl('')
    });

    effect(() => this.initializeForm());
  }

  initializeForm() {
    const user = this.authService.currentUser();
    if (!user) return;
    this.userForm.patchValue(user);
  }

  async handleSubmit() {
    this.isLoading.set(true);
  }
}
