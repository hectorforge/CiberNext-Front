import { NgClass, NgIf } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth-service';
import { MenuService } from '@shared/services/menu.service';


@Component({
  selector: 'app-admin-navbar',
  imports: [RouterLink, NgClass, NgIf],
  templateUrl: './navbar.html',
  styles: ``
})
export class Navbar {
  private router = inject(Router);
  private menuService = inject(MenuService);
    private auth = inject(AuthService);

  // señales para plantilla
  menuOpen = this.menuService.state;         // drawer móvil
  sidebarCollapsed = this.menuService.collapsed; // collapse escritorio

  constructor() {
    // cerrar drawer al navegar
    effect(() => {
      const sub = this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.menuService.close();
        }
      });
      return () => sub.unsubscribe();
    });
  }

  // móvil
  toggleMenu() { this.menuService.toggle(); }
  closeMenu() { this.menuService.close(); }

  // escritorio
  toggleSidebar() { this.menuService.toggleCollapsed(); }
  closeSidebar() { this.menuService.closeCollapsed(); }

  logout() {
     this.auth.logout();
    this.router.navigateByUrl('/auth/login');
  }
}
