import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router'; 
import { Footer } from '@features/admin/components/footer/footer';
import { Navbar } from '@features/admin/components/navbar/navbar';
import { MenuService } from '@shared/services/menu.service';


@Component({
  selector: 'app-admin-layout',
  imports: [
    Navbar,
    Footer,
    RouterOutlet,NgClass],
  templateUrl: './admin-layout.html',
  styles: ``
})
export class AdminLayout {
  private menuService = inject(MenuService);
  // exponer la señal para usar sidebarCollapsed() en admin-layout.html
  sidebarCollapsed = this.menuService.collapsed;
}
