import { Component, Input, Output, EventEmitter } from '@angular/core';

import Swal from 'sweetalert2';
import { Testimonio } from '../interface/testimonio.interface';
import { NotyfService } from '../services/notyf.service';

@Component({
  selector: 'app-comentarios-usuarios',
  templateUrl: './comentarios-usuarios.component.html',
  styleUrls: ['./comentarios-usuarios.component.css']
})
export class ComentariosUsuariosComponent {

  @Input() testimonios: Testimonio[] = [];
  @Input() isUserLoggedIn: boolean = false;
  @Input() currentUser: any = null;

  // --- SALIDAS: Eventos emitidos al componente padre ---
  @Output() publicarResenaEvent = new EventEmitter<{ comentario: string, puntuacion: number }>();
  @Output() eliminarResenaEvent = new EventEmitter<number>();

  // Propiedades internas del estado del componente
  mostrarTodasResenas = false;

  constructor(private notyf: NotyfService) {}

  get testimoniosVisibles(): Testimonio[] {
    return this.mostrarTodasResenas ? this.testimonios : this.testimonios.slice(0, 3);
  }

  abrirModalResena(): void {
    if (!this.currentUser) {
      this.notyf.error('Debes iniciar sesión para dejar una reseña.');
      return;
    }
    if (this.testimonios.some(t => t.id_usuario === this.currentUser.id)) {
      this.notyf.error('Solo puedes dejar una reseña.');
      return;
    }

    Swal.fire({
      title: 'Comparte tu Experiencia',
      html: `
        <div class="mb-4 text-left">
          <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Calificación</label>
          <div id="swal-rating-stars" class="flex items-center gap-2 text-3xl cursor-pointer">
            ${[1,2,3,4,5].map(i => `<span data-rating="${i}" class="star text-gray-300 dark:text-gray-600 transition-all duration-200">★</span>`).join('')}
          </div>
        </div>
        <div class="text-left">
          <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Tu Comentario</label>
          <textarea id="swal-comentario" rows="4" 
                    class="swal2-textarea" 
                    placeholder="Describe tu experiencia..."></textarea>
        </div>
      `,
      confirmButtonText: 'Publicar Reseña',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      didOpen: () => {
        const container = Swal.getHtmlContainer();
        if (!container) return;

        const stars = container.querySelectorAll('.star');
        let currentRating = 0;
        
        const updateStars = (rating: number) => {
          stars.forEach(star => {
            const starRating = parseInt(star.getAttribute('data-rating') || '0');
            star.classList.toggle('text-yellow-400', starRating <= rating);
            star.classList.toggle('text-gray-300', starRating > rating);
            star.classList.toggle('dark:text-gray-600', starRating > rating);
          });
        };

        stars.forEach(star => {
          star.addEventListener('mouseenter', () => {
            const rating = parseInt(star.getAttribute('data-rating') || '0');
            updateStars(rating);
          });
          star.addEventListener('mouseleave', () => {
            updateStars(currentRating);
          });
          star.addEventListener('click', () => {
            currentRating = parseInt(star.getAttribute('data-rating') || '0');
            container.setAttribute('data-current-rating', String(currentRating));
          });
        });
      },
      preConfirm: () => {
        const container = Swal.getHtmlContainer();
        const puntuacion = parseInt(container?.getAttribute('data-current-rating') || '0');
        const comentario = (document.getElementById('swal-comentario') as HTMLTextAreaElement).value;

        if (puntuacion === 0) {
          Swal.showValidationMessage('Por favor, selecciona una calificación.');
          return false;
        }
        if (!comentario.trim()) {
          Swal.showValidationMessage('Por favor, escribe un comentario.');
          return false;
        }
        return { puntuacion, comentario };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.publicarResenaEvent.emit(result.value);
      }
    });
  }

  eliminarResena(index: number, event: Event): void {
    event.stopPropagation();
    const testimonio = this.testimonios[index];
    if (!this.currentUser || testimonio.id_usuario !== this.currentUser.id) {
      this.notyf.error('Solo puedes eliminar tus propias reseñas.');
      return;
    }

    Swal.fire({
      title: '¿Eliminar reseña?',
      text: '¿Estás seguro de que quieres eliminar esta reseña?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.eliminarResenaEvent.emit(index);
      }
    });
  }
}
