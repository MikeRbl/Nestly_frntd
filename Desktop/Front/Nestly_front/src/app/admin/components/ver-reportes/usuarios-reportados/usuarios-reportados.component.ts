import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../../services/admin.service';
import { NotyfService } from '../../../../services/notyf.service';
import { Reporte } from '../../../../interface/reporte,interface';

@Component({
  selector: 'app-usuarios-reportados',
  templateUrl: './usuarios-reportados.component.html',
  styleUrls: ['./usuarios-reportados.component.css']
})
export class UsuariosReportadosComponent implements OnInit {
  totalItems: number = 0;
  pageSize: number = 10;
  pageIndex: number = 0;

  isLoading = true;
  reportes: Reporte[] = [];
  filtros = { search: '', estado: '', motivo: '' };

  constructor(
    private adminService: AdminService,
    private notyfService: NotyfService
  ) {}

  ngOnInit(): void {
    this.loadReportes();
  }

  onPageChange(newPageIndex: number) {
    this.pageIndex = newPageIndex;
    this.loadReportes();
  }

  onFilterChange(nuevosFiltros: any): void {
    this.filtros = nuevosFiltros;
    this.applyFilters();
  }

  applyFilters(): void {
    this.pageIndex = 0;
    this.loadReportes();
  }

  loadReportes(): void {
    this.isLoading = true;

    const params = {
      page: this.pageIndex + 1, // backend usa base 1
      per_page: this.pageSize,
      search: this.filtros.search,
      estado: this.filtros.estado,
      motivo: this.filtros.motivo,
    };

    this.adminService.getReportes(params).subscribe({
      next: (res) => {
        this.reportes = res.data;
        this.totalItems = res.total;
        this.isLoading = false;
      },
      error: () => {
        this.notyfService.error('Error cargando reportes');
        this.isLoading = false;
      }
    });
  }

  descartarReporte(reporte: Reporte): void {
    this.adminService.actualizarEstadoReporte(reporte.id, 'descartado').subscribe({
      next: () => {
        this.notyfService.success('Reporte descartado');
        this.loadReportes();
      },
      error: () => this.notyfService.error('No se pudo descartar el reporte')
    });
  }

  suspenderUsuario(reporte: Reporte): void {
    this.adminService.suspenderUsuarioReportado(reporte.id).subscribe({
      next: () => {
        this.notyfService.success('Usuario suspendido y reporte resuelto');
        this.loadReportes();
      },
      error: () => this.notyfService.error('No se pudo suspender al usuario')
    });
  }
}
