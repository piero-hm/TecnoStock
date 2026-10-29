import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse, Usuario } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'tecnostock_token';
  private readonly usuarioSignal = signal<Usuario | null>(this.leerUsuario());

  readonly usuario = this.usuarioSignal.asReadonly();
  readonly estaAutenticado = computed(() => this.usuarioSignal() !== null && this.token() !== null);

  constructor(private http: HttpClient, private router: Router) {}

  token(): string | null {
    try {
      return localStorage.getItem(this.tokenKey);
    } catch {
      return null;
    }
  }

  private leerUsuario(): Usuario | null {
    try {
      const raw = localStorage.getItem('tecnostock_usuario');
      return raw ? (JSON.parse(raw) as Usuario) : null;
    } catch {
      return null;
    }
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, request).pipe(
      tap((res) => {
        try {
          localStorage.setItem(this.tokenKey, res.access_token);
          localStorage.setItem('tecnostock_usuario', JSON.stringify(res.usuario));
        } catch {
          // ignore storage errors
        }
        this.usuarioSignal.set(res.usuario);
      }),
    );
  }

  logout(): void {
    try {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem('tecnostock_usuario');
    } catch {
      // ignore
    }
    this.usuarioSignal.set(null);
    this.router.navigate(['/login']);
  }

  establecerUsuarioDesdeToken(): void {
    // no-op: usuario ya cargado desde localStorage
  }
}
