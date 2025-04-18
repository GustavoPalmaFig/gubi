import { AuthService } from '@features/auth/services/auth.service';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { PasswordModule } from 'primeng/password';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CardModule, InputTextModule, PasswordModule, ReactiveFormsModule, DividerModule, CommonModule],
  templateUrl: './register.page.html',
  styleUrl: './register.page.scss'
})
export class RegisterPage {
  protected registerForm: FormGroup;
  protected loading = false;
  private strongPasswordRegx = /^(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=\D*\d).{8,}$/;
  public passwordRules = [
    { message: 'Mínimo 1 letra maiúscula', regex: /(?=.*[A-Z])/ },
    { message: 'Mínimo 1 letra minúscula', regex: /(?=.*[a-z])/ },
    { message: 'Mínimo 1 número', regex: /(?=.*[0-9])/ },
    { message: 'Mínimo 1 caracter especial', regex: /(?=.*[!@#$%^&*])/ },
    { message: 'Mínimo 8 caracteres', regex: /(.{8,})/ }
  ];

  private messageService = inject(MessageService);
  private authService = inject(AuthService);
  public router = inject(Router);

  constructor() {
    this.registerForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.pattern(this.strongPasswordRegx)])
    });
  }

  get passwordFormField() {
    return this.registerForm.get('password');
  }

  async register() {
    if (this.registerForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Erro', detail: 'Preencha os campos corretamente', life: 30000 });
      return;
    }

    this.loading = true;
    const { name, email, password } = this.registerForm.value;
    const result = await this.authService.register(name, email, password);

    if (result.success) {
      this.router.navigate(['']);
    } else {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: result.error, life: 30000 });
    }

    this.loading = false;
  }
}
