import { Component, OnInit } from '@angular/core';
import { HttpLavavelService } from '../../http.service';
import { Router } from '@angular/router';
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

  constructor(private Shttp: HttpLavavelService, private router: Router) {}

  ngOnInit(): void {
    this.loadProperties();
  }

  loadProperties(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.Shttp.Service_Get('propiedades').subscribe({
      next: (response: any) => {
        console.log('Respuesta completa:', response);
        
        // Versión mejorada para manejar diferentes estructuras de respuesta
        let propertiesData: any[] = [];
        
        if (response?.data?.data) {
          propertiesData = response.data.data; // Para Laravel paginado
        } else if (response?.data) {
          propertiesData = Array.isArray(response.data) ? response.data : [response.data];
        } else if (Array.isArray(response)) {
          propertiesData = response;
        }
        
        if (propertiesData.length > 0) {
          this.properties = this.processProperties(propertiesData);
          this.featuredProperties = this.getRandomProperties(this.properties, 3);
          console.log('Propiedades cargadas:', this.properties);
          console.log('Propiedades destacadas:', this.featuredProperties);
        } else {
          this.errorMessage = 'No se encontraron propiedades disponibles';
          console.warn('No se encontraron propiedades en la respuesta');
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar propiedades:', err);
        this.errorMessage = err.error?.message || 'Error al cargar las propiedades. Por favor intenta nuevamente.';
        this.isLoading = false;
      }
    });
  }

private processProperties(properties: any[]): Property[] {
  return properties.map(prop => {
    // Procesamiento más flexible de fotos
    let fotos: string[] = [];
    
    // Si hay foto_principal o imagen_url, las usamos como fotos
    if (prop.foto_principal) {
      fotos = [prop.foto_principal];
    } else if (prop.imagen_url) {
      fotos = [prop.imagen_url];
    } else if (prop.fotos) {
      // Procesamiento de campo fotos
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
      id_propiedad: prop.id_propiedad || 0,
      id_propietario: prop.id_propietario || 0,
      titulo: prop.titulo || 'Propiedad sin título',
      pais: prop.pais || 'México',
      estado_ubicacion: prop.estado_ubicacion || 'Guanajuato',
      ciudad: prop.ciudad || 'Ciudad no especificada',
      colonia: prop.colonia || '',
      precio: Number(prop.precio) || 0,
      habitaciones: Number(prop.habitaciones) || 0,
      banos: Number(prop.banos) || 0,
      metros_cuadrados: Number(prop.metros_cuadrados) || 0,
      anualizado: Boolean(prop.anualizado),
      fotos: fotos,
      // Campos adicionales que podrían contener imágenes
      foto_principal: prop.foto_principal,
      imagen_url: prop.imagen_url,
      // Mantener todas las propiedades originales
      ...prop
    };
  });
}

private getRandomProperties(properties: Property[], count: number): Property[] {
  // Filtro más flexible para propiedades disponibles
  const available = properties.filter(prop => {
    // Verificar si tiene alguna imagen (fotos, foto_principal o imagen_url)
    const hasAnyPhoto = 
      (Array.isArray(prop.fotos) && prop.fotos.length > 0) ||
      (typeof prop.fotos === 'string' && prop.fotos.trim() !== '') ||
      (prop.foto_principal && prop.foto_principal.trim() !== '') ||
      (prop.imagen_url && prop.imagen_url.trim() !== '');

    // Verificar estado (si no existe el campo, asumir que está activo)
    const isActive = !prop.estado_propiedad || 
                    prop.estado_propiedad.toString().toLowerCase() !== 'inactivo';
    
    return hasAnyPhoto && isActive;
  });
  
  if (available.length === 0) {
    console.warn('Propiedades disponibles:', properties);
    console.warn('No hay propiedades que cumplan los criterios. Mostrando todas con imagen por defecto...');
    // Si no hay ninguna, mostramos las primeras con imagen por defecto
    return properties.slice(0, Math.min(count, properties.length));
  }
  
  // Mezclar y seleccionar propiedades aleatorias
  return [...available]
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.min(count, available.length));
}

getFirstPhoto(property: Property): string {
  // Ruta base de tu API Laravel (ajusta esto según tu configuración)
  const baseUrl = 'http://localhost:8000'; // o tu URL de producción
  
  // Función para formatear la URL
  const formatUrl = (url: string | undefined): string => {
    if (!url) return 'assets/dashboard/default-property.jpg';
    
    // Si ya es una URL completa, no hacer cambios
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Si empieza con /, asumir que es desde la raíz del backend
    if (url.startsWith('/')) {
      return `${baseUrl}${url}`;
    }
    
    // Si es un nombre de archivo simple, asumir que está en el directorio de uploads
    return `${baseUrl}/storage/${url}`;
  };

  // Intentar con cada posible campo de imagen
  if (property.foto_principal) {
    return formatUrl(property.foto_principal);
  }
  
  if (property.imagen_url) {
    return formatUrl(property.imagen_url);
  }
  
  if (property.fotos) {
    if (typeof property.fotos === 'string') {
      return formatUrl(property.fotos);
    }
    if (Array.isArray(property.fotos) && property.fotos.length > 0) {
      return formatUrl(property.fotos[0]);
    }
  }
  
  // Imagen por defecto si no hay ninguna
  return 'assets/dashboard/default-property.jpg';
}

  formatPrice(price: number | undefined, anualizado: boolean | undefined = false): string {
    const precio = Number(price) || 0;
    return `$${precio.toLocaleString('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}${anualizado ? '/año' : '/mes'}`;
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