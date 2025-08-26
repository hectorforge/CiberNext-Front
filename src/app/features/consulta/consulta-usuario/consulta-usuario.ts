import { Component, OnInit } from '@angular/core';
import { ConsultaService, ConsultaDto } from '../consulta-service';
import { ConsultaMensaje } from '../consulta-mensaje/consulta-mensaje';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CursoFiltroPipe } from '../curso-filtro.pipe';
import { AuthService } from '../../../core/services/auth-service'; 
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-consulta-usuario',
  imports: [ConsultaMensaje, CommonModule, FormsModule, CursoFiltroPipe],
  templateUrl: './consulta-usuario.html',
  styleUrls: ['./consulta-usuario.css'],
})
export class ConsultaUsuario implements OnInit {
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
      // this.idUsuario = 3; 
      // this.usuarioRol = 'PROFESOR';
      console.log(this.idUsuario , ' - ', this.usuarioRol);
    }

    this.consultaService
      .getConsultas(this.idUsuario, this.usuarioRol)
      .subscribe((data) => {        
        this.consultas = data;
        this.consultaService.agruparConsultasPorCursoYUnidad(data);
        this.agrupadas = this.consultaService.agrupadas;
      });
  }

  mostrarTodas() {
    this.vistaActual = 'todas';
    this.consultaService
      .getConsultas(this.idUsuario, this.usuarioRol)
      .subscribe((data) => {
        this.consultas = data;
        this.consultaService.agruparConsultasPorCursoYUnidad(data);
        this.agrupadas = this.consultaService.agrupadas;
        console.log('agrupadas - todas: ', this.agrupadas);
      });    
  }

  mostrarNoRespondidas() {
    this.vistaActual = 'no-respondidas';
    this.consultaService
      .getConsultasNoRespondidas(this.idUsuario, this.usuarioRol)
      .subscribe((data) => {
        this.consultas = data;
        this.consultaService.agruparConsultasPorCursoYUnidad(data);
        this.agrupadas = this.consultaService.agrupadas;
        console.log('agrupadas - no respondidas: ', this.agrupadas);
      });
  }
}
