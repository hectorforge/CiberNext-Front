import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html'
})
export class Register {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  loading = false;
  successMessage = '';
  errorMessage = '';

  registerForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
    apellido: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
    dni: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/)]],
    fotoPerfil: [''],
    email: ['', [Validators.required, Validators.email]]
  });

  handleSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    console.log('Formulario enviado:', this.registerForm.value);

    this.loading = true;

    this.authService.register(this.registerForm.value).subscribe({
      next: (res) => {
        this.successMessage = res.message || 'Usuario registrado con éxito';
        this.errorMessage = '';
        this.registerForm.reset();
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Error en el registro';
        this.loading = false;
        this.successMessage = '';
      }
    });
  }

  getErrorMessage(field: string): string {
    const control = this.registerForm.get(field);

    if (control?.hasError('required')) {
      return 'El campo es requerido';
    }
    if (control?.hasError('minlength')) {
      return `Debe tener al menos ${control.getError('minlength').requiredLength} caracteres`;
    }
    if (control?.hasError('maxlength')) {
      return `No debe exceder ${control.getError('maxlength').requiredLength} caracteres`;
    }
    if (control?.hasError('email')) {
      return 'El formato de correo no es válido';
    }
    if (control?.hasError('pattern')) {
      return field === 'dni'
        ? 'El DNI debe tener 8 dígitos'
        : 'Formato no válido';
    }
    return '';
  }
}
