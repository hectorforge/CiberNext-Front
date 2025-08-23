import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ProfesorService } from '../../services/profesor';
import { Profesor } from '../../models/profesor';

@Component({
  selector: 'app-editar-profesor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-profesores.html'
})
export class EditarProfesorComponent implements OnInit {
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

  constructor(
    private route: ActivatedRoute,
    private profesorService: ProfesorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.profesorService.obtenerPorId(id).subscribe(data => this.profesor = data);
  }

  actualizar(): void {
    this.profesorService.actualizar(this.profesor.id!, this.profesor).subscribe(() => {
      this.router.navigate(['/teacher/profesores']);
    });
  }
}
