import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-perfil',
  imports: [],
  templateUrl: './perfil.html',
  styles: ``
})
export class Perfil {
    private authService = inject(AuthService);
  usuario: any;
  rolesTexto = '';

  ngOnInit() {
    this.authService.getProfile().subscribe({
      next: (res) => {
        this.usuario = res;
        this.rolesTexto = res.roles
          ? res.roles.map((r: any) => r.nombre).join(', ')
          : '';
      },
      error: (err) => console.error(err)
    });
  }
}
