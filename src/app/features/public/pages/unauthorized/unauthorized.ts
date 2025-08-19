import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  imports: [],
  templateUrl: './unauthorized.html',
  styles: ``
})
export class Unauthorized {
  constructor(private router: Router) {}

  goHome() {
    this.router.navigateByUrl('/');
  }

  goLogin() {
    this.router.navigateByUrl('/auth/login');
  }

  contactSupport() {
    this.router.navigateByUrl('/cibernext/contact');
  }
}
