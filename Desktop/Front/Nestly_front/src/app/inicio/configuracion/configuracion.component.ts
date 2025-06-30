import { Component, OnInit } from '@angular/core';
import { HttpLavavelService } from '../../http.service'; // Asegúrate de que esta ruta sea correcta
import { HttpErrorResponse } from '@angular/common/http';

// Interfaz para la estructura de datos del usuario
interface User {
  id: number;
  first_name: string;
  last_name_paternal: string;
  last_name_maternal: string;
  email: string;
  phone: string;
  role: string;
  profile_picture?: string; // Campo para la URL completa del avatar
  avatar_url?: string; // Posiblemente otra propiedad del backend para la URL del avatar
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.scss']
})
export class ConfiguracionComponent implements OnInit {
  userData: User | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';
  successMessage: string = '';

  // Variables para la configuración
  notificationsEnabled: boolean = true;
  darkModeEnabled: boolean = false;

  constructor(private Shttp: HttpLavavelService) { }

  ngOnInit(): void {
    this.loadUserData();
    this.loadSettings(); // Carga las configuraciones del usuario
  }

  /**
   * Carga los datos actuales del usuario desde el backend.
   * Muestra el estado de carga y maneja posibles errores.
   */
  loadUserData(): void {
    this.isLoading = true; // Activa el estado de carga
    this.errorMessage = ''; // Limpia mensajes de error previos
    this.successMessage = ''; // Limpia mensajes de éxito previos

    this.Shttp.Service_Get('user').subscribe({
      next: (response: any) => {
        if (response && response.user) {
          this.userData = response.user; // Asigna los datos de usuario obtenidos

          // Determina la URL correcta de la imagen del backend (avatar_url o profile_picture)
          const imageUrl = this.userData?.avatar_url || this.userData?.profile_picture;

          if (this.userData && imageUrl) {
            // Agrega un parámetro de marca de tiempo a la URL de la imagen para asegurar que siempre sea fresca
            this.userData.profile_picture = `${imageUrl}?${new Date().getTime()}`;
          } else if (this.userData) {
            // Si el backend no proporciona una URL de imagen válida, asegúrate de que profile_picture sea undefined
            this.userData.profile_picture = undefined;
          }
        } else {
          this.errorMessage = 'Respuesta inesperada al cargar los datos del usuario.';
          this.userData = null; // Limpia los datos del usuario si la respuesta es malformada
        }
        this.isLoading = false; // Desactiva el estado de carga
      },
      error: (err: HttpErrorResponse) => { // Especifica el tipo de error
        console.error('Error al cargar los datos del usuario:', err);
        this.errorMessage = err.error?.message || 'Error al cargar los datos del usuario. Por favor, inténtalo de nuevo más tarde.';
        this.isLoading = false; // Desactiva el estado de carga
        this.userData = null; // Limpia los datos del usuario en caso de error
      }
    });
  }

  /**
   * Carga las configuraciones específicas del usuario (ej., modo oscuro, notificaciones) del almacenamiento local o valores predeterminados.
   * En una aplicación real, estas se obtendrían típicamente de un backend.
   */
  loadSettings(): void {
    // Ejemplo: Carga desde el almacenamiento local
    this.notificationsEnabled = localStorage.getItem('notificationsEnabled') === 'true';
    this.darkModeEnabled = localStorage.getItem('darkModeEnabled') === 'true';

    this.applyTheme(); // Aplica el modo oscuro inmediatamente
  }

  /**
   * Guarda las configuraciones actuales (notificaciones, modo oscuro) en el almacenamiento local.
   * En una aplicación real, estas se enviarían típicamente a un backend.
   */
  saveSettings(): void {
    localStorage.setItem('notificationsEnabled', this.notificationsEnabled.toString());
    localStorage.setItem('darkModeEnabled', this.darkModeEnabled.toString());

    this.applyTheme(); // Aplica los cambios de modo oscuro inmediatamente

    this.successMessage = '¡Configuración guardada exitosamente!';
    setTimeout(() => this.successMessage = '', 3000); // Limpia el mensaje después de 3 segundos
  }

  /**
   * Alterna el modo oscuro y aplica el tema al cuerpo del documento.
   */
  toggleDarkMode(): void {
    this.darkModeEnabled = !this.darkModeEnabled;
    this.applyTheme();
    this.saveSettings(); // Guarda la nueva configuración
  }

  /**
   * Aplica o remueve la clase 'dark' del cuerpo del documento basándose en `darkModeEnabled`.
   */
  applyTheme(): void {
    if (this.darkModeEnabled) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }

  /**
   * Maneja el proceso de cierre de sesión del usuario.
   * Elimina el token de autenticación del almacenamiento local y redirige a la página de inicio de sesión.
   */
  logout(): void {
    localStorage.removeItem('token'); // Elimina el token de autenticación
    window.location.href = '/login'; // Redirige al usuario a la página de inicio de sesión
  }
}
