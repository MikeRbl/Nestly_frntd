<<<<<<< HEAD
import { Component, OnInit } from "@angular/core";
import { HttpLavavelService } from "../../http.service"; // Asegúrate de que esta ruta sea correcta para tu servicio HTTP

// Interfaz para la estructura de datos del usuario
// Es buena práctica tener esta interfaz en un archivo compartido (ej. src/app/interfaces/user.interface.ts)
// y luego importarla. Por ahora, la incluyo aquí para que el código sea autocontenido.
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
    selector: "app-configuracion",
    templateUrl: "./configuracion.component.html",
    styleUrls: ["./configuracion.component.scss"],
})
export class ConfiguracionComponent implements OnInit {
    userData: User | null = null; // Almacena los datos del perfil del usuario
    isLoading: boolean = true; // Controla el indicador de estado de carga
    darkMode: boolean = false; // Estado del modo oscuro

    // Inyecta HttpLavavelService en el constructor del componente
    constructor(private Shttp: HttpLavavelService) {}

    /**
     * Hook del ciclo de vida que se ejecuta después de que Angular inicializa las vistas del componente.
     * Se usa aquí para cargar los datos del usuario cuando el componente se crea por primera vez.
     * También inicializa el estado del modo oscuro.
     */
    ngOnInit(): void {
        this.loadUserData(); // Cargar los datos del usuario
        
        // Inicializar el estado del modo oscuro
        const savedMode = localStorage.getItem('darkMode');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Si hay una preferencia guardada, úsala; de lo contrario, usa la preferencia del sistema
        this.darkMode = savedMode ? savedMode === 'true' : prefersDark;
        this.applyDarkModeClass(); // Aplicar la clase 'dark' al body si es necesario
    }

    /**
     * Carga los datos actuales del usuario desde el backend.
     * Muestra el estado de carga y maneja posibles errores.
     */
    loadUserData(): void {
        this.isLoading = true; // Activar estado de carga

        this.Shttp.Service_Get('user').subscribe({
            next: (response: any) => {
                if (response && response.user) {
                    this.userData = response.user; // Asignar los datos de usuario obtenidos

                    // Determinar la URL correcta de la imagen de la respuesta del backend (avatar_url o profile_picture)
                    const imageUrl = response.user.avatar_url || response.user.profile_picture;

                    if (this.userData && imageUrl) {
                        // Añadir un parámetro de timestamp a la URL de la imagen para asegurar que siempre sea fresca
                        this.userData.profile_picture = `${imageUrl}?${new Date().getTime()}`;
                    } else if (this.userData) {
                        // Si el backend no proporciona una URL de imagen válida, asegurar que profile_picture sea undefined
                        // para que la imagen de marcador de posición predeterminada se muestre en la plantilla.
                        this.userData.profile_picture = undefined;
                    }
                } else {
                    console.error('Respuesta inesperada al cargar los datos del usuario.');
                    this.userData = null; // Limpiar datos de usuario si la respuesta está mal formada
                }
                this.isLoading = false; // Desactivar estado de carga
            },
            error: (err) => {
                console.error('Error al cargar los datos del usuario:', err);
                // Aquí podrías mostrar un mensaje de error en la UI si lo deseas
                this.isLoading = false; // Desactivar estado de carga
                this.userData = null; // Limpiar datos de usuario en caso de error
            }
        });
    }

    /**
     * Alterna el estado del modo oscuro (dark mode) y lo guarda en el localStorage.
     */
    toggleDarkMode(): void {
        this.darkMode = !this.darkMode;
        localStorage.setItem('darkMode', this.darkMode.toString());
        this.applyDarkModeClass();
    }

    /**
     * Aplica o remueve la clase 'dark' del elemento body,
     * lo que activa o desactiva los estilos de modo oscuro definidos en el CSS.
     * Se usa 'document.body' para consistencia con el CSS proporcionado, que aplica
     * los estilos a 'body' directamente o a sus descendientes.
     */
    private applyDarkModeClass(): void {
        if (this.darkMode) {
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
        localStorage.removeItem('token'); // Eliminar el token de autenticación
        window.location.href = '/login'; // Redirigir al usuario a la página de inicio de sesión
        // En una aplicación Angular completa, se usaría this.router.navigate(['/login']);
    }
}
=======
import { Component, OnInit } from '@angular/core';
import { HttpLavavelService } from '../../http.service';
import { HttpErrorResponse } from '@angular/common/http';

interface User {
  id: number;
  first_name: string;
  last_name_paternal: string;
  last_name_maternal?: string | null;
  email: string;
  phone?: string | null;
  role: string;
  profile_picture?: string | null;
  avatar_url?: string | null;
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
  notificationsEnabled: boolean = true;
  darkModeEnabled: boolean = false;

  constructor(private Shttp: HttpLavavelService) { }

  ngOnInit(): void {
    this.loadUserData();
    this.loadSettings();
  }

  loadUserData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.Shttp.Service_Get('user').subscribe({
      next: (response: any) => {
        if (response?.user) {
          this.userData = response.user;
          
          // Manejo seguro de la imagen de perfil
          const imageUrl = this.userData?.avatar_url || this.userData?.profile_picture;
          if (this.userData) {
            this.userData.profile_picture = imageUrl 
              ? `${imageUrl}?${new Date().getTime()}`
              : undefined;
          }
        } else {
          this.errorMessage = 'No se pudieron cargar los datos del usuario';
          this.userData = null;
        }
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al cargar datos:', err);
        this.errorMessage = err.error?.message || 'Error en el servidor';
        this.isLoading = false;
        this.userData = null;
      }
    });
  }

  loadSettings(): void {
    // Cargar configuraciones con valores por defecto
    this.darkModeEnabled = localStorage.getItem('darkModeEnabled') === 'true';
    this.notificationsEnabled = localStorage.getItem('notificationsEnabled') !== 'false'; // true por defecto
    
    this.applyTheme();
  }

  saveSettings(): void {
    localStorage.setItem('darkModeEnabled', String(this.darkModeEnabled));
  }

  toggleDarkMode(): void {
    this.darkModeEnabled = !this.darkModeEnabled;
    this.applyTheme();
    this.saveSettings();
  }

 applyTheme(): void {
  const html = document.documentElement; // <html>

  if (this.darkModeEnabled) {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
}


  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('darkModeEnabled'); // Opcional: limpiar preferencias
    window.location.href = '/login';
  }

  private showSuccessMessage(message: string): void {
    this.successMessage = message;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
>>>>>>> 15cfc6413a89886cd2bbd463b799e1c2230a7858
