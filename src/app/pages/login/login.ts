import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {AuthService} from '../../services/auth-service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule,RouterLink],
  templateUrl: './login.html'
})
export class Login {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  errorMessage = '';
  loading = false;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  handleSubmit(): void {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login(email!.trim(), password!.trim()).subscribe({
      next: (res) => {
        console.log('Login exitoso:', res);
        this.loading = false;
        this.router.navigate(['/home']);

      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Error en el login';
        this.loading = false;
      }
    });
  }

  getErrorMessage(field: string): string {
    const control = this.loginForm.get(field);

    if (control?.hasError('required')) {
      return 'El campo es requerido';
    }
    if (control?.hasError('email')) {
      return 'El formato de correo no es válido';
    }
    return '';
  }
}
