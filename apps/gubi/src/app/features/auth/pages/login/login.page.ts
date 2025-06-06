import { AuthService } from '@features/auth/services/auth.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Component, inject, signal } from '@angular/core';
import { Divider } from 'primeng/divider';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { MessageService } from '@shared/services/message.service';
import { PasswordModule } from 'primeng/password';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CardModule, InputTextModule, PasswordModule, ReactiveFormsModule, ButtonModule, Divider, LoadingComponent],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss'
})
export class LoginPage {
  protected loginForm: FormGroup;
  protected isLoading = signal(false);
  protected isGoogleLoading = signal(false);

  private messageService = inject(MessageService);
  private authService = inject(AuthService);
  public router = inject(Router);

  constructor() {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required])
    });
  }

  async signInWithGoogle() {
    this.isGoogleLoading.set(true);
    const { error } = await this.authService.signInWithGoogle();

    if (error) {
      this.messageService.showMessage('error', 'Erro', error);
      this.isGoogleLoading.set(false);
      return;
    }
  }

  async login() {
    if (this.loginForm.invalid) {
      this.messageService.showMessage('warn', 'Erro', 'Preencha os campos corretamente');
      return;
    }

    this.isLoading.set(true);
    const { email, password } = this.loginForm.value;
    const { error } = await this.authService.login(email, password);

    if (error) {
      this.messageService.showMessage('error', 'Erro', error);
      this.isLoading.set(false);
      return;
    }
  }
}
