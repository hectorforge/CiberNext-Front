import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DashboardService } from './dashboard.service';

@Component({
  selector: 'app-dashboard-admin',
  templateUrl: './dashboard.html',
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class DashboardAdmin implements OnInit {
  loading = true;
  error = '';
  stats = { cursos: 0, alumnos: 0, profesores: 0, registros: 0 };
  recent: any[] = [];

  constructor(private svc: DashboardService, private router: Router) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll() {
    this.loading = true;
    this.error = '';

    this.svc.getCounts().subscribe({
      next: res => {
        this.stats = res;
        this.loading = false;
      },
      error: err => {
        console.error('Dashboard counts error', err);
        this.error = 'Error al cargar estadísticas';
        this.loading = false;
      }
    });

    // actividad (no bloqueante)
    this.svc.getRecentActivity().subscribe({
      next: (r: any[]) => this.recent = Array.isArray(r) ? r.slice(0, 6) : [],
      error: () => this.recent = []
    });
  }

  goTo(path: string) {
    this.router.navigate([path]);
  }
}
