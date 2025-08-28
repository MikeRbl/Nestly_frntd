import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, map  } from 'rxjs';
import { HttpLaravelService } from './http.service';
import { HttpParams } from '@angular/common/http';
import { RoleRequest, RoleRequestUpdatePayload } from '../interface/role-request.interface';

@Injectable({
  providedIn: 'root'
})
export class RoleRequestService {
  private _pendingCountSubject = new BehaviorSubject<number>(0);
  public pendingCount$ = this._pendingCountSubject.asObservable();

  constructor(private http: HttpLaravelService) { }

  /**
   * (Usuario) Envía una solicitud para convertirse en propietario.
   */
  enviarSolicitud(): Observable<any> {
    return this.http.Service_Post('role-requests', {});
  }

  /**
   * (Usuario) Verifica el estado actual de su solicitud de rol.
   * Llama a la ruta del backend que devuelve el estado ('aprobado', 'pendiente', 'ninguna').
   */
  verificarEstadoSolicitud(): Observable<{ status: string }> {
    return this.http.Service_Get('role-requests/status') as Observable<{ status: string }>;
  }

  /**
   * (Admin) Obtiene la lista de solicitudes de forma paginada.
   */
  /**
 * (Admin) Obtiene la lista de solicitudes.
 */
obtenerSolicitudes(page: number, limit: number): Observable<{ data: RoleRequest[], total: number }> {
    const params = new HttpParams()
        .set('page', page + 1)
        .set('limit', limit);
    
    return this.http.Service_Get('role-requests', { params }).pipe(
        map((response: any) => {
            // Si la respuesta ya tiene la estructura esperada, devolverla
            if (response.data !== undefined && response.total !== undefined) {
                return response;
            }
            
            // Si es un array simple, convertirlo a la estructura esperada
            return {
                data: response,
                total: response.length
            };
        })
    ) as Observable<{ data: RoleRequest[], total: number }>;
}

  /**
   * (Admin) Aprueba o rechaza una solicitud.
   */
  actualizarSolicitud(id: number, payload: RoleRequestUpdatePayload): Observable<RoleRequest> {
    return this.http.Service_Put(`role-requests/${id}`, payload).pipe(
      tap(() => {
        // Después de procesar, recargamos el contador para que sea siempre preciso.
        this.cargarContadorPendientes();
      })
    ) as Observable<RoleRequest>;
  }

  /**
   * (Admin) Carga el número de solicitudes pendientes para el notificador.
   */
  cargarContadorPendientes(): void {
    this.http.Service_Get('role-requests').subscribe((response: any) => {
        // Manejar ambos casos: respuesta paginada o array simple
        const solicitudes = response.data || response;
        const pendingCount = solicitudes.filter((s: RoleRequest) => s.status === 'pendiente').length;
        this._pendingCountSubject.next(pendingCount);
    });
}
}