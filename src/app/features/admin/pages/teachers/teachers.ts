import { Component, ViewChild, ElementRef, effect, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Validators } from '@angular/forms';
import { Routes } from '@angular/router';
import { DynamicFormComponent } from '@shared/components/DynamicForm/dynamicForm';
import { DynamicField } from '@shared/models/dynamic-field';
import { TeachersService, ProfesorDto } from './teachers.service';

@Component({
  selector: 'app-teachers',
  standalone: true,
  imports: [CommonModule, DynamicFormComponent],
  templateUrl: './teachers.html'
})
export class Teachers {
  @ViewChild('dynFormRef', { read: ElementRef }) private dynFormRef?: ElementRef;

  public Math = Math;

  // Campos para el DynamicForm (nombres compatibles con tu API/Swagger)
  fields: DynamicField[] = [
    { id: 1, name: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Nombre', validators: [Validators.required] },
    { id: 2, name: 'apellido', label: 'Apellido', type: 'text', placeholder: 'Apellido', validators: [Validators.required] },
    { id: 3, name: 'dni', label: 'DNI', type: 'text', placeholder: 'DNI', validators: [] },
    { id: 4, name: 'telefono', label: 'Teléfono', type: 'text', placeholder: 'Teléfono', validators: [] },
    { id: 5, name: 'email', label: 'Email', type: 'email', placeholder: 'correo@dominio.com', validators: [Validators.required, Validators.email] },
    { id: 6, name: 'codigoProfesor', label: 'Código Profesor', type: 'text', placeholder: 'Código', validators: [] },
    { id: 7, name: 'correoProfesional', label: 'Correo Profesional', type: 'email', placeholder: 'correo.institucional@dominio.com', validators: [Validators.email] },
    { id: 8, name: 'biografia', label: 'Biografía', type: 'textarea', placeholder: 'Descripción breve', validators: [] },
    { id: 9, name: 'fotoPerfil', label: 'Foto Perfil (URL)', type: 'text', placeholder: 'https://...', validators: [] },
    { id: 10, name: 'rolId', label: 'Rol (ID)', type: 'number', placeholder: '2', validators: [] }
  ];

  // paginación (usa el service.profesores() si existe)
  page = signal(1);
  pageSize = signal(6);
  totalItems = computed(() => (this.teachersService.profesores ? this.teachersService.profesores().length : 0));
  totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize())));
  pagedProfesores = computed(() => {
    const all = (this.teachersService.profesores ? this.teachersService.profesores() : []);
    const p = this.page();
    const size = this.pageSize();
    return all.slice((p - 1) * size, (p - 1) * size + size);
  });

  // curso modal
  cursos = signal<any[]>([]);
  showCursos = signal(false);
  profesorEnVista: ProfesorDto | null = null;

  // modal detalle
  showDetail = signal(false);
  loadingDetail = signal(false);

  // delete confirm
  showDeleteConfirm = signal(false);
  profesorParaEliminar = signal<ProfesorDto | null>(null);
  deleting = signal(false);

  // Modal de consultas
  showConsultasModal = false;
  consultasTipo: 'respondidas' | 'no-respondidas' = 'no-respondidas';
  consultas: any[] = [];
  consultasLoading = false;
  profesorEnConsultas: any = null;

  constructor(public teachersService: TeachersService) {
    // carga inicial
    if ((this.teachersService as any).load) {
      try { (this.teachersService as any).load(); } catch {}
    }
    effect(() => console.log('Profesores total:', (this.teachersService.profesores ? this.teachersService.profesores().length : 0)));
  }

  // getter para usar en template sin llamar la señal directamente
  get selectedProfesorValue(): ProfesorDto | null {
    return (this.teachersService as any).selected ? (this.teachersService as any).selected() : null;
  }

  // abrir modal nuevo / editar
  openNew() {
    const nuevo: ProfesorDto = {
      id: undefined,
      nombre: '',
      apellido: '',
      dni: '',
      telefono: '',
      email: '',
      codigoProfesor: '',
      correoProfesional: '',
      biografia: '',
      fotoPerfil: '',
      rolId: 2 // valor por defecto si corresponde
    };
    if ((this.teachersService as any).select) {
      try { (this.teachersService as any).select(nuevo); }
      catch { /* noop */ }
    }
  }

  openEdit(p: ProfesorDto) {
    if ((this.teachersService as any).select) {
      try { (this.teachersService as any).select({ ...p }); }
      catch { /* noop */ }
    }
  }

  cancel() {
    if ((this.teachersService as any).select) {
      try { (this.teachersService as any).select(null); }
      catch { /* noop */ }
    }
  }

  // Guardar: evita enviar id === null y armoniza nombres (email)
  save(payload: any) {
    // Combina datos seleccionados y formulario
    const selected = (this.teachersService as any).selected ? (this.teachersService as any).selected() : null;
    const dto: any = { ...(selected || {}), ...payload };

    // El backend falla si recibe id: null -> eliminar la propiedad cuando es creación
    if (dto.id === null || dto.id === undefined) {
      delete dto.id;
    }

    // Asegurar que el campo email esté presente (tu backend usa 'email' según Swagger)
    if (!dto.email || (dto.email || '').trim() === '') {
      alert('El correo es requerido. La contraseña se genera automáticamente si no la envías.');
      return;
    }

    // Llamada al service (tu service internamente subscribe() y recarga lista)
    try {
      // teachersService.save espera el payload que coincida con la API (uso dto tal cual)
      (this.teachersService as any).save(dto);
      // cerrar modal inmediatamente (como en Courses). Si prefieres cerrar sólo al éxito, cambia esto.
      this.cancel();
    } catch (e) {
      console.error('Error al invocar save en TeachersService', e);
      alert('Error al guardar profesor.');
    }
  }

  // Intento de disparar submit del DynamicForm (usa ViewChild)
  saveClick() {
    try {
      const el = this.dynFormRef?.nativeElement as HTMLElement | undefined;
      const btn = el?.querySelector('button[type="submit"]') as HTMLElement | null;
      if (btn) { btn.click(); return; }
      const cmp: any = (this.dynFormRef as any)?.nativeElement;
      if (cmp && typeof cmp.submit === 'function') { cmp.submit(); }
    } catch (e) {
      console.warn('saveClick error', e);
    }
  }

  // Cursos del profesor
  openCursos(p: ProfesorDto) {
    if (!p?.id) return;
    this.cursos.set([]);
    this.showCursos.set(true);
    this.profesorEnVista = p;
    if (typeof this.teachersService.listarCursosPorProfesor === 'function') {
      this.teachersService.listarCursosPorProfesor(p.id!).subscribe({
        next: list => this.cursos.set(list || []),
        error: err => { console.error('Error al listar cursos:', err); this.cursos.set([]); }
      });
    }
  }
  closeCursos() { this.showCursos.set(false); this.cursos.set([]); this.profesorEnVista = null; }

  // Abrir detalle (intenta obtener por ID desde el service si existe; si no usa el objeto p)
  openDetail(p: ProfesorDto | null) {
    if (!p) return;

    // Si ya tenemos todos los datos en p, mostramos directamente
    const hasFullData = !!(p.nombre || p.apellido || p.email || p.biografia || p.fotoPerfil);
    const svc: any = this.teachersService;

    // funciones posibles en el service que podrían obtener por id
    const candidateFns = ['getById', 'findById', 'find', 'get', 'obtenerPorId', 'obtener', 'listarPorId', 'getProfesor'];

    if (p.id && !hasFullData) {
      // buscar una función disponible en el service
      const fnName = candidateFns.find(fn => typeof svc[fn] === 'function');
      if (fnName) {
        try {
          this.loadingDetail.set(true);
          const obs = svc[fnName](p.id);
          if (obs && typeof obs.subscribe === 'function') {
            obs.subscribe({
              next: (res: any) => {
                this.profesorEnVista = res || p;
                this.showDetail.set(true);
                this.loadingDetail.set(false);
              },
              error: (err: any) => {
                console.error('Error fetching profesor by id:', err);
                // fallback: mostrar objeto p
                this.profesorEnVista = p;
                this.showDetail.set(true);
                this.loadingDetail.set(false);
              }
            });
            return;
          }
        } catch (err) {
          console.error('openDetail error calling service.', err);
        }
      }
    }

    // fallback: usar el objeto p que ya viene en la lista
    this.profesorEnVista = p;
    this.showDetail.set(true);
  }

  closeDetail() {
    this.showDetail.set(false);
    this.profesorEnVista = null;
    this.loadingDetail.set(false);
  }

  // Eliminación (confirmación)
  confirmDelete(p: ProfesorDto | null) {
    this.profesorParaEliminar.set(p);
    this.showDeleteConfirm.set(true);
  }
  cancelDelete() {
    this.showDeleteConfirm.set(false);
    this.profesorParaEliminar.set(null);
  }
  async confirmDeleteYes() {
    const p = this.profesorParaEliminar();
    if (!p?.id) { this.cancelDelete(); return; }
    this.deleting.set(true);
    try {
      // tu service delete hace subscribe internamente
      (this.teachersService as any).delete(p.id);
    } catch (err) {
      console.error('Error eliminando profesor:', err);
    } finally {
      this.deleting.set(false);
      this.cancelDelete();
    }
  }

  // Modal de consultas
  abrirConsultas(profesor: any) {
    this.profesorEnConsultas = profesor;
    this.consultasTipo = 'no-respondidas';
    this.showConsultasModal = true;
    this.cargarConsultas();
  }

  cerrarConsultas() {
    this.showConsultasModal = false;
    this.consultas = [];
    this.profesorEnConsultas = null;
    this.consultasLoading = false;
  }

  cambiarTipoConsultas(tipo: 'respondidas' | 'no-respondidas') {
    if (this.consultasTipo === tipo) return;
    this.consultasTipo = tipo;
    this.cargarConsultas();
  }

  private cargarConsultas() {
    if (!this.profesorEnConsultas?.id) { this.consultas = []; return; }
    this.consultasLoading = true;
    const id = this.profesorEnConsultas.id;
    const svc: any = this.teachersService;
    const req = this.consultasTipo === 'respondidas'
      ? svc.listarConsultasRespondidasProfesor(id)
      : svc.listarConsultasNoRespondidasProfesor(id);

    req.subscribe({
      next: (data: any[]) => { this.consultas = data || []; this.consultasLoading = false; },
      error: () => { this.consultas = []; this.consultasLoading = false; }
    });
  }

  // Paginación helpers
  goTo(pageNum: number) { if (pageNum < 1) pageNum = 1; if (pageNum > this.totalPages()) pageNum = this.totalPages(); this.page.set(pageNum); }
  prev() { this.goTo(this.page() - 1); }
  next() { this.goTo(this.page() + 1); }
  setPageSize(size: number) { this.pageSize.set(Number(size)); this.goTo(1); }
}

export const routes: Routes = [
  { path: 'admin/teachers', component: Teachers },
];
