import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProfesorService } from '../../services/profesor';
import { Profesor } from '../../models/profesor';

@Component({
  selector: 'app-ver-profesor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ver-profesores.html'
})
export class VerProfesorComponent implements OnInit {
  profesor?: Profesor;

  constructor(
    private route: ActivatedRoute,
    private profesorService: ProfesorService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.profesorService.obtenerPorId(id).subscribe(data => this.profesor = data);
  }
}
