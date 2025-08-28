import { Component, OnInit } from '@angular/core';
import { NotyfService } from '../../../services/notyf.service';
import { RoleRequestService } from '../../../services/roleRequest.service';
import Swal from 'sweetalert2';
import { RoleRequest } from '../../../interface/role-request.interface';

@Component({
  selector: 'app-gestion-solicitudes',
  templateUrl: './gestion-solicitudes.component.html',
  styleUrls: ['./gestion-solicitudes.component.css']
})
export class GestionSolicitudesComponent implements OnInit {

  solicitudes: RoleRequest[] = []; 
  isLoading = true;
  isProcessingId: number | null = null;

  // Paginación
  pageIndex = 0;
  pageSize = 10;
  totalItems = 0;
  
  // Para usar Math.min en el HTML
  math = Math;

  constructor(
    private roleRequestService: RoleRequestService,
    private notyf: NotyfService
  ) { }

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  cargarSolicitudes(): void {
    this.isLoading = true;
    this.roleRequestService.obtenerSolicitudes(this.pageIndex, this.pageSize).subscribe({
      next: (response) => {
        // Asegúrate de que tu backend devuelve un objeto con 'data' y 'total'
        this.solicitudes = response.data || [];
        this.totalItems = response.total || 0;
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
    const textoAccion = nuevoStatus === 'aprobado' ? 'aprobar' : 'rechazar';

    Swal.fire({
      title: `¿Confirmas ${textoAccion} esta solicitud?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isProcessingId = id;
        this.roleRequestService.actualizarSolicitud(id, { status: nuevoStatus }).subscribe({
          next: () => {
            this.notyf.success(`Solicitud ${nuevoStatus} con éxito.`);
            this.cargarSolicitudes(); 
          },
          error: (err) => {
            this.notyf.error('Error al procesar la solicitud.');
            console.error(err);
          },
          complete: () => {
            this.isProcessingId = null;
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