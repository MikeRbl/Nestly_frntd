import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpLavavelService } from '../../http.service';


interface Property {
  id_propiedad: number;
  id_propietario: number;
  tipo_propiedad_id?: number;
   propietario?: {
    first_name: string;
    last_name_paternal?: string; // Opcional por si acaso
    last_name_maternal?: string; // Opcional
    avatar_url?: string;         // Opcional
    [key: string]: any;
  };
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
  selector: 'app-alquilar-casa',
  templateUrl: './alquilar-casa.component.html',
  styleUrls: ['./alquilar-casa.component.css']
})
export class AlquilarCasaComponent implements OnInit {
  property: Property | null = null;
  isLoading = true;
  errorMessage = '';
  mainImage = 'assets/default-property.jpg';
  allImages: string[] = [];
  propertyId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private httpService: HttpLavavelService
  ) {}

  ngOnInit(): void {
    this.propertyId = this.route.snapshot.paramMap.get('id');
    if (this.propertyId) {
      this.loadProperty(this.propertyId);
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
        // La estructura de la respuesta es probablemente { success: true, data: { data: { ...la propiedad... } } }
        // O podría ser { success: true, data: { ...la propiedad... } }
        // La forma más segura de manejarlo es verificar si 'data.data' existe.
        const propertyData = response?.data?.data || response?.data;

        if (response?.success && propertyData) {
          // ANTES (Incorrecto):
          // this.property = this.processProperty(response.data);
          
          // AHORA (Correcto):
          this.property = this.processProperty(propertyData);
          
          this.setupImages();
        } else {
          this.errorMessage = 'Propiedad no encontrada o formato de respuesta inesperado.';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar propiedad:', err);
        this.errorMessage = err.error?.message || 'Error al cargar la propiedad';
        this.isLoading = false;
      }
    });
  }

  private processProperty(property: any): Property {
    let fotos: string[] = [];

    if (property.fotos) {
      if (typeof property.fotos === 'string') {
        try {
          fotos = JSON.parse(property.fotos);
          if (!Array.isArray(fotos)) fotos = [property.fotos];
        } catch {
          fotos = [property.fotos];
        }
      } else if (Array.isArray(property.fotos)) {
        fotos = property.fotos;
      }
    }

    return {
      ...property,
      propietario: property.propietario || {},
      fotos,
      precio: Number(property.precio) || 0,
      deposito: Number(property.deposito) || 0,
      amueblado: !!property.amueblado,
      anualizado: !!property.anualizado,
      mascotas: !!property.mascotas,
    };
  }

  private setupImages(): void {
    if (!this.property) return;

    const baseUrl = 'http://localhost:8000';

    const buildUrl = (path: string): string => {
      if (path.startsWith('http://') || path.startsWith('https://')) return path;
      return `${baseUrl}/storage/${path}`;
    };

    let images: string[] = [];

    if (this.property.foto_principal) {
      images.push(buildUrl(this.property.foto_principal));
    }

    if (this.property.fotos) {
      if (typeof this.property.fotos === 'string') {
        try {
          const parsed = JSON.parse(this.property.fotos);
          if (Array.isArray(parsed)) {
            images = images.concat(parsed.map(buildUrl));
          } else {
            images.push(buildUrl(this.property.fotos));
          }
        } catch {
          images.push(buildUrl(this.property.fotos));
        }
      } else if (Array.isArray(this.property.fotos)) {
        images = images.concat(this.property.fotos.map(buildUrl));
      }
    }

    this.mainImage = images[0];
    this.allImages = images.length > 1 ? images.slice(1) : [images[0]];
  }

  changeMainImage(img: string): void {
    this.mainImage = img;
  }

  getTotalPrice(): number {
    return this.property ? this.property.precio * 1.1 : 0;
  }
getFullImageUrl(path?: string, defaultImg: string = 'assets/default-profile.png'): string {
  // Si la ruta no existe o está vacía, devuelve la imagen por defecto que pasaste como argumento.
  if (!path || path.trim() === '') {
    return defaultImg;
  }

  // Si la ruta ya es una URL completa, la devuelve tal cual.
  if (path.startsWith('http')) {
    return path;
  }
  
  // Para rutas relativas, construye la URL completa.
  // (Aquí deberías usar la variable de entorno que discutimos, pero para que funcione ahora lo dejamos así)
  return `http://127.0.0.1:8000/storage/${path}`;
}

  retryLoad(): void {
    if (this.propertyId) {
      this.loadProperty(this.propertyId);
    }
  }
}
