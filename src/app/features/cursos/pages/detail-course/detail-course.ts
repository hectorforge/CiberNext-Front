import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CourseService } from '@features/cursos/services/course-service';
import { Course } from '@features/cursos/models/Course';
import { Document } from '@features/cursos/models/Document';
import { UnidadAprendizaje } from '@features/cursos/models/UnidadAprendizaje';

interface Clase {
  titulo: string;
  duracion: string;
}

interface Seccion {
  titulo: string;
  abierta: boolean;
  clases: Clase[];
}

@Component({
  selector: 'app-detail-course',
  standalone: true,
  imports: [RouterLink, RouterOutlet, CommonModule],
  templateUrl: './detail-course.html'
})
export class DetailCourse implements OnInit {
  curso!: Course;
  documentos: Document[] = [];
  unidades: UnidadAprendizaje[] = [];
  videoUrl!: string;
  secciones: Seccion[] = [];

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService
  ) {}

  ngOnInit(): void {
    const courseId = Number(this.route.snapshot.paramMap.get('id'));
    if (!courseId) return;

    this.courseService.getById(courseId).subscribe({
      next: (data: Course) => {
        this.curso = data;
        this.videoUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ'; 
      },
      error: (err) => console.error('Error al cargar curso', err)
    });

    this.courseService.getUnidadesJerarquico(courseId).subscribe({
      next: (unidad: UnidadAprendizaje) => {
        this.unidades = [unidad];

        // de cada unidad, cargar documentos
        this.unidades.forEach(u => {
          this.courseService.getDocumentsByUnidad(u.id).subscribe({
            next: (docs: Document[]) => {
              this.documentos.push(...docs);
              this.secciones.push({
                titulo: u.nombre,
                abierta: false,
                clases: docs.map(d => ({
                  titulo: d.nombre,
                  duracion: d.descripcion || 'Sin descripción'
                }))
              });
            },
            error: (err) => console.error(`Error al cargar documentos de la unidad ${u.id}`, err)
          });
        });
      },
      error: (err) => console.error('Error al cargar unidades', err)
    });
  }
}