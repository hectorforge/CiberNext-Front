import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CourseService } from '@features/cursos/services/course-service';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth-service';
import { environment } from '@envs/environment';

interface Documento {
  documentoId: number;
  documentoNombre: string;
  documentoArchivo: string;
  tipoDocumentoNombre: string;
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
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule
  ],
  templateUrl: './home.html'
})
export class Home implements OnInit {
  private courseService = inject(CourseService);
  private authTokenService = inject(AuthService);

  cursos: Curso[] = [];
  loading = true;
  error: string | null = null;

  private userId!: string | null | undefined;

  URLBase: string = environment.URLBase;

  ngOnInit(): void {
    const token: any = this.authTokenService.decodeToken();
    this.userId = token?.userId;

    if (!this.userId) {
      this.error = 'No se pudo obtener el ID del usuario';
      this.loading = false;
      return;
    }

    this.courseService.getCursoPorIdEstudiante(Number(this.userId)).subscribe({
      next: (data) => {
        this.cursos = this.groupByCurso(data);
        if (this.cursos.length === 0) {
          this.error = 'No tienes cursos asignados actualmente.';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar cursos:', err);
        this.error = 'No se pudieron cargar los cursos';
        this.loading = false;
      }
    });
  }

  // 🔹 Agrupamos los datos planos en estructura Curso → Unidades → Documentos
  private groupByCurso(data: any[]): Curso[] {
    const cursosMap = new Map<number, Curso>();

    data.forEach(item => {
      if (!cursosMap.has(item.cursoId)) {
        cursosMap.set(item.cursoId, {
          cursoId: item.cursoId,
          cursoCodigo: item.cursoCodigo,
          cursoNombre: item.cursoNombre,
          cursoDescripcion: item.cursoDescripcion,
          unidades: []
        });
      }

      const curso = cursosMap.get(item.cursoId)!;

      let unidad = curso.unidades.find(u => u.unidadId === item.unidadId);
      if (!unidad) {
        unidad = {
          unidadId: item.unidadId,
          unidadNombre: item.unidadNombre,
          unidadDescripcion: item.unidadDescripcion,
          documentos: []
        };
        curso.unidades.push(unidad);
      }

      unidad.documentos.push({
        documentoId: item.documentoId,
        documentoNombre: item.documentoNombre,
        documentoArchivo: item.documentoArchivo,
        tipoDocumentoNombre: item.tipoDocumentoNombre
      });
    });

    return Array.from(cursosMap.values());
  }
}