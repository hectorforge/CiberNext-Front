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
    { id: 6, name: 'pais', label: 'País', type: 'text', placeholder: 'País', validators: [] },
    { id: 7, name: 'fotoPerfil', label: 'Foto Perfil (URL)', type: 'text', placeholder: 'https://...', validators: [] },
    { id: 8, name: 'rolId', label: 'Rol (ID)', type: 'number', placeholder: '3', validators: [] }
  ];

  // paginación
  page = signal(1);
  pageSize = signal(6);

  // BÚSQUEDA: señal y filtro (filtrado local sobre la lista cargada)
  searchTerm = signal('');
  private searchTimer: any = null;
  private readonly SEARCH_DEBOUNCE = 250; // ms
  private filtered = signal<AlumnoDto[] | null>(null);

  // totalItems y pagedAlumnos ahora consideran el filtro cuando existe
  totalItems = computed(() => {
    const f = this.filtered();
    return f ? f.length : this.studentsService.alumnos().length;
  });
  totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize())));
  pagedAlumnos = computed(() => {
    const all = this.filtered() ?? this.studentsService.alumnos();
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
    effect(() => console.log('Alumnos total:', this.studentsService.alumnos().length, 'filtro:', this.filtered()?.length ?? 'n/a'));
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

  onSearch(term: string) {
    const texto = (term || '').trim();
    this.searchTerm.set(texto);

    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      if (!texto) {
        this.filtered.set(null);
        this.studentsService.load();
        this.goTo(1);
        return;
      }

      this.studentsService.buscar(texto).subscribe({
        next: (list) => {
          this.filtered.set(Array.isArray(list) ? list : []);
          this.goTo(1);
        },
        error: (err) => {
          console.error('Error buscando alumnos:', err);
          this.filtered.set([]);
          this.goTo(1);
        }
      });
    }, this.SEARCH_DEBOUNCE);
  }

  descargarAlumnos() {
    // Usar la lista filtrada si existe, sino la completa
    const alumnos = this.filtered() ?? this.studentsService.alumnos();
    
    if (alumnos.length === 0) {
      alert('No hay alumnos para descargar');
      return;
    }

    // Crear CSV
    const headers = ['ID', 'Código', 'Nombre', 'Apellido', 'Email', 'Teléfono', 'DNI', 'País'];
    const csvContent = [
      headers.join(','),
      ...alumnos.map(a => [
        a.id || '',
        a.codigoAlumno || '',
        this.escapeCsvField(a.nombre || ''),
        this.escapeCsvField(a.apellido || ''),
        a.email || '',
        a.telefono || '',
        a.dni || '',
        this.escapeCsvField(a.pais || '')
      ].join(','))
    ].join('\n');

    // Crear y descargar archivo
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `alumnos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  private escapeCsvField(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }

  descargarAlumnosPDF() {
    const alumnos = this.filtered() ?? this.studentsService.alumnos();
    
    if (alumnos.length === 0) {
      alert('No hay alumnos para descargar');
      return;
    }

    // Crear HTML para PDF
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Lista de Alumnos</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .header { text-align: center; margin-bottom: 20px; }
            .date { font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Lista de Alumnos</h1>
            <p class="date">Generado el: ${new Date().toLocaleDateString('es-ES')}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Email</th>
                <th>DNI</th>
                <th>País</th>
              </tr>
            </thead>
            <tbody>
              ${alumnos.map(a => `
                <tr>
                  <td>${a.codigoAlumno || ''}</td>
                  <td>${a.nombre || ''}</td>
                  <td>${a.apellido || ''}</td>
                  <td>${a.email || ''}</td>
                  <td>${a.dni || ''}</td>
                  <td>${a.pais || ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
            Total de alumnos: ${alumnos.length}
          </div>
        </body>
      </html>
    `;

    // Crear ventana para imprimir/guardar como PDF
    const ventana = window.open('', '_blank');
    if (ventana) {
      ventana.document.write(html);
      ventana.document.close();
      
      // Esperar a que cargue y luego abrir diálogo de impresión
      ventana.onload = () => {
        setTimeout(() => {
          ventana.print();
          // Opcional: cerrar la ventana después de imprimir
          // ventana.close();
        }, 500);
      };
    } else {
      alert('No se pudo abrir la ventana para generar el PDF. Verifique que no esté bloqueando ventanas emergentes.');
    }
  }
}

export const routes: Routes = [
  { path: 'admin/students', component: Students },
];
