import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { NotyfService } from '../../../services/notyf.service';
import Swal from 'sweetalert2';
import { Reporte } from '../../../interface/reporte,interface';

@Component({
  selector: 'app-ver-reportes',
  templateUrl: './ver-reportes.component.html',
  styleUrls: ['./ver-reportes.component.css']
})
export class VerReportesComponent implements OnInit {
  reportes: Reporte[] = [];
  isLoading = false;
  reporteSeleccionado: Reporte | null = null;


  // Paginación
  pageIndex = 0;
  pageSize = 10;
  totalItems = 0;

  // Filtros
  activeTab: 'todos' | 'usuarios' | 'propiedades' | 'resenas' = 'todos';
  filtros = {
    estado: '',
    motivo: '',
    search: ''
  };

  constructor(private adminService: AdminService,private notyfService: NotyfService) {}

  ngOnInit(): void {
    this.cargarReportes();
  }

  cargarReportes(): void {
    this.isLoading = true;

    const params = {
      page: this.pageIndex + 1,
      per_page: this.pageSize,
      estado: this.filtros.estado || null,
      motivo: this.filtros.motivo || null,
      search: this.filtros.search || null,
      reportable_type: this.getReportableTypeFromTab()
    };

    this.adminService.getReportes(params).subscribe({
      next: (res) => {
        this.reportes = res.data;
        this.totalItems = res.total;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar reportes:', err);
        this.notyfService.error('No se pudieron cargar los reportes.');
        this.isLoading = false;
      }
    });
  }

  // --- MÉTODOS DE FILTRADO Y PAGINACIÓN ---

  onPageChange(newPageIndex: number): void {
    this.pageIndex = newPageIndex;
    this.cargarReportes();
  }

  applyFilters(): void {
    this.pageIndex = 0;
    this.cargarReportes();
  }

  selectTab(tab: 'todos' | 'usuarios' | 'propiedades' | 'resenas'): void {
    this.activeTab = tab;
    this.applyFilters();
  }

  private getReportableTypeFromTab(): string | null {
    switch (this.activeTab) {
      case 'usuarios': return 'User';
      case 'propiedades': return 'Propiedad';
      case 'resenas': return 'Resena';
      default: return null;
    }
  }

  verDetalles(reporte: Reporte): void {
    this.reporteSeleccionado = reporte;
  }
  cerrarModal(): void {
    this.reporteSeleccionado = null;
  }
  // --- MÉTODOS DE ACCIONES DEL ADMIN ---

  cambiarEstadoReporte(reporteId: number, nuevoEstado: 'resuelto' | 'descartado'): void {
    Swal.fire({
      title: `¿Marcar como "${nuevoEstado}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.actualizarEstadoReporte(reporteId, nuevoEstado).subscribe({
          next: () => {
            this.notyfService.success('Estado del reporte actualizado.');
            this.cargarReportes();
          },
          error: () => this.notyfService.error('No se pudo actualizar el estado.')
        });
      }
    });
  }

  suspenderUsuario(reporteId: number): void {
  Swal.fire({
    title: 'Suspender al usuario reportado',
    html: `
      <p class="text-sm text-gray-600 mb-4">Selecciona la duración de la suspensión.</p>
      <input id="suspension-dias" type="number" min="1" value="7" class="swal2-input" placeholder="Días de suspensión">
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, suspender',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
      const dias = (document.getElementById('suspension-dias') as HTMLInputElement).value;
      if (!dias || parseInt(dias) <= 0) {
        Swal.showValidationMessage('Por favor, ingresa un número de días válido.');
        return false;
      }
      return parseInt(dias);
    }
  }).then((result) => {
    if (result.isConfirmed) {
      const diasDeSuspension = result.value;
      this.adminService.suspenderUsuarioReportado(reporteId, diasDeSuspension).subscribe({
        next: () => {
          this.notyfService.success(`Usuario suspendido por ${diasDeSuspension} días.`);
          this.cargarReportes();
          this.cerrarModal();
        },
        error: () => this.notyfService.error('No se pudo suspender al usuario.')
      });
    }
  });
}

  eliminarPropiedad(reporteId: number): void {
    Swal.fire({
      title: '¿Eliminar la propiedad reportada?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.eliminarPropiedadReportada(reporteId).subscribe({
          next: () => {
            this.notyfService.success('Propiedad eliminada correctamente.');
            this.cargarReportes();
          },
          error: () => this.notyfService.error('No se pudo eliminar la propiedad.')
        });
      }
    });
  }

  eliminarResena(reporteId: number): void {
    Swal.fire({
      title: '¿Eliminar la reseña reportada?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.eliminarResenaReportada(reporteId).subscribe({
          next: () => {
            this.notyfService.success('Reseña eliminada correctamente.');
            this.cargarReportes();
          },
          error: () => this.notyfService.error('No se pudo eliminar la reseña.')
        });
      }
    });
  }

  getReportableTypeText(type: string): string {
    const cleanType = type.split('\\').pop();
    switch (cleanType) {
      case 'User': return 'Usuario';
      case 'Propiedad': return 'Propiedad';
      case 'Resena': return 'Reseña';
      default: return 'Desconocido';
    }
  }
}
