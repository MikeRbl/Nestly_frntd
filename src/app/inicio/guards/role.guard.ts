import { Injectable } from '@angular/core';
import { CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivateChild {

  constructor(private authService: AuthService, private router: Router) {}

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    const allowedRoles = childRoute.data['roles'] as Array<string>;
    const user = this.authService.obtenerUsuarioActualId();
    const userRole = user?.role || '';

    if (allowedRoles && allowedRoles.includes(userRole)) {
      return true;
    } else {
      // Redirige a mis-rentas si no tiene permiso
      return this.router.createUrlTree(['/gestion-propiedades/mis-rentas']);
    }
  }
}
