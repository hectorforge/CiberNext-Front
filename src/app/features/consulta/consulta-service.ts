import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { environment } from '@envs/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ConsultaDto {
  id?: number;
  titulo?: string;
  mensaje?: string;
  fecha?: string;
  nombreAutor?: string;
  unidad?: string;
  curso?: string;
  respuestas?: ConsultaDto[];

  idAutor?: number;
  idRegistroAlumno?: number;
  idUnidad?: number;
}

export interface ConsultaRequestDto {
  titulo?: string;
  mensaje?: string;
  unidadAprendizajeId?: number;
  usuarioId?: number;
  registroAlumnoId?: number;
  consultaPadreId?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ConsultaService {
  private api = environment.apiURLConsultas;
  //private api = 'http://localhost:8080/api/consultas';

  constructor(private httpClient: HttpClient) {}

  getConsultas(idUsuario: number, rol: string): Observable<ConsultaDto[]> {
    if (rol === 'ALUMNO') {
      return this.httpClient.get<ConsultaDto[]>(
        `${this.api}/alumno/${idUsuario}/todas`
      );
    } else {
      return this.httpClient.get<ConsultaDto[]>(
        `${this.api}/profesor/${idUsuario}/todas`
      );
    }
  }

  getConsultasNoRespondidas(idUsuario: number, rol: string): Observable<ConsultaDto[]> {
    if (rol === 'ALUMNO') {
      return this.httpClient.get<ConsultaDto[]>(
        `${this.api}/alumno/${idUsuario}/no-respondidas`
      );
    } else {
      return this.httpClient.get<ConsultaDto[]>(
        `${this.api}/profesor/${idUsuario}/no-respondidas`
      );
    }
  }

  getConsultasPorUnidad(idUnidad: number): Observable<ConsultaDto[]> {
    return this.httpClient.get<ConsultaDto[]>(
        `${this.api}/unidad/${idUnidad}/todas`
      );
  }

  registrarConsulta(request: ConsultaRequestDto): Observable<any> {
    return this.httpClient.post(`${this.api}/registrar`, request);
  }

  agrupadas: any[] = [];

  agruparConsultasPorCursoYUnidad(consultas: ConsultaDto[]) {
    const resultado: any = {};
    consultas.forEach((c) => {
      if (c.curso !== undefined && c.unidad !== undefined) {
        if (!resultado[c.curso]) {
          resultado[c.curso] = {};
        }
        if (!resultado[c.curso][c.unidad]) {
          resultado[c.curso][c.unidad] = [];
        }
        resultado[c.curso][c.unidad].push(c);
      }
    });

    this.agrupadas = Object.entries(resultado).map(
      ([curso, unidades]: [string, any]) => ({
        curso,
        unidades: Object.entries(unidades).map(
          ([unidad, consultas]: [string, any]) => ({
            unidad,
            consultas,
          })
        ),
      })
    );
  }
  
}
