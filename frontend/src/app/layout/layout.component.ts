import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificacionService } from '../services/notificacion.service';
import { ProductoService } from '../services/producto.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
})
export class LayoutComponent implements OnInit {
  private auth = inject(AuthService);
  readonly notificaciones = inject(NotificacionService);
  private productoService = inject(ProductoService);

  readonly usuario = this.auth.usuario;
  readonly menuAbierto = signal(false);
  readonly stockBajoCount = signal(0);

  ngOnInit(): void {
    this.productoService.stockBajo().subscribe({
      next: (data) => this.stockBajoCount.set(data.length),
    });
  }

  toggleMenu(): void {
    this.menuAbierto.update((v) => !v);
  }

  cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  logout(): void {
    this.auth.logout();
  }

  iniciales(): string {
    const u = this.usuario();
    if (!u) return '?';
    return u.nombre_completo
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join('');
  }
}
