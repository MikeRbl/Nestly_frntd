import { Component, Input, Output, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { Propiedad } from '../../interface/propiedades.interface';

@Component({
  selector: 'app-propiedades-destacadas',
  templateUrl: './propiedades-destacadas.component.html',
  styleUrls: ['./propiedades-destacadas.component.css']
})
export class PropiedadesDestacadasComponent implements OnInit, OnDestroy {
  // --- ENTRADAS: Recibe datos del componente padre (Dashboard) ---
  @Input() properties: Propiedad[] = [];
  @Input() isLoading: boolean = true;
  @Input() isUserLoggedIn: boolean = false;
  @Input() favoritoIds = new Set<number>();

  // --- SALIDAS: Emite eventos al componente padre ---
  @Output() propertyClick = new EventEmitter<number>();
  @Output() toggleFavoritoEvent = new EventEmitter<Propiedad>();

  // Lógica del carrusel de fotos
  photoIndexes = new Map<number, number>();
  photoIntervalId: any;

  constructor() {}

  ngOnInit(): void {
    this.properties.forEach(p => this.photoIndexes.set(p.id_propiedad, 0));
    this.startPhotoCarousel();
  }

  ngOnDestroy(): void {
    this.pausePhotoCarousel();
  }

  // --- Lógica del carrusel y utilidades ---
  startPhotoCarousel(): void {
    this.photoIntervalId = setInterval(() => {
      this.properties.forEach(prop => {
        if (prop.fotos && prop.fotos.length > 1) {
          const currentIndex = this.photoIndexes.get(prop.id_propiedad) || 0;
          const nextIndex = (currentIndex + 1) % prop.fotos.length;
          this.photoIndexes.set(prop.id_propiedad, nextIndex);
        }
      });
    }, 5000);
  }

  pausePhotoCarousel(): void {
    if (this.photoIntervalId) {
      clearInterval(this.photoIntervalId);
    }
  }

  prevPhoto(property: Propiedad, event: MouseEvent): void {
    event.stopPropagation();
    const currentIndex = this.photoIndexes.get(property.id_propiedad) || 0;
    const photosCount = property.fotos?.length || 1;
    const prevIndex = (currentIndex - 1 + photosCount) % photosCount;
    this.photoIndexes.set(property.id_propiedad, prevIndex);
  }

  nextPhoto(property: Propiedad, event: MouseEvent): void {
    event.stopPropagation();
    const currentIndex = this.photoIndexes.get(property.id_propiedad) || 0;
    const photosCount = property.fotos?.length || 1;
    const nextIndex = (currentIndex + 1) % photosCount;
    this.photoIndexes.set(property.id_propiedad, nextIndex);
  }

  // Notifica al componente padre cuando se hace clic en una propiedad
  handlePropertyClick(id: number): void {
    this.propertyClick.emit(id);
  }

  // Notifica al componente padre para manejar el favorito
  toggleFavorito(propiedad: Propiedad, event: MouseEvent): void {
    this.toggleFavoritoEvent.emit(propiedad);
  }

  buildUrl(path: string | undefined): string {
    const baseUrl = 'http://127.0.0.1:8000'; // O tu URL de entorno
    if (!path) return 'assets/default-property.jpg';
    if (path.startsWith('http')) return path;
    return `${baseUrl}/storage/${path}`;
  }

  getFirstPhoto(property: Propiedad): string {
    if (property.imagen_principal) return this.buildUrl(property.imagen_principal);
    if (property.fotos && Array.isArray(property.fotos) && property.fotos.length > 0) {
      return this.buildUrl(property.fotos[0]);
    }
    return 'assets/default-property.jpg';
  }

  formatPrice(precio: number, anualizado: boolean): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0
  }).format(precio) + (anualizado ? ' /año' : ' /mes');
}

}
