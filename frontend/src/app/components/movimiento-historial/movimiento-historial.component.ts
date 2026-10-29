import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Producto } from '../../interfaces';
import { ProductoService } from '../../services/producto.service';
import { MovimientoService } from '../../services/movimiento.service';
import { Movimiento, FiltroMovimientos } from '../../interfaces';

@Component({
  selector: 'app-movimiento-historial',
  templateUrl: './movimiento-historial.component.html',
  imports: [DatePipe],
  styleUrl: './movimiento-historial.component.css',
})
export class MovimientoHistorialComponent implements OnInit {
  private productoService = inject(ProductoService);
  private movimientoService = inject(MovimientoService);

  readonly productos = signal<Producto[]>([]);
  readonly movimientos = signal<Movimiento[]>([]);
  readonly cargando = signal(false);

  readonly productoId = signal<number | null>(null);
  readonly fechaDesde = signal<string>('');
  readonly fechaHasta = signal<string>('');
  readonly tipo = signal<string>('');

  readonly filtroInvalido = computed(() => {
    return !!this.fechaDesde() && !!this.fechaHasta() && this.fechaDesde() > this.fechaHasta();
  });

  toNumber(v: string): number { return Number(v); }

  ngOnInit(): void {
    this.productoService.listar().subscribe({ next: (p) => this.productos.set(p) });
    this.buscar();
  }

  buscar(): void {
    if (this.filtroInvalido()) return;
    this.cargando.set(true);
    const filtros: FiltroMovimientos = {
      producto_id: this.productoId(),
      fecha_desde: this.fechaDesde() || null,
      fecha_hasta: this.fechaHasta() || null,
      tipo: (this.tipo() as 'ENTRADA' | 'SALIDA') || null,
    };
    this.movimientoService.historial(filtros).subscribe({
      next: (data) => {
        this.movimientos.set(data);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }
}
