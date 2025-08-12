
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from './interface/usuario.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  //* 1. BehaviorSubject: El "corazón" reactivo del servicio.
  private currentUserSubject: BehaviorSubject<User | null>;
  
  //* 2. Observable público: Los componentes se suscriben a esto para recibir actualizaciones.
  public currentUser$: Observable<User | null>;

  constructor(private router: Router) {
    //* Se inicializa el BehaviorSubject con el usuario que pueda existir en localStorage.
    const storedUser = this.getUserFromStorage();
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  login(userData: User, token: string): void {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(userData));

    //* Notifica a todos los componentes suscritos que hay un nuevo usuario.
    this.currentUserSubject.next(userData);
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');

    //* Notifica a todos que el usuario ya no existe.
    this.currentUserSubject.next(null);
    
    //* Mantenemos la lógica de navegación y recarga si la necesitas.
    this.router.navigate(['/login']);
    window.location.reload(); 
  }

  isLoggedIn(): boolean {
    //* Lee el valor actual del BehaviorSubject.
    return !!this.currentUserSubject.getValue();
  }

  
   //* Devuelve el valor actual del usuario de forma síncrona.
   
  obtenerUsuarioActualId(): User | null {
    return this.currentUserSubject.getValue();
  }

  //* Helper privado para leer de localStorage de forma segura.
  private getUserFromStorage(): User | null {
    const userString = localStorage.getItem('user');
    if (!userString || userString === 'undefined') {
      return null;
    }
    try {
      return JSON.parse(userString) as User;
    } catch (e) {
      console.error("Error al procesar usuario de localStorage:", e);
      return null;
    }
  }
  getUserRole(): string | null {
    // Obtenemos el valor actual del usuario desde el BehaviorSubject
    const currentUser = this.currentUserSubject.getValue();
    return currentUser ? currentUser.role : null;
  }
}
