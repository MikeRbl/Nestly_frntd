import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { NotyfService } from '../../services/notyf.service';
import { AuthService } from '../../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private notyf: NotyfService // Opcional
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    if (this.authService.isLoggedIn()) {
      // Si el usuario ha iniciado sesión, permite el acceso a la ruta.
      return true;
    } else {
      // Si no ha iniciado sesión, redirige a la página de login.
      this.notyf.error('Necesitas iniciar sesión para acceder a esta página.'); // Notificación opcional
      this.router.navigate(['/login']);
      return false;
    }
  }
}
