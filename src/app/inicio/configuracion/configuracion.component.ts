import { Component, OnInit } from '@angular/core';
import { HttpLavavelService } from '../../http.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../auth.service';
import { NotyfService } from '../../services/notyf.service';
import { RoleRequestService } from '../../services/roleRequest.service';
import { User } from '../../interface/usuario.interface';



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
  solicitudEnviada = false;

  constructor(
    private Shttp: HttpLavavelService,
    private roleRequestService: RoleRequestService,
    private authService: AuthService,
    private notyf: NotyfService,
  ) { }

  ngOnInit(): void {
    this.loadUserData();
    this.loadSettings();
    if (localStorage.getItem('roleRequestSent') === 'true') {
      this.solicitudEnviada = true;
    }
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
          const imageUrl = this.userData?.avatar_url || this.userData?.avatar_url;
          if (this.userData) {
            this.userData.avatar_url = imageUrl 
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
enviarSolicitud(): void {
    this.roleRequestService.enviarSolicitud().subscribe({
      next: () => {
        this.notyf.success('¡Solicitud enviada! Un administrador la revisará pronto.');
        localStorage.setItem('roleRequestSent', 'true');
        this.solicitudEnviada = true; // Deshabilita el botón
      },
      error: (err) => {
        if (err.status === 400 || err.status === 409) {
          this.notyf.error('Ya tienes una solicitud pendiente.');
          localStorage.setItem('roleRequestSent', 'true'); // Sincroniza el estado
          this.solicitudEnviada = true;
        } else {
          this.notyf.error(err.error?.message || 'Error al enviar la solicitud');
        }
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
  const html = document.documentElement; 

  if (this.darkModeEnabled) {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
}


  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('darkModeEnabled'); 
    window.location.href = '/login';
  }

  private showSuccessMessage(message: string): void {
    this.successMessage = message;
    setTimeout(() => this.successMessage = '', 3000);
  }
}