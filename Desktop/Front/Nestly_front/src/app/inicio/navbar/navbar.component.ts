import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpLavavelService } from '../../http.service'; // Asegúrate de importar el servicio

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  userData: any = {}; // Variable para almacenar los datos del usuario
  isLoading: boolean = true; // Indicador de carga
  errorMessage: string = ''; // Mensaje de error

  constructor(private Shttp: HttpLavavelService, private router: Router) {}

  ngOnInit() {
    if (this.isLoggedIn()) {
      this.loadUserData();
    }
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  loadUserData(): void {
    this.isLoading = true; // Muestra el indicador de carga

    this.Shttp.Service_Get('user').subscribe({
      next: (response: any) => {
        console.log('Respuesta completa:', response);
        
        // Extrae solo el nombre y el primer apellido
        this.userData = response.user;
        this.isLoading = false; // Desactiva el indicador de carga
      },
      error: (err) => {
        console.error('Error al cargar datos:', err);
        this.errorMessage = 'Error al cargar los datos del usuario';
        this.isLoading = false;
      }
    });
  }
}
