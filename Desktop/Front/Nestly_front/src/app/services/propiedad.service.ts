
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

  /**
   * Crea los encabezados de autenticación para las peticiones protegidas.
   * @param isFormData Indica si la petición es de tipo FormData para omitir el 'Content-Type'.
   */
  private getAuthHeaders(isFormData: boolean = false): HttpHeaders {
    const token = localStorage.getItem('accessToken'); // O como hayas guardado tu token
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

  // =======================================================
  // MÉTODOS PÚBLICOS DEL SERVICIO DE PROPIEDADES
  // =======================================================

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
   * Crea una nueva propiedad (Ejemplo adicional, sigue el mismo patrón que actualizar).
   */
  public crearPropiedad(formData: FormData): Observable<any> {
    const headers = this.getAuthHeaders(true);
    return this.http.post(`${this.apiUrl}/propiedades`, formData, { headers });
  }
  
  /**
   * Elimina una propiedad (Ejemplo adicional).
   */
  public eliminarPropiedad(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/propiedades/${id}`, { headers });
  }

  // Agrega este método a tu PropiedadesService
public getTodasPropiedades(): Observable<any> {
  const headers = this.getAuthHeaders();
  return this.http.get(`${this.apiUrl}/propiedades`, { headers });
}
}
