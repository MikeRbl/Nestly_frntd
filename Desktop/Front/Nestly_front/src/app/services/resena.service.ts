import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
// --- CORRECCIÓN: Se añade la importación de la interfaz Resena ---
import { Resena } from '../interface/resena.interface';

@Injectable({
  providedIn: 'root'
})
export class ResenaService {
  private apiUrl = 'http://127.0.0.1:8000/api'; 

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      return new HttpHeaders({ 'Accept': 'application/json' });
    }

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });
  }

  // Ahora podemos usar 'Resena' sin errores porque la hemos importado.
  getResenas(propiedadId: number): Observable<{data: Resena[]}> { // Tipado más específico
    return this.http.get<{data: Resena[]}>(`${this.apiUrl}/propiedades/${propiedadId}/resenas`, {
      headers: this.getAuthHeaders()
    });
  }

  createResena(propiedadId: number, reseñaData: { puntuacion: number; comentario?: string }): Observable<Resena> {
    return this.http.post<Resena>(`${this.apiUrl}/propiedades/${propiedadId}/resenas`, reseñaData, {
      headers: this.getAuthHeaders()
    });
  }
  
  updateResena(resenaId: number, data: { puntuacion?: number; comentario?: string }): Observable<Resena> {
    const url = `${this.apiUrl}/resenas/${resenaId}`;
    return this.http.put<Resena>(url, data, {
      headers: this.getAuthHeaders()
    });
  }

  deleteResena(resenaId: number): Observable<void> { // Un delete exitoso no suele devolver contenido
    return this.http.delete<void>(`${this.apiUrl}/resenas/${resenaId}`, {
      headers: this.getAuthHeaders()
    });
  }

  toggleVoto(resenaId: number): Observable<{ votos_count: number; liked_by_current_user: boolean }> {
  return this.http.post<{ votos_count: number; liked_by_current_user: boolean }>(
    `${this.apiUrl}/resenas/${resenaId}/voto`, {}, {
      headers: this.getAuthHeaders()
    }
  );
  }
  getLikedResenaIds(): Observable<{data: number[]}> {
    // Asegúrate que tu API tenga este endpoint: /api/resenas/liked-ids
    return this.http.get<{data: number[]}>(`${this.apiUrl}/resenas/liked-ids`, {
      headers: this.getAuthHeaders()
    });
  }
}