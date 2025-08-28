import { Component, Input, OnInit } from '@angular/core';
import { ConsultaService, ConsultaDto } from '../consulta-service';
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
export class ConsultaUnidadAprendizaje implements OnInit {
  @Input() unidadId!: number;
  consultas: ConsultaDto[] = [];
  agrupadas: any[] = [];
  cursoSeleccionado: string = '';  
  vistaActual: 'todas' | 'no-respondidas' = 'todas';
  idUsuario: number = 0;
  usuarioRol: string = '';

  constructor(private consultaService: ConsultaService, private authService: AuthService) {}

  ngOnInit(): void {
    const token = this.authService['cookieService'].get('authToken');
    if (token) {
      const payload: any = jwtDecode(token);
      this.idUsuario = payload.userId;
      this.usuarioRol = Array.isArray(payload.roles) ? payload.roles[0]?.nombre : null; 
      console.log("unidadId", this.unidadId);
    }

    this.consultaService
      .getConsultasPorUnidad(this.unidadId)
      .subscribe((data) => {        
        this.consultas = data;
        this.consultaService.agruparConsultasPorCursoYUnidad(data);
        this.agrupadas = this.consultaService.agrupadas;
      });
  }

}
