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
    // Asigna el observable de solicitudes y pide una actualización
    this.pendingCount$ = this.roleRequestService.pendingCount$;
    this.roleRequestService.fetchPendingCount();

    // Asigna el observable de reportes y pide una actualización
    this.pendingReportsCount$ = this.reporteService.pendingReportsCount$;
    this.reporteService.fetchPendingReportsCount();
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }
}