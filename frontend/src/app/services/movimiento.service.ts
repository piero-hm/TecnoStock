import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { FiltroMovimientos, Movimiento, MovimientoCreate } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class MovimientoService {
  private readonly url = `${environment.apiUrl}/movimientos`;

  constructor(private http: HttpClient) {}

  registrarEntrada(data: MovimientoCreate): Observable<Movimiento> {
    return this.http.post<Movimiento>(`${this.url}/entradas`, data);
  }

  registrarSalida(data: MovimientoCreate): Observable<Movimiento> {
    return this.http.post<Movimiento>(`${this.url}/salidas`, data);
  }

  historial(filtros: FiltroMovimientos): Observable<Movimiento[]> {
    let params = new HttpParams();
    if (filtros.producto_id != null) params = params.set('producto_id', filtros.producto_id);
    if (filtros.fecha_desde) params = params.set('fecha_desde', filtros.fecha_desde);
    if (filtros.fecha_hasta) params = params.set('fecha_hasta', filtros.fecha_hasta);
    if (filtros.tipo) params = params.set('tipo', filtros.tipo);
    return this.http.get<Movimiento[]>(this.url, { params });
  }
}
