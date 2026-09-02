import { Component, OnInit } from '@angular/core';
import { NotyfService } from '../../../services/notyf.service';
import { RoleRequestService } from '../../../services/roleRequest.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestion-solicitudes',
  templateUrl: './gestion-solicitudes.component.html',
  styleUrls: ['./gestion-solicitudes.component.css']
})
export class GestionSolicitudesComponent implements OnInit {

  solicitudes: any[] = [];
  isLoading = true;

  // Paginación
  pageIndex = 0;
  pageSize = 10;
  totalItems = 0;

  constructor(
    private roleRequestService: RoleRequestService,
    private notyf: NotyfService
  ) { }

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  cargarSolicitudes(): void {
    this.isLoading = true;
    this.roleRequestService.obtenerSolicitudes().subscribe({
      next: (data) => {
        this.solicitudes = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.notyf.error('No se pudieron cargar las solicitudes.');
        console.error(err);
      }
    });
  }

  onPageChange(newPageIndex: number): void {
    this.pageIndex = newPageIndex;
    this.cargarSolicitudes();
  }

  procesarSolicitud(id: number, nuevoStatus: 'aprobado' | 'rechazado'): void {
    Swal.fire({
      title: `¿Quieres ${nuevoStatus} esta solicitud?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Deshabilitar botones temporalmente
        const solicitud = this.solicitudes.find(s => s.id === id);
        if (solicitud) solicitud.procesando = true;

        this.roleRequestService.actualizarSolicitud(id, nuevoStatus).subscribe({
          next: (solicitudActualizada) => {
            const index = this.solicitudes.findIndex(s => s.id === id);
            if (index !== -1) {
              this.solicitudes[index] = solicitudActualizada;
            }
            this.notyf.success(`Solicitud ${nuevoStatus} con éxito.`);
          },
          error: (err) => {
            if (solicitud) solicitud.procesando = false;
            this.notyf.error('Error al procesar la solicitud.');
            console.error(err);
          }
        });
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'aprobado': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rechazado': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200';
    }
  }
}
