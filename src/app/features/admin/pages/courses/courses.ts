import { Component, effect, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Validators } from '@angular/forms';
import { CoursesService, CursoDto, ProfesorDto, AlumnoDto } from './courses.service';
import { DynamicField } from '@shared/models/dynamic-field';
import { Routes } from '@angular/router';
import { DynamicFormComponent } from '@shared/components/DynamicForm/dynamicForm';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, DynamicFormComponent],
  templateUrl: './courses.html'
})
export class Courses {
  public Math = Math;

  // campos para el DynamicForm (no elimines, solo agrega/ajusta si hace falta)
  fields: DynamicField[] = [
    { id: 1, name: 'codigo', label: 'Código', type: 'text', placeholder: 'Código', validators: [Validators.required] },
    { id: 2, name: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Nombre', validators: [Validators.required] },
    { id: 3, name: 'descripcion', label: 'Descripción', type: 'textarea', placeholder: 'Descripción', validators: [] }
  ];

  // paginación (client-side)
  page = signal(1);
  pageSize = signal(6);
  totalItems = computed(() => this.coursesService.cursos().length);
  totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize())));
  pagedCourses = computed(() => {
    const all = this.coursesService.cursos();
    const p = this.page();
    const size = this.pageSize();
    return all.slice((p - 1) * size, (p - 1) * size + size);
  });

  // modal docentes
  profesores = signal<ProfesorDto[]>([]);
  showProfesores = signal(false);
  cursoEnVista: CursoDto | null = null;

  // modal alumnos (nuevo)
  alumnos = signal<AlumnoDto[]>([]);
  showAlumnos = signal(false);
  cursoEnVistaAlumnos: CursoDto | null = null;

  // búsqueda
  searchTerm = signal('');
  private searchTimer: any = null;
  private SEARCH_DEBOUNCE = 300; // ms

  // NUEVO: confirmación de borrado (modal)
  showDeleteConfirm = signal(false);
  cursoParaEliminar = signal<CursoDto | null>(null);
  deleting = signal(false);

  constructor(public coursesService: CoursesService) {
    this.coursesService.load();
    // debug opcional
    effect(() => {
      // eslint-disable-next-line no-console
      console.log('Cursos total:', this.coursesService.cursos().length);
    });
  }

  // abrir modal y cargar docentes
  openDocentes(c: CursoDto) {
    if (!c?.id) return;
    this.profesores.set([]);
    this.showProfesores.set(true);
    this.cursoEnVista = c;
    this.coursesService.listarProfesoresPorCurso(c.id!).subscribe({
      next: list => this.profesores.set(list || []),
      error: err => {
        console.error('Error al listar docentes:', err);
        this.profesores.set([]);
      }
    });
  }
  closeDocentes() {
    this.showProfesores.set(false);
    this.profesores.set([]);
    this.cursoEnVista = null;
  }

  // abrir modal "Ver Alumnos" y cargar alumnos desde API
  openAlumnos(c: CursoDto) {
    if (!c?.id) return;
    this.alumnos.set([]);
    this.showAlumnos.set(true);
    this.cursoEnVistaAlumnos = c;
    this.coursesService.listarAlumnosPorCurso(c.id!).subscribe({
      next: list => this.alumnos.set(list || []),
      error: err => {
        // eslint-disable-next-line no-console
        console.error('Error cargando alumnos:', err);
        this.alumnos.set([]);
      }
    });
  }

  closeAlumnos() {
    this.showAlumnos.set(false);
    this.alumnos.set([]);
    this.cursoEnVistaAlumnos = null;
  }

  // búsqueda
  onSearch(filtro: string) {
    // actualiza UI inmediatamente
    this.searchTerm.set(filtro || '');

    // debounce simple
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    this.searchTimer = setTimeout(() => {
      const q = (filtro || '').trim();
      if (!q) {
        // vacío => volver al listado completo
        this.coursesService.load();
      } else {
        // llamar al endpoint de búsqueda
        this.coursesService.buscarCursos(q);
      }
    }, this.SEARCH_DEBOUNCE);
  }

  // paginación helpers
  goTo(pageNum: number) {
    if (pageNum < 1) pageNum = 1;
    if (pageNum > this.totalPages()) pageNum = this.totalPages();
    this.page.set(pageNum);
  }
  prev() { this.goTo(this.page() - 1); }
  next() { this.goTo(this.page() + 1); }
  setPageSize(size: number) {
    this.pageSize.set(Number(size));
    this.goTo(1);
  }

  // CRUD + modales
  openNew() {
    const nuevo: CursoDto = { id: undefined, codigo: '', nombre: '', descripcion: '' };
    this.coursesService.select(nuevo);
  }

  openEdit(c: CursoDto) {
    this.coursesService.select({ ...c });
  }

  save(payload: any) {
    const selected = this.coursesService.selected();
    const dto: CursoDto = { ...(selected || {}), ...payload };

    // Cerrar modal de formulario inmediatamente para regresar al listado
    this.cancel();

    // Intentar usar el retorno del service si devuelve Observable
    try {
      const result: any = this.coursesService.save(dto);
      if (result && typeof result.subscribe === 'function') {
        result.subscribe({
          next: () => {
            // recargar listado cuando la petición termine
            this.coursesService.load();
          },
          error: (err: any) => {
            console.error('Error al guardar curso:', err);
            // recargar igualmente para mantener consistencia
            this.coursesService.load();
          }
        });
        return;
      }
    } catch (e) {
      // si ocurre error al intentar usar el retorno, lo ignoramos y seguimos
      // eslint-disable-next-line no-console
      console.warn('save: no se pudo suscribir al resultado de save()', e);
    }

    // Si el service hace el subscribe internamente o no retorna Observable,
    // forzamos una recarga del listado (fallback)
    this.coursesService.load();
  }

  remove(id?: number) {
    if (!id) return;
    if (confirm('¿Eliminar curso?')) {
      this.coursesService.delete(id);
    }
  }

  cancel() {
    this.coursesService.select(null);
  }

  // NUEVO: confirmación de borrado (modal)
  confirmDelete(c: CursoDto) {
    this.cursoParaEliminar.set(c);
    this.showDeleteConfirm.set(true);
  }

  cancelDelete() {
    this.showDeleteConfirm.set(false);
    this.cursoParaEliminar.set(null);
  }

  async confirmDeleteYes() {
    const c = this.cursoParaEliminar();
    if (!c?.id) {
      this.cancelDelete();
      return;
    }
    this.deleting.set(true);
    try {
      await this.coursesService.delete(c.id);
    } catch (err) {
      // noop - tu service ya maneja errores. puedes mostrar toast aquí.
      // console.error('Eliminar error', err);
    } finally {
      this.deleting.set(false);
      this.cancelDelete();
    }
  }
}

export const routes: Routes = [
  { path: 'admin/courses', component: Courses },
];
