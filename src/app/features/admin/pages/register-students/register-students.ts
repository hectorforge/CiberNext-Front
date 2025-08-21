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
  totalItems = computed(() => (this.service.registros ? this.service.registros().length : 0));
  totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize())));
  pagedRegistros = computed(() => {
    const all = (this.service.registros ? this.service.registros() : []);
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

  save() {
    if (!this.nuevoRegistro.cursoId || !this.nuevoRegistro.alumnoId || !this.nuevoRegistro.profesorId) {
      alert('Debe seleccionar curso, alumno y profesor');
      return;
    }
    if (typeof this.service.save === 'function') {
      this.service.save(this.nuevoRegistro);
    }
    this.cancel();
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
