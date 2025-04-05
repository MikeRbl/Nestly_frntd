
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = false; 

  constructor(private router: Router) {}

  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  login(): void {
    this.loggedIn = true;
  }

  logout(): void {
    this.loggedIn = false;
    this.router.navigate(['/login']);
  }
  obtenerUsuarioActualId(): number {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    return usuario.id;
  }
}
