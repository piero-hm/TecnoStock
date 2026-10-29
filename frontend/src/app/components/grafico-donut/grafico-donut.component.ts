import { Component, computed, input } from '@angular/core';

export interface PorcionDonut {
  nombre: string;
  valor: number;
}

@Component({
  selector: 'app-grafico-donut',
  templateUrl: './grafico-donut.component.html',
  styleUrl: './grafico-donut.component.css',
})
export class GraficoDonutComponent {
  readonly datos = input<PorcionDonut[]>([]);
  readonly ariaLabel = input<string>('Gráfico donut de valor de inventario por categoría');

  readonly radio = 70;
  readonly circunferencia = 2 * Math.PI * this.radio;

  readonly total = computed(() => this.datos().reduce((a, b) => a + b.valor, 0));

  readonly porciones = computed(() => {
    const total = this.total();
    let acumulado = 0;
    return this.datos().map((d, i) => {
      const frac = total > 0 ? d.valor / total : 0;
      const dash = frac * this.circunferencia;
      const offset = acumulado * this.circunferencia;
      acumulado += frac;
      return { ...d, frac, dash, offset, color: this.colorDe(i) };
    });
  });

  readonly vacio = computed(() => this.datos().length === 0 || this.total() === 0);

  private colorDe(i: number): string {
    const paleta = ['#b6f24a', '#34d399', '#38bdf8', '#a78bfa', '#f472b6'];
    return paleta[i % paleta.length];
  }

  formatearMoneda(v: number): string {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(v);
  }

  formatearPorcentaje(v: number): string {
    return (v * 100).toFixed(1) + ' %';
  }
}
