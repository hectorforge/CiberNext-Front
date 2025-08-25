import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { ProfesorService } from '../../services/profesor';
import { Profesor } from '../../models/profesor';

@Component({
  selector: 'app-crear-profesor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-profesores.html',
})
export class CrearProfesorComponent {
  private fb = inject(FormBuilder);
  private profesorService = inject(ProfesorService);
  private router = inject(Router);

  loading = false;

  profesorForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellido: ['', [Validators.required, Validators.minLength(2)]],
    dni: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/)]],
    telefono: ['', [Validators.required, Validators.pattern(/^[0-9\+\s\-]{7,15}$/)]],
    email: ['', [Validators.required, Validators.email]],
    codigoProfesor: ['', Validators.required],
    correoProfesional: ['', [Validators.required, Validators.email]],
    biografia: [''],
    fotoPerfil: ['']
  });

  getError(controlName: string): string {
    const control = this.profesorForm.get(controlName);
    if (control?.hasError('required')) return 'Campo obligatorio';
    if (control?.hasError('minlength')) return `Mínimo ${control.getError('minlength').requiredLength} caracteres`;
    if (control?.hasError('email')) return 'Correo inválido';
    if (control?.hasError('pattern')) {
      return controlName === 'dni' ? 'El DNI debe tener 8 dígitos' : 'Formato no válido';
    }
    return '';
  }

  guardar(): void {
    if (this.profesorForm.invalid) return;

    this.loading = true;

    const formValue = this.profesorForm.value;
const nuevoProfesor: Profesor = {
  nombre: formValue.nombre || '',
  apellido: formValue.apellido || '',
  dni: formValue.dni || '',
  telefono: formValue.telefono || '',
  email: formValue.email || '',
  codigoProfesor: formValue.codigoProfesor || '',
  correoProfesional: formValue.correoProfesional || '',
  biografia: formValue.biografia || '',
  fotoPerfil: formValue.fotoPerfil || ''
};

    this.profesorService.registrar(nuevoProfesor).subscribe({
      next: () => this.router.navigate(['/teacher/profesores']),
      error: () => this.loading = false
    });
  }

  volver(): void {
    this.router.navigate(['/teacher/dashboard']);
  }
}

