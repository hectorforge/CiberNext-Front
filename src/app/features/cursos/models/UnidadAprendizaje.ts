export interface UnidadAprendizaje {
    id: number;
    nombre: string;
    codigo: string;
    descripcion: string;
    estado: string;
    cursoId: number;
    subUnidades?: UnidadAprendizaje[];
 }
