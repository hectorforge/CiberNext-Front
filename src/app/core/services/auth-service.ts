import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { CookieService } from 'ngx-cookie-service';
import { Observable, tap } from 'rxjs';

interface JwtPayload {
  roles: { id: number; nombre: string }[];
  sub: string;
  exp: number;
  iat: number;
}
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private apiUrlUser = 'http://localhost:8080/api/users';
  private tokenKey = 'authToken';

  constructor(private http: HttpClient, private cookieService: CookieService) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(res => this.cookieService.set(this.tokenKey, res.token, 1, '/'))
      );
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrlUser}/me`);
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrlUser}/update`, data).pipe(
      tap((res: any) => {
        if (res.token) {
          this.cookieService.set(this.tokenKey, res.token, 1, '/');
        }
      })
    );
  }

  changePassword(data: any): Observable<any> {
    return this.http.put(`${this.apiUrlUser}/update/password`, data);
  }

  logout(): void {
    this.cookieService.delete(this.tokenKey, '/');
  }

  getRolesFromToken(): string[] {
    const token = this.cookieService.get(this.tokenKey);
    if (!token) return [];
  
    try {
      const payload = jwtDecode<JwtPayload>(token);
      return Array.isArray(payload.roles)
        ? payload.roles.map(r => r.nombre)
        : [];
    } catch (error) {
      console.error("Error al decodificar token:", error);
      return [];
    }
  }
}