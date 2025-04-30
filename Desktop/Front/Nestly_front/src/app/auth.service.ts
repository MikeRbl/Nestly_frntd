
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = false; 

  constructor(private router: Router) {}

 

  login(): void {
    this.loggedIn = true;
    localStorage.setItem('loggedIn', 'true');
  }

  logout(): void {
    this.loggedIn = false;
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
    window.location.reload();
  }
  isLoggedIn(): boolean {
    return this.loggedIn || localStorage.getItem('loggedIn') === 'true';
  }
  obtenerUsuarioActualId(): number {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    return usuario.id;
  }
}
