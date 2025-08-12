import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { HttpLavavelService } from '../../http.service';
import Swal from 'sweetalert2';
import { ElementRef, ViewChild } from '@angular/core';

interface UserData {
  id: number;
  first_name: string;
  last_name_paternal: string;
  last_name_maternal: string;
  email: string;
  phone: string;
  role: string;
  avatar_url?: string;
  profile_picture?: string;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})

export class NavbarComponent implements OnInit {
  userData: UserData | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';
  userRole: string = '';
  mobileMenuOpen: boolean = false;
  userMenuOpen: boolean = false;
  screenWidth: number = 0;
  darkModeEnabled: boolean = false;
@ViewChild('userDropdownMenu') userDropdownMenuRef!: ElementRef;

  constructor(private Shttp: HttpLavavelService, private router: Router) {
    this.screenWidth = window.innerWidth;
  }



  loadSettings(): void {
    const savedMode = localStorage.getItem('darkModeEnabled');
    this.darkModeEnabled = savedMode !== null ? savedMode === 'true' : false;
    this.applyTheme();
  }

  toggleDarkMode(): void {
    this.darkModeEnabled = !this.darkModeEnabled;
    this.applyTheme();
    this.saveSettings();
  }

  private saveSettings(): void {
    localStorage.setItem('darkModeEnabled', String(this.darkModeEnabled));
  }

  private applyTheme(): void {
    const html = document.documentElement;
    if (this.darkModeEnabled) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }

  isDarkMode(): boolean {
    return this.darkModeEnabled;
  }

  ngOnInit() {
    if (this.isLoggedIn()) {
      this.loadUserData();
    } else {
      this.isLoading = false;
      this.userData = null;
      this.userRole = '';
    }
  }
handleFavoritosClick() {
  if (!this.isLoggedIn()) {
    import('sweetalert2').then(Swal => {
      Swal.default.fire({
        icon: 'info',
        title: 'Debes crear una cuenta',
        text: 'Para ver tus favoritos, primero debes registrarte o iniciar sesión.',
        showCancelButton: true,
        confirmButtonText: 'Registrarme',
        cancelButtonText: 'Iniciar Sesión',
      }).then(result => {
        if (result.isConfirmed) {
          this.router.navigate(['/register']);
        } else if (result.dismiss === Swal.default.DismissReason.cancel) {
          this.router.navigate(['/login']);
        }
      });
    });
  } else {
    // Si está logueado, navega directo a favoritos
    this.router.navigate(['/principal/favoritos']);
    this.closeMenus();
  }
}

  @HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent): void {
  const clickedInside = this.userDropdownMenuRef?.nativeElement.contains(event.target);
  const clickedOnTrigger = (event.target as HTMLElement).closest('.user-info'); // clase del botón que abre el menú

  if (!clickedInside && !clickedOnTrigger) {
    this.userMenuOpen = false;
  }
}



  isMobileView(): boolean {
    return this.screenWidth <= 640;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  }



  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
    // Cerrar el menú móvil si está abierto
    if (this.userMenuOpen) {
      this.mobileMenuOpen = false;
    }
  }

  closeMenus(): void {
    this.mobileMenuOpen = false;
    this.userMenuOpen = false;
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
          this.router.navigate(['/login']);
        }
      });
      return;
    }
    this.router.navigate(['/principal/perfil']);
    this.closeMenus();
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    this.userData = null;
    this.userRole = '';
    this.router.navigate(['/login']);
    this.closeMenus();
  }

  loadUserData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.Shttp.Service_Get('user').subscribe({
      next: (response: any) => {
        if (response && response.user) {
          this.userData = response.user as UserData;
          this.userRole = this.userData.role || '';
          const imageUrl = this.userData.avatar_url || this.userData.profile_picture;

          if (imageUrl) {
            this.userData.profile_picture = `${imageUrl.split('?')[0]}?${new Date().getTime()}`;
          } else if (this.userData) {
            this.userData.profile_picture = undefined;
          }
        } else {
          this.userData = null;
          this.userRole = '';
          this.errorMessage = 'No se pudieron obtener los datos del usuario.';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar datos del usuario en Navbar:', err);
        this.errorMessage = err.error?.message || 'Error al cargar los datos del usuario.';
        this.isLoading = false;
        this.userData = null;
        this.userRole = '';
      }
    });
  }



 
}