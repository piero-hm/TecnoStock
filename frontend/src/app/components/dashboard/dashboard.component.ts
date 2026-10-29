import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { ProductoService } from '../../services/producto.service';
import { MovimientoService } from '../../services/movimiento.service';
import { DashboardAgregacionService } from '../../services/dashboard-agregacion.service';
import { Indicadores, Movimiento, Producto } from '../../interfaces';
import { GraficoAreaComponent, PuntoArea } from '../../components/grafico-area/grafico-area.component';
import { GraficoDonutComponent, PorcionDonut } from '../../components/grafico-donut/grafico-donut.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  imports: [RouterLink, GraficoAreaComponent, GraficoDonutComponent],
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private productoService = inject(ProductoService);
  private movimientoService = inject(MovimientoService);
  readonly agg = inject(DashboardAgregacionService);

  readonly rango = signal<7 | 30 | 90>(7);

  ngOnInit(): void {
    this.agg.cargando.set(true);
    this.dashboardService.indicadores().subscribe({
      next: (d) => this.agg.indicadores.set(d),
    });
    this.productoService.listar().subscribe({
      next: (p) => this.agg.productos.set(p),
    });
    this.productoService.stockBajo().subscribe({
      next: (p) => this.agg.stockBajo.set(p),
    });
    this.movimientoService.historial({}).subscribe({
      next: (m) => {
        this.agg.ultimos.set(m.slice(0, 8));
        this.agg.cargando.set(false);
      },
      error: () => this.agg.cargando.set(false),
    });
    this.cargarRango();
  }

  cambiarRango(dias: 7 | 30 | 90): void {
    this.rango.set(dias);
    this.agg.rangoDias.set(dias);
    this.cargarRango();
  }

  private cargarRango(): void {
    const dias = this.rango();
    const hasta = new Date();
    const desde = new Date();
    desde.setDate(desde.getDate() - (dias - 1));
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    this.movimientoService.historial({ fecha_desde: fmt(desde), fecha_hasta: fmt(hasta) }).subscribe({
      next: (m) => this.agg.movimientosRango.set(m),
    });
  }

  moneda(v: number): string {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(v);
  }

  nivelStock(p: Producto): number {
    if (p.stock_minimo <= 0) return p.stock_actual > 0 ? 100 : 0;
    return Math.min(100, (p.stock_actual / p.stock_minimo) * 100);
  }

  colorNivel(p: Producto): string {
    const n = this.nivelStock(p);
    if (p.stock_actual === 0) return 'danger';
    if (n <= 25) return 'danger';
    if (n <= 60) return 'warn';
    return 'ok';
  }

  formatearFechaHora(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' +
      d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }

  donutDatos(): PorcionDonut[] {
    return this.agg.valorPorCategoria().map((c) => ({ nombre: c.nombre, valor: c.valor }));
  }

  areaDatos(): PuntoArea[] {
    return this.agg.serieArea();
  }
}
