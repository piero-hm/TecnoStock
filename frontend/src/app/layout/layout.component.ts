import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';
import { NavigationEnd } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ConfirmacionModalComponent } from '../components/confirmacion-modal/confirmacion-modal.component';
import { NotificacionService } from '../services/notificacion.service';
import { ProductoService } from '../services/producto.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, DatePipe, ConfirmacionModalComponent],})
export class LayoutComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  readonly notificaciones = inject(NotificacionService);
  private productoService = inject(ProductoService);

  readonly usuario = this.auth.usuario;
  readonly menuAbierto = signal(false);
  readonly stockBajoCount = signal(0);
  readonly fechaActual = new Date();

  private readonly urlActual = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly tituloPagina = computed(() => {
    const url = (this.urlActual() ?? '').split('?')[0];
    const mapa: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/productos': 'Productos',
      '/productos/nuevo': 'Nuevo producto',
      '/categorias': 'Categorías',
      '/movimientos/entrada': 'Registrar entrada',
      '/movimientos/salida': 'Registrar salida',
      '/movimientos': 'Historial de movimientos',
      '/stock-bajo': 'Productos con stock bajo',
    };
    if (mapa[url]) return mapa[url];
    if (url.startsWith('/productos/') && url.endsWith('/editar')) return 'Editar producto';
    return 'TecnoStock';
  });

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
