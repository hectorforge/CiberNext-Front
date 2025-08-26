import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes } from '@angular/router';
import { RegisterStudentsService, RegistroAlumnoRequestDto, RegistroAlumnoResponseDto } from './register-students.service';

@Component({
  selector: 'app-register-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register-students.html'
})
export class RegisterStudents {
  public Math = Math;

  // paginación
  page = signal(1);
  pageSize = signal(8);

  // búsqueda
  searchTerm = signal('');
  private searchTimer: any = null;
  private readonly SEARCH_DEBOUNCE = 300;
  private filtered = signal<RegistroAlumnoResponseDto[] | null>(null);

  // ahora consideran el filtro cuando exista
  totalItems = computed(() => {
    const f = this.filtered();
    return f ? f.length : (this.service.registros ? this.service.registros().length : 0);
  });
  totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize())));
  pagedRegistros = computed(() => {
    const all = this.filtered() ?? (this.service.registros ? this.service.registros() : []);
    const p = this.page();
    const size = this.pageSize();
    return all.slice((p - 1) * size, (p - 1) * size + size);
  });

  // getters para plantilla (rango)
  get startItem(): number {
    const total = this.totalItems();
    if (total === 0) return 0;
    return (this.page() - 1) * this.pageSize() + 1;
  }
  get endItem(): number {
    return Math.min(this.page() * this.pageSize(), this.totalItems());
  }

  // BÚSQUEDA: debounce + llamada al backend
  onSearch(term: string) {
    const q = (term || '').trim();
    this.searchTerm.set(q);

    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      if (!q) {
        this.filtered.set(null);
        // recargar lista completa
        if (typeof this.service.load === 'function') { try { this.service.load(); } catch {} }
        this.goTo(1);
        return;
      }

      // llamar al backend
      if (typeof this.service.buscar === 'function') {
        this.service.buscar(q).subscribe({
          next: list => {
            this.filtered.set(Array.isArray(list) ? list : []);
            this.goTo(1);
          },
          error: err => {
            console.error('Error buscando registros:', err);
            this.filtered.set([]);
            this.goTo(1);
          }
        });
      } else {
        // si no existe el método, limpiar filtro
        this.filtered.set(null);
      }
    }, this.SEARCH_DEBOUNCE);
  }
  
  // modales / estados
  showModal = signal(false);
  showDeleteConfirm = signal(false);
  showDetail = signal(false);
  
  registroParaEliminar = signal<RegistroAlumnoResponseDto | null>(null);
  registroEnVista = signal<RegistroAlumnoResponseDto | null>(null);

  // combos / formularios
  cursos: any[] = [];
  alumnos: any[] = [];
  profesores: any[] = [];
  nuevoRegistro: RegistroAlumnoRequestDto = { cursoId: 0, alumnoId: 0, profesorId: 0 };

  // --- MENSAJES DE ÉXITO / ERROR ---
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  constructor(public service: RegisterStudentsService) {
    if (typeof this.service.load === 'function') {
      try { this.service.load(); } catch {}
    }

    // intentar cargar listas si el service expone métodos
    if (typeof this.service.listarCursos === 'function') {
      this.service.listarCursos().subscribe(c => this.cursos = c || []);
    }
    if (typeof this.service.listarAlumnos === 'function') {
      this.service.listarAlumnos().subscribe(a => this.alumnos = a || []);
    }
    if (typeof this.service.listarProfesores === 'function') {
      this.service.listarProfesores().subscribe(p => this.profesores = p || []);
    }
  }

  // modal nuevo
  openNew() {
    this.nuevoRegistro = { cursoId: 0, alumnoId: 0, profesorId: 0 };
    this.showModal.set(true);
  }
  cancel() { this.showModal.set(false); }

  // Llamar desde la UI en lugar de service.save() para mostrar alertas en la vista
  registrarEnVista(payload: RegistroAlumnoRequestDto) {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.service.registerAlumno(payload).subscribe({
      next: resp => {
        const status = resp?.status ?? 0;
        if (status >= 200 && status < 300) {
          this.successMessage.set('Alumno registrado correctamente.');
          this.service.load();
        } else {
          this.errorMessage.set('Error al registrar el alumno. Código: ' + status);
        }
      },
      error: err => {
        const status = err?.status ?? 0;
        const serverMsg = err?.error?.message || err?.error?.mensaje || null;
        if (status === 409 || status === 400) {
          this.errorMessage.set(serverMsg || 'El profesor no está asignado para dictar este curso.');
        } else {
          this.errorMessage.set('Error al registrar el alumno. Código: ' + status + (serverMsg ? ' — ' + serverMsg : ''));
        }
      }
    });
  }

  // Wrapper para compatibilidad con la plantilla
  save(payload?: RegistroAlumnoRequestDto) {
    const p = payload ?? this.nuevoRegistro;
    this.registrarEnVista(p);
    this.showModal.set(false);
  }
  
  // eliminar
  confirmDelete(r: RegistroAlumnoResponseDto) {
    this.registroParaEliminar.set(r);
    this.showDeleteConfirm.set(true);
  }
  cancelDelete() {
    this.showDeleteConfirm.set(false);
    this.registroParaEliminar.set(null);
  }
  confirmDeleteYes() {
    const r = this.registroParaEliminar();
    if (r?.id && typeof this.service.delete === 'function') {
      this.service.delete(r.id);
    }
    this.cancelDelete();
  }

  // detalle
  openDetail(r: RegistroAlumnoResponseDto) {
    this.registroEnVista.set(r);
    this.showDetail.set(true);
  }
  closeDetail() {
    this.showDetail.set(false);
    this.registroEnVista.set(null);
  }

  // --- Paginación: métodos usados en plantilla ---
  goTo(pageNum: number) {
    let pn = Number(pageNum) || 1;
    if (pn < 1) pn = 1;
    const max = this.totalPages();
    if (pn > max) pn = max;
    this.page.set(pn);
  }

  prev() { this.goTo(this.page() - 1); }
  next() { this.goTo(this.page() + 1); }

  setPageSize(size: number) {
    const s = Number(size) || 8;
    this.pageSize.set(s);
    this.goTo(1);
  }
}

export const routes: Routes = [
  { path: 'admin/register-students', component: RegisterStudents },
];
