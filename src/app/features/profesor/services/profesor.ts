import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Profesor } from '../models/profesor';
import { Observable } from 'rxjs';
import { environment } from '@envs/environment.development'; 

@Injectable({
  providedIn: 'root'
})
export class ProfesorService {
    private baseUrl = environment.apiURLProfesores; 

  constructor(private http: HttpClient) {}

  listar(): Observable<Profesor[]> {
    return this.http.get<Profesor[]>(this.baseUrl);
  }

  obtenerPorId(id: number): Observable<Profesor> {
    return this.http.get<Profesor>(`${this.baseUrl}/${id}`);
  }

  registrarProfesor(profesor: Profesor): Observable<Profesor> {
   return this.http.post<Profesor>(this.baseUrl, profesor);
  }

  actualizar(id: number, profesor: Profesor): Observable<Profesor> {
    return this.http.put<Profesor>(`${this.baseUrl}/${id}`, profesor);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

}
