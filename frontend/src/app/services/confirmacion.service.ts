import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConfirmacionService {
  readonly visible = signal(false);
  readonly mensaje = signal('');
  private resolver: ((v: boolean) => void) | null = null;

  confirmar(mensaje: string): Promise<boolean> {
    this.mensaje.set(mensaje);
    this.visible.set(true);
    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
    });
  }

  aceptar(): void {
    this.visible.set(false);
    this.resolver?.(true);
    this.resolver = null;
  }

  cancelar(): void {
    this.visible.set(false);
    this.resolver?.(false);
    this.resolver = null;
  }
}
