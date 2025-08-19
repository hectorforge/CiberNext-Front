import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth-service';


@Component({
  selector: 'app-update-perfil',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './update-perfil.html',
  styles: ``
})
export class UpdatePerfil {
  
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  successMessage = '';
  errorMessage = '';
  loading = false;

  form = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    dni: ['', Validators.required],
    fotoPerfil: [''],
    email: ['', [Validators.required, Validators.email]]
  });

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (usuario) => {
        this.form.patchValue(usuario);
      }
    });
  }

  handleSubmit(): void {
    if (this.form.invalid) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.updateProfile(this.form.value).subscribe({
      next: (res) => {
        this.successMessage = res.message || 'Perfil actualizado con éxito';
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Error al actualizar perfil';
        this.loading = false;
      }
    });
  }

  getErrorMessage(field: string): string {
    const control = this.form.get(field);
    if (control?.hasError('required')) return 'El campo es requerido';
    if (control?.hasError('email')) return 'Formato de correo inválido';
    return '';
  }
}
