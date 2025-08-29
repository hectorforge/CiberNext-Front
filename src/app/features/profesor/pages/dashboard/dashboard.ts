import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Profesor } from '../../models/profesor';
import { ProfesorService } from '../../services/profesor';
import { AuthService } from '../../../../core/services/auth-service'; 

@Component({
  selector: 'app-dashboard-teacher',
  templateUrl: './dashboards.html',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styles: []
})
export class DashboardTeacher implements OnInit {
  profesores: Profesor[] = [];
  userId: number | null = null;

  constructor(
    private profesorService: ProfesorService,
    private authService: AuthService // Inyectamos AuthService
  ) {}

  ngOnInit(): void {
    // Obtener el userId desde el token
    const token: any = this.authService.decodeToken();
    console.log('Decoded Token:', token); 
    this.userId = token?.userId;

    
    this.profesorService.listar().subscribe(data => {
      this.profesores = data;
    });
  }
}
