import { Component, OnInit } from '@angular/core';

import Swal from 'sweetalert2';
import { AuthService } from '../../../services/auth.service';
import { NotyfService } from '../../../services/notyf.service';
import { RoleRequestService } from '../../../services/roleRequest.service';

@Component({
  selector: 'app-ser-propietario',
  templateUrl: './ser-propietario.component.html',
  styleUrls: ['./ser-propietario.component.scss']
})
export class SerPropietarioComponent implements OnInit {

  estadoSolicitud: 'ninguna' | 'pendiente' | 'aprobado' = 'ninguna';
  isLoading = false;

  constructor(
    private roleRequestService: RoleRequestService,
    private authService: AuthService,
    private notyf: NotyfService 
  ) { }

  ngOnInit(): void {
    // Verificamos el estado real de la solicitud con el servidor
    this.roleRequestService.verificarEstadoSolicitud().subscribe(response => {
      this.estadoSolicitud = response.status as 'ninguna' | 'pendiente' | 'aprobado';
    });
  }

  enviarSolicitudDeRol(): void {
    Swal.fire({
      title: '¿Confirmar solicitud?',
      icon: 'question',
      html: `
        <p class="mb-4">Se enviará una solicitud para convertirte en propietario. Un administrador la revisará.</p>
        <div class="text-left p-4 bg-slate-100 dark:bg-gray-700 rounded-lg border dark:border-gray-600">
          <h3 class="font-bold text-lg mb-2 text-gray-800 dark:text-white">¿Qué significa ser propietario?</h3>
          <ul class="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300">
            <li>Podrás publicar y gestionar tus propiedades.</li>
            <li>Recibirás solicitudes de alquiler de otros usuarios.</li>
            <li>Gestionarás los pagos de forma segura a través de la plataforma.</li>
          </ul>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Sí, enviar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'dark:bg-gray-800 dark:text-gray-200',
        confirmButton: 'bg-blue-600',
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true; // Inicia la carga
        this.roleRequestService.enviarSolicitud().subscribe({
          next: () => {
            this.notyf.success('¡Solicitud enviada! Un administrador la revisará pronto.');
            this.estadoSolicitud = 'pendiente'; // Actualizamos el estado del botón
            this.isLoading = false; 
          },
          error: (err) => {
            this.notyf.error(err.error?.message || 'No se pudo enviar la solicitud.');
            this.isLoading = false;
          }
        });
      }
    });
  }
}
