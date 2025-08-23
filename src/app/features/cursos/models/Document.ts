export interface Document {
    id: number;
    nombre: string;
    archivo: string;
    descripcion: string;
    idTipoDocumento: number;
    // Solo lectura (DTO backend)
    nombreTipoDocumento?: string;
    extensionTipoDocumento?: string;
    idUnidadAprendizaje: number;
    nombreUnidadAprendizaje?: string;
    codigoUnidadAprendizaje?: string;
    descripcionUnidadAprendizaje?: string;
    estadoUnidadAprendizaje?: string;
    cursoId?: number;
}
