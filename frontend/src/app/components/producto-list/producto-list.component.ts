import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Categoria, Producto } from '../../interfaces';
import { CategoriaService } from '../../services/categoria.service';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-producto-list',
  templateUrl: './producto-list.component.html',
  styleUrl: './producto-list.component.css',
  imports: [RouterLink],
})
export class ProductoListComponent implements OnInit {
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);

  readonly productos = signal<Producto[]>([]);
  readonly categorias = signal<Categoria[]>([]);
  readonly cargando = signal(false);

  readonly busqueda = signal('');
  readonly categoriaId = signal<number | null>(null);
  readonly incluirInactivos = signal(false);

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.categoriaService.listar().subscribe({ next: (c) => this.categorias.set(c) });
    this.cargar();
  }

  onBusqueda(valor: string): void {
    this.busqueda.set(valor);
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.cargar(), 300);
  }

  onCategoria(valor: string): void {
    this.categoriaId.set(valor ? Number(valor) : null);
    this.cargar();
  }

  onIncluir(valor: boolean): void {
    this.incluirInactivos.set(valor);
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.productoService.listar(this.busqueda() || null, this.categoriaId(), this.incluirInactivos()).subscribe({
      next: (data) => {
        this.productos.set(data);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  toggleActivo(p: Producto): void {
    const accion = p.activo ? this.productoService.desactivar(p.id) : this.productoService.activar(p.id);
    accion.subscribe({ next: () => this.cargar() });
  }
}
