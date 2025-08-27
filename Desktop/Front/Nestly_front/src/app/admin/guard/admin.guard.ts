import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { NotyfService } from '../../services/notyf.service';
import { AuthService } from '../../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authService: AuthService, 
    private router: Router,
    private notyf: NotyfService
  ) {}


canActivate(): boolean {
  const userRole = this.authService.getUserRole(); 

  if (this.authService.isLoggedIn() && userRole === 'admin') {
    return true; // Acceso permitido
  } else {
    this.notyf.error('No tienes permiso para acceder a esta sección.');
    this.router.navigate(['/']); 
    return false; // Acceso denegado
  }
}
}
