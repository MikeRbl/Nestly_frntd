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

  // --- Eventos emitidos al componente padre ---
  @Output() publicarResenaEvent = new EventEmitter<{ comentario: string, puntuacion: number }>();
  @Output() eliminarResenaEvent = new EventEmitter<number>();

  // Estado interno
  mostrarFormularioResena = false;
  nuevaResena = { comentario: '', puntuacion: 0 };
  hoverRating = 0;

  // Carrusel interno
  grupoResenasActual = 0;
  carruselOpacity = 1;
  private carruselIntervalId: any;

  constructor(private notyf: NotyfService) {}

  ngOnInit(): void {
    this.iniciarCarruselResenas();
  }

  ngOnDestroy(): void {
    if (this.carruselIntervalId) clearInterval(this.carruselIntervalId);
  }

  // --- Carrusel de reseñas ---
  get testimoniosVisibles(): Testimonio[] {
    const inicio = this.grupoResenasActual * 3;
    const fin = inicio + 3;
    return this.testimonios.slice(inicio, fin);
  }

  get totalGruposResenas(): number {
    return Math.ceil(this.testimonios.length / 3);
  }

  iniciarCarruselResenas(): void {
    if (this.totalGruposResenas > 1) {
      this.carruselIntervalId = setInterval(() => this.grupoResenasSiguiente(), 8000);
    }
  }

  async grupoResenasSiguiente(): Promise<void> {
    this.carruselOpacity = 0;
    await this.delay(300);
    this.grupoResenasActual = (this.grupoResenasActual + 1) % this.totalGruposResenas;
    this.carruselOpacity = 1;
  }

  async grupoResenasAnterior(): Promise<void> {
    this.carruselOpacity = 0;
    await this.delay(300);
    this.grupoResenasActual = (this.grupoResenasActual - 1 + this.totalGruposResenas) % this.totalGruposResenas;
    this.carruselOpacity = 1;
  }

  async cambiarGrupoResenas(index: number): Promise<void> {
    this.carruselOpacity = 0;
    await this.delay(300);
    this.grupoResenasActual = index;
    this.carruselOpacity = 1;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getInicioGrupoResenas(): number {
    return this.grupoResenasActual * 3 + 1;
  }

  getFinGrupoResenas(): number {
    return Math.min((this.grupoResenasActual + 1) * 3, this.testimonios.length);
  }

  // --- Funciones para el formulario de reseña ---
  yaDejoResena(): boolean {
    if (!this.currentUser) return false;
    return this.testimonios.some(t => t.id_usuario === this.currentUser.id);
  }

  publicarResena(): void {
    if (!this.nuevaResena.comentario || this.nuevaResena.puntuacion === 0) {
      this.notyf.error('Por favor, escribe tu comentario y selecciona una calificación.');
      return;
    }
    this.publicarResenaEvent.emit({ ...this.nuevaResena });
    this.resetFormularioResena();
  }

  resetFormularioResena(): void {
    this.nuevaResena = { comentario: '', puntuacion: 0 };
    this.hoverRating = 0;
    this.mostrarFormularioResena = false;
  }

  abrirModalResena(): void {
    if (!this.currentUser) {
      this.notyf.error('Debes iniciar sesión para dejar una reseña.');
      return;
    }
    if (this.yaDejoResena()) {
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
          <textarea id="swal-comentario" rows="4" class="swal2-textarea" placeholder="Describe tu experiencia..."></textarea>
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
          star.addEventListener('mouseenter', () => updateStars(parseInt(star.getAttribute('data-rating') || '0')));
          star.addEventListener('mouseleave', () => updateStars(currentRating));
          star.addEventListener('click', () => currentRating = parseInt(star.getAttribute('data-rating') || '0'));
        });
      },
      preConfirm: () => {
        const container = Swal.getHtmlContainer();
        const puntuacion = parseInt(container?.querySelector('.star.text-yellow-400')?.getAttribute('data-rating') || '0');
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
      if (result.isConfirmed && result.value) {
        this.publicarResenaEvent.emit(result.value);
      }
    });
  }

  // --- Eliminar reseña ---
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
