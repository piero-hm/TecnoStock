import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Producto } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class AlertasStockService {
  private readonly url = `${environment.apiUrl}/productos/stock-bajo`;
  private readonly _contador = signal(0);
  readonly contador = this._contador.asReadonly();

  private enCurso = false;

  constructor(private http: HttpClient) {}

  refrescar(): void {
    if (this.enCurso) return;
    this.enCurso = true;
    this.http.get<Producto[]>(this.url).subscribe({
      next: (data) => {
        this._contador.set(Array.isArray(data) ? data.length : 0);
        this.enCurso = false;
      },
      error: () => {
        this.enCurso = false;
      },
    });
  }

  resetear(): void {
    this._contador.set(0);
    this.enCurso = false;
  }
}
