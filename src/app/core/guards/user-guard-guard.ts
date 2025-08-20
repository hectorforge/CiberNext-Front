import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import {jwtDecode} from 'jwt-decode';

interface JwtPayload {
  roles: { id: number; nombre: string }[];
  sub: string;
  exp: number;
  iat: number;
}

export const userGuardGuard: CanActivateFn = (route, state) => {
  const cookieService = inject(CookieService);
  const router = inject(Router);

  if (!cookieService.check('authToken')) {
    router.navigate(['/auth/login']);
    return false;
  }

  const token = cookieService.get('authToken');
  let decoded: JwtPayload;

  try {
    decoded = jwtDecode<JwtPayload>(token);
  } catch (error) {
    console.error('Error decodificando el token:', error);
    router.navigate(['/auth/login']);
    return false;
  }

  const userRole = decoded.roles[0]?.nombre; // <-- Aqui ya obtengo el nombre del rol
  const requiredRoles = route.data?.['roles'] as string[];

  // Debugs xd
  console.log('Token decodificado:', decoded);
  console.log('Este es el userRole que llego : ', userRole);
  console.log('Este es el requiredRoles que llego : ', requiredRoles);

  if (requiredRoles && !requiredRoles.includes(userRole)) {
    router.navigate(['/unauthorized']);
    return false;
  }

  return true;
};
