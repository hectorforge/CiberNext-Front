import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@envs/environment.development';
import { Observable } from 'rxjs';
import { Course } from '../models/Course';
import { Document } from '../models/Document';
import { UnidadAprendizaje } from '../models/UnidadAprendizaje';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrlCursos = environment.apiURLCursos;
  private apiUrlDocs = environment.apiURLDocumentos;
  private apiUrlUnidades = environment.apiURLUnidades;

  constructor(private http: HttpClient) {}

  // ===================== CURSOS =====================
  getById(id: number): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrlCursos}/${id}`);
  }

  getAll(): Observable<Course[]> {
    return this.http.get<Course[]>(this.apiUrlCursos);
  }

  create(course: Course): Observable<Course> {
    return this.http.post<Course>(this.apiUrlCursos, course);
  }

  update(id: number, course: Course): Observable<Course> {
    return this.http.put<Course>(`${this.apiUrlCursos}/${id}`, course);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrlCursos}/${id}`);
  }

  searchByFilter(filtro: string): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrlCursos}/buscar`, {
      params: { filtro }
    });
  }

  // ===================== DOCUMENTOS =====================
  /** Obtiene TODOS los documentos */
  getAllDocuments(): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrlDocs}`);
  }

  /** Obtiene documentos por unidad */
  getDocumentsByUnidad(unidadId: number): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrlDocs}/unidad/${unidadId}`);
  }

  /** Obtiene documento por ID */
  getDocumentById(id: number): Observable<Document> {
    return this.http.get<Document>(`${this.apiUrlDocs}/${id}`);
  }

  createDocument(doc: Document): Observable<Document> {
    return this.http.post<Document>(`${this.apiUrlDocs}`, doc);
  }

  // ===================== UNIDADES =====================
  /** Obtiene arbol jerarquico de unidades de aprendizaje por curso */
  getUnidadesJerarquico(cursoId: number): Observable<UnidadAprendizaje> {
    return this.http.get<UnidadAprendizaje>(`${this.apiUrlUnidades}/jerarquico/${cursoId}`);
  }

  createUnidad(unidad: UnidadAprendizaje): Observable<UnidadAprendizaje> {
    return this.http.post<UnidadAprendizaje>(`${this.apiUrlUnidades}`, unidad);
  }

  updateUnidad(id: number, unidad: UnidadAprendizaje): Observable<UnidadAprendizaje> {
    return this.http.put<UnidadAprendizaje>(`${this.apiUrlUnidades}/${id}`, unidad);
  }

  deleteUnidad(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrlUnidades}/${id}`);
  }
}
