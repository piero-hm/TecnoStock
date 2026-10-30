import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Producto, ProductoCreate } from '../interfaces';
import { AlertasStockService } from './alertas-stock.service';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly url = `${environment.apiUrl}/productos`;
  private readonly alertas = inject(AlertasStockService);

  constructor(private http: HttpClient) {}

  listar(busqueda?: string | null, categoriaId?: number | null, incluirInactivos = false): Observable<Producto[]> {
    let params = new HttpParams();
    if (busqueda) params = params.set('busqueda', busqueda);
    if (categoriaId != null) params = params.set('categoria_id', categoriaId);
    if (incluirInactivos) params = params.set('incluir_inactivos', 'true');
    return this.http.get<Producto[]>(this.url, { params });
  }

  stockBajo(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.url}/stock-bajo`);
  }

  obtener(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.url}/${id}`);
  }

  crear(data: ProductoCreate): Observable<Producto> {
    return this.http.post<Producto>(this.url, data).pipe(tap(() => this.alertas.refrescar()));
  }

  actualizar(id: number, data: ProductoCreate): Observable<Producto> {
    return this.http.put<Producto>(`${this.url}/${id}`, data).pipe(tap(() => this.alertas.refrescar()));
  }

  desactivar(id: number): Observable<Producto> {
    return this.http.patch<Producto>(`${this.url}/${id}/desactivar`, {}).pipe(tap(() => this.alertas.refrescar()));
  }

  activar(id: number): Observable<Producto> {
    return this.http.patch<Producto>(`${this.url}/${id}/activar`, {}).pipe(tap(() => this.alertas.refrescar()));
  }
}
