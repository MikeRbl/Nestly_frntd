import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpLavavelService {
  public apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // ✅ Método para obtener headers, opcionalmente sin Content-Type si es FormData
  private getHeaders(isFormData: boolean = false): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    const headersConfig: any = {
      'Authorization': `Bearer ${token}`
    };

    if (!isFormData) {
      headersConfig['Content-Type'] = 'application/json';
    }

    return new HttpHeaders(headersConfig);
  }

  // 🌐 POST público (sin autenticación)
  publicPost(endpoint: string, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${endpoint}`, data, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }

  // 🔍 GET con autenticación
  Service_Get(endpoint: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${endpoint}`, {
      headers: this.getHeaders()
    });
  }

  // 📤 POST con autenticación (soporta FormData o JSON)
  Service_Post(endpoint: string, data: any): Observable<any> {
    if (data instanceof FormData) {
      // ✅ Con token, pero sin 'Content-Type' para que el navegador lo maneje
      return this.http.post(`${this.apiUrl}/${endpoint}`, data, {
        headers: this.getHeaders(true)
      });
    }

    // JSON normal
    return this.http.post(`${this.apiUrl}/${endpoint}`, data, {
      headers: this.getHeaders()
    });
  }

  // 🔄 PUT con autenticación
  Service_Put(endpoint: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${endpoint}`, data, {
      headers: this.getHeaders()
    });
  }

  // ❌ DELETE con autenticación
  Service_Delete(endpoint: string, idOrPath?: string | number): Observable<any> {
  let url = `${this.apiUrl}/${endpoint}`;

  if (idOrPath !== undefined && idOrPath !== null) {
    url += `/${idOrPath}`;
  }

  return this.http.delete(url, {
    headers: this.getHeaders()
  });
}

Service_Patch(endpoint: string, data: any): Observable<any> {
  return this.http.patch(`${this.apiUrl}/${endpoint}`, data, {
    headers: this.getHeaders()
  });
}

  public getTiposDePropiedad(): Observable<any> {
  return this.http.get(`${this.apiUrl}/tipos-propiedad`);
}

getPropiedad(id: number) {
  return this.http.get(`${this.apiUrl}/propiedades/${id}`);
}

actualizarPropiedad(id: number, formData: FormData) {
  formData.append('_method', 'PUT');

  return this.http.post(`${this.apiUrl}/propiedades/${id}`, formData);
}

getUserId(): number {
  const userData = localStorage.getItem('user');
  if (userData) {
    const user = JSON.parse(userData);
    return user.id;
  }
  return 0;
}
}
