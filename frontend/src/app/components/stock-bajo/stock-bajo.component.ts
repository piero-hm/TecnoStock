import { Component, inject, OnInit, signal } from '@angular/core';
import { Producto } from '../../interfaces';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-stock-bajo',
  templateUrl: './stock-bajo.component.html',
  styleUrl: './stock-bajo.component.css',
})
export class StockBajoComponent implements OnInit {
  private productoService = inject(ProductoService);
  readonly productos = signal<Producto[]>([]);
  readonly cargando = signal(false);

  ngOnInit(): void {
    this.cargando.set(true);
    this.productoService.stockBajo().subscribe({
      next: (data) => {
        this.productos.set(data);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }
}
