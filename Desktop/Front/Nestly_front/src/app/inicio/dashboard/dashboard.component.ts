import { Component, OnInit } from '@angular/core';
import { HttpLavavelService } from '../../http.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Propiedad } from '../../interface/propiedades.interface';
import { AuthService } from '../../auth.service';
import { PropiedadesService } from '../../services/propiedad.service';
import { NotyfService } from '../../services/notyf.service';

// La interfaz Testimonio se queda aquí, ya que la sección de testimonios es parte del dashboard.
export interface Testimonio {
  id?: number;
  id_usuario?: number;
  nombre: string;
  comentario: string;
  puntuacion: number;
  avatar: string;
  fecha?: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // --- Propiedades para el componente hijo 'propiedades-destacadas' ---
  featuredProperties: Propiedad[] = [];
  isLoading: boolean = true;
  isUserLoggedIn = false;
  favoritoIds = new Set<number>();
  
  // --- Lógica de testimonios (se queda en el Dashboard) ---
  public mostrarFormularioResena = false;
  public nuevaResena = { comentario: '', puntuacion: 0 };
  hoverRating = 0;
  currentUser: any = null;
  mostrarTodasResenas = false;
  public testimonios: Testimonio[] = [
    {
      id: 1,
      nombre: 'Ana Sofía Vargas',
      comentario: '"¡El proceso fue increíblemente fácil! Encontré la casa de mis sueños en San Miguel en menos de una semana."',
      puntuacion: 5,
      avatar: 'https://placehold.co/100x100/E2E8F0/4A5568?text=AV',
      fecha: '15/05/2024', 
      id_usuario: 1
    },
    {
      id: 2,
      nombre: 'Ricardo Morales',
      comentario: '"Publicar mi casa fue sencillo. Recibí solicitudes reales y el sistema de gestión fue excelente."',
      puntuacion: 5,
      avatar: 'https://placehold.co/100x100/A0AEC0/2D3748?text=RM',
      fecha: '22/04/2024',
      id_usuario: 2
    }
  ];

  constructor(
    private Shttp: HttpLavavelService,
    private router: Router,
    private authService: AuthService,
    private propiedadesService: PropiedadesService,
    private notyf: NotyfService
  ) {}

  ngOnInit(): void {
    this.isUserLoggedIn = this.authService.isLoggedIn();
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.loadFeaturedProperties(); // Ahora solo carga las propiedades para pasarlas al hijo
    if (this.isUserLoggedIn) {
      this.cargarIdsFavoritos();
    }
  }

  // --- Métodos que se quedan en el Dashboard ---

  loadFeaturedProperties(): void {
    this.isLoading = true;
    this.Shttp.Service_Get('propiedades').subscribe({
      next: (response: any) => {
        const data = response?.data?.data || response?.data || [];
        const allProperties = this.processProperties(Array.isArray(data) ? data : [data]);
        this.featuredProperties = this.getRandomProperties(allProperties, 3);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar propiedades:', err);
        this.isLoading = false;
        this.notyf.error('Error al cargar propiedades');
      }
    });
  }

  processProperties(properties: any[]): Propiedad[] {
    // Esta función procesa los datos antes de pasarlos al componente hijo.
    return properties.map(prop => ({
      ...prop,
      fotos: (typeof prop.fotos === 'string') ? JSON.parse(prop.fotos) : prop.fotos
    }));
  }

  getRandomProperties(properties: Propiedad[], count: number): Propiedad[] {
    const available = properties.filter(prop => prop.estado_propiedad !== 'inactivo');
    return [...available].sort(() => 0.5 - Math.random()).slice(0, count);
  }

  cargarIdsFavoritos(): void {
    this.propiedadesService.getIdsFavoritos().subscribe({
      next: (response) => { this.favoritoIds = new Set(response.data); },
      error: (err) => console.error('Error al cargar IDs de favoritos:', err)
    });
  }

