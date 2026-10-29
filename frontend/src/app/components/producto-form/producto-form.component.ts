import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormField, form, maxLength, max, min, minLength, required } from '@angular/forms/signals';
import { Categoria } from '../../interfaces';
import { Producto } from '../../interfaces';
import { ProductoCreate } from '../../interfaces';
import { ProductoService } from '../../services/producto.service';
import { CategoriaService } from '../../services/categoria.service';

interface ProductoFormModel {
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria_id: string;
  precio_compra: number;
  precio_venta: number;
  stock_minimo: number;
}

@Component({
  selector: 'app-producto-form',
  templateUrl: './producto-form.component.html',
  styleUrl: './producto-form.component.css',
  imports: [FormField, RouterLink],
})
export class ProductoFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);

  readonly categorias = signal<Categoria[]>([]);
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly esEdicion = signal(false);
  readonly productoId = signal<number | null>(null);
  readonly stockActual = signal<number | null>(null);

  readonly model = signal<ProductoFormModel>({
    codigo: '',
    nombre: '',
    descripcion: '',
    categoria_id: '',
    precio_compra: 0,
    precio_venta: 0,
    stock_minimo: 0,
  });

  readonly productoForm = form(this.model, (schema) => {
    required(schema.codigo, { message: 'Código obligatorio' });
    maxLength(schema.codigo, 30, { message: 'Máximo 30 caracteres' });
    required(schema.nombre, { message: 'Nombre obligatorio' });
    maxLength(schema.nombre, 150, { message: 'Máximo 150 caracteres' });
    maxLength(schema.descripcion, 500, { message: 'Máximo 500 caracteres' });
    required(schema.categoria_id, { message: 'Categoría obligatoria' });
    min(schema.precio_compra, 0.01, { message: 'Debe ser mayor a 0' });
    min(schema.precio_venta, 0.01, { message: 'Debe ser mayor a 0' });
    min(schema.stock_minimo, 0, { message: 'No puede ser negativo' });
  });

  ngOnInit(): void {
    this.categoriaService.listar().subscribe({ next: (c) => this.categorias.set(c) });
    const modo = this.route.snapshot.data['modo'];
    const id = this.route.snapshot.paramMap.get('id');
    if (modo === 'editar' && id) {
      this.esEdicion.set(true);
      this.productoId.set(Number(id));
      this.cargando.set(true);
      this.productoService.obtener(Number(id)).subscribe({
        next: (p: Producto) => {
          this.stockActual.set(p.stock_actual);
          this.model.set({
            codigo: p.codigo,
            nombre: p.nombre,
            descripcion: p.descripcion ?? '',
            categoria_id: String(p.categoria_id),
            precio_compra: p.precio_compra,
            precio_venta: p.precio_venta,
            stock_minimo: p.stock_minimo,
          });
          this.cargando.set(false);
        },
        error: () => this.cargando.set(false),
      });
    }
  }

  onSubmit(): void {
    if (this.productoForm().invalid()) {
      this.productoForm.codigo().markAsTouched();
      this.productoForm.nombre().markAsTouched();
      this.productoForm.categoria_id().markAsTouched();
      this.productoForm.precio_compra().markAsTouched();
      this.productoForm.precio_venta().markAsTouched();
      this.productoForm.stock_minimo().markAsTouched();
      return;
    }
    this.guardando.set(true);
    const data: ProductoCreate = {
      codigo: this.model().codigo.trim(),
      nombre: this.model().nombre.trim(),
      descripcion: this.model().descripcion.trim() || null,
      categoria_id: Number(this.model().categoria_id),
      precio_compra: this.model().precio_compra,
      precio_venta: this.model().precio_venta,
      stock_minimo: this.model().stock_minimo,
    };
    const id = this.productoId();
    const req = id ? this.productoService.actualizar(id, data) : this.productoService.crear(data);
    req.subscribe({
      next: () => {
        this.guardando.set(false);
        this.router.navigate(['/productos']);
      },
      error: () => this.guardando.set(false),
    });
  }
}
