import { Component, OnInit } from '@angular/core';

import { PropiedadesService } from '../../../services/propiedad.service';
import { NotyfService } from '../../../services/notyf.service';
import { Testimonio } from '../../../interface/testimonio.interface';
import { TestimonioService } from '../../../services/testimonio.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Propiedad } from '../../../interface/propiedades.interface';
import { AuthService } from '../../../services/auth.service';
import { HttpLaravelService } from '../../../services/http.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  // --- Propiedades destacadas ---
  featuredProperties: Propiedad[] = [];
  isLoading: boolean = true;
  isUserLoggedIn = false;
  favoritoIds = new Set<number>();

  // --- Testimonios ---
  mostrarFormularioResena = false;
  nuevaResena = { comentario: '', puntuacion: 0 };
  hoverRating = 0;
  currentUser: any = null;
  mostrarTodasResenas = false;
  testimoniosLoading: boolean = true;

    testimonios: Testimonio[] = [];

  constructor(
    private Shttp: HttpLaravelService,
    private router: Router,
    private authService: AuthService,
    private propiedadesService: PropiedadesService,
    private testimonioService: TestimonioService,
    private notyf: NotyfService
  ) {}

  ngOnInit(): void {
    this.isUserLoggedIn = this.authService.isLoggedIn();
    this.authService.currentUser$.subscribe(user => this.currentUser = user);

    this.loadFeaturedProperties();
    this.cargarTestimonios()

    if (this.isUserLoggedIn) {
      this.cargarIdsFavoritos();
    }
  }

  // --------------------- PROPIEDADES DESTACADAS ---------------------
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
    return properties.map(prop => ({
      ...prop,
      fotos: typeof prop.fotos === 'string' ? JSON.parse(prop.fotos) : prop.fotos
    }));
  }

  getRandomProperties(properties: Propiedad[], count: number): Propiedad[] {
    const available = properties.filter(prop => prop.estado_propiedad !== 'inactivo');
    return [...available].sort(() => 0.5 - Math.random()).slice(0, count);
  }

  cargarIdsFavoritos(): void {
    this.propiedadesService.getIdsFavoritos().subscribe({
      next: (response) => this.favoritoIds = new Set(response.data),
      error: (err) => console.error('Error al cargar IDs de favoritos:', err)
    });
  }

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

  toggleFavorito(propiedad: Propiedad): void {
    const propiedadId = propiedad.id_propiedad;
    const esFavorito = this.favoritoIds.has(propiedadId);

    const action = esFavorito
      ? this.propiedadesService.quitarFavorito(propiedadId)
      : this.propiedadesService.agregarFavorito(propiedadId);

    action.subscribe({
      next: () => {
        if (esFavorito) this.favoritoIds.delete(propiedadId);
        else this.favoritoIds.add(propiedadId);

        this.notyf.success(esFavorito ? 'Eliminado de favoritos' : 'Agregado a favoritos');
      },
      error: () => this.notyf.error('Ocurrió un error. Intenta de nuevo.')
    });
  }

  // --------------------- TESTIMONIOS ---------------------
  cargarTestimonios(): void {
    this.testimoniosLoading = true;  
    this.testimonioService.getTestimonios().subscribe({
      next: (response) => {
        this.testimonios = response.data;
        this.testimoniosLoading = false; 
      },
      error: (err) => {
        console.error('Error al cargar testimonios:', err);
        this.notyf.error('No se pudieron cargar los testimonios.');
        this.testimoniosLoading = false; 
      }
    });
  }
  get testimoniosVisibles(): Testimonio[] {
    return this.mostrarTodasResenas ? this.testimonios : this.testimonios.slice(0, 3);
  }

  // Publicar reseña desde el hijo
  publicarResena(event: { comentario: string; puntuacion: number }): void {
  this.testimonioService.createTestimonio(event).subscribe({
    next: (nuevoTestimonio) => {
      this.testimonios.unshift(nuevoTestimonio);
      this.notyf.success('¡Gracias! Tu reseña ha sido publicada.');
    },
    error: (err) => {
      // --- ✅ LÓGICA DE ERROR MEJORADA ---
      if (err.status === 409) {
        // Error específico: El usuario ya ha publicado una reseña.
        // Muestra el mensaje exacto que envía el backend.
        this.notyf.warning(err.error.message); 
      } else {
        // Para cualquier otro tipo de error (problemas de servidor, etc.).
        this.notyf.error('Ocurrió un error inesperado al publicar tu reseña.');
      }
      console.error('Error al publicar reseña:', err);
    }
  });
}

  /**
   * Llama al servicio para actualizar una reseña existente.
   */
  actualizarResena(testimonio: Testimonio): void {
    if (!testimonio.id) return;

    const datos = { comentario: testimonio.comentario, puntuacion: testimonio.puntuacion };
    this.testimonioService.updateTestimonio(testimonio.id, datos).subscribe({
      next: (testimonioActualizado) => {
        // Reemplaza el testimonio antiguo con el actualizado en el array
        const index = this.testimonios.findIndex(t => t.id === testimonio.id);
        if (index !== -1) {
          this.testimonios[index] = testimonioActualizado;
        }
        this.notyf.success('Reseña actualizada correctamente.');
      },
      error: (err) => {
        console.error('Error al actualizar reseña:', err);
        this.notyf.error('No se pudo actualizar la reseña.');
      }
    });
  }

  /**
   * Llama al servicio para eliminar una reseña del backend.
   */
  eliminarResena(testimonio: Testimonio): void {
    if (!testimonio.id) return;

    Swal.fire({
      title: '¿Eliminar reseña?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.testimonioService.deleteTestimonio(testimonio.id!).subscribe({
          next: () => {
            this.testimonios = this.testimonios.filter(t => t.id !== testimonio.id);
            this.notyf.success('Reseña eliminada correctamente');
          },
          error: (err) => {
            console.error('Error al eliminar reseña:', err);
            this.notyf.error('No se pudo eliminar la reseña.');
          }
        });
      }
    });
  }
}
