import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CourseService } from '@features/cursos/services/course-service';

interface Documento {
  documentoId: number;
  documentoNombre: string;
  documentoArchivo: string;
  tipoDocumentoNombre: string;
  tipoDocumentoExtension: string;
}

interface Unidad {
  unidadId: number;
  unidadNombre: string;
  unidadDescripcion: string;
  documentos: Documento[];
}

interface Curso {
  cursoId: number;
  cursoCodigo: string;
  cursoNombre: string;
  cursoDescripcion: string;
  unidades: Unidad[];
}

@Component({
  selector: 'app-detail-course',
  standalone: true,
  imports: [RouterLink, RouterOutlet, CommonModule],
  templateUrl: './detail-course.html'
})
export class DetailCourse implements OnInit {
  private route = inject(ActivatedRoute);
  private courseService = inject(CourseService);

  curso!: Curso;
  videoUrl: string | null = null;
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    const courseId = Number(this.route.snapshot.paramMap.get('id'));
    if (!courseId) return;

    this.courseService.getCursoPorIdEstudiante(9).subscribe({ // 🔹 aquí 9 es fijo, deberías pasarlo dinámico según user
      next: (data: any[]) => {
        const cursoPlano = data.filter(c => c.cursoId === courseId);
        if (!cursoPlano.length) {
          this.error = 'Curso no encontrado';
          this.loading = false;
          return;
        }
        this.curso = this.groupByCurso(cursoPlano);
        // Seleccionar primer video como predeterminado
        const firstVideo = this.curso.unidades
          .flatMap(u => u.documentos)
          .find(d => d.tipoDocumentoExtension === 'mp4');
        if (firstVideo) {
          this.videoUrl = firstVideo.documentoArchivo;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar curso', err);
        this.error = 'No se pudo cargar el curso';
        this.loading = false;
      }
    });
  }

  private groupByCurso(data: any[]): Curso {
    const unidadesMap = new Map<number, Unidad>();

    data.forEach(item => {
      if (!unidadesMap.has(item.unidadId)) {
        unidadesMap.set(item.unidadId, {
          unidadId: item.unidadId,
          unidadNombre: item.unidadNombre,
          unidadDescripcion: item.unidadDescripcion,
          documentos: []
        });
      }
      const unidad = unidadesMap.get(item.unidadId)!;
      unidad.documentos.push({
        documentoId: item.documentoId,
        documentoNombre: item.documentoNombre,
        documentoArchivo: item.documentoArchivo,
        tipoDocumentoNombre: item.tipoDocumentoNombre,
        tipoDocumentoExtension: item.tipoDocumentoExtension
      });
    });

    return {
      cursoId: data[0].cursoId,
      cursoCodigo: data[0].cursoCodigo,
      cursoNombre: data[0].cursoNombre,
      cursoDescripcion: data[0].cursoDescripcion,
      unidades: Array.from(unidadesMap.values())
    };
  }

  playVideo(url: string) {
    this.videoUrl = url;
  }

  getIcon(ext: string): string {
    switch (ext) {
      case 'mp4': return '🎬';
      case 'pdf': return '📄';
      case 'zip': return '🗂️';
      case 'pptx': return '📊';
      case 'url': return '🔗';
      default: return '📁';
    }
  }
}
