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
    // Aquí inicializarías tus variables con datos reales,
    // quizás a través de un servicio que llama a una API.

    // Datos de ejemplo para la maquetación:
    this.curso = {
      titulo: 'Spring Framework 6 & Spring Boot 3 desde cero a experto'
    };

    this.videoUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ'; // URL del video

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
