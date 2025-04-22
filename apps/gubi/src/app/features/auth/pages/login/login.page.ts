import { AuthService } from '@features/auth/services/auth.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { PasswordModule } from 'primeng/password';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CardModule, InputTextModule, PasswordModule, ReactiveFormsModule, ButtonModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss'
})
export class LoginPage {
  protected loginForm: FormGroup;
  protected loading = false;

  private messageService = inject(MessageService);
  private authService = inject(AuthService);
  public router = inject(Router);

  constructor() {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required])
    });
  }

  async login() {
    if (this.loginForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Erro', detail: 'Preencha os campos corretamente', life: 30000 });
      return;
    }

    this.loading = true;
    const { email, password } = this.loginForm.value;
    const result = await this.authService.login(email, password);

    if (result.success) {
      this.router.navigate(['']);
    } else {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: result.error, life: 30000 });
    }

    this.loading = false;
  }
}
