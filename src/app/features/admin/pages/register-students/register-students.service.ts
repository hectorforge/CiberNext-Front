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

  save(payload: RegistroAlumnoRequestDto) {
    this.http.post<RegistroAlumnoResponseDto>(this.api, payload).subscribe(() => this.load());
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
