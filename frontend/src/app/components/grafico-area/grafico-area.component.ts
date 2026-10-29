import { Component, computed, input, signal } from '@angular/core';

export interface PuntoArea {
  fecha: string;
  entradas: number;
  salidas: number;
}

@Component({
  selector: 'app-grafico-area',
  templateUrl: './grafico-area.component.html',
  styleUrl: './grafico-area.component.css',
})
export class GraficoAreaComponent {
  readonly datos = input<PuntoArea[]>([]);
  readonly ariaLabel = input<string>('Gráfico de área de entradas y salidas por día');

  readonly ancho = 640;
  readonly alto = 260;
  readonly paddingX = 40;
  readonly paddingY = 24;

  readonly maximo = computed(() => {
    const vals = this.datos().flatMap((d) => [d.entradas, d.salidas]);
    const max = Math.max(0, ...vals);
    if (max === 0) return 1;
    return Math.ceil(max * 1.15);
  });

  readonly puntosEntradas = computed(() => this.calcularPuntos('entradas'));
  readonly puntosSalidas = computed(() => this.calcularPuntos('salidas'));

  readonly pathEntradas = computed(() => this.pathLinea(this.puntosEntradas()));
  readonly pathSalidas = computed(() => this.pathLinea(this.puntosSalidas()));
  readonly areaEntradas = computed(() => this.pathArea(this.puntosEntradas()));
  readonly areaSalidas = computed(() => this.pathArea(this.puntosSalidas()));

  readonly lineasGuia = computed(() => {
    const pasos = 4;
    const max = this.maximo();
    return Array.from({ length: pasos + 1 }, (_, i) => {
      const y = this.paddingY + ((this.alto - 2 * this.paddingY) * i) / pasos;
      const valor = Math.round(max * (1 - i / pasos));
      return { y, valor };
    });
  });

  readonly etiquetasX = computed(() => {
    const data = this.datos();
    if (!data.length) return [];
    const paso = data.length <= 8 ? 1 : data.length <= 31 ? 5 : 15;
    const res: { x: number; texto: string }[] = [];
    for (let i = 0; i < data.length; i += paso) {
      res.push({ x: this.xDe(i), texto: this.formatearFechaCorta(data[i].fecha) });
    }
    if (res[res.length - 1]?.x !== this.xDe(data.length - 1)) {
      res.push({ x: this.xDe(data.length - 1), texto: this.formatearFechaCorta(data[data.length - 1].fecha) });
    }
    return res;
  });

  readonly hoverIndex = signal<number | null>(null);

  readonly totalCero = computed(() => this.datos().every((d) => d.entradas === 0 && d.salidas === 0));

  yDeEntradas(i: number): number {
    const d = this.datos()[i];
    return this.yDe(d?.entradas ?? 0);
  }
  yDeSalidas(i: number): number {
    const d = this.datos()[i];
    return this.yDe(d?.salidas ?? 0);
  }

  readonly tooltipTop = computed(() => {
    const h = this.puntoHover();
    if (!h) return 0;
    return Math.min(h.yEntradas, h.ySalidas);
  });

  readonly puntoHover = computed(() => {
    const i = this.hoverIndex();
    if (i === null) return null;
    const d = this.datos()[i];
    if (!d) return null;
    return {
      x: this.xDe(i),
      yEntradas: this.yDe(d.entradas),
      ySalidas: this.yDe(d.salidas),
      fecha: d.fecha,
      entradas: d.entradas,
      salidas: d.salidas,
    };
  });

  private calcularPuntos(campo: 'entradas' | 'salidas'): { x: number; y: number }[] {
    const data = this.datos();
    if (!data.length) return [];
    return data.map((d, i) => ({ x: this.xDe(i), y: this.yDe(d[campo]) }));
  }

  xDe(i: number): number {
    const data = this.datos();
    if (data.length <= 1) return this.paddingX;
    const usable = this.ancho - 2 * this.paddingX;
    return this.paddingX + (usable * i) / (data.length - 1);
  }

  yDe(valor: number): number {
    const max = this.maximo();
    const usable = this.alto - 2 * this.paddingY;
    return this.paddingY + usable * (1 - valor / max);
  }

  private pathLinea(puntos: { x: number; y: number }[]): string {
    if (!puntos.length) return '';
    return puntos.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  }

  private pathArea(puntos: { x: number; y: number }[]): string {
    if (!puntos.length) return '';
    const base = this.alto - this.paddingY;
    const linea = puntos.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    return `${linea} L ${puntos[puntos.length - 1].x} ${base} L ${puntos[0].x} ${base} Z`;
  }

  private formatearFechaCorta(iso: string): string {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
  }

  formatearFecha(iso: string): string {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('es-PE', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  }

  onMove(event: MouseEvent, index: number): void {
    this.hoverIndex.set(index);
  }
  onLeave(): void {
    this.hoverIndex.set(null);
  }
}
