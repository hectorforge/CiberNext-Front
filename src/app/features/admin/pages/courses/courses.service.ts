import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@envs/environment.development';


export interface CursoDto { id?: number; codigo?: string; nombre?: string; descripcion?: string; }
export interface ProfesorDto {
  id?: number; // <-- agregado para seguridad
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

export interface DocumentoDto {
  id?: number;
  nombre?: string;
  archivo?: string;
  descripcion?: string;
  idTipoDocumento?: number;
  nombreTipoDucumento?: string;
  extensionTipoDocumento?: string;
  idUnidadAprendizaje?: number;
  nombreUnidadaprendizaje?: string;
  codigoUnidadaprendizaje?: string;
  descripcionUnidadaprendizaje?: string;
  estadoUnidadaprendizaje?: string;
  cursoId?: number;
}

@Injectable({ providedIn: 'root' })
export class CoursesService {
  cursos = signal<CursoDto[]>([]);
  selected = signal<CursoDto | null>(null);

  private api = environment.apiURLCursos; 

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

  listarDocumentosPorCurso(idCurso: number): Observable<DocumentoDto[]> {
    return this.http.get<DocumentoDto[]>(`${this.api}/${idCurso}/documentos`);
  }

  listarProfesoresDisponibles(): Observable<ProfesorDto[]> {
    return this.http.get<ProfesorDto[]>(`${environment.apiURLProfesores}`);
  }

  buscarProfesores(filtro: string): Observable<ProfesorDto[]> {
    const url = `${environment.apiURLProfesores}/buscar?filtro=${encodeURIComponent(filtro)}`;
    return this.http.get<ProfesorDto[]>(url);
  }

  asignarProfesor(cursoId: number, profesorId: number) {
    return this.http.post(`${this.api}/${cursoId}/asignar-profesor/${profesorId}`, {});
  }

  asignarProfesorDto(payload: { cursoId: number; profesorId: number; }) {
    return this.http.post(`${this.api}/asignar-profesor`, payload);
  }
  
  registrarDocumento(doc: DocumentoDto): Observable<DocumentoDto> {
    return this.http.post<DocumentoDto>(`${this.api}/registrar-documento`, doc);
  }

  eliminarDocumento(idDocumento: number): Observable<any> {
    return this.http.delete(`${this.api}/${idDocumento}/eliminar-documento`);
  }
  
  actualizarDocumento(idCurso: number, doc: DocumentoDto): Observable<DocumentoDto> {
    return this.http.put<DocumentoDto>(`${this.api}/${idCurso}/actualizar-documento`, doc);
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
