import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Profesor } from '../../models/profesor';
import { ProfesorService } from '../../services/profesor';

@Component({
  selector: 'app-dashboard-teacher',
  templateUrl: './dashboards.html',
  standalone: true,
  imports: [CommonModule, RouterModule],
  
  styles: []
})
export class DashboardTeacher implements OnInit {
  profesores: Profesor[] = [];

  constructor(private profesorService: ProfesorService) {}

  ngOnInit(): void {
    this.profesorService.listar().subscribe(data => {
      this.profesores = data;
    });
}
}
