import { Component } from '@angular/core';
import { NotyfService } from '../../services/notyf.service';
import { RoleRequestService } from '../../services/roleRequest.service';

@Component({
  selector: 'app-solicitar-rol',
  template: `
    <button (click)="solicitar()" [disabled]="loading">Solicitar ser Propietario</button>
  `
})
export class SolicitarRolComponent {
  loading = false;

  constructor(
    private roleService: RoleRequestService,
    private notyf: NotyfService
  ) {}

  solicitar() {
    this.loading = true;
    this.roleService.enviarSolicitud().subscribe({
      next: (res) => {
        this.notyf.success('Solicitud enviada correctamente');
        this.loading = false;
      },
      error: (err) => {
        this.notyf.error(err.error.message || 'Error al enviar la solicitud');
        this.loading = false;
      }
    });
  }
}
