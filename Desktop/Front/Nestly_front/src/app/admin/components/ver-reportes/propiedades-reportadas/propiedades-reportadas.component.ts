import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../../services/admin.service';
import { NotyfService } from '../../../../services/notyf.service';

@Component({
  selector: 'app-propiedades-reportadas',
  templateUrl: './propiedades-reportadas.component.html',
  styleUrls: ['./propiedades-reportadas.component.css'],
})
export class PropiedadesReportadasComponent implements OnInit {
  propiedadesReportadas: any[] = [];
  isLoading: boolean = true;

  // Paginación
  pageIndex: number = 0;
  pageSize: number = 5;
  totalItems: number = 0;

  // Filtros
  filtros: any = {
    estado: 'pendiente',
    motivo: '',
    search: '',
  };

  constructor(
    private adminService: AdminService,
    private notyf: NotyfService
  ) {}

  ngOnInit(): void {
    this.obtenerPropiedadesReportadas();
  }

  obtenerPropiedadesReportadas(): void {
    this.isLoading = true;

    const params = {
      page: this.pageIndex + 1, // Laravel pages empiezan en 1
      per_page: this.pageSize,
      estado: this.filtros.estado,
      motivo: this.filtros.motivo,
      search: this.filtros.search,
    };

    this.adminService.getReportes(params).subscribe({
      next: (res) => {
        this.propiedadesReportadas = res.data;
        this.totalItems = res.total;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.notyf.error('Error cargando propiedades reportadas');
        console.error(err);
      },
    });
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.obtenerPropiedadesReportadas();
  }

  onFilterChange(filtros: any): void {
    this.filtros = filtros;
    this.pageIndex = 0;
    this.obtenerPropiedadesReportadas();
  }

  descartarReporte(propiedad: any): void {
    this.adminService.actualizarEstadoReporte(propiedad.id, 'descartado').subscribe({
      next: () => {
        this.notyf.success('Reporte descartado');
        this.obtenerPropiedadesReportadas();
      },
      error: () => {
        this.notyf.error('Error descartando reporte');
      },
    });
  }

  eliminarPropiedad(propiedad: any): void {
    this.adminService.eliminarPropiedadReportada(propiedad.id).subscribe({
      next: () => {
        this.notyf.success('Propiedad eliminada correctamente');
        this.obtenerPropiedadesReportadas();
      },
      error: () => {
        this.notyf.error('Error eliminando propiedad');
      },
    });
  }
}
