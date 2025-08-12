import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../../services/admin.service';
import { NotyfService } from '../../../../services/notyf.service';

@Component({
  selector: 'app-resenas-reportadas',
  templateUrl: './resenas-reportadas.component.html',
  styleUrls: ['./resenas-reportadas.component.css']
})
export class ResenasReportadasComponent implements OnInit {
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;

  isLoading = false;
  reportes: any[] = [];
  filtros = { search: '', estado: '', motivo: '' };

  constructor(
    private adminService: AdminService,
    private notyfService: NotyfService
  ) {}

  ngOnInit(): void {
    this.loadReportes();
  }

  onPageChange(newPageIndex: number): void {
  this.pageIndex = newPageIndex;
  this.loadReportes();
}


  onFilterChange(nuevosFiltros: any): void {
    this.filtros = nuevosFiltros;
    this.pageIndex = 0; // reset paginación al cambiar filtros
    this.loadReportes();
  }

  loadReportes(): void {
    this.isLoading = true;

    const params = {
      page: this.pageIndex + 1, // Laravel 1-based pages
      per_page: this.pageSize,
      estado: this.filtros.estado,
      motivo: this.filtros.motivo,
      search: this.filtros.search,
      reportable_type: 'App\\Models\\Resena' // Filtra solo reportes de reseñas
    };

    this.adminService.getReportes(params).subscribe({
      next: (res) => {
        this.reportes = res.data;
        this.totalItems = res.total;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.notyfService.error('Error cargando reportes');
        console.error(err);
      }
    });
  }

  descartarReporte(id: number): void {
    this.adminService.actualizarEstadoReporte(id, 'descartado').subscribe({
      next: () => {
        this.notyfService.success('Reporte descartado');
        this.loadReportes();
      },
      error: () => {
        this.notyfService.error('Error descartando reporte');
      }
    });
  }

  eliminarResena(id: number): void {
    this.adminService.eliminarResenaReportada(id).subscribe({
      next: () => {
        this.notyfService.success('Reseña eliminada correctamente');
        this.loadReportes();
      },
      error: () => {
        this.notyfService.error('Error eliminando reseña');
      }
    });
  }
}
