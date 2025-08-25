import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ProfesorService } from '../../services/profesor';
import { Profesor } from '../../models/profesor';

@Component({
  selector: 'app-editar-profesor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './editar-profesores.html'
})
export class EditarProfesorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private profesorService = inject(ProfesorService);
  private router = inject(Router);

  loading = false;
  profesorId!: number;

  profesorForm: FormGroup = this.fb.group({
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

  ngOnInit(): void {
    this.profesorId = Number(this.route.snapshot.paramMap.get('id'));
    this.profesorService.obtenerPorId(this.profesorId).subscribe((data: Profesor) => {
      this.profesorForm.patchValue(data);
    });
  }

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

  actualizar(): void {
    if (this.profesorForm.invalid) return;

    this.loading = true;

    const formValue = this.profesorForm.value;
    const profesorActualizado: Profesor = {
      id: this.profesorId,
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

    this.profesorService.actualizar(this.profesorId, profesorActualizado).subscribe({
      next: () => this.router.navigate(['/teacher/profesores']),
      error: () => this.loading = false
    });
  }

  volver(): void {
    this.router.navigate(['/teacher/dashboard']);
  }
  
}
  

