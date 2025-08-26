import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@envs/environment.development';
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
  private apiUrl = environment.apiURLAuth;
  private apiUrlUser = environment.apiURLUsers;
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

  // Tokens utils

    /** Retorna el token almacenado en cookies */
    getToken(): string | null {
      if (!this.cookieService.check('authToken')) {
        return null;
      }
      return this.cookieService.get('authToken');
    }
  
    /** Decodifica el token y retorna el payload */
    decodeToken(): JwtPayload | null {
      const token = this.getToken();
      if (!token) return null;
  
      try {
        return jwtDecode<JwtPayload>(token);
      } catch (error) {
        console.error('Error decodificando token:', error);
        return null;
      }
    }
  
    /** Devuelve el rol principal del usuario */
    getUserRole(): string | null {
      const decoded = this.decodeToken();
      return decoded?.roles[0]?.nombre ?? null;
    }
  
    /** Devuelve si el token expiró */
    isTokenExpired(): boolean {
      const decoded = this.decodeToken();
      if (!decoded) return true;
  
      const now = Math.floor(Date.now() / 1000);
      return decoded.exp < now;
    }
}