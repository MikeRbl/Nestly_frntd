import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('accessToken');

    let authReq = req;

    // 1. Añadir el token de autorización si existe
    if (token) {
      authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`),
      });

      // 2. Solo establecer Content-Type si NO es FormData
      if (!(req.body instanceof FormData)) {
        authReq = authReq.clone({
          headers: authReq.headers.set('Content-Type', 'application/json'),
        });
      }
    }

    // 3. Enviar la petición (original o modificada) y manejar errores
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        
        if (error.status === 403 && error.error.message?.includes('baneada')) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'Tu cuenta ha sido baneada. Contacta con el administrador.',
            confirmButtonText: 'OK'
          }).then(() => {
            // Aquí podrías hacer logout completo antes de redirigir
            this.router.navigate(['/login']);
          });
        }

        // Propaga el error para que el servicio que hizo la llamada también pueda manejarlo
        return throwError(() => error);
      })
    );
  }
}
