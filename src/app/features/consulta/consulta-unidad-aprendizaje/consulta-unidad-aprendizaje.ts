import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ConsultaService, ConsultaDto, ConsultaRequestDto } from '../consulta-service';
import { ConsultaMensaje } from '../consulta-mensaje/consulta-mensaje';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CursoFiltroPipe } from '../curso-filtro.pipe';
import { AuthService } from '../../../core/services/auth-service'; 
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-consulta-unidad-aprendizaje',
  imports: [ConsultaMensaje, CommonModule, FormsModule, CursoFiltroPipe],
  templateUrl: './consulta-unidad-aprendizaje.html',
  styleUrls: ['./consulta-unidad-aprendizaje.css'],
})
export class ConsultaUnidadAprendizaje implements OnInit, OnChanges {
  @Input() unidadId!: number;
  consultas: ConsultaDto[] = [];
  agrupadas: any[] = [];
  cursoSeleccionado: string = '';  
  vistaActual: 'todas' | 'no-respondidas' = 'todas';
  idUsuario: number = 0;
  usuarioRol: string = '';

  mostrarFormulario = false;
  nuevaConsulta = {
    titulo: '',
    mensaje: ''
  };

  constructor(private consultaService: ConsultaService, private authService: AuthService) {}

  ngOnInit(): void {
    const token = this.authService['cookieService'].get('authToken');
    if (token) {
      const payload: any = jwtDecode(token);
      this.idUsuario = payload.userId;
      this.usuarioRol = Array.isArray(payload.roles) ? payload.roles[0]?.nombre : null; 
    }
    if (this.unidadId) {
      this.cargarConsultas();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['unidadId'] && !changes['unidadId'].firstChange) {
      this.cargarConsultas();
    }
  }

  cargarConsultas() {
    this.consultaService
      .getConsultasPorUnidad(this.unidadId)
      .subscribe((data) => {        
        this.consultas = data;
        this.consultaService.agruparConsultasPorCursoYUnidad(data);
        this.agrupadas = this.consultaService.agrupadas;
      });
      console.log('unidad id:', this.unidadId);
      console.log('alumno id:', this.idUsuario);
  }

  agregarConsulta() {
    if (!this.nuevaConsulta.titulo || !this.nuevaConsulta.mensaje) return;

    const request: ConsultaRequestDto = {
      titulo: this.nuevaConsulta.titulo,
      mensaje: this.nuevaConsulta.mensaje,
      unidadAprendizajeId: this.unidadId,
      usuarioId: this.idUsuario      
    };

    this.consultaService.responderConsulta(request).subscribe({
      next: () => {
        this.mostrarFormulario = false;
        this.nuevaConsulta = { titulo: '', mensaje: '' };
        this.cargarConsultas(); 
      },
      error: () => {
        throw new Error('Error al registrar la consulta');
      }
    });
  }
}
