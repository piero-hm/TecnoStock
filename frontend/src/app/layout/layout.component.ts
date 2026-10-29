import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificacionService } from '../services/notificacion.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
})
export class LayoutComponent {
  private auth = inject(AuthService);
  readonly notificaciones = inject(NotificacionService);
  readonly usuario = this.auth.usuario;
  readonly menuAbierto = signal(false);

  toggleMenu(): void {
    this.menuAbierto.update((v) => !v);
  }

  cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  logout(): void {
    this.auth.logout();
  }
}
