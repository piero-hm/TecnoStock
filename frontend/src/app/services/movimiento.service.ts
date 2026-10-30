import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { FiltroMovimientos, Movimiento, MovimientoCreate } from '../interfaces';
import { AlertasStockService } from './alertas-stock.service';

@Injectable({ providedIn: 'root' })
export class MovimientoService {
  private readonly url = `${environment.apiUrl}/movimientos`;
  private readonly alertas = inject(AlertasStockService);

  constructor(private http: HttpClient) {}

  registrarEntrada(data: MovimientoCreate): Observable<Movimiento> {
    return this.http.post<Movimiento>(`${this.url}/entradas`, data).pipe(tap(() => this.alertas.refrescar()));
  }

  registrarSalida(data: MovimientoCreate): Observable<Movimiento> {
    return this.http.post<Movimiento>(`${this.url}/salidas`, data).pipe(tap(() => this.alertas.refrescar()));
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
