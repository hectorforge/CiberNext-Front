import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

export const userGuardGuard: CanActivateFn = (route, state) => {
  const cookieService = inject(CookieService);
  const router = inject(Router);

  if (!cookieService.check('authToken')) {
    router.navigate(['/auth/login']);
    return false;
  }

  const userRole = cookieService.get('userRole');
  const requiredRoles = route.data?.['roles'] as string[];

  if (requiredRoles && !requiredRoles.includes(userRole)) {
    router.navigate(['/unauthorized']);
    return false;
  }

  return true;
};