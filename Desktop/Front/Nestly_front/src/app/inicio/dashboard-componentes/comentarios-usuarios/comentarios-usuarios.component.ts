import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Testimonio } from '../../../interface/testimonio.interface';

@Component({
  selector: 'app-comentarios-usuarios',
  templateUrl: './comentarios-usuarios.component.html',
  styleUrls: ['./comentarios-usuarios.component.css']
})
export class ComentariosUsuariosComponent {
  @Input() testimonios: Testimonio[] = [];
  @Input() isUserLoggedIn = false;
  @Input() currentUser: any = null;

  // Event Emitters
  @Output() publicarResenaEvent = new EventEmitter<{ comentario: string; puntuacion: number }>();
  @Output() actualizarResenaEvent = new EventEmitter<Testimonio>();
  @Output() eliminarResenaEvent = new EventEmitter<Testimonio>();

  @Input() isLoading = false;

  // State for the modal
  showReviewModal = false;
  modoEdicion = false;
  
  // FIX: By using an intersection type, we tell TypeScript that 'puntuacion' will always be a number,
  // even if other properties of Testimonio are optional. This resolves the template error.
  resenaActual: Partial<Testimonio> & { puntuacion: number } = { comentario: '', puntuacion: 0 };
  
  // State for UI
  hoverRating = 0;
  carruselIndex = 0;

  // --- Métodos para gestionar el Modal ---

  /**
   * Prepara y abre el modal para crear una nueva reseña.
   */
  abrirModalParaCrear(): void {
    this.modoEdicion = false;
    this.resenaActual = { comentario: '', puntuacion: 0 };
    this.showReviewModal = true;
  }

  /**
   * Prepara y abre el modal para editar una reseña existente.
   * @param testimonio El testimonio a editar.
   */
  editarResena(testimonio: Testimonio): void {
    this.modoEdicion = true;
    // Hacemos una copia para no modificar el original hasta guardar
    this.resenaActual = { ...testimonio };
    this.showReviewModal = true;
  }

  /**
   * Cierra el modal y resetea los estados.
   */
  cerrarModal(): void {
    this.showReviewModal = false;
    this.hoverRating = 0;
  }

  // --- Métodos para Acciones de Datos ---

  /**
   * Guarda los cambios, ya sea creando una nueva reseña o actualizando una existente.
   */
  guardarResena(): void {
    if (!this.resenaActual.comentario?.trim() || !this.resenaActual.puntuacion) {
      return; // Evita enviar si el formulario está incompleto
    }

    if (this.modoEdicion) {
      this.actualizarResenaEvent.emit(this.resenaActual as Testimonio);
    } else {
      this.publicarResenaEvent.emit({
        comentario: this.resenaActual.comentario,
        puntuacion: this.resenaActual.puntuacion
      });
    }

    this.cerrarModal();
  }

  /**
   * Emite el evento para eliminar una reseña.
   */
  eliminarResena(testimonio: Testimonio): void {
    this.eliminarResenaEvent.emit(testimonio);
  }
  
  // --- Métodos para la Lógica del Carrusel ---

  get totalGruposResenas(): number {
  if (!this.testimonios || this.testimonios.length === 0) {
    return 0;
  }
  return Math.max(1, Math.ceil(this.testimonios.length / 3)); 
}


  prevTestimonios(): void {
    if (this.totalGruposResenas === 0) return;
    this.carruselIndex = (this.carruselIndex - 1 + this.totalGruposResenas) % this.totalGruposResenas;
  }

  nextTestimonios(): void {
    if (this.totalGruposResenas === 0) return;
    this.carruselIndex = (this.carruselIndex + 1) % this.totalGruposResenas;
  }
}
