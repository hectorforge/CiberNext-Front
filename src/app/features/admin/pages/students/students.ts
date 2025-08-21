import { Component, ViewChild, ElementRef, effect, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Validators } from '@angular/forms';
import { Routes } from '@angular/router';
import { DynamicFormComponent } from '@shared/components/DynamicForm/dynamicForm';
import { DynamicField } from '@shared/models/dynamic-field';
import { StudentsService, AlumnoDto } from './students.service';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, DynamicFormComponent],
  templateUrl: './students.html'
})
export class Students {
  @ViewChild('dynFormRef', { read: ElementRef }) private dynFormRef?: ElementRef;

  public Math = Math;

  // Campos dinámicos
  fields: DynamicField[] = [
    { id: 1, name: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Nombre', validators: [Validators.required] },
    { id: 2, name: 'apellido', label: 'Apellido', type: 'text', placeholder: 'Apellido', validators: [Validators.required] },
    { id: 3, name: 'dni', label: 'DNI', type: 'text', placeholder: 'DNI', validators: [] },
    { id: 4, name: 'telefono', label: 'Teléfono', type: 'text', placeholder: 'Teléfono', validators: [] },
    { id: 5, name: 'email', label: 'Email', type: 'email', placeholder: 'correo@dominio.com', validators: [Validators.required, Validators.email] },
    { id: 6, name: 'codigoAlumno', label: 'Código Alumno', type: 'text', placeholder: 'Código', validators: [] },
    { id: 7, name: 'correoPersonal', label: 'Correo Personal', type: 'email', placeholder: 'personal@dominio.com', validators: [Validators.email] },
    { id: 8, name: 'pais', label: 'País', type: 'text', placeholder: 'País', validators: [] },
    { id: 9, name: 'fotoPerfil', label: 'Foto Perfil (URL)', type: 'text', placeholder: 'https://...', validators: [] },
    { id: 10, name: 'rolId', label: 'Rol (ID)', type: 'number', placeholder: '3', validators: [] }
  ];

  // paginación
  page = signal(1);
  pageSize = signal(6);
  totalItems = computed(() => this.studentsService.alumnos().length);
  totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize())));
  pagedAlumnos = computed(() => {
    const all = this.studentsService.alumnos();
    const p = this.page();
    const size = this.pageSize();
    return all.slice((p - 1) * size, (p - 1) * size + size);
  });

  // modal cursos
  cursos = signal<any[]>([]);
  showCursos = signal(false);
  alumnoEnVista: AlumnoDto | null = null;

  // detalle
  showDetail = signal(false);
  loadingDetail = signal(false);

  // delete confirm
  showDeleteConfirm = signal(false);
  alumnoParaEliminar = signal<AlumnoDto | null>(null);
  deleting = signal(false);

  constructor(public studentsService: StudentsService) {
    try { this.studentsService.load(); } catch {}
    effect(() => console.log('Alumnos total:', this.studentsService.alumnos().length));
  }

  get selectedAlumnoValue(): AlumnoDto | null {
    return this.studentsService.selected();
  }

  openNew() {
    const nuevo: AlumnoDto = {
      id: undefined,
      nombre: '',
      apellido: '',
      dni: '',
      telefono: '',
      email: '',
      codigoAlumno: '',
      correoPersonal: '',
      pais: '',
      fotoPerfil: '',
      rolId: 3
    };
    this.studentsService.select(nuevo);
  }

  openEdit(a: AlumnoDto) { this.studentsService.select({ ...a }); }

  cancel() { this.studentsService.select(null); }

  save(payload: any) {
    const selected = this.studentsService.selected();
    const dto: any = { ...(selected || {}), ...payload };

    if (!dto.id) delete dto.id;
    if (!dto.email || dto.email.trim() === '') {
      alert('El correo es obligatorio');
      return;
    }
    if (dto.password && dto.password.trim() === '') delete dto.password;

    this.studentsService.save(dto);
    this.cancel();
  }

  saveClick() {
    try {
      const el = this.dynFormRef?.nativeElement as HTMLElement | undefined;
      const btn = el?.querySelector('button[type="submit"]') as HTMLElement | null;
      if (btn) { btn.click(); return; }
      const cmp: any = (this.dynFormRef as any)?.nativeElement;
      if (cmp && typeof cmp.submit === 'function') { cmp.submit(); }
    } catch (e) { console.warn('saveClick error', e); }
  }

  openCursos(a: AlumnoDto) {
    if (!a?.id) return;
    this.cursos.set([]); this.showCursos.set(true); this.alumnoEnVista = a;
    this.studentsService.listarCursosPorAlumno(a.id!).subscribe({
      next: list => this.cursos.set(list || []),
      error: err => { console.error('Error al listar cursos:', err); this.cursos.set([]); }
    });
  }
  closeCursos() { this.showCursos.set(false); this.cursos.set([]); this.alumnoEnVista = null; }

  openDetail(a: AlumnoDto | null) {
    if (!a) return;
    this.alumnoEnVista = a;
    this.showDetail.set(true);
  }
  closeDetail() { this.showDetail.set(false); this.alumnoEnVista = null; }

  confirmDelete(a: AlumnoDto | null) {
    this.alumnoParaEliminar.set(a);
    this.showDeleteConfirm.set(true);
  }
  cancelDelete() { this.showDeleteConfirm.set(false); this.alumnoParaEliminar.set(null); }
  async confirmDeleteYes() {
    const a = this.alumnoParaEliminar();
    if (!a?.id) { this.cancelDelete(); return; }
    this.deleting.set(true);
    try { this.studentsService.delete(a.id); }
    catch (err) { console.error('Error eliminando alumno:', err); }
    finally { this.deleting.set(false); this.cancelDelete(); }
  }

  goTo(pageNum: number) { if (pageNum < 1) pageNum = 1; if (pageNum > this.totalPages()) pageNum = this.totalPages(); this.page.set(pageNum); }
  prev() { this.goTo(this.page() - 1); }
  next() { this.goTo(this.page() + 1); }
  setPageSize(size: number) { this.pageSize.set(Number(size)); this.goTo(1); }
}

export const routes: Routes = [
  { path: 'admin/students', component: Students },
];
