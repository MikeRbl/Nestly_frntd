import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RentasService {
  private apiUrl = environment.apiUrl; 

  constructor(private http: HttpClient) { }

  obtenerMisRentas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/propiedades/rentadas/mias`);
  }
}
