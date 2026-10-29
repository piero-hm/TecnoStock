import { Component, inject, OnInit, signal } from '@angular/core';
import { FormField, form, required } from '@angular/forms/signals';
import { Categoria, CategoriaCreate } from '../../interfaces';
import { CategoriaService } from '../../services/categoria.service';

interface CategoriaFormModel {
  nombre: string;
  descripcion: string;
}

@Component({
  selector: 'app-categoria-list',
  templateUrl: './categoria-list.component.html',
  styleUrl: './categoria-list.component.css',
  imports: [FormField],
})
export class CategoriaListComponent implements OnInit {
  private service = inject(CategoriaService);

  readonly categorias = signal<Categoria[]>([]);
  readonly cargando = signal(false);

  readonly model = signal<CategoriaFormModel>({ nombre: '', descripcion: '' });
  readonly categoriaForm = form(this.model, (schema) => {
    required(schema.nombre, { message: 'Nombre obligatorio' });
  });

  readonly guardando = signal(false);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.service.listar().subscribe({
      next: (data) => {
        this.categorias.set(data);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  onSubmit(): void {
    if (this.categoriaForm().invalid()) {
      this.categoriaForm.nombre().markAsTouched();
      return;
    }
    this.guardando.set(true);
    const data: CategoriaCreate = {
      nombre: this.model().nombre,
      descripcion: this.model().descripcion || null,
    };
    this.service.crear(data).subscribe({
      next: () => {
        this.guardando.set(false);
        this.model.set({ nombre: '', descripcion: '' });
        this.cargar();
      },
      error: () => this.guardando.set(false),
    });
  }
}
