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
    localStorage.setItem('notificationsEnabled', String(this.notificationsEnabled));
    localStorage.setItem('darkModeEnabled', String(this.darkModeEnabled));
    this.showSuccessMessage('Configuración guardada correctamente');
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