import { Component, ViewChild, ElementRef, effect, computed, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Validators } from '@angular/forms';
import { Routes } from '@angular/router';
import { DynamicFormComponent } from '@shared/components/DynamicForm/dynamicForm';
import { DynamicField } from '@shared/models/dynamic-field';
import { TeachersService, ProfesorDto } from './teachers.service';
import { HttpClient } from '@angular/common/http';
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-teachers',
  standalone: true,
  imports: [CommonModule, DynamicFormComponent],
  templateUrl: './teachers.html'
})
export class Teachers implements OnInit, OnDestroy {
  @ViewChild('dynFormRef', { read: ElementRef }) private dynFormRef?: ElementRef;

  public Math = Math;

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

  cursos = signal<any[]>([]);
  showCursos = signal(false);
  profesorEnVista: ProfesorDto | null = null;

  showDetail = signal(false);
  loadingDetail = signal(false);

  showDeleteConfirm = signal(false);
  profesorParaEliminar = signal<ProfesorDto | null>(null);
  deleting = signal(false);

  showConsultasModal = false;
  consultasTipo: 'respondidas' | 'no-respondidas' = 'no-respondidas';
  consultas: any[] = [];
  consultasLoading = false;
  profesorEnConsultas: any = null;

  searchTerm = '';
  private search$ = new Subject<string>();
  private searchSub?: Subscription;

  profesores: any[] = [];

  constructor(
    private http: HttpClient,
    public teachersService: TeachersService
  ) {
    if ((this.teachersService as any).load) {
      try { (this.teachersService as any).load(); } catch {}
    }
    effect(() => (this.teachersService.profesores ? this.teachersService.profesores().length : 0));
  }

  ngOnInit(): void {
    if ((this.teachersService as any).load) { try { (this.teachersService as any).load(); } catch {} }

    this.searchSub = this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        const t = (term || '').trim();
        if (!t) {
          try { this.teachersService.load(); } catch {}
          return of(this.teachersService.profesores ? this.teachersService.profesores() : []);
        }
        try {
          if (typeof this.teachersService.buscar === 'function') {
            return (this.teachersService.buscar(t) as any).pipe(catchError(() => of([])));
          }
        } catch (e) {}
        return this.http.get<any[]>(`/api/profesores/buscar?filtro=${encodeURIComponent(t)}`).pipe(
          catchError(() => of([]))
        );
      })
    ).subscribe(list => {
      const arr = Array.isArray(list) ? list : [];
      try { this.teachersService.profesores.set(arr); } catch (e) {}
      if (typeof (this as any).setPage === 'function') (this as any).setPage(1);
    });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  get selectedProfesorValue(): ProfesorDto | null {
    return (this.teachersService as any).selected ? (this.teachersService as any).selected() : null;
  }

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
      rolId: 2
    };
    if ((this.teachersService as any).select) {
      try { (this.teachersService as any).select(nuevo); } catch {}
    }
  }

  openEdit(p: ProfesorDto) {
    if ((this.teachersService as any).select) {
      try { (this.teachersService as any).select({ ...p }); } catch {}
    }
  }

  cancel() {
    if ((this.teachersService as any).select) {
      try { (this.teachersService as any).select(null); } catch {}
    }
  }

  save(payload: any) {
    const selected = (this.teachersService as any).selected ? (this.teachersService as any).selected() : null;
    const dto: any = { ...(selected || {}), ...payload };

    if (dto.id === null || dto.id === undefined) {
      delete dto.id;
    }

    if (!dto.email || (dto.email || '').trim() === '') {
      alert('El correo es requerido. La contraseña se genera automáticamente si no la envías.');
      return;
    }

    try {
      (this.teachersService as any).save(dto);
      this.cancel();
    } catch (e) {
      alert('Error al guardar profesor.');
    }
  }

  saveClick() {
    try {
      const el = this.dynFormRef?.nativeElement as HTMLElement | undefined;
      const btn = el?.querySelector('button[type="submit"]') as HTMLElement | null;
      if (btn) { btn.click(); return; }
      const cmp: any = (this.dynFormRef as any)?.nativeElement;
      if (cmp && typeof cmp.submit === 'function') { cmp.submit(); }
    } catch (e) {}
  }

  openCursos(p: ProfesorDto) {
    if (!p?.id) return;
    this.cursos.set([]);
    this.showCursos.set(true);
    this.profesorEnVista = p;
    if (typeof this.teachersService.listarCursosPorProfesor === 'function') {
      this.teachersService.listarCursosPorProfesor(p.id!).subscribe({
        next: list => this.cursos.set(list || []),
        error: () => { this.cursos.set([]); }
      });
    }
  }
  closeCursos() { this.showCursos.set(false); this.cursos.set([]); this.profesorEnVista = null; }

  openDetail(p: ProfesorDto | null) {
    if (!p) return;

    const hasFullData = !!(p.nombre || p.apellido || p.email || p.biografia || p.fotoPerfil);
    const svc: any = this.teachersService;
    const candidateFns = ['getById', 'findById', 'find', 'get', 'obtenerPorId', 'obtener', 'listarPorId', 'getProfesor'];

    if (p.id && !hasFullData) {
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
              error: () => {
                this.profesorEnVista = p;
                this.showDetail.set(true);
                this.loadingDetail.set(false);
              }
            });
            return;
          }
        } catch {}
      }
    }

    this.profesorEnVista = p;
    this.showDetail.set(true);
  }

  closeDetail() {
    this.showDetail.set(false);
    this.profesorEnVista = null;
    this.loadingDetail.set(false);
  }

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
      (this.teachersService as any).delete(p.id);
    } finally {
      this.deleting.set(false);
      this.cancelDelete();
    }
  }

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

  onSearch(term: string) {
    this.searchTerm = term;
    this.search$.next(term);
  }

  private loadAllProfesores() {
    this.http.get<any[]>('/api/profesores').pipe(
      catchError(() => of([]))
    ).subscribe(list => {
      this.profesores = Array.isArray(list) ? list : [];
    });
  }

  goTo(pageNum: number) { if (pageNum < 1) pageNum = 1; if (pageNum > this.totalPages()) pageNum = this.totalPages(); this.page.set(pageNum); }
  prev() { this.goTo(this.page() - 1); }
  next() { this.goTo(this.page() + 1); }
  setPageSize(size: number) { this.pageSize.set(Number(size)); this.goTo(1); }
}

export const routes: Routes = [
  { path: 'admin/teachers', component: Teachers },
];
