import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, catchError, map, of, Observable } from 'rxjs';
import { environment } from '@envs/environment.development';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiCursos = environment.apiURLCursos;
  private apiAlumnos = environment.apiURLAlumnos;
  private apiProfesores = environment.apiURLProfesores;
  // opcional: endpoint de inscripciones si lo tienes
  private apiInscripciones = `${environment.apiURLBase}/registro-alumno`;

  constructor(private http: HttpClient) {}

  getCounts(): Observable<{ cursos: number; alumnos: number; profesores: number; registros: number }> {
    const cursos$ = this.http.get<any[]>(this.apiCursos).pipe(map(r => Array.isArray(r) ? r.length : 0), catchError(() => of(0)));
    const alumnos$ = this.http.get<any[]>(this.apiAlumnos).pipe(map(r => Array.isArray(r) ? r.length : 0), catchError(() => of(0)));
    const profesores$ = this.http.get<any[]>(this.apiProfesores).pipe(map(r => Array.isArray(r) ? r.length : 0), catchError(() => of(0)));
    const registros$ = this.http.get<any[]>(this.apiInscripciones).pipe(map(r => Array.isArray(r) ? r.length : 0), catchError(() => of(0)));

    return forkJoin({
      cursos: cursos$,
      alumnos: alumnos$,
      profesores: profesores$,
      registros: registros$
    });
  }

  // intenta /api/consultas/recent, si no existe devuelve arreglo vacío
  getRecentActivity(): Observable<any[]> {
    return this.http.get<any[]>('/api/consultas/recent').pipe(
      catchError(() => of([]))
    );
  }
}