import {Component, inject} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../../services/auth-service';
import {CookieService} from 'ngx-cookie-service';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule,RouterLink],
  templateUrl: './navbar.html'
})
export class Navbar {
  private router = inject(Router);
  private authService = inject(AuthService);
  private cookieService = inject(CookieService);

  usuario: any = null;
  isMenuOpen = false;

  ngOnInit(): void {
    if (this.isLoggedIn()) {
      this.authService.getProfile().subscribe({
        next: (data) => {
          this.usuario = data;
        },
        error: (err) => {
          console.error('Error al obtener perfil:', err);
        }
      });
    }
  }

  isLoggedIn(): boolean {
    return this.cookieService.check('authToken');
  }

  getFotoPerfil(): string {
    return this.usuario?.fotoPerfil;
  }

  getNombreCompleto(): string {
    return this.usuario ? `${this.usuario.nombre} ${this.usuario.apellido}` : '';
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}