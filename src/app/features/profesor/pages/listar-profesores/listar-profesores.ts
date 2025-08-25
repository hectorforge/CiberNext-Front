import { Component, OnInit } from '@angular/core';
import { ProfesorService } from '../../services/profesor';
import { Profesor } from '../../models/profesor';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-listar-profesores',
  templateUrl: './listar-profesores.html',
  imports: [CommonModule]
})
export class ListarProfesoresComponent implements OnInit{
  profesores: Profesor[] = [];

  constructor(private profesorService: ProfesorService, private router: Router) {}

  ngOnInit(): void {
    this.profesorService.listar().subscribe(data => this.profesores = data);
  }

  eliminar(id: number) {
    if (confirm('¿Estás seguro de eliminar este profesor?')) {
      this.profesorService.eliminar(id).subscribe(() => {
        this.profesores = this.profesores.filter(p => p.id !== id);
      });
    }
  }

  ver(id: number) {
    this.router.navigate(['teacher/profesores/ver', id]);
  }

  volver(): void {
    this.router.navigate(['/teacher/dashboard']);
  }
}
