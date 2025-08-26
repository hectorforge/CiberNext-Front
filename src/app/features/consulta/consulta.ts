import { Component, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-consulta',
  imports: [
    RouterOutlet
  ],
  templateUrl: './consulta.html',
  styleUrl: './consulta.css'
})
export class Consulta {

  protected readonly titulo = signal('Consultas');

  constructor(
    private router: Router, 
    private route: ActivatedRoute
  ) {}

  goAlumno() {
    // this.router.navigateByUrl("consulta/todas");
    this.router.navigate(['alumno'], { relativeTo: this.route });
  }

  goProfesor() {
    this.router.navigate(['profesor'], { relativeTo: this.route });
  }

}
