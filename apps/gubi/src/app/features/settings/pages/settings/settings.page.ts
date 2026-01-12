import { AuthService } from '@features/auth/services/auth.service';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { eBucketName } from '@shared/enums/bucketName.enum';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { MessageService } from '@shared/services/message.service';
import { StorageService } from '@shared/services/supabase/storage.service';
import { UserApiService } from '@features/settings/services/user-api.service';
import { UserAvatarComponent } from '@shared/components/user-avatar/user-avatar.component';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, UserAvatarComponent, ReactiveFormsModule, InputIcon, IconField, InputTextModule, ButtonModule, LoadingComponent],
  templateUrl: './settings.page.html',
  styleUrl: './settings.page.scss'
})
export class SettingsPage {
  protected authService = inject(AuthService);
  protected userApiService = inject(UserApiService);
  private messageService = inject(MessageService);
  private storageService = inject(StorageService);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  protected isLoading = signal(false);
  protected isUploadingAvatar = signal(false);
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

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  async handleAvatarUpload(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const { type, size } = file;
    if (!type.startsWith('image/')) {
      this.messageService.showMessage('error', 'Erro', 'Por favor, selecione uma imagem válida');
      return;
    }

    if (size > 5 * 1024 * 1024) {
      this.messageService.showMessage('error', 'Erro', 'Imagem muito grande. Máx: 5MB');
      return;
    }

    this.isUploadingAvatar.set(true);

    try {
      const userId = this.authService.currentUser()?.id;
      if (!userId) return;

      const url = await this.storageService.uploadFile(eBucketName.avatar, userId, file, { returnUrl: true });
      this.userForm.patchValue({ avatar_url: url });
      this.userForm.get('avatar_url')?.markAsDirty();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.messageService.showMessage('error', 'Erro', errorMessage);
    } finally {
      this.isUploadingAvatar.set(false);
      input.value = '';
    }
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
