import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@envs/environment.development';

export interface AlumnoDto {
  id?: number;
  nombre?: string;
  apellido?: string;
  dni?: string;
  telefono?: string;
  email?: string;
  password?: string;
  fotoPerfil?: string;
  codigoAlumno?: string;
  correoPersonal?: string;
  pais?: string;
  rolId?: number;
  rolNombre?: string;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class StudentsService {
  alumnos = signal<AlumnoDto[]>([]);
  selected = signal<AlumnoDto | null>(null);

  private api = environment.apiURLAlumnos; // '/api/alumnos'

  constructor(private http: HttpClient) {}

  load() {
    this.http.get<AlumnoDto[]>(this.api).subscribe({
      next: data => this.alumnos.set(data || []),
      error: () => this.alumnos.set([])
    });
  }

  select(a: AlumnoDto | null) { this.selected.set(a); }

  save(payload: AlumnoDto) {
    const dto: any = { ...payload };

    // 🚨 No enviar id nulo
    if (!dto.id) delete dto.id;

    // 🚨 No enviar password vacío en creación
    if (!dto.id) delete dto.password;
    if (dto.password && dto.password.trim() === '') delete dto.password;

    // 🚨 Backend espera rolId (no array)
    if (!dto.rolId) dto.rolId = 3; // ALUMNO por defecto

    const req = dto.id
      ? this.http.put<AlumnoDto>(`${this.api}/${dto.id}`, dto)
      : this.http.post<AlumnoDto>(this.api, dto);

    req.subscribe(() => this.load());
  }

  delete(id: number) {
    return this.http.delete(`${this.api}/${id}`).subscribe(() => this.load());
  }

  listarCursosPorAlumno(idAlumno: number) {
    return this.http.get<any[]>(`${this.api}/${idAlumno}/cursos`);
  }

  // Buscar alumnos en backend: GET /api/alumnos/buscar?filtro=...
  buscar(filtro: string) {
    const url = `${this.api}/buscar?filtro=${encodeURIComponent(filtro)}`;
    return this.http.get<AlumnoDto[]>(url);
  }
}
