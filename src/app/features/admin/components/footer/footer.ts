import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuService } from '@shared/services/menu.service';

@Component({
  selector: 'app-admin-footer',
  imports: [NgClass, RouterLink],
  templateUrl: './footer.html',
  styles: ``
})
export class Footer {
  private menuService = inject(MenuService);

  // señales expuestas para usar en la plantilla: menuOpen() y sidebarCollapsed()
  menuOpen = this.menuService.state;
  sidebarCollapsed = this.menuService.sidebarCollapsed;
}
