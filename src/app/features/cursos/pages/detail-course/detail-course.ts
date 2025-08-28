import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CourseService } from '@features/cursos/services/course-service';
import { AuthService } from '@core/services/auth-service';
import { ConsultaUnidadAprendizaje } from '@features/consulta/consulta-unidad-aprendizaje/consulta-unidad-aprendizaje';

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
  imports: [RouterLink, RouterOutlet, CommonModule, ConsultaUnidadAprendizaje],
  templateUrl: './detail-course.html',
})
export class DetailCourse implements OnInit {
  private route = inject(ActivatedRoute);
  private courseService = inject(CourseService);
  private authTokenService = inject(AuthService);

  userId!: number;
  curso: Curso | null = null;
  videoUrl: string | null = null;
  loading = true;
  error: string | null = null;
  activeTab: 'descripcion' | 'preguntas-respuestas' = 'descripcion';
  unidadSeleccionadaId: number | null = null;
  unidadSeleccionada: Unidad | null = null;

  setTab(tab: 'descripcion' | 'preguntas-respuestas') {
    this.activeTab = tab;
  }

  seleccionarUnidad(id: number) {
    this.unidadSeleccionadaId = id;
    this.unidadSeleccionada =
      this.curso?.unidades.find((u) => u.unidadId === id) || null;
    this.setTab('descripcion');
  }

  ngOnInit(): void {
    const courseId = Number(this.route.snapshot.paramMap.get('id'));

    const token: any = this.authTokenService.decodeToken();
    this.userId = token?.userId;

    if (!courseId) return;

    this.courseService.getCursoPorIdEstudiante(this.userId).subscribe({
      next: (data: any[]) => {
        const cursoPlano = data.filter((c) => c.cursoId === courseId);

        console.log('Filtro plano ', cursoPlano);

        if (!cursoPlano.length) {
          this.error = 'Curso no encontrado';
          this.loading = false;
          return;
        }        
        this.curso = this.groupByCurso(cursoPlano);
        
        const firstVideo2 = this.curso.unidades
          .flatMap((u) => u.documentos)
          .find((d) => d.tipoDocumentoExtension === 'mp4');
        if (firstVideo2) {
          this.videoUrl = firstVideo2.documentoArchivo;
        }
        this.loading = false;

        if (!cursoPlano.length) {
          this.error = 'Curso no encontrado';
          this.loading = false;
          return;
        }
        this.curso = this.groupByCurso(cursoPlano);

        // Simula el click en la primera unidad
        if (this.curso.unidades.length > 0) {
          this.seleccionarUnidad(this.curso.unidades[0].unidadId);
        }

        const firstVideo = this.curso.unidades
          .flatMap((u) => u.documentos)
          .find((d) => d.tipoDocumentoExtension === 'mp4');
        if (firstVideo) {
          this.videoUrl = firstVideo.documentoArchivo;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar curso', err);
        this.error = 'No se pudo cargar el curso';
        this.loading = false;
      },
    });
  }

  private groupByCurso(data: any[]): Curso {
    const unidadesMap = new Map<number, Unidad>();

    data.forEach((item) => {
      if (!unidadesMap.has(item.unidadId)) {
        unidadesMap.set(item.unidadId, {
          unidadId: item.unidadId,
          unidadNombre: item.unidadNombre,
          unidadDescripcion: item.unidadDescripcion,
          documentos: [],
        });
      }
      const unidad = unidadesMap.get(item.unidadId)!;
      unidad.documentos.push({
        documentoId: item.documentoId,
        documentoNombre: item.documentoNombre,
        documentoArchivo: item.documentoArchivo,
        tipoDocumentoNombre: item.tipoDocumentoNombre,
        tipoDocumentoExtension: item.tipoDocumentoExtension,
      });
    });

    return {
      cursoId: data[0].cursoId,
      cursoCodigo: data[0].cursoCodigo,
      cursoNombre: data[0].cursoNombre,
      cursoDescripcion: data[0].cursoDescripcion,
      unidades: Array.from(unidadesMap.values()),
    };
  }

  playVideo(url: string) {
    this.videoUrl = url;
  }

  getIcon(ext: string): string {
    switch (ext) {
      case 'mp4':
        return '🎬';
      case 'pdf':
        return '📄';
      case 'zip':
        return '🗂️';
      case 'pptx':
        return '📊';
      case 'url':
        return '🔗';
      default:
        return '📁';
    }
  }
}
