  import { Component, OnInit } from '@angular/core';
  import { Router } from '@angular/router';
  import { HttpLavavelService } from '../../http.service'; // Asegúrate de importar el servicio
import Swal from 'sweetalert2';

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
    
    
    handleProfileClick(): void {
      if (!this.isLoggedIn()) {
        Swal.fire({
          title: 'Acceso restringido',
          text: 'Primero debes iniciar sesión o crear una cuenta para acceder al perfil.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Iniciar sesión',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#7FA6FF',
          cancelButtonColor: '#d33'
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigate(['/login']); // Redirige al login si elige "Iniciar sesión"
          }
        });
        return;
      }
    
      // Si está logueado, redirige al perfil
      this.router.navigate(['/principal/perfil']);
    }
    
    
    userRole: string = '';

    loadUserData(): void {
      this.isLoading = true; // Muestra el indicador de carga
      
      this.Shttp.Service_Get('user').subscribe({
        next: (response: any) => {
          console.log('Respuesta completa:', response);
    
          // Asignamos los datos del usuario y el rol
          this.userData = response.user;
          this.userRole = this.userData.role;  // Asegúrate de que el backend envíe un campo `role`
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
