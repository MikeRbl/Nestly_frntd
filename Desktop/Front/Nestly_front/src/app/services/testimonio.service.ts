import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Testimonio } from '../interface/testimonio.interface';

@Injectable({
  providedIn: 'root'
})
export class TestimonioService {

    private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    return token ? new HttpHeaders({ 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' })
                 : new HttpHeaders({ 'Accept': 'application/json' });
  }

  getTestimonios(): Observable<{ data: Testimonio[] }> {
    return this.http.get<{ data: Testimonio[] }>(`${this.apiUrl}/testimonios`);
  }

  createTestimonio(data: { comentario: string; puntuacion: number }): Observable<Testimonio> {
    return this.http.post<Testimonio>(`${this.apiUrl}/testimonios`, data, { headers: this.getAuthHeaders() });
  }

  updateTestimonio(id: number, data: { comentario: string; puntuacion: number }): Observable<Testimonio> {
    return this.http.put<Testimonio>(`${this.apiUrl}/testimonios/${id}`, data, { headers: this.getAuthHeaders() });
  }

  deleteTestimonio(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/testimonios/${id}`, { headers: this.getAuthHeaders() });
  }
}
