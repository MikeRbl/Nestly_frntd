import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth.service';
import { User } from '../../../interface/usuario.interface';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent {
  userData: User | null = null;
  currentDate: Date = new Date();
  isDarkMode = false;
  constructor(
    private authService: AuthService, // Inyectas el servicio de autenticación
    private router: Router // Inyectas el Router para la navegación
  ) {}

  ngOnInit() {
        this.userData = this.authService.obtenerUsuarioActualId();
    this.isDarkMode = document.documentElement.classList.contains('dark');
  }
  crearNuevoUsuario(): void {
    this.router.navigate(['/admin/usuarios-admin/crear']);
  }
  verReportes(): void{
    this.router.navigate(['/admin/ver-reportes']);
  }
  logout(): void {
    this.authService.logout();
  }
toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;

    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkModeEnabled', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkModeEnabled', 'false');
    }
  }
}

