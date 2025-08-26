import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cursoFiltro',
  standalone: true
})
export class CursoFiltroPipe implements PipeTransform {
  transform(cursos: any[], cursoSeleccionado: string): any[] {
    if (!cursoSeleccionado) return cursos;
    return cursos.filter(c => c.curso === cursoSeleccionado);
  }
}
