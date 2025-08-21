import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@envs/environment.development';

export interface CursoDto { id?: number; codigo?: string; nombre?: string; descripcion?: string; }
export interface ProfesorDto {
  idProfesor?: number;
  codigoProfesor?: string;
  nombre?: string;
  apellido?: string;
  correo?: string;
  fotoPerfil?: string;
  dni?: string;
  [key: string]: any;
}

export interface AlumnoDto {
  idAlumno?: number;
  codigoAlumno?: string;
  nombre?: string;
  apellido?: string;
  email?: string;
  pais?: string;
  fotoPerfil?: string;
  dni?: string;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class CoursesService {
  cursos = signal<CursoDto[]>([]);
  selected = signal<CursoDto | null>(null);

  private api = environment.apiURLCursos; // '/api/cursos' o full URL

  constructor(private http: HttpClient) {}

  load() {
    this.http.get<CursoDto[]>(this.api).subscribe({
      next: data => this.cursos.set(data || []),
      error: () => this.cursos.set([])
    });
  }

  select(c: CursoDto | null) { this.selected.set(c); }

  save(payload: CursoDto) {
    const req = payload.id ? this.http.put<CursoDto>(`${this.api}/${payload.id}`, payload)
                           : this.http.post<CursoDto>(this.api, payload);
    req.subscribe(() => this.load());
  }

  delete(id: number) { this.http.delete(`${this.api}/${id}`).subscribe(() => this.load()); }

  listarProfesoresPorCurso(idCurso: number): Observable<ProfesorDto[]> {
    return this.http.get<ProfesorDto[]>(`${this.api}/${idCurso}/profesores`);
  }

  listarAlumnosPorCurso(idCurso: number): Observable<AlumnoDto[]> {
    return this.http.get<AlumnoDto[]>(`${this.api}/${idCurso}/alumnos`);
  }

  buscarCursos(filtro: string) {
    const url = `${this.api}/buscar?filtro=${encodeURIComponent(filtro)}`;
    console.log('DEBUG: buscarCursos ->', url);
    this.http.get<CursoDto[]>(url).subscribe({
      next: data => this.cursos.set(data || []),
      error: err => {
        console.error('ERROR: buscarCursos', err);
        this.cursos.set([]);
      }
    });
  }
}
