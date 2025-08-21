// ...existing code...
import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth-service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router, private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(

      catchError((err: HttpErrorResponse) => {
        console.log(err)
         if (err && (err.status === 401 || err.status === 403)) { 
             this.authService.logout();
          if (this.router.url !== '/auth/login') {
            this.router.navigate(['/auth/login']);
          }
        } 
        return throwError(() => err);
      })
    );
  }
}
 

export const ErrorInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: ErrorInterceptor,
  multi: true
};