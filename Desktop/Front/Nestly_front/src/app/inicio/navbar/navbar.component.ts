import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpLavavelService } from '../../http.service';
import Swal from 'sweetalert2';
import { User } from '../../interface/usuario.interface';
import { NotyfService } from '../../services/notyf.service';
import { FavoritosService } from '../../services/favoritos.service';
import { Subscription } from 'rxjs';
import { PropiedadesService } from '../../services/propiedad.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  userData: User | null = null;
  isLoading: boolean = true;
  userRole: string = '';
  mobileMenuOpen: boolean = false;
  userMenuOpen: boolean = false;
  darkModeEnabled: boolean = false;
  
  newFavoritesCount = 0;
  private newFavoritesSubscription!: Subscription;

  @ViewChild('userDropdownMenu') userDropdownMenuRef!: ElementRef;

  constructor(
    private Shttp: HttpLavavelService,
    private router: Router,
    private notyf: NotyfService,
    private favoritosService: FavoritosService
  ) {}

  ngOnInit() {
    if (this.isLoggedIn()) {
      this.loadUserData();
    } else {
      this.isLoading = false;
    }

    // Se suscribe al contador de "nuevos" favoritos para la notificación
    this.newFavoritesSubscription = this.favoritosService.newFavoritesCount$.subscribe(count => {
      this.newFavoritesCount = count;
    });
  }

  ngOnDestroy() {
    if (this.newFavoritesSubscription) {
      this.newFavoritesSubscription.unsubscribe();
    }
  }
  
  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  irAFavoritos(): void {
    this.favoritosService.markFavoritesAsSeen(); // Limpia la notificación al hacer clic
    this.router.navigate(['/principal/favoritos']);
    this.closeMenus();
  }
  
  // ... (el resto de tus métodos como loadUserData, logout, etc. se quedan igual)
  loadUserData(): void {
    this.isLoading = true;
    this.Shttp.Service_Get('user').subscribe({
      next: (response: any) => {
        if (response?.user) {
          this.userData = response.user as User;
          this.userRole = this.userData.role || '';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error Navbar:', err);
        this.isLoading = false;
      }
    });
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  closeMenus(): void {
    this.userMenuOpen = false;
    this.mobileMenuOpen = false;
  }

  logout(): void {
  // Limpia los datos de la sesión
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  this.userData = null;
  this.userRole = '';

  // Navega al dashboard público en lugar de al login
  this.router.navigate(['/principal/dashboard']); 
  
  // Recarga para asegurar que el estado se limpie completamente
  setTimeout(() => window.location.reload(), 100); 
}

  toggleDarkMode(): void {
    this.darkModeEnabled = !this.darkModeEnabled;
    if (this.darkModeEnabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkModeEnabled', String(this.darkModeEnabled));
  }

  isMobileView(): boolean {
    return window.innerWidth <= 640;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedInside = this.userDropdownMenuRef?.nativeElement.contains(event.target);
    const clickedOnTrigger = (event.target as HTMLElement).closest('.user-info');
    if (!clickedInside && !clickedOnTrigger) this.userMenuOpen = false;
  }
}
