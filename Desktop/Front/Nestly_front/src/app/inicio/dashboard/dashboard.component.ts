import { Component, OnInit } from '@angular/core';
import { HttpLavavelService } from '../../http.service';
import { Router, ActivatedRoute } from '@angular/router'; // Añade ActivatedRoute
import Swal from 'sweetalert2';

interface Property {
  id_propiedad: number;
  id_propietario: number;
  tipo_propiedad_id?: number;
  titulo: string;
  descripcion?: string;
  direccion?: string;
  pais: string;
  estado_ubicacion: string;
  ciudad: string;
  colonia?: string;
  precio: number;
  habitaciones?: number;
  banos?: number;
  metros_cuadrados?: number;
  amueblado?: boolean;
  anualizado?: boolean;
  deposito?: number;
  mascotas?: boolean;
  estado_propiedad?: string;
  fotos: string[] | string;
  email?: string;
  telefono?: string;
  foto_principal?: string;
  imagen_url?: string;
  [key: string]: any; // Para propiedades adicionales
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  properties: Property[] = [];
  featuredProperties: Property[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private Shttp: HttpLavavelService,
    private router: Router,
    private activatedRoute: ActivatedRoute // Inyectado correctamente
  ) {}

  ngOnInit(): void {
    this.loadProperties();
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

  private processProperties(properties: any[]): Property[] {
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
        amueblado: Boolean(prop.amueblado),
        anualizado: Boolean(prop.anualizado),
        mascotas: Boolean(prop.mascotas),
        deposito: Number(prop.deposito) || 0
      };
    });
  }

  private getRandomProperties(properties: Property[], count: number): Property[] {
    const available = properties.filter(prop => 
      prop.estado_propiedad !== 'inactivo' && 
      ((Array.isArray(prop.fotos) && prop.fotos.length > 0) || prop.foto_principal || prop.imagen_url)
    );
    
    return [...available]
      .sort(() => 0.5 - Math.random())
      .slice(0, count);
  }

  getFirstPhoto(property: Property): string {
  // Ruta base de tu API Laravel (ajusta esto según tu configuración)
  const baseUrl = 'http://localhost:8000'; // Cambia esto por tu URL de backend

  // Función para construir la URL correcta
  const buildUrl = (path: string | undefined): string => {
    if (!path) return 'assets/default-property.jpg';
    
    // Si ya es una URL completa (http:// o https://)
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // Si es una ruta relativa que comienza con /storage
    if (path.startsWith('/storage')) {
      return `${baseUrl}${path}`;
    }
    
    // Si es solo un nombre de archivo
    if (path.startsWith('propiedades/')) {
      return `${baseUrl}/storage/${path}`;
    }
    
    // Caso por defecto (para rutas de assets)
    return path;
  };

  // Intenta con cada posible campo de imagen en orden de prioridad
  if (property.foto_principal) {
    return buildUrl(property.foto_principal);
  }
  
  if (property.imagen_url) {
    return buildUrl(property.imagen_url);
  }
  
  if (property.fotos) {
    if (typeof property.fotos === 'string') {
      return buildUrl(property.fotos);
    }
    if (Array.isArray(property.fotos) && property.fotos.length > 0) {
      return buildUrl(property.fotos[0]);
    }
  }
  
  // Imagen por defecto si no hay ninguna
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

    // Opción 1: Navegación relativa (para rutas anidadas)
    this.router.navigate(['propiedad', id], { relativeTo: this.activatedRoute.parent })
      .then(navigated => {
        if (!navigated) {
          // Opción 2: Fallback a navegación absoluta
          this.router.navigate(['/propiedad', id])
            .catch(() => {
              // Opción 3: Último recurso - recarga la página
              window.location.href = `propiedad/${id}`;
            });
        }
      });
  }

  // Otros métodos existentes
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