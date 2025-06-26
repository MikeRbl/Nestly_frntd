
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PropiedadesService {
  // URL base de la API de Laravel
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(isFormData: boolean = false): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      // Si no hay token, no podemos hacer peticiones autenticadas
      return new HttpHeaders();
    }

    const headersConfig: any = {
      'Authorization': `Bearer ${token}`
    };

    if (!isFormData) {
      headersConfig['Content-Type'] = 'application/json';
    }

    return new HttpHeaders(headersConfig);
  }

  /**
   * Obtiene la lista de tipos de propiedad (endpoint público, no requiere token).
   */
  public getTiposDePropiedad(): Observable<any> {
    return this.http.get(`${this.apiUrl}/tipos-propiedad`);
  }

  /**
   * Obtiene los datos de una propiedad específica (requiere token).
   */
  public getPropiedad(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/propiedades/${id}`, { headers });
  }

  /**
   * Actualiza una propiedad existente (requiere token).
   * Maneja FormData y la simulación del método PUT.
   */
  public actualizarPropiedad(id: number, formData: FormData): Observable<any> {
    // 1. Añadimos el campo para que Laravel trate la petición POST como un PUT.
    formData.append('_method', 'PUT');

    // 2. Obtenemos los headers de autenticación, indicando que es FormData.
    const headers = this.getAuthHeaders(true);

    // 3. Hacemos la petición POST.
    return this.http.post(`${this.apiUrl}/propiedades/${id}`, formData, { headers });
  }

  /**
   * Crea una nueva propiedad 
   */
  public crearPropiedad(formData: FormData): Observable<any> {
    const headers = this.getAuthHeaders(true);
    return this.http.post(`${this.apiUrl}/propiedades`, formData, { headers });
  }

  /**
   * Elimina una propiedad 
   */
  public eliminarPropiedad(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/propiedades/${id}`, { headers });
  }

  public getTodasPropiedades(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/propiedades`, { headers });
  }

   // =======================================================
  // MÉTODOS PARA FAVORITOS 
  // =======================================================
  
  getFavoritos(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/favoritos`, { headers });
  }

  getIdsFavoritos(): Observable<{ data: number[] }> {
    const headers = this.getAuthHeaders();
    return this.http.get<{ data: number[] }>(`${this.apiUrl}/favoritos/ids`, { headers });
  }

  agregarFavorito(propiedadId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/favoritos/agregar/${propiedadId}`, {}, { headers });
  }

  quitarFavorito(propiedadId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/favoritos/quitar/${propiedadId}`, { headers });
  }

}
