import { 
  Component, 
  Input, 
  Output, 
  EventEmitter 
} from '@angular/core';
import {
  ConsultaDto,
  ConsultaService,
  ConsultaRequestDto,
} from '../consulta-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-consulta-mensaje',
  imports: [CommonModule, FormsModule],
  templateUrl: './consulta-mensaje.html',
})
export class ConsultaMensaje {
  @Input() consulta!: ConsultaDto;
  @Input() idUsuario!: number;

  @Output() consultaRegistrada = new EventEmitter<void>();

  nuevaRespuesta: string = '';
  mostrarFormulario = false;

  constructor(private consultaService: ConsultaService) {}

  mostrarResponder() {
    this.mostrarFormulario = true;
  }

  cancelarResponder() {
    this.mostrarFormulario = false;
  }

  responder() {
    if (!this.nuevaRespuesta.trim()) return;
    const request: ConsultaRequestDto = {
      mensaje: this.nuevaRespuesta,
      consultaPadreId: this.consulta.id,
      unidadAprendizajeId: this.consulta.idUnidad,
      usuarioId: this.idUsuario,
      registroAlumnoId: this.consulta.idRegistroAlumno,
    };
    console.log('request', request);
    this.consultaService.responderConsulta(request).subscribe(() => {
      this.nuevaRespuesta = '';
      this.mostrarFormulario = false;
      this.consultaRegistrada.emit();
    });
  }
}
