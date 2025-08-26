import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@envs/environment.development';
import { Observable } from 'rxjs';

export interface RegistroAlumnoRequestDto {
  cursoId: number;
  alumnoId: number;
  profesorId: number;
}
export interface RegistroAlumnoResponseDto {
  id: number;
  fechaInscripcion: string;
  cursoId: number; nombreCurso: string;
  alumnoId: number; nombreAlumno: string; correoAlumno: string; codigoAlumno: string;
  profesorId: number; nombreProfesor: string; correoProfesor: string; codigoProfesor: string;
}

@Injectable({ providedIn: 'root' })
export class RegisterStudentsService {
  registros = signal<RegistroAlumnoResponseDto[]>([]);
  selected = signal<RegistroAlumnoRequestDto | null>(null);

  private api = `${environment.apiURLBase}/registro-alumno`;

  constructor(private http: HttpClient) {}

  load() {
    this.http.get<RegistroAlumnoResponseDto[]>(this.api).subscribe({
      next: data => this.registros.set(data || []),
      error: () => this.registros.set([])
    });
  }

  // Buscar registros en backend: GET /api/registro-alumno/buscar?filtro=...
  buscar(filtro: string) {
    const url = `${this.api}/buscar?filtro=${encodeURIComponent(filtro)}`;
    return this.http.get<RegistroAlumnoResponseDto[]>(url);
  }
  
  save(payload: RegistroAlumnoRequestDto) {
    this.http.post<RegistroAlumnoResponseDto>(this.api, payload).subscribe({
      next: () => {
        this.load();
      },
      error: (err) => {
        const status = err?.status ?? 0;
        const serverMsg = err?.error?.message || err?.error?.mensaje || null;
        if (status === 409 || status === 400) {
          const msg = serverMsg || 'El profesor no está asignado para dictar este curso.';
          alert(msg);
          return;
        }
        alert('Error al registrar el alumno. Código: ' + status + (serverMsg ? ' — ' + serverMsg : ''));
      }
    });
  }

  // Nuevo: registrar pero devolver la respuesta para que el componente la maneje (sin hacer alert())
  registerAlumno(payload: RegistroAlumnoRequestDto) {
    return this.http.post<RegistroAlumnoResponseDto>(this.api, payload, { observe: 'response' as const });
  }
  
  delete(id: number) {
    this.http.delete(`${this.api}/${id}`).subscribe(() => this.load());
  }

  // 👇 Nuevos helpers para selects
  listarCursos(): Observable<any[]> {
    return this.http.get<any[]>(environment.apiURLCursos);
  }
  listarAlumnos(): Observable<any[]> {
    return this.http.get<any[]>(environment.apiURLAlumnos);
  }
  listarProfesores(): Observable<any[]> {
    return this.http.get<any[]>(environment.apiURLProfesores);
  }
}
