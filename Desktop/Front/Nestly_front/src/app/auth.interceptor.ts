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

  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {

        if (error.status === 403 && error.error.message?.includes('baneada')) {
          // Mensaje cool para el usuario baneado
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'Tu cuenta ha sido baneada. Contacta con el administrador.',
            confirmButtonText: 'OK'
          }).then(() => {
            // Opcional: redirigir a login o logout
            this.router.navigate(['/login']);
            // También podrías limpiar localStorage o token aquí si usas JWT
          });
        }

        return throwError(() => error);
      })
    );
  }
}
