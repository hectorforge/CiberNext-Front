import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProfesorService } from '../../services/profesor';
import { Profesor } from '../../models/profesor';

@Component({
  selector: 'app-crear-profesor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-profesores.html',
})
export class CrearProfesorComponent {
  profesor: Profesor = {
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    correo: '',
    codigoProfesor: '',
    correoProfesional: '',
    biografia: '',
    fotoPerfil: '',
  };

  constructor(private profesorService: ProfesorService, private router: Router) {}

  guardar(): void {
    this.profesorService.registrar(this.profesor).subscribe(() => {
      this.router.navigate(['/teacher/profesores']);
    });
  }
}

