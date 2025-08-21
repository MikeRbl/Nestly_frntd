import { Component, OnInit } from '@angular/core';
import { HttpLavavelService } from '../../../http.service'; // Asegúrate que la ruta sea correcta
import { NotyfService } from '../../../services/notyf.service'; // Asegúrate que la ruta sea correcta

@Component({
  selector: 'app-dashboard-admin',
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.css']
})
export class DashboardAdminComponent implements OnInit {

  isLoading = true;
  
  // Objeto de estadísticas
  stats = {
    total_users: 0,
    active_properties: 0,
    current_rents: 0,
    monthly_income: 0,
    monthly_earnings: 0,
    pending_role_requests: 0, 
    unresolved_reports: 0,   
    top_properties: [] as any[] 
  };
  
  recentActivities: any[] = [];

  constructor(
    private httpService: HttpLavavelService,
    private notyfService: NotyfService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  /**
   * Carga todos los datos necesarios para el dashboard desde el backend.
   */
  loadDashboardData(): void {
    this.isLoading = true;
    this.httpService.Service_Get('admin/stats').subscribe({
      next: (response: any) => {
        // Asignamos los datos a las propiedades del componente
        this.stats = response.stats;
        this.recentActivities = response.recent_activities;
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('La API devolvió un ERROR:', err);
        this.notyfService.error('No se pudieron cargar los datos del dashboard.');
        this.isLoading = false;
      }
    });
  }
}
