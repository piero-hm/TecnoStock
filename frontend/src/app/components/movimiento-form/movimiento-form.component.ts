import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormField, form, maxLength, min, required } from '@angular/forms/signals';
import { NotificacionService } from '../../services/notificacion.service';
import { ProductoService } from '../../services/producto.service';
import { MovimientoService } from '../../services/movimiento.service';
import { Producto } from '../../interfaces';
import { MovimientoCreate } from '../../interfaces';

interface MovimientoFormModel {
  producto_id: string;
  cantidad: number;
  fecha: string;
  motivo: string;
}

@Component({
  selector: 'app-movimiento-form',
  templateUrl: './movimiento-form.component.html',
  styleUrl: './movimiento-form.component.css',
  imports: [FormField],
})
export class MovimientoFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productoService = inject(ProductoService);
  private movimientoService = inject(MovimientoService);
  private noti = inject(NotificacionService);

  readonly tipo = signal<'ENTRADA' | 'SALIDA'>('ENTRADA');
  readonly productos = signal<Producto[]>([]);
  readonly cargando = signal(false);
  readonly guardando = signal(false);

  readonly model = signal<MovimientoFormModel>({
    producto_id: '',
    cantidad: 1,
    fecha: new Date().toISOString().slice(0, 16),
    motivo: '',
  });

  readonly movimientoForm = form(this.model, (schema) => {
    required(schema.producto_id, { message: 'Producto obligatorio' });
    min(schema.cantidad, 1, { message: 'Cantidad mínima 1' });
    required(schema.fecha, { message: 'Fecha obligatoria' });
    required(schema.motivo, { message: 'Motivo obligatorio' });
    maxLength(schema.motivo, 255, { message: 'Máximo 255 caracteres' });
  });

  readonly productoSeleccionado = computed(() => {
    const id = Number(this.model().producto_id);
    return this.productos().find((p) => p.id === id) ?? null;
  });

  ngOnInit(): void {
    const t = this.route.snapshot.data['tipo'];
    this.tipo.set(t === 'SALIDA' ? 'SALIDA' : 'ENTRADA');
    this.cargando.set(true);
    this.productoService.listar().subscribe({
      next: (data) => {
        this.productos.set(data.filter((p) => p.activo));
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  onSubmit(): void {
    if (this.movimientoForm().invalid()) {
      this.movimientoForm.producto_id().markAsTouched();
      this.movimientoForm.cantidad().markAsTouched();
      this.movimientoForm.fecha().markAsTouched();
      this.movimientoForm.motivo().markAsTouched();
      return;
    }
    const sel = this.productoSeleccionado();
    if (this.tipo() === 'SALIDA' && sel && this.model().cantidad > sel.stock_actual) {
      this.noti.mostrar(`Cantidad supera el stock disponible (${sel.stock_actual}).`, 'warning');
      return;
    }
    this.guardando.set(true);
    const fecha = this.model().fecha.length === 16 ? `${this.model().fecha}:00` : this.model().fecha;
    const data: MovimientoCreate = {
      producto_id: Number(this.model().producto_id),
      cantidad: this.model().cantidad,
      fecha,
      motivo: this.model().motivo.trim(),
    };
    const req = this.tipo() === 'ENTRADA'
      ? this.movimientoService.registrarEntrada(data)
      : this.movimientoService.registrarSalida(data);
    req.subscribe({
      next: () => {
        this.guardando.set(false);
        this.noti.mostrar('Movimiento registrado.', 'success');
        this.model.set({
          producto_id: '',
          cantidad: 1,
          fecha: new Date().toISOString().slice(0, 16),
          motivo: '',
        });
      },
      error: () => this.guardando.set(false),
    });
  }
}
