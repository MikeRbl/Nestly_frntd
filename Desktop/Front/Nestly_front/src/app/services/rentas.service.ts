import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RentasService {
  private apiUrl = 'http://localhost:8000/api'; 

  constructor(private http: HttpClient) { }

  obtenerMisRentas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/propiedades/rentadas/mias`);
  }
}
