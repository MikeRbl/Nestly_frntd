import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Propiedad } from '../interface/propiedades.interface';
import { TipoPropiedad } from '../interface/tipopropiedad.interface';

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
      return new HttpHeaders();
    }

    const headersConfig: any = {
      'Authorization': `Bearer ${token}`
    };

    // HttpClient es lo suficientemente inteligente como para establecer el Content-Type
    // correcto para FormData (multipart/form-data) por sí mismo.
    // Solo establecemos el Content-Type para JSON.
    if (!isFormData) {
      headersConfig['Content-Type'] = 'application/json';
    }

    return new HttpHeaders(headersConfig);
  }

  /**
   * Obtiene la lista de tipos de propiedad (endpoint público).
   */
  public getTiposDePropiedad(): Observable<TipoPropiedad[]> {
    return this.http.get<TipoPropiedad[]>(`${this.apiUrl}/tipos-propiedad`);
  }

  /**
   * Obtiene los datos de una propiedad específica.
   */
  public getPropiedad(id: number): Observable<{ data: Propiedad }> {
    const headers = this.getAuthHeaders();
    return this.http.get<{ data: Propiedad }>(`${this.apiUrl}/propiedades/${id}`, { headers });
  }

  /**
   * Actualiza una propiedad existente.
   */
  public actualizarPropiedad(id: number, formData: FormData): Observable<Propiedad> {
    formData.append('_method', 'PUT');
    const headers = this.getAuthHeaders(true);
    return this.http.post<Propiedad>(`${this.apiUrl}/propiedades/${id}`, formData, { headers });
  }

  /**
   * Crea una nueva propiedad.
   */
  public crearPropiedad(formData: FormData): Observable<Propiedad> {
    const headers = this.getAuthHeaders(true);
    return this.http.post<Propiedad>(`${this.apiUrl}/propiedades`, formData, { headers });
  }

  /**
   * Elimina una propiedad.
   */
  public eliminarPropiedad(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/propiedades/${id}`, { headers });
  }

  public getTodasPropiedades(): Observable<{ data: Propiedad[] }> {
    const headers = this.getAuthHeaders();
    return this.http.get<{ data: Propiedad[] }>(`${this.apiUrl}/propiedades`, { headers });
  }

  // =======================================================
  // MÉTODOS PARA FAVORITOS 
  // =======================================================
  
  getFavoritos(): Observable<{ data: Propiedad[] }> {
    const headers = this.getAuthHeaders();
    return this.http.get<{ data: Propiedad[] }>(`${this.apiUrl}/favoritos`, { headers });
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
