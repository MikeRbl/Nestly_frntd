import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpLavavelService } from '../http.service';
import { User } from '../interface/usuario.interface';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpLavavelService) {}

  // Dashboard stats
  getDashboardStats(): Observable<any> {
    return this.http.Service_Get('admin/stats');
  }

  // Usuarios con filtros y paginación
  getUsers(params: any): Observable<{ data: User[], total: number }> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.role) queryParams.append('role', params.role);
    if (params.status) queryParams.append('status', params.status); 
    const url = `users?${queryParams.toString()}`;
    return this.http.Service_Get(url);
  }
  

  createUser(userData: Partial<User>): Observable<User> {
    return this.http.Service_Post('users', userData);
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.Service_Delete('users', userId);
  }

  cambiarEstadoUsuario(userId: number, nuevoEstado: string, duracionDias: number | null): Observable<any> {
  const payload = { 
    status: nuevoEstado,
    suspension_duration_days: duracionDias 
  };
  return this.http.Service_Put(`users/${userId}/status`, payload);
}


  actualizarRolUsuario(userId: number, role: string): Observable<any> {
    // Apunta a la NUEVA ruta específica para el rol
    return this.http.Service_Put(`users/${userId}/role`, { role });
  }


  // ======== Reportes con filtros y paginación ========

  getReportes(params: any): Observable<{ data: any[], total: number }> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.estado) queryParams.append('estado', params.estado);
    
    if (params.motivo) queryParams.append('motivo', params.motivo);
    if (params.reportable_type) queryParams.append('reportable_type', params.reportable_type); // filtro para tipo de reporte (User, Propiedad, Resena)
    const url = `reportes?${queryParams.toString()}`;
    return this.http.Service_Get(url);
  }

  actualizarEstadoReporte(reporteId: number, estado: 'pendiente' | 'descartado' | 'resuelto'): Observable<any> {
    return this.http.Service_Put(`reportes/${reporteId}/estado`, { estado });
  }

  suspenderUsuarioReportado(reporteId: number, duracionDias: number): Observable<any> {
  const payload = { suspension_duration_days: duracionDias };
  return this.http.Service_Patch(`reportes/${reporteId}/suspender-usuario`, payload);
}

  eliminarPropiedadReportada(reporteId: number): Observable<any> {
    return this.http.Service_Delete(`reportes/${reporteId}/eliminar-propiedad`);
  }

  eliminarResenaReportada(reporteId: number): Observable<any> {
    return this.http.Service_Delete(`reportes/${reporteId}/eliminar-resena`);
  }

}
