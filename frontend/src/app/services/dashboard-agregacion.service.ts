import { Injectable, computed, signal } from '@angular/core';
import { Producto, Movimiento, Indicadores } from '../interfaces';

// Agregaciones del dashboard calculadas en frontend con computed.
// Fuentes: GET /productos, GET /productos/stock-bajo, GET /movimientos, GET /dashboard/indicadores.
@Injectable({ providedIn: 'root' })
export class DashboardAgregacionService {
  readonly indicadores = signal<Indicadores | null>(null);
  readonly productos = signal<Producto[]>([]);
  readonly stockBajo = signal<Producto[]>([]);
  readonly ultimos = signal<Movimiento[]>([]);
  readonly movimientosRango = signal<Movimiento[]>([]);
  readonly rangoDias = signal<7 | 30 | 90>(7);
  readonly cargando = signal(true);

  // Valor de inventario por categoría (stock_actual * precio_compra) de productos activos.
  readonly valorPorCategoria = computed(() => {
    const mapa = new Map<string, number>();
    for (const p of this.productos()) {
      if (!p.activo) continue;
      const valor = p.stock_actual * p.precio_compra;
      mapa.set(p.categoria_nombre, (mapa.get(p.categoria_nombre) ?? 0) + valor);
    }
    const total = Array.from(mapa.values()).reduce((a, b) => a + b, 0);
    return Array.from(mapa.entries()).map(([nombre, valor]) => ({
      nombre,
      valor,
      porcentaje: total > 0 ? (valor / total) * 100 : 0,
    })).sort((a, b) => b.valor - a.valor);
  });

  // Productos sin stock y los 3 con mayor faltante.
  readonly reposicionUrgente = computed(() => {
    const sinStock = this.stockBajo().filter((p) => p.stock_actual === 0).length;
    const top = [...this.stockBajo()]
      .map((p) => ({ producto: p, faltante: p.stock_minimo - p.stock_actual }))
      .filter((x) => x.faltante > 0)
      .sort((a, b) => b.faltante - a.faltante)
      .slice(0, 3);
    return { sinStock, top };
  });

  // Serie por día para el gráfico de área, rellenando días sin movimientos con 0.
  readonly serieArea = computed(() => {
    const dias = this.rangoDias();
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const inicio = new Date(hoy);
    inicio.setDate(inicio.getDate() - (dias - 1));

    const mapa = new Map<string, { entradas: number; salidas: number }>();
    for (let i = 0; i < dias; i++) {
      const d = new Date(inicio);
      d.setDate(d.getDate() + i);
      mapa.set(this.claveFecha(d), { entradas: 0, salidas: 0 });
    }
    for (const m of this.movimientosRango()) {
      const clave = this.claveFecha(new Date(m.fecha));
      const actual = mapa.get(clave);
      if (!actual) continue;
      if (m.tipo === 'ENTRADA') actual.entradas += m.cantidad;
      else actual.salidas += m.cantidad;
    }
    return Array.from(mapa.entries()).map(([clave, v]) => ({
      fecha: clave,
      entradas: v.entradas,
      salidas: v.salidas,
    }));
  });

  private claveFecha(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
