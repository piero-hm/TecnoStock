import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Producto, ProductoCreate } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly url = `${environment.apiUrl}/productos`;

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
    return this.http.post<Producto>(this.url, data);
  }

  actualizar(id: number, data: ProductoCreate): Observable<Producto> {
    return this.http.put<Producto>(`${this.url}/${id}`, data);
  }

  desactivar(id: number): Observable<Producto> {
    return this.http.patch<Producto>(`${this.url}/${id}/desactivar`, {});
  }

  activar(id: number): Observable<Producto> {
    return this.http.patch<Producto>(`${this.url}/${id}/activar`, {});
  }
}
