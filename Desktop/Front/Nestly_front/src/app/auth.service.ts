import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = false; 

  constructor(private router: Router) {
    this.loggedIn = localStorage.getItem('loggedIn') === 'true';
  }

  login(userData: any, token: string): void {
    this.loggedIn = true;
    localStorage.setItem('loggedIn', 'true');
    localStorage.setItem('accessToken', token);
    // Asegurarse de no guardar 'undefined'
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    }
  }

  logout(): void {
    this.loggedIn = false;
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
    window.location.reload();
  }

  isLoggedIn(): boolean {
    return this.loggedIn || localStorage.getItem('loggedIn') === 'true';
  }

  // 👇 MÉTODO CORREGIDO
  obtenerUsuarioActualId(): number | null {
    const userString = localStorage.getItem('user');

    // Comprueba si el string es nulo, vacío o literalmente "undefined"
    if (!userString || userString === 'undefined') {
      return null;
    }

    try {
      const user = JSON.parse(userString);
      return user?.id ?? null; // Devuelve el id o null si no existe
    } catch (e) {
      console.error("Error al procesar los datos del usuario desde localStorage:", e);
      return null; // Si hay un error de parseo, devuelve null
    }
  }

  // 👇 MÉTODO CORREGIDO
  obtenerUsuarioActual(): any | null {
    const userString = localStorage.getItem('user');

    // Comprueba si el string es nulo, vacío o literalmente "undefined"
    if (!userString || userString === 'undefined') {
      return null;
    }

    try {
      return JSON.parse(userString);
    } catch (e) {
      console.error("Error al procesar los datos del usuario desde localStorage:", e);
      return null; // Si hay un error de parseo, devuelve null
    }
  }
}