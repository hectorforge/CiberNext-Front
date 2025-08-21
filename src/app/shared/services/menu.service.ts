import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MenuService {
  state = signal(false);

  collapsed = signal(false);

  sidebarCollapsed = this.collapsed;

  toggle() { this.state.update(v => !v); }
  open() { this.state.set(true); }
  close() { this.state.set(false); }

  toggleCollapsed() { this.collapsed.update(v => !v); }
  openCollapsed() { this.collapsed.set(true); }
  closeCollapsed() { this.collapsed.set(false); }
}