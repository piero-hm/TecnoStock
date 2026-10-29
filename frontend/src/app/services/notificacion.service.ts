import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  tipo: 'success' | 'danger' | 'warning' | 'info';
  mensaje: string;
}

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private contador = 0;
  readonly toasts = signal<Toast[]>([]);

  mostrar(mensaje: string, tipo: Toast['tipo'] = 'info'): void {
    const id = ++this.contador;
    this.toasts.update((lista) => [...lista, { id, tipo, mensaje }]);
    setTimeout(() => this.cerrar(id), 4000);
  }

  cerrar(id: number): void {
    this.toasts.update((lista) => lista.filter((t) => t.id !== id));
  }
}
