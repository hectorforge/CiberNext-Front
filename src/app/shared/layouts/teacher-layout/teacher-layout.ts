import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router'; 
import { Footer } from '@features/profesor/components/footer/footer';
import { Navbar } from '@features/profesor/components/navbar/navbar';
import { MenuService } from '@shared/services/menu.service';


@Component({
  selector: 'app-teacher-layout',
  imports: [
    Navbar,
    Footer,
    RouterOutlet,NgClass],
  templateUrl: './techer-layout.html',
  styles: ``
})
export class TeacherLayout {
  private menuService = inject(MenuService);
  // exponer la señal para usar sidebarCollapsed() en admin-layout.html
  sidebarCollapsed = this.menuService.collapsed;
}