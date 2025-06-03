import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpLavavelService } from '../../http.service'; // Asegúrate que la ruta sea correcta
import Swal from 'sweetalert2';

// Interfaz para tipar los datos del usuario. Define la estructura esperada.
interface UserData {
  id: number;
  first_name: string;
  last_name_paternal: string;
  last_name_maternal: string;
  email: string;
  phone: string;
  role: string;
  avatar_url?: string;      // URL original del avatar desde el backend.
  profile_picture?: string; // URL procesada con timestamp para el template (evita caché).
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-navbar',              
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'] 
})
export class NavbarComponent implements OnInit {
  userData: UserData | null = null; // Almacena los datos del usuario actual, o null si no hay.
  isLoading: boolean = true;        // Indica si se están cargando los datos del usuario.
  errorMessage: string = '';        // Para mostrar mensajes de error si la carga falla.
  userRole: string = '';            // Almacena el rol del usuario para control de acceso o UI.

  // Inyección de dependencias: Router para navegación y HttpLavavelService para peticiones HTTP.
  constructor(private Shttp: HttpLavavelService, private router: Router) {}

  // Método del ciclo de vida de Angular, se ejecuta al iniciar el componente.
  ngOnInit() {
    if (this.isLoggedIn()) { // Verifica si el usuario ha iniciado sesión.
      this.loadUserData();     // Si está logueado, carga sus datos.
    } else {
      this.isLoading = false;    // Si no, finaliza el estado de carga.
      this.userData = null;      // Asegura que no haya datos de usuario.
      this.userRole = '';        // Limpia el rol del usuario.
    }
  }

  // Verifica si existe un token de acceso en localStorage para determinar si el usuario está logueado.
  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken'); // Devuelve true si 'accessToken' existe.
  }

  // Maneja el clic en el área de perfil del usuario en la navbar.
  handleProfileClick(): void {
    if (!this.isLoggedIn()) { // Si el usuario no está logueado.
      // Muestra una alerta pidiendo iniciar sesión.
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
        if (result.isConfirmed) { // Si el usuario confirma, redirige al login.
          this.router.navigate(['/login']);
        }
      });
      return; // Termina la ejecución para no navegar al perfil.
    }
    // Si está logueado, navega a la página de perfil.
    this.router.navigate(['/principal/perfil']);
  }

  // Carga los datos del usuario desde el backend.
  loadUserData(): void {
    this.isLoading = true;     // Inicia el estado de carga.
    this.errorMessage = '';    // Limpia mensajes de error previos.

    // Realiza una petición GET al endpoint 'user'.
    this.Shttp.Service_Get('user').subscribe({
      next: (response: any) => { // Callback para respuesta exitosa.
        if (response && response.user) { // Si la respuesta contiene datos de usuario.
          this.userData = response.user as UserData; // Asigna los datos y castea al tipo UserData.

          // Asigna el rol del usuario.
          this.userRole = this.userData.role || '';

          // Intenta obtener la URL de la imagen de 'avatar_url' o 'profile_picture'.
          const imageUrl = this.userData.avatar_url || this.userData.profile_picture;

          if (imageUrl) {
            // Añade un timestamp a la URL para evitar problemas de caché del navegador.
            // Esto fuerza al navegador a recargar la imagen si ha cambiado, aunque la URL base sea la misma.
            this.userData.profile_picture = `${imageUrl.split('?')[0]}?${new Date().getTime()}`;
          } else if (this.userData) { // Si no hay URL de imagen.
            this.userData.profile_picture = undefined; // Establece profile_picture a undefined.
          }
        } else { // Si la respuesta no es la esperada.
          this.userData = null;
          this.userRole = '';
          this.errorMessage = 'No se pudieron obtener los datos del usuario.';
        }
        this.isLoading = false; // Finaliza el estado de carga
      },
      error: (err) => { // Callback para manejar errores en la petición
        console.error('Error al cargar datos del usuario en Navbar:', err);
        this.errorMessage = err.error?.message || 'Error al cargar los datos del usuario.';
        this.isLoading = false; // Finaliza el estado de carga
        this.userData = null;   // Limpia datos de usuario en caso de error
        this.userRole = '';     // Limpia rol de usuario
      }
    });
  }
}