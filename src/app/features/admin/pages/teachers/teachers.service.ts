import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@envs/environment.development';

export interface ProfesorDto {
  id?: number;
  nombre?: string;
  apellido?: string;
  dni?: string;
  telefono?: string;
   email?: string; 
  codigoProfesor?: string;
  correoProfesional?: string;
  biografia?: string;
  fotoPerfil?: string;
  rolIds?: number[];
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class TeachersService {
  profesores = signal<ProfesorDto[]>([]);
  selected = signal<ProfesorDto | null>(null);

  private api = environment.apiURLProfesores; // '/api/profesores'

  constructor(private http: HttpClient) {}

  load() {
    this.http.get<ProfesorDto[]>(this.api).subscribe({
      next: data => this.profesores.set(data || []),
      error: () => this.profesores.set([])
    });
  }

  select(p: ProfesorDto | null) { this.selected.set(p); }

  save(payload: ProfesorDto) {
    const req = payload.id
      ? this.http.put<ProfesorDto>(`${this.api}/${payload.id}`, payload)
      : this.http.post<ProfesorDto>(this.api, payload);

    req.subscribe(() => this.load());
  }

  delete(id: number) {
    this.http.delete(`${this.api}/${id}`).subscribe(() => this.load());
  }

  listarCursosPorProfesor(idProfesor: number) {
    return this.http.get<any[]>(`${this.api}/${idProfesor}/cursos`);
  }

  // Consultas respondidas / no-respondidas
  listarConsultasRespondidasProfesor(idProfesor: number) {
    return this.http.get<any[]>(`${this.api}/${idProfesor}/respondidas`);
  }

  listarConsultasNoRespondidasProfesor(idProfesor: number) {
    return this.http.get<any[]>(`${this.api}/${idProfesor}/no-respondidas`);
  }
}
