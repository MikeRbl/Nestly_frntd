import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpLavavelService } from '../http.service';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  // BehaviorSubject para almacenar y notificar el contador de reportes pendientes
  private pendingReportsCountSubject = new BehaviorSubject<number>(0);
  public pendingReportsCount$ = this.pendingReportsCountSubject.asObservable();

  constructor(private http: HttpLavavelService) { }

  /**
   * (Usuario) Crea un nuevo reporte y luego actualiza el contador.
   */
  crearReporte(data: any): Observable<any> {
    return this.http.Service_Post('reportes', data).pipe(
      tap(() => {
        // Después de crear un reporte, pide la cuenta actualizada al backend.
        this.fetchPendingReportsCount();
      })
    );
  }

  /**
   * (Admin) Obtiene la lista de reportes para la página de gestión.
   * Esta función ya no necesita manejar el contador.
   */
  obtenerReportes(params: any): Observable<any> {
    const queryParams = new URLSearchParams();
    if (params) {
      // Construye la URL con los parámetros de forma dinámica
      Object.keys(params).forEach(key => {
        if (params[key]) { // Asegura que no se añadan parámetros nulos o vacíos
          queryParams.append(key, params[key]);
        }
      });
    }
    const url = `reportes?${queryParams.toString()}`;
    return this.http.Service_Get(url);
  }

  /**
   * (Admin) Actualiza el estado de un reporte y luego actualiza el contador.
   */
  actualizarEstadoReporte(id: number, estado: string): Observable<any> {
    return this.http.Service_Put(`reportes/${id}/estado`, { estado }).pipe(
      tap(() => {
        // Después de actualizar un reporte, pide la cuenta actualizada
        this.fetchPendingReportsCount();
      })
    );
  }

  /**
   * (Admin) Obtiene la cuenta inicial y actualizada para la notificación.
   */
  fetchPendingReportsCount(): void {
    this.http.Service_Get('admin/stats').subscribe((response: any) => {
        // Usamos ?? 0 como salvaguarda si la respuesta no es la esperada.
        const count = response.stats?.unresolved_reports ?? 0;
        this.pendingReportsCountSubject.next(count);
    });
  }
}