  // Maneja el evento (propertyClick) del componente hijo
  handlePropertyClick(id: number): void {
    if (this.isUserLoggedIn) {
      this.router.navigate(['/principal/propiedad', id]);
    } else {
      Swal.fire({
        title: '¡Inicia sesión o crea una cuenta!',
        text: 'Necesitas una cuenta para ver los detalles de la propiedad.',
        icon: 'info',
        showDenyButton: true,
        confirmButtonText: 'Iniciar Sesión',
        denyButtonText: 'Crear Cuenta',
      }).then((result) => {
        if (result.isConfirmed) this.router.navigate(['/login']);
        else if (result.isDenied) this.router.navigate(['/register']);
      });
    }
  }

  // Maneja el evento (toggleFavoritoEvent) del componente hijo
  toggleFavorito(propiedad: Propiedad): void {
    const propiedadId = propiedad.id_propiedad;
    const esFavorito = this.favoritoIds.has(propiedadId);
    
    const action = esFavorito 
      ? this.propiedadesService.quitarFavorito(propiedadId) 
      : this.propiedadesService.agregarFavorito(propiedadId);
    
    action.subscribe({
      next: () => {
        if (esFavorito) {
          this.favoritoIds.delete(propiedadId);
        } else {
          this.favoritoIds.add(propiedadId);
        }
        this.notyf.success(esFavorito ? 'Eliminado de favoritos' : 'Agregado a favoritos');
      },
      error: () => this.notyf.error('Ocurrió un error. Intenta de nuevo.')
    });
  }

  // --- Lógica de testimonios (se queda aquí) ---
  get testimoniosVisibles(): Testimonio[] {
    return this.mostrarTodasResenas ? this.testimonios : this.testimonios.slice(0, 3);
  }

public publicarResena(event: { comentario: string; puntuacion: number }) {
  if (!event.comentario || event.puntuacion === 0) {
    this.notyf.error('Por favor, escribe tu comentario y selecciona una calificación.');
    return;
  }
  if (!this.currentUser) {
    this.notyf.error('Debes iniciar sesión para dejar una reseña.');
    return;
  }

  const yaTieneResena = this.testimonios.some(t => t.id_usuario === this.currentUser.id);
  if (yaTieneResena) {
    this.notyf.error('Solo puedes dejar una reseña.');
    return;
  }

  const userName = `${this.currentUser.first_name} ${this.currentUser.last_name_paternal}`;
  const testimonioPublicar: Testimonio = {
    id_usuario: this.currentUser.id,
    nombre: userName,
    comentario: event.comentario,
    puntuacion: event.puntuacion,
    avatar: `https://placehold.co/100x100?text=${userName.substring(0, 2).toUpperCase()}`,
    fecha: new Date().toLocaleDateString()
  };

  this.testimonios.unshift(testimonioPublicar);
  this.notyf.success('¡Gracias! Tu reseña ha sido publicada.');
}


  resetFormularioResena(): void {
    this.nuevaResena = { comentario: '', puntuacion: 0 };
    this.mostrarFormularioResena = false;
  }

  public eliminarResena(index: number) {
  const testimonio = this.testimonios[index];
  if (!this.currentUser || testimonio.id_usuario !== this.currentUser.id) {
    this.notyf.error('Solo puedes eliminar tus propias reseñas.');
    return;
  }

  Swal.fire({
    title: '¿Eliminar reseña?',
    text: '¿Estás seguro de que quieres eliminar esta reseña?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonText: 'Cancelar',
    confirmButtonText: 'Sí, eliminar'
  }).then((result) => {
    if (result.isConfirmed) {
      this.testimonios.splice(index, 1);
      this.notyf.success('Reseña eliminada correctamente');
    }
  });
}

  
  subscrito() {
    Swal.fire({
      title: "¡Gracias por suscribirte!",
      text: "Recibirás nuestras mejores ofertas",
      icon: "success",
      confirmButtonText: "Aceptar",
      timer: 3000,
      timerProgressBar: true
    });
  }
}
