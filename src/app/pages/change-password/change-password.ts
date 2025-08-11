import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-change-password',
  imports: [ReactiveFormsModule],
  templateUrl: './change-password.html',
  styles: ``
})
export class ChangePassword {
  
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  successMessage = '';
  errorMessage = '';
  loading = false;

  form = this.fb.group({
    actualPassword: ['', Validators.required],
    nuevaPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmarPassword: ['', Validators.required]
  });

  handleSubmit(): void {
    if (this.form.invalid) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.changePassword(this.form.value).subscribe({
      next: () => {
        this.successMessage = 'Contraseña actualizada con éxito, Inicie sesion nuevamente';
        this.form.reset();
        this.loading = false;

        setTimeout(() => {
          this.authService.logout();
          this.router.navigate(['/auth/login']);
        }, 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Error al cambiar contraseña';
        this.loading = false;
      }
    });
  }

  getErrorMessage(field: string): string {
    const control = this.form.get(field);
    if (control?.hasError('required')) return 'El campo es requerido';
    if (control?.hasError('minlength')) return 'Debe tener al menos 6 caracteres';
    return '';
  }
}
