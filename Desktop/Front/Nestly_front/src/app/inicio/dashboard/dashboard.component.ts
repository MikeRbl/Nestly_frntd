import { Component, OnInit } from '@angular/core';
import { HttpLavavelService } from '../../http.service';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { Propiedad } from '../../interface/propiedades.interface';
import { AuthService } from '../../auth.service';
import { PropiedadesService } from '../../services/propiedad.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Se usa Propiedad en lugar de Property
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
    private propiedadesService: PropiedadesService
  ) {}

  ngOnInit(): void {
    this.isUserLoggedIn = this.authService.isLoggedIn();
    this.loadProperties();
    if (this.isUserLoggedIn) {
      this.cargarIdsFavoritos();
    }
  }
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
        // Creamos un Set con los IDs para una comprobación muy rápida
        this.favoritoIds = new Set(response.data);
      },
      error: (err) => console.error('Error al cargar IDs de favoritos en Dashboard:', err)
    });
  }
toggleFavorito(propiedad: Propiedad, event: MouseEvent): void {
  event.stopPropagation(); 
  if (!this.isUserLoggedIn) {
    console.warn('Usuario no autenticado, redirigiendo al detalle de la propiedad');
    this.handlePropertyClick(propiedad.id_propiedad); 
    return;
  }

  const propiedadId = propiedad.id_propiedad;
  const esFavorito = this.favoritoIds.has(propiedadId);

  if (esFavorito) {
    console.log(`Quitando de favoritos propiedad ID: ${propiedadId}`);
    this.favoritoIds.delete(propiedadId); // Actualización optimista de la UI
    this.propiedadesService.quitarFavorito(propiedadId).subscribe({
      next: () => console.log(`✅ Propiedad ${propiedadId} quitada de favoritos correctamente.`),
      error: (error) => {
        console.error(`❌ Error al quitar favorito (ID: ${propiedadId})`, error);
        this.favoritoIds.add(propiedadId); // Revertimos el cambio
      }
    });
  } else {
    console.log(`Agregando a favoritos propiedad ID: ${propiedadId}`);
    this.favoritoIds.add(propiedadId); // Actualización optimista de la UI
    this.propiedadesService.agregarFavorito(propiedadId).subscribe({
      next: () => console.log(`✅ Propiedad ${propiedadId} agregada a favoritos correctamente.`),
      error: (error) => {
        console.error(`❌ Error al agregar favorito (ID: ${propiedadId})`, error);
        this.favoritoIds.delete(propiedadId); // Revertimos el cambio
      }
    });
  }
}

  loadProperties(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.Shttp.Service_Get('propiedades').subscribe({
      next: (response: any) => {
        if (response?.data?.data) {
          this.properties = this.processProperties(response.data.data);
          this.featuredProperties = this.getRandomProperties(this.properties, 3);
        } else if (response?.data) {
          this.properties = this.processProperties(Array.isArray(response.data) ? response.data : [response.data]);
          this.featuredProperties = this.getRandomProperties(this.properties, 3);
        } else {
          this.errorMessage = 'No se encontraron propiedades disponibles';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar propiedades:', err);
        this.errorMessage = 'Error al cargar las propiedades. Intenta nuevamente.';
        this.isLoading = false;
      }
    });
  }
  
  // El tipo de retorno ahora es Propiedad[]
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

  // Los tipos en los parámetros y el retorno ahora son Propiedad
  private getRandomProperties(properties: Propiedad[], count: number): Propiedad[] {
  const available = properties.filter(prop =>
    // Usamos el campo 'estado_propiedad' que SÍ existe en tu interface
    prop.estado_propiedad !== 'inactivo' &&

    // Y aquí comprobamos si tiene imagen con los nombres 
    (prop.imagen_principal || (Array.isArray(prop.fotos) && prop.fotos.length > 0))
  );

  return [...available]
    .sort(() => 0.5 - Math.random())
    .slice(0, count);
}

  // El tipo del parámetro es Propiedad
  // Pega esta función corregida en tu dashboard.component.ts,
// reemplazando la versión anterior de getFirstPhoto.

getFirstPhoto(property: Propiedad): string {
    const baseUrl = 'http://localhost:8000';

    const buildUrl = (path: string | undefined): string => {
        if (!path) {
            return 'assets/default-property.jpg'; // Imagen por defecto
        }
        // Si ya es una URL completa
        if (path.startsWith('http')) {
            return path;
        }
        // Si es una ruta de storage, pero sin el http
        if (path.startsWith('/storage')) {
            return `${baseUrl}${path}`;
        }
        // Para rutas relativas como "propiedades/imagen.jpg"
        return `${baseUrl}/storage/${path}`;
    };

    // 1. Busca 'imagen_principal', que SÍ existe en tu interface.
    if (property.imagen_principal) {
        return buildUrl(property.imagen_principal);
    }

    // 2. Si no la encuentra, busca en el arreglo 'fotos'.
    if (property.fotos && Array.isArray(property.fotos) && property.fotos.length > 0) {
        return buildUrl(property.fotos[0]);
    }

    // 3. Si no hay ninguna imagen, usa la de por defecto.
    return 'assets/default-property.jpg';
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