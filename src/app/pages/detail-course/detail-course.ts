import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common'; // Importa CommonModule para *ngFor

interface Clase {
  titulo: string;
  duracion: string;
}

interface Seccion {
  titulo: string;
  abierta: boolean;
  clases: Clase[];
}

interface Curso {
  titulo: string;
}

@Component({
  selector: 'app-detail-course',
  standalone: true,
  imports: [RouterLink, RouterOutlet, CommonModule],
  templateUrl: './detail-course.html'
})
export class DetailCourse implements OnInit {
  curso!: Curso;
  videoUrl!: string;
  secciones!: Seccion[];

  constructor() { }

  ngOnInit(): void {
    this.curso = {
      titulo: 'Spring Framework 6 & Spring Boot 3 desde cero a experto'
    };

    this.videoUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ';

    this.secciones = [
      {
        titulo: 'Sección 1: Introducción al curso',
        abierta: false,
        clases: [
          { titulo: '1. Creando un proyecto web con Spring Boot', duracion: '9 min' }
        ]
      },
      {
        titulo: 'Sección 2: Spring MVC',
        abierta: true,
        clases: [
          { titulo: '10. Creando un proyecto Web con Spring Boot', duracion: '9 min' },
          { titulo: '11. Estructura de una aplicación Spring Boot', duracion: '13 min' },
          { titulo: '12. Creando el controlador', duracion: '12 min' }
        ]
      }
    ];
  }
}
