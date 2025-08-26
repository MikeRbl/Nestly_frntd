import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PropiedadesService } from './propiedad.service'; // Asegúrate que la ruta sea correcta
import { NotyfService } from './notyf.service';

@Injectable({
  providedIn: 'root'
})
export class FavoritosService {
  // --- Estado para el conjunto completo de IDs de favoritos ---
  private favoritoIdsSubject = new BehaviorSubject<Set<number>>(new Set());
  public favoritoIds$ = this.favoritoIdsSubject.asObservable();

  // --- Estado para la notificación de "nuevos" favoritos ---
  private newFavoritesCountSubject = new BehaviorSubject<number>(0);
  public newFavoritesCount$ = this.newFavoritesCountSubject.asObservable();

  constructor(
    private propiedadesService: PropiedadesService,
    private notyf: NotyfService
  ) {}

  // Carga los favoritos iniciales desde el backend y actualiza el estado
  loadInitialFavoritos(): void {
    this.propiedadesService.getIdsFavoritos().subscribe({
      next: (response) => {
        this.favoritoIdsSubject.next(new Set(response.data));
      },
      error: (err) => console.error('Error al cargar los favoritos iniciales', err)
    });
  }

  // Se llama desde la navbar para limpiar la notificación
  markFavoritesAsSeen(): void {
    this.newFavoritesCountSubject.next(0);
  }

  // Método central para alternar un favorito desde cualquier componente
  toggleFavorito(propiedadId: number): void {
    const currentSet = this.favoritoIdsSubject.getValue();
    const esFavorito = currentSet.has(propiedadId);
    
    const action = esFavorito 
      ? this.propiedadesService.quitarFavorito(propiedadId) 
      : this.propiedadesService.agregarFavorito(propiedadId);

    action.subscribe({
      next: () => {
        if (esFavorito) {
          currentSet.delete(propiedadId);
        } else {
          currentSet.add(propiedadId);
          // Incrementa el contador de "nuevos" favoritos solo al añadir
          this.newFavoritesCountSubject.next(this.newFavoritesCountSubject.value + 1);
        }
        // Notifica a todos los suscriptores del conjunto actualizado
        this.favoritoIdsSubject.next(new Set(currentSet)); 
        this.notyf.success(esFavorito ? 'Eliminado de favoritos' : 'Agregado a favoritos');
      },
      error: () => this.notyf.error('Ocurrió un error. Intenta de nuevo.')
    });
  }
}
