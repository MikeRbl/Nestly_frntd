import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpLavavelService } from '../../http.service';

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
}

@Component({
  selector: 'app-alquilar-casa',
  templateUrl: './alquilar-casa.component.html',
  styleUrls: ['./alquilar-casa.component.css']
})
export class AlquilarCasaComponent implements OnInit {
  property: Property | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';
  mainImage: string = 'assets/default-property.jpg';
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
        if (response?.success && response?.data) {
          this.property = this.processProperty(response.data);
          this.setupImages();
        } else {
          this.errorMessage = 'Propiedad no encontrada';
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

  retryLoad(): void {
    if (this.propertyId) {
      this.loadProperty(this.propertyId);
    }
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
      fotos: fotos,
      precio: Number(property.precio) || 0,
      deposito: Number(property.deposito) || 0,
      amueblado: Boolean(property.amueblado),
      anualizado: Boolean(property.anualizado),
      mascotas: Boolean(property.mascotas)
    };
  }

private setupImages(): void {
  if (!this.property) {
    return;
  }

  const baseUrl = 'http://localhost:8000'; // Misma URL de tu backend

  // Función para construir URLs correctas
  const buildUrl = (path: string): string => {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `${baseUrl}/storage/${path}`;
  };

  // Procesar todas las imágenes
  let images: string[] = [];
  
  // 1. Priorizar foto_principal
  if (this.property.foto_principal) {
    images.push(buildUrl(this.property.foto_principal));
  }

  // 2. Procesar el array de fotos
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

  

  // Asignar imágenes
  this.mainImage = images[0];
  this.allImages = images.length > 1 ? images.slice(1) : [images[0]];
}

  private getImagesArray(): string[] {
    if (!this.property) return [];
    
    if (Array.isArray(this.property.fotos)) {
      return this.property.fotos.length > 0 ? this.property.fotos : ['assets/default-property.jpg'];
    }
    
    if (typeof this.property.fotos === 'string') {
      return [this.property.fotos];
    }
    
    return ['assets/default-property.jpg'];
  }

  changeMainImage(img: string): void {
    this.mainImage = img;
  }

  getTotalPrice(): number {
    return this.property ? this.property.precio * 1.1 : 0;
  }
}