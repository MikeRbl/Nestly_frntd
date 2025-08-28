import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { RoleRequestService } from '../../../services/roleRequest.service';
import { ReporteService } from '../../../services/reporte.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar-admin',
  templateUrl: './sidebar-admin.component.html',
  styleUrls: ['./sidebar-admin.component.css']
})
export class SidebarAdminComponent implements OnInit {
  public pendingCount$!: Observable<number>;
  public pendingReportsCount$!: Observable<number>;

  constructor(
    private roleRequestService: RoleRequestService,
    private reporteService: ReporteService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Asigna el observable de solicitudes
    this.pendingCount$ = this.roleRequestService.pendingCount$;
    // Llama al método correcto para cargar el contador
    this.roleRequestService.cargarContadorPendientes();

    // Haz lo mismo para los reportes
    this.pendingReportsCount$ = this.reporteService.pendingReportsCount$;
    // Asegúrate de que este método exista en tu ReporteService
    this.reporteService.cargarContadorReportesPendientes();
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }
}