import { UnidadAprendizaje } from "./UnidadAprendizaje";

export interface ProfesorCurso {
  idProfesor: number;
  codigoProfesor: string;
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  correoProfesional: string;
  biografia: string;
  fotoPerfil: string;
  dni: string;
}

export interface AlumnoCurso {
  idAlumno: number;
  codigoAlumno: string;
  nombre: string;
  apellido: string;
  email: string;
  pais: string;
  fotoPerfil: string;
  dni: string;
}

export interface Curricula {
  id: number;
  descripcion: string;
  orden: number;
  cursoId: number;
  areaEspecializacionId: number | null;
}

export interface CourseDetail {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  profesores: ProfesorCurso[];
  alumnos: AlumnoCurso[];
  unidades: UnidadAprendizaje[];
  curriculas: Curricula[];
}
