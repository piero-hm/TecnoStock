import { Component, inject } from '@angular/core';
import { ConfirmacionService } from '../../services/confirmacion.service';

@Component({
  selector: 'app-confirmacion-modal',
  templateUrl: './confirmacion-modal.component.html',
  styleUrl: './confirmacion-modal.component.css',
})
export class ConfirmacionModalComponent {
  readonly confirmacion = inject(ConfirmacionService);
}
