import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpLavavelService } from '../../http.service';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { Propiedad } from '../../interface/propiedades.interface';
import { AuthService } from '../../auth.service';
import { PropiedadesService } from '../../services/propiedad.service';
import { NotyfService } from '../../services/notyf.service';  

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  
  properties: Propiedad[] = [];
  featuredProperties: Propiedad[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  favoritoIds = new Set<number>();
  isUserLoggedIn = false;

  photoIndexes: Map<number, number> = new Map(); // índice de foto actual por propiedad
  photoIntervalId: any;

  constructor(
    private Shttp: HttpLavavelService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private propiedadesService: PropiedadesService,
    private notyf: NotyfService
  ) {}

  ngOnInit(): void {
    this.isUserLoggedIn = this.authService.isLoggedIn();
    this.loadProperties();
    if (this.isUserLoggedIn) {
      this.cargarIdsFavoritos();
    }
    this.startPhotoCarousel();
  }

  ngOnDestroy(): void {
    if (this.photoIntervalId) {
      clearInterval(this.photoIntervalId);
    }
  }

  loadProperties(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.Shttp.Service_Get('propiedades').subscribe({
      next: (response: any) => {
        if (response?.data?.data) {
          this.properties = this.processProperties(response.data.data);
          this.featuredProperties = this.getRandomProperties(this.properties, 4);
          this.featuredProperties.forEach(p => this.photoIndexes.set(p.id_propiedad, 0));
        } else if (response?.data) {
          this.properties = this.processProperties(Array.isArray(response.data) ? response.data : [response.data]);
          this.featuredProperties = this.getRandomProperties(this.properties, 4);
          this.featuredProperties.forEach(p => this.photoIndexes.set(p.id_propiedad, 0));
        } else {
          this.errorMessage = 'No se encontraron propiedades disponibles';
          this.notyf.warning('No hay propiedades disponibles');
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar propiedades:', err);
        this.errorMessage = 'Error al cargar las propiedades. Intenta nuevamente.';
        this.isLoading = false;
        this.notyf.error('Error al cargar propiedades');
      }
    });
  }

  processProperties(properties: any[]): Propiedad[] {
    return properties.map(prop => {
      let fotos: string[] = [];
      if (prop.fotos) {
        if (typeof prop.fotos === 'string') {
          try {
            fotos = JSON.parse(prop.fotos);
            if (!Array.isArray(fotos)) fotos = [prop.fotos];
          } catch {
            fotos = [prop.fotos];
          }
        } else if (Array.isArray(prop.fotos)) {
          fotos = prop.fotos;
        }
      }
      return {
        ...prop,
        fotos: fotos,
        precio: Number(prop.precio) || 0,
        habitaciones: Number(prop.habitaciones) || 0,
        banos: Number(prop.banos) || 0,
        metros_cuadrados: Number(prop.metros_cuadrados) || 0,
        amueblado: !!prop.amueblado,
        anualizado: !!prop.anualizado,
        mascotas: prop.mascotas === 'si' || prop.mascotas === true,
        deposito: Number(prop.deposito) || 0
      };
    });
  }

  getRandomProperties(properties: Propiedad[], count: number): Propiedad[] {
    const available = properties.filter(prop =>
      prop.estado_propiedad !== 'inactivo' &&
      (prop.imagen_principal || (Array.isArray(prop.fotos) && prop.fotos.length > 0))
    );
    return [...available]
      .sort(() => 0.5 - Math.random())
      .slice(0, count);
  }

  getFirstPhoto(property: Propiedad): string {
    const baseUrl = 'http://localhost:8000';

    const buildUrl = (path: string | undefined): string => {
      if (!path) return 'assets/default-property.jpg';
      if (path.startsWith('http')) return path;
      if (path.startsWith('/storage')) return `${baseUrl}${path}`;
      return `${baseUrl}/storage/${path}`;
    };

    if (property.imagen_principal) {
      return buildUrl(property.imagen_principal);
    }

    if (property.fotos && Array.isArray(property.fotos) && property.fotos.length > 0) {
      return buildUrl(property.fotos[0]);
    }

    return 'assets/default-property.jpg';
  }

  // Nuevo método para carrusel fotos
  startPhotoCarousel() {
    this.photoIntervalId = setInterval(() => {
      this.featuredProperties.forEach(prop => {
        const currentIndex = this.photoIndexes.get(prop.id_propiedad) || 0;
        const photosCount = (prop.fotos && prop.fotos.length > 0) ? prop.fotos.length : 1;
        const nextIndex = (currentIndex + 1) % photosCount;
        this.photoIndexes.set(prop.id_propiedad, nextIndex);
      });
    }, 5000);
  }

  getCurrentPhoto(property: Propiedad): string {
    const index = this.photoIndexes.get(property.id_propiedad) || 0;
    if (property.fotos && property.fotos.length > 0) {
      return this.buildUrl(property.fotos[index]);
    }
    return this.getFirstPhoto(property);
  }

  buildUrl(path: string | undefined): string {
    const baseUrl = 'http://localhost:8000';
    if (!path) return 'assets/default-property.jpg';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/storage')) return `${baseUrl}${path}`;
    return `${baseUrl}/storage/${path}`;
  }

  prevPhoto(property: Propiedad, event: MouseEvent) {
    event.stopPropagation();
    const currentIndex = this.photoIndexes.get(property.id_propiedad) || 0;
    const photosCount = (property.fotos && property.fotos.length > 0) ? property.fotos.length : 1;
    const prevIndex = (currentIndex - 1 + photosCount) % photosCount;
    this.photoIndexes.set(property.id_propiedad, prevIndex);
  }

  nextPhoto(property: Propiedad, event: MouseEvent) {
    event.stopPropagation();
    const currentIndex = this.photoIndexes.get(property.id_propiedad) || 0;
    const photosCount = (property.fotos && property.fotos.length > 0) ? property.fotos.length : 1;
    const nextIndex = (currentIndex + 1) % photosCount;
    this.photoIndexes.set(property.id_propiedad, nextIndex);
  }

  // Los demás métodos existentes sin cambio:
  handlePropertyClick(id: number): void {
    if (this.authService.isLoggedIn()) {
      this.navigateToProperty(id);
    } else {
      Swal.fire({
        title: '¡Inicia sesión o crea una cuenta!',
        text: 'Necesitas una cuenta para ver los detalles de la propiedad y contactar al propietario.',
        icon: 'info',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Iniciar Sesión',
        denyButtonText: 'Crear Cuenta',
        cancelButtonText: 'Más tarde',
        confirmButtonColor: '#3B82F6',
        denyButtonColor: '#10B981',
        cancelButtonColor: '#6B7280',
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']);
        } else if (result.isDenied) {
          this.router.navigate(['/register']);
        }
      });
    }
  }

  cargarIdsFavoritos(): void {
    this.propiedadesService.getIdsFavoritos().subscribe({
      next: (response) => {
        this.favoritoIds = new Set(response.data);
      },
      error: (err) => console.error('Error al cargar IDs de favoritos en Dashboard:', err)
    });
  }

  toggleFavorito(propiedad: Propiedad, event: MouseEvent): void {
    event.stopPropagation();
    if (!this.isUserLoggedIn) {
      this.handlePropertyClick(propiedad.id_propiedad);
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
        error: () => {
          this.notyf.error('Error al quitar favorito. Intenta de nuevo.');
        }
      });
    } else {
      this.propiedadesService.agregarFavorito(propiedadId).subscribe({
        next: () => {
          this.favoritoIds.add(propiedadId);
          this.notyf.success('Agregado a favoritos');
        },
        error: () => {
          this.notyf.error('Error al agregar favorito. Intenta de nuevo.');
        }
      });
    }
  }

  formatPrice(price: number | undefined, anualizado: boolean | undefined = false): string {
    const precio = price || 0;
    return `$${precio.toLocaleString('es-MX')}${anualizado ? '/año' : '/mes'}`;
  }

  navigateToProperty(id: number): void {
    if (!id) {
      console.error('ID de propiedad no válido');
      return;
    }
    this.router.navigate(['propiedad', id], { relativeTo: this.activatedRoute.parent })
      .then(navigated => {
        if (!navigated) {
          this.router.navigate(['/propiedad', id])
            .catch(() => {
              window.location.href = `propiedad/${id}`;
            });
        }
      });
  }
  
  public getStarArray(rating: string | null | undefined): string[] {
    const stars: string[] = [];
    if (!rating) {
        return Array(5).fill('empty');
    }
    const numericRating = parseFloat(rating);
    if (isNaN(numericRating)) {
        return Array(5).fill('empty');
    }
    const roundedRating = Math.round(numericRating * 2) / 2;
    for (let i = 1; i <= 5; i++) {
        if (roundedRating >= i) {
            stars.push('full');
        } else if (roundedRating >= i - 0.5) {
            stars.push('half');
        } else {
            stars.push('empty');
        }
    }
    return stars;
  }
  
  handleNavigation(route: string): void {
    this.router.navigate([route]);
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
