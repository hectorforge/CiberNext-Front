import { Component, effect, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, Validators } from '@angular/forms';
import { CoursesService, CursoDto, ProfesorDto, AlumnoDto, DocumentoDto } from './courses.service';
import { DynamicField } from '@shared/models/dynamic-field';
import { Routes } from '@angular/router';
import { DynamicFormComponent } from '@shared/components/DynamicForm/dynamicForm';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, DynamicFormComponent, FormsModule],
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

  // modal documentos
  documentos = signal<DocumentoDto[]>([]);
  showDocumentos = signal(false);
  cursoEnVistaDocumentos: CursoDto | null = null;

  // búsqueda
  searchTerm = signal('');
  private searchTimer: any = null;
  private SEARCH_DEBOUNCE = 300; // ms

  // NUEVO: confirmación de borrado (modal)
  showDeleteConfirm = signal(false);
  cursoParaEliminar = signal<CursoDto | null>(null);
  deleting = signal(false);

  // --- Añadido: soporte edición de documentos y combos ---
  editingDocumento: any = null;
  tiposDocumento: any[] = [];
  unidades: any[] = [];

  // --- Nuevo: creación de documento ---
  isNewDocumento = false;

  constructor(public coursesService: CoursesService) {
    this.coursesService.load();
    // debug opcional
    effect(() => {
      // eslint-disable-next-line no-console
      console.log('Cursos total:', this.coursesService.cursos().length);
    });

    // Si ya tenías constructor, añade solo la carga de listas dentro del tuyo.
    const svc: any = (this as any).coursesService || (this as any).service || (this as any);

    if (svc) {
      try {
        if (typeof svc.listarTiposDocumento === 'function') svc.listarTiposDocumento().subscribe((r: any) => this.tiposDocumento = r || []);
        else if (typeof svc.getTiposDocumento === 'function') svc.getTiposDocumento().subscribe((r: any) => this.tiposDocumento = r || []);
      } catch (e) { /* noop */ }

      try {
        if (typeof svc.listarUnidades === 'function') svc.listarUnidades().subscribe((r: any) => this.unidades = r || []);
        else if (typeof svc.getUnidades === 'function') svc.getUnidades().subscribe((r: any) => this.unidades = r || []);
      } catch (e) { /* noop */ }
    }
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
  // abrir modal "Ver DOCUMENTOS" y cargar documentos desde API
  openDocumentos(c: CursoDto) {
    if (!c?.id) return;
    this.documentos.set([]);
    this.showDocumentos.set(true);
    this.cursoEnVistaDocumentos = c;
    this.coursesService.listarDocumentosPorCurso(c.id!).subscribe({
      next: list => {
        const docs = list || [];
        this.documentos.set(docs);

        // Reconstruir unidades asegurando id numérico
        const mapU = new Map<number, { id: number; nombre: string; codigo?: string }>();
        for (const d of docs) {
          if (!d) continue;
          if ((d as any).idUnidadAprendizaje != null) {
            const id = Number((d as any).idUnidadAprendizaje);
            const nombre =
              (d as any).nombreUnidadaprendizaje ??
              (d as any).nombreUnidadAprendizaje ??
              (d as any).descripcionUnidadaprendizaje ??
              `Unidad ${id}`;
            const codigo = (d as any).codigoUnidadaprendizaje ?? (d as any).codigoUnidad;
            if (!Number.isNaN(id) && !mapU.has(id)) mapU.set(id, { id, nombre, codigo });
            continue;
          }
          const u = (d as any).unidad || (d as any).unidadAprendizaje;
          if (u && (u.id != null || u.unidadId != null)) {
            const id = Number(u.id ?? u.unidadId);
            const nombre = u.nombre ?? u.titulo ?? u.nombreUnidadaprendizaje ?? (`Unidad ${id}`);
            const codigo = u.codigo ?? u.codigoUnidadaprendizaje;
            if (!Number.isNaN(id) && !mapU.has(id)) mapU.set(id, { id, nombre, codigo });
          }
        }
        this.unidades = Array.from(mapU.values());

        // logs de depuración (temporal)
        // eslint-disable-next-line no-console
        console.log('openDocumentos -> unidades reconstruidas:', this.unidades);

        // reconstruir tipos también (si lo necesitas)...
        {
          const map = new Map<number | string, { id: any; nombre: string }>();
          for (const d of docs) {
            if (!d) continue;

            // preferir campos planos en tu DTO
            if ((d as any).idTipoDocumento != null) {
              const id = (d as any).idTipoDocumento;
              const nombre =
                (d as any).nombreTipoDucumento ?? // typo posible en DTO
                (d as any).nombreTipoDocumento ??
                (d as any).nombreTipo ??
                `Tipo ${id}`;
              if (!map.has(id)) map.set(id, { id, nombre });
              continue;
            }

            // fallback por compatibilidad si existiera objeto tipoDocumento
            const t = (d as any).tipoDocumento;
            if (t && (t.id != null || t.tipoId != null)) {
              const id = t.id ?? t.tipoId;
              const nombre = t.nombre ?? t.label ?? t.tipoNombre ?? `Tipo ${id}`;
              if (!map.has(id)) map.set(id, { id, nombre });
            }
          }
          this.tiposDocumento = Array.from(map.values());
        }

        // logs temporales para depuración (quítalos cuando confirme que funciona)
        // eslint-disable-next-line no-console
        console.log('openDocumentos: docs.length=', docs.length, 'tiposDocumento=', this.tiposDocumento, 'unidades=', this.unidades);
      },
      error: err => {
        console.error('Error cargando documentos:', err);
        this.documentos.set([]);
        this.tiposDocumento = [];
        this.unidades = [];
      }
    });
  }

  closeDocumentos() {
    this.showDocumentos.set(false);
    this.documentos.set([]);
    this.cursoEnVistaDocumentos = null;
  }



  // iniciar edición (clona para no mutar la lista directamente)
  startEditarDocumento(d: any) {
    if (!d) return;
    this.editingDocumento = { ...d };

    // normalizar idUnidadDocumento (existente)
    if (this.editingDocumento.idTipoDocumento == null) {
      if (this.editingDocumento.tipoDocumento && this.editingDocumento.tipoDocumento.id != null) {
        this.editingDocumento.idTipoDocumento = Number(this.editingDocumento.tipoDocumento.id);
      } else if (this.editingDocumento.tipoDocumentoId != null) {
        this.editingDocumento.idTipoDocumento = Number(this.editingDocumento.tipoDocumentoId);
      } else {
        this.editingDocumento.idTipoDocumento = null;
      }
    } else {
      this.editingDocumento.idTipoDocumento = Number(this.editingDocumento.idTipoDocumento);
    }

    // normalizar unidad: asegurar idUnidadAprendizaje en editingDocumento y convertir a number
    let unidadId: any = null;
    if (this.editingDocumento.idUnidadAprendizaje != null) unidadId = this.editingDocumento.idUnidadAprendizaje;
    else if (this.editingDocumento.unidadId != null) unidadId = this.editingDocumento.unidadId;
    else if (this.editingDocumento.idUnidad != null) unidadId = this.editingDocumento.idUnidad;
    else if (this.editingDocumento.unidad && this.editingDocumento.unidad.id != null) unidadId = this.editingDocumento.unidad.id;

    this.editingDocumento.idUnidadAprendizaje = unidadId != null ? Number(unidadId) : null;

    // log temporal para depurar si no se selecciona la unidad
    // eslint-disable-next-line no-console
    console.log('startEditarDocumento: editingDocumento.idUnidadAprendizaje=', this.editingDocumento.idUnidadAprendizaje, 'unidades=', this.unidades);
  }

  // --- Nuevo: creación de documento ---
  startNuevoDocumento() {
    // prepara objeto vacío para crear
    this.editingDocumento = {
      id: undefined,
      nombre: '',
      descripcion: '',
      archivo: '',
      idTipoDocumento: null,
      idUnidadAprendizaje: null,
      cursoId: this.cursoEnVistaDocumentos?.id ?? undefined
    };
    this.isNewDocumento = true;
    // abrir modal si no está abierto
    try { this.showDocumentos.set(true); } catch (e) { /* noop */ }
  }

  // guardar cambios (ahora maneja CREATE y UPDATE)
  guardarDocumento() {
    if (!this.editingDocumento) return;
    const svc: any = this.coursesService;

    const payload: DocumentoDto = {
      id: this.editingDocumento.id,
      nombre: this.editingDocumento.nombre,
      descripcion: this.editingDocumento.descripcion,
      archivo: this.editingDocumento.archivo,
      idTipoDocumento: this.editingDocumento.idTipoDocumento != null ? Number(this.editingDocumento.idTipoDocumento) : undefined,
      idUnidadAprendizaje: this.editingDocumento.idUnidadAprendizaje != null ? Number(this.editingDocumento.idUnidadAprendizaje) : undefined,
      cursoId: this.cursoEnVistaDocumentos?.id
    };

    // debug rapido (quita si no hace falta)
    // console.log('guardarDocumento -> payload:', payload, 'isNew=', this.isNewDocumento);

    // Si es NUEVO -> intentar crear (POST)
    if (this.isNewDocumento) {
      const createCandidates = [
        'registrarDocumento', 'registrarDocumentoCurso', 'crearDocumento',
        'createDocumento', 'saveDocumento', 'guardarDocumento'
      ];
      const fnCreate = createCandidates.find(n => svc && typeof svc[n] === 'function');
      if (fnCreate) {
        try {
          const res = svc[fnCreate](payload);
          if (res && typeof res.subscribe === 'function') {
            res.subscribe({
              next: (r: any) => this.postGuardarReload(),
              error: (err: any) => { console.error('crearDocumento error:', err); this.postGuardarReload(); }
            });
            return;
          }
          if (res && typeof res.then === 'function') {
            res.then(() => this.postGuardarReload()).catch((err: any) => { console.error(err); this.postGuardarReload(); });
            return;
          }
          // si devuelve directo
          this.postGuardarReload();
          return;
        } catch (e) {
          console.error('guardarDocumento (crear) fallo llamando service', e);
        }
      }
      // fallback local si no hay método en service
      try {
        const arr = this.documentos();
        arr.push(payload);
        this.documentos.set(arr);
      } catch (e) { console.warn('fallback crear documento', e); }
      this.editingDocumento = null;
      this.isNewDocumento = false;
      return;
    }

    // Si no es nuevo -> actualizar (UPDATE)
    // Intentar métodos conocidos del service (varias firmas)
    try {
      if (svc && typeof svc.actualizarDocumento === 'function') {
        if (payload.id != null) {
          const res = svc.actualizarDocumento(payload.id, payload);
          if (res) {
            if (typeof res.subscribe === 'function') { res.subscribe(() => this.postGuardarReload()); return; }
            if (typeof res.then === 'function') { res.then(() => this.postGuardarReload()); return; }
            this.postGuardarReload(); return;
          }
        }
        const res2 = svc.actualizarDocumento(this.cursoEnVistaDocumentos?.id, payload);
        if (res2) {
          if (typeof res2.subscribe === 'function') { res2.subscribe(() => this.postGuardarReload()); return; }
          if (typeof res2.then === 'function') { res2.then(() => this.postGuardarReload()); return; }
          this.postGuardarReload(); return;
        }
      }

      if (svc && typeof svc.updateDocumento === 'function' && payload.id != null) {
        const r = svc.updateDocumento(payload.id, payload);
        if (r) {
          if (typeof r.subscribe === 'function') { r.subscribe(() => this.postGuardarReload()); return; }
          if (typeof r.then === 'function') { r.then(() => this.postGuardarReload()); return; }
          this.postGuardarReload(); return;
        }
      }
    } catch (e) {
      console.error('guardarDocumento: error llamando service', e);
    }

    // fallback local si no se llamó al servicio
    try {
      const arr = this.documentos();
      const idx = arr.findIndex(x => x.id === payload.id);
      if (idx >= 0) arr[idx] = { ...arr[idx], ...payload };
      else arr.push(payload);
      this.documentos.set(arr);
    } catch (e) { console.warn('guardarDocumento fallback error', e); }
    this.editingDocumento = null;
    this.isNewDocumento = false;
  }

  private postGuardarReload() {
    // recargar desde API y limpiar edición/flags
    if (this.cursoEnVistaDocumentos?.id && typeof this.coursesService.listarDocumentosPorCurso === 'function') {
      this.coursesService.listarDocumentosPorCurso(this.cursoEnVistaDocumentos.id).subscribe({
        next: list => { this.documentos.set(list || []); this.editingDocumento = null; this.isNewDocumento = false; },
        error: err => { console.error('postGuardarReload error', err); this.editingDocumento = null; this.isNewDocumento = false; }
      });
    } else {
      this.editingDocumento = null;
      this.isNewDocumento = false;
    }
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

  // cancelar edición o creación
  cancelEditarDocumento() {
    // cancelar edición o creación
    this.editingDocumento = null;
    this.isNewDocumento = false;
  }
}

export const routes: Routes = [
  { path: 'admin/courses', component: Courses },
];
