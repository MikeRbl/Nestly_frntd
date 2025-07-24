import { Component, OnInit } from '@angular/core';
import { PropiedadesService } from './../../services/propiedad.service';
import { Propiedad } from './../../interface/propiedades.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { NotyfService } from '../../services/notyf.service';
import Swal from 'sweetalert2';
import { AuthService } from '../../auth.service';
import { HttpLavavelService } from '../../http.service';

@Component({
  selector: 'app-propiedades-favoritos',
  templateUrl: './propiedades-favoritos.component.html',
  styleUrls: ['./propiedades-favoritos.component.css']
})
export class PropiedadesFavoritosComponent implements OnInit {

  properties: Propiedad[] = [];
  featuredProperties: Propiedad[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  favoritoIds = new Set<number>();
  isUserLoggedIn = false;

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
    if (this.isUserLoggedIn) {
      this.cargarIdsFavoritosYPropiedades();
    } else {
      this.isLoading = false;
      this.notyf.warning('Debes iniciar sesión para ver tus favoritos');
    }
  }

  // Carga los IDs de favoritos del usuario y luego carga las propiedades correspondientes
  cargarIdsFavoritosYPropiedades(): void {
    this.isLoading = true;
    this.propiedadesService.getIdsFavoritos().subscribe({
      next: (response) => {
        this.favoritoIds = new Set(response.data);
        this.loadProperties();
      },
      error: (err) => {
        console.error('Error al cargar favoritos:', err);
        this.isLoading = false;
        this.notyf.error('No se pudieron cargar tus favoritos');
      }
    });
  }

    // Carga todas las propiedades y filtra solo las que están en favoritos
  loadProperties(): void {
    this.Shttp.Service_Get('propiedades').subscribe({
      next: (response: any) => {
        let todas: Propiedad[] = [];

        if (response?.data?.data) {
          todas = this.processProperties(response.data.data);
        } else if (response?.data) {
          todas = this.processProperties(Array.isArray(response.data) ? response.data : [response.data]);
        }

        this.featuredProperties = todas.filter(p => this.favoritoIds.has(p.id_propiedad));
        this.isLoading = false;

      },
      error: (err) => {
        console.error('Error al cargar propiedades:', err);
        this.errorMessage = 'Error al cargar propiedades favoritas.';
        this.notyf.error('Ups, ocurrió un error al cargar ');
        this.isLoading = false;
      }
    });
  }

  // Método que agrega o quita una propiedad de favoritos según esté o no en la lista
  toggleFavorito(propiedad: Propiedad, event: MouseEvent): void {
  event.stopPropagation(); // Evita que el clic active otros eventos

  if (!this.isUserLoggedIn) {
    this.handlePropertyClick(propiedad.id_propiedad);
    return;
  }

  const propiedadId = propiedad.id_propiedad;
  const esFavorito = this.favoritoIds.has(propiedadId);

  if (esFavorito) {
  Swal.fire({
    title: '¿Estás seguro?',
    text: '¿Deseas quitar esta propiedad de tus favoritos?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6B7280',
    confirmButtonText: 'Sí, quitar',
    cancelButtonText: 'Cancelar',
  }).then((result) => {
    if (result.isConfirmed) {
      this.propiedadesService.quitarFavorito(propiedadId).subscribe({
        next: () => {
          this.favoritoIds.delete(propiedadId);
          this.properties = this.properties.filter(p => p.id_propiedad !== propiedadId);
          this.featuredProperties = this.featuredProperties.filter(p => p.id_propiedad !== propiedadId); // 👈 ¡Aquí!
          this.notyf.success('Eliminado de favoritos');
        },
        error: () => {
          this.notyf.error('Error al quitar favorito. Intenta de nuevo.');
        }
      });
    }
  });
}
 else {
  // Agrega la propiedad a favoritos
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

  // Controla el clic en una propiedad: si está logueado navega, si no, muestra alerta para login/registro

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

    // Limpia y normaliza la info de propiedades para facilitar su uso en el frontend
  private processProperties(properties: any[]): Propiedad[] {
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

  
  // Obtiene la primera foto válida de la propiedad con su url correcta o una default si no hay
  getFirstPhoto(property: Propiedad): string {
    const baseUrl = 'http://localhost:8000';

    const buildUrl = (path: string | undefined): string => {
      if (!path) return 'assets/default-property.jpg';
      if (path.startsWith('http')) return path;
      if (path.startsWith('/storage')) return `${baseUrl}${path}`;
      return `${baseUrl}/storage/${path}`;
    };

    if (property.imagen_principal) return buildUrl(property.imagen_principal);
    if (property.fotos?.length) return buildUrl(property.fotos[0]);
    return 'assets/default-property.jpg';
  }

  formatPrice(price: number | undefined, anualizado: boolean | undefined = false): string {
    const precio = price || 0;
    return `$${precio.toLocaleString('es-MX')}${anualizado ? '/año' : '/mes'}`;
  }

  navigateToProperty(id: number): void {
    if (!id) return;
    this.router.navigate(['propiedad', id], { relativeTo: this.activatedRoute.parent })
      .then(navigated => {
        if (!navigated) {
          this.router.navigate(['/propiedad', id])
            .catch(() => window.location.href = `propiedad/${id}`);
        }
      });
  }
  
  // Devuelve array de strings para mostrar estrellas full, half o empty según calificación numérica
  getStarArray(rating: string | null | undefined): string[] {
    const stars: string[] = [];
    const numericRating = parseFloat(rating || '0');
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
