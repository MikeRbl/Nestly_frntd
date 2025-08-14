import { Component, OnInit } from '@angular/core';
import { Reporte } from '../../../interface/reporte,interface';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-ver-reportes',
  templateUrl: './ver-reportes.component.html',
  styleUrl: './ver-reportes.component.css'
})
export class VerReportesComponent implements OnInit {
  reportes: Reporte[] = [];
  isLoading = false;

  // Paginación
  pageIndex = 0;
  pageSize = 10;
  totalItems = 0;

  // Filtros
  filtroEstado: string | null = null;
  filtroMotivo: string | null = null;
  filtroSearch: string | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.cargarReportes();
  }

  cargarReportes() {
    this.isLoading = true;

    const params = {
      page: this.pageIndex + 1, // API asume página 1-based
      per_page: this.pageSize,
      estado: this.filtroEstado || '',
      motivo: this.filtroMotivo || '',
      search: this.filtroSearch || ''
    };

    this.adminService.getReportes(params).subscribe({
      next: (res) => {
        this.reportes = res.data;
        this.totalItems = res.total;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar reportes:', err);
        this.isLoading = false;
      }
    });
  }

  // Cambiar página desde el paginador
  onPageChange(event: { pageIndex: number; pageSize: number }) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.cargarReportes();
  }

  // Cambiar filtros
  onFilterChange(filtros: { estado?: string; motivo?: string; search?: string }) {
    this.filtroEstado = filtros.estado ?? null;
    this.filtroMotivo = filtros.motivo ?? null;
    this.filtroSearch = filtros.search ?? null;
    this.pageIndex = 0; // reset pagina
    this.cargarReportes();
  }

  // Ejemplo: cambiar estado reporte (descartar, resolver)
  descartarReporte(reporteId: number) {
    this.adminService.actualizarEstadoReporte(reporteId, 'descartado').subscribe(() => {
      this.cargarReportes();
    });
  }

  // Suspender usuario reportado
  suspenderUsuario(reporteId: number) {
    this.adminService.suspenderUsuarioReportado(reporteId).subscribe(() => {
      this.cargarReportes();
    });
  }

  // Eliminar propiedad reportada
  eliminarPropiedad(reporteId: number) {
    this.adminService.eliminarPropiedadReportada(reporteId).subscribe(() => {
      this.cargarReportes();
    });
  }

  // Eliminar reseña reportada
  eliminarResena(reporteId: number) {
    this.adminService.eliminarResenaReportada(reporteId).subscribe(() => {
      this.cargarReportes();
    });
  }
}