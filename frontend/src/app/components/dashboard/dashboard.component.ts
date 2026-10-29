import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { ProductoService } from '../../services/producto.service';
import { MovimientoService } from '../../services/movimiento.service';
import { Indicadores, Movimiento, Producto } from '../../interfaces';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  imports: [DatePipe],
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private productoService = inject(ProductoService);
  private movimientoService = inject(MovimientoService);

  readonly indicadores = signal<Indicadores | null>(null);
  readonly stockBajo = signal<Producto[]>([]);
  readonly ultimos = signal<Movimiento[]>([]);
  readonly cargando = signal(true);

  ngOnInit(): void {
    this.dashboardService.indicadores().subscribe({
      next: (d) => this.indicadores.set(d),
    });
    this.productoService.stockBajo().subscribe({
      next: (p) => this.stockBajo.set(p),
    });
    this.movimientoService.historial({}).subscribe({
      next: (m) => {
        this.ultimos.set(m.slice(0, 8));
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  moneda(v: number): string {
    return `S/ ${v.toFixed(2)}`;
  }
}
