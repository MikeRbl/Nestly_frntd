import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpLavavelService } from '../http.service';


@Injectable({
  providedIn: 'root'
})
export class RoleRequestService {
  // Almacena y notifica el número de solicitudes pendientes.
  private pendingCountSubject = new BehaviorSubject<number>(0);
  public pendingCount$ = this.pendingCountSubject.asObservable();

  constructor(private http: HttpLavavelService) { }

  /** Un usuario envía una solicitud para ser propietario*/
  enviarSolicitud(): Observable<any> {
    return this.http.Service_Post('role-requests', {}).pipe(
      tap(() => {
        // Al tener éxito, incrementamos el contador para el admin.
        const currentCount = this.pendingCountSubject.getValue();
        this.pendingCountSubject.next(currentCount + 1);
      })
    );
  }

  /*   (Admin) Obtiene todas las solicitudes y actualiza el contador.*/
  obtenerSolicitudes(): Observable<any[]> {
    // Asegúrate de que la ruta del admin sea la correcta, ej: 'admin/role-requests'
    return this.http.Service_Get('role-requests').pipe(
      tap(solicitudes => {
        const pendingCount = solicitudes.filter(s => s.status === 'pendiente').length;
        this.pendingCountSubject.next(pendingCount);
      })
    );
  }

  /**
   * (Admin) Aprueba o rechaza una solicitud.
   */
  actualizarSolicitud(id: number, status: 'aprobado' | 'rechazado'): Observable<any> {
    // Asegúrate de que la ruta del admin sea la correcta, ej: 'admin/role-requests/${id}'
    return this.http.Service_Put(`role-requests/${id}`, { status }).pipe(
      tap(() => {
        // Al procesar, decrementamos el contador para el admin.
        const currentCount = this.pendingCountSubject.getValue();
        if (currentCount > 0) {
          this.pendingCountSubject.next(currentCount - 1);
        }
      })
    );
  }

  /**
   * (Admin) Carga el número inicial de solicitudes para el notificador.
   */
  fetchPendingCount(): void {
    this.obtenerSolicitudes().subscribe();
  }
}
