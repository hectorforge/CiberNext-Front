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

  isMenuOpen  = false;

  isLoggedIn(): boolean {
    return this.cookieService.check('authToken');
  }

  toggleMenu(): void {
    this.isMenuOpen  = !this.isMenuOpen;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
