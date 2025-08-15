import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { HttpLavavelService } from '../../http.service';
import { ResenaService } from '../../services/resena.service';
import { AuthService } from '../../auth.service';
import { NotyfService } from '../../services/notyf.service';
import { PropiedadesService } from '../../services/propiedad.service';
import { Propiedad } from '../../interface/propiedades.interface';

@Component({
  selector: 'app-alquilar-casa',
  templateUrl: './alquilar-casa.component.html',
  styleUrls: ['./alquilar-casa.component.css']
})
export class AlquilarCasaComponent implements OnInit {
  property: Propiedad | null = null;
  isLoading = true;
  errorMessage = '';
  propertyId: string | null = null;
  allImages: string[] = [];
  mainImage = 'assets/default-property.jpg';
  resenas: any[] = [];
  isLoadingResenas = true;
  usuarioActual: any = null;
  favoritoIds = new Set<number>();
  isUserLoggedIn = false;

  // Propiedades para gestionar la reserva
  estaRentada = false;
  proximaFechaDisponible: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private httpService: HttpLavavelService,
    private router: Router,
    private resenaService: ResenaService,
    private authService: AuthService,
    private notyf: NotyfService,
    private propiedadesService: PropiedadesService
  ) {}

  ngOnInit(): void {
    this.usuarioActual = this.authService.obtenerUsuarioActualId();
    this.propertyId = this.route.snapshot.paramMap.get('id');
    this.isUserLoggedIn = this.authService.isLoggedIn();
    if (this.isUserLoggedIn) {
      this.cargarIdsFavoritos();
    }
    if (this.propertyId) {
      this.loadProperty(this.propertyId);
      this.loadResenas(Number(this.propertyId));
    } else {
      this.errorMessage = 'ID de propiedad no proporcionado';
      this.isLoading = false;
    }
  }

  loadProperty(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.httpService.Service_Get(`propiedades/${id}`).subscribe({
      next: (response: any) => {
        if (response?.success && response?.data) {
          this.property = this.processProperty(response.data);
          this.setupImages();
          this.verificarEstadoRenta();
        } else {
          this.errorMessage = 'Propiedad no encontrada.';
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar la propiedad.';
        this.isLoading = false;
      }
    });
  }

  verificarEstadoRenta(): void {
    // Usamos 'rentas', el nombre de la relación en el backend
    if (this.property && Array.isArray(this.property.rentas) && this.property.rentas.length > 0) {
      const ultimaRenta = this.property.rentas[this.property.rentas.length - 1];
      const fechaFin = new Date(ultimaRenta.fecha_fin + 'T00:00:00');

      if (fechaFin >= new Date()) { // Si la renta está activa hoy o en el futuro
        this.estaRentada = true;
        const proximaFecha = new Date(fechaFin);
        proximaFecha.setDate(proximaFecha.getDate() + 1); // Disponible un día después
        this.proximaFechaDisponible = proximaFecha.toISOString().split('T')[0];
      }
    }
  }

  navegarAPago(): void {
    if (this.property) {
      this.router.navigate(['/principal/pagos', this.property.id_propiedad], {
        state: { proximaFecha: this.proximaFechaDisponible }
      });
    } else {
      this.notyf.error('No se pudo encontrar la información de la propiedad para rentar.');
    }
  }
  
  cargarIdsFavoritos(): void {
    this.propiedadesService.getIdsFavoritos().subscribe({
      next: (response) => {
        this.favoritoIds = new Set(response.data);
      },
      error: (err) => console.error('Error al cargar IDs de favoritos:', err)
    });
  }

  toggleFavorito(propiedad: Propiedad, event?: MouseEvent): void {
    event?.stopPropagation();
    if (!this.isUserLoggedIn) {
      Swal.fire({
        title: '¡Inicia sesión para guardar!',
        text: 'Necesitas una cuenta para añadir esta propiedad a tus favoritos.',
        icon: 'info',
        showDenyButton: true,
        confirmButtonText: 'Iniciar Sesión',
        denyButtonText: 'Crear Cuenta',
      }).then((result) => {
        if (result.isConfirmed) this.router.navigate(['/login']);
        else if (result.isDenied) this.router.navigate(['/register']);
      });
      return;
    }

    const propiedadId = propiedad.id_propiedad;
    const esFavorito = this.favoritoIds.has(propiedadId);

    if (esFavorito) {
      this.propiedadesService.quitarFavorito(propiedadId).subscribe({
        next: () => {
          this.favoritoIds.delete(propiedadId);
          this.notyf.success('Eliminado de favoritos');
        },
        error: () => this.notyf.error('Error al quitar favorito.')
      });
    } else {
      this.propiedadesService.agregarFavorito(propiedadId).subscribe({
        next: () => {
          this.favoritoIds.add(propiedadId);
          this.notyf.success('Agregado a favoritos');
        },
        error: () => this.notyf.error('Error al agregar favorito.')
      });
    }
  }

  loadResenas(propiedadId: number): void {
    this.isLoadingResenas = true;
    this.resenaService.getResenas(propiedadId).subscribe({
      next: (response) => {
        this.resenas = response.data.map((resena: any) => ({
          ...resena,
          likedByCurrentUser: resena.likedByCurrentUser ?? false
        }));
        this.isLoadingResenas = false;
      },
      error: (err) => {
        console.error('Error al cargar resenas:', err);
        this.notyf.error('No se pudieron cargar las reseñas.');
        this.isLoadingResenas = false;
      }
    });
  }

  onCrearResena(formData: { puntuacion: number, comentario: string }): void {
    if (!this.property) return;
    this.resenaService.createResena(this.property.id_propiedad, formData).subscribe({
      next: (resenaCreada) => {
        this.resenas.unshift(resenaCreada);
        this.notyf.success('Tu reseña ha sido publicada.');
      },
      error: (err) => {
        this.notyf.error(err.error.message || 'No se pudo crear la reseña');
      }
    });
  }

  onEliminarResena(resenaId: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Sí, ¡eliminar!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.resenaService.deleteResena(resenaId).subscribe({
          next: () => {
            this.resenas = this.resenas.filter(r => r.id !== resenaId);
            this.notyf.success('La reseña ha sido eliminada.');
          },
          error: (err) => {
            this.notyf.error('No se pudo eliminar la reseña.');
          }
        });
      }
    });
  }

  onToggleVoto(resenaId: number): void {
    this.resenaService.toggleVoto(resenaId).subscribe({
      next: (response) => {
        const resena = this.resenas.find(r => r.id === resenaId);
        if (resena) {
          resena.votos_count = response.votos_count;
          resena.likedByCurrentUser = !resena.likedByCurrentUser;
        }
      },
      error: () => {
        this.notyf.error('No se pudo procesar tu voto.');
      }
    });
  }

  onEditarResena(resenaId: number): void {
    // Tu lógica para editar reseñas
  }

  get reviewCount(): number {
    return this.resenas.length;
  }
  
  get averageRating(): number {
    if (this.reviewCount === 0) return 0;
    const totalPuntuacion = this.resenas.reduce((sum, resena) => sum + resena.puntuacion, 0);
    return Math.round((totalPuntuacion / this.reviewCount) * 10) / 10;
  }

  private processProperty(propertyData: any): Propiedad {
    return propertyData as Propiedad;
  }

  private setupImages(): void {
    if (!this.property || !this.property.fotos) return;
    const baseUrl = 'http://127.0.0.1:8000';
    const buildUrl = (path: string) => path.startsWith('http') ? path : `${baseUrl}/storage/${path}`;
    
    let images: string[] = [];
    if (this.property.imagen_principal) {
      images.push(buildUrl(this.property.imagen_principal));
    }
    if (Array.isArray(this.property.fotos)) {
      images = images.concat(this.property.fotos.map(buildUrl));
    }
    
    this.allImages = [...new Set(images)];
    this.mainImage = this.allImages[0] || 'assets/default-property.jpg';
  }

  changeMainImage(img: string): void {
    this.mainImage = img;
  }

  getTotalPrice(): number {
    return this.property ? this.property.precio * 1.1 : 0;
  }

  getFullImageUrl(path?: string, defaultImg: string = 'assets/default-profile.png'): string {
    if (!path || path.trim() === '') return defaultImg;
    if (path.startsWith('http')) return path;
    return `http://127.0.0.1:8000/storage/${path}`;
  }

  retryLoad(): void {
    if (this.propertyId) {
      this.loadProperty(this.propertyId);
    }
  }

  goBack() {
    window.history.back();
  }
}