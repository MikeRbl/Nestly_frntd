import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Testimonio } from '../../../interface/testimonio.interface';
import { ReporteService } from '../../../services/reporte.service'; 
import Swal from 'sweetalert2';

@Component({
  selector: 'app-comentarios-usuarios',
  templateUrl: './comentarios-usuarios.component.html',
  styleUrls: ['./comentarios-usuarios.component.css']
})
export class ComentariosUsuariosComponent {
  @Input() testimonios: Testimonio[] = [];
  @Input() isUserLoggedIn = false;
  @Input() currentUser: any = null;
  @Input() isLoading = false;

  // Event Emitters
  @Output() publicarResenaEvent = new EventEmitter<{ comentario: string; puntuacion: number }>();
  @Output() actualizarResenaEvent = new EventEmitter<Testimonio>();
  @Output() eliminarResenaEvent = new EventEmitter<Testimonio>();

  // State for the modal
  showReviewModal = false;
  modoEdicion = false;
  resenaActual: Partial<Testimonio> & { puntuacion: number } = { comentario: '', puntuacion: 0 };
  
  // State for UI
  hoverRating = 0;
  carruselIndex = 0;

  usuarioYaComento = false;
  constructor(
    private reporteService: ReporteService
  ) {}

  ngOnChanges(): void {
    this.verificarSiUsuarioComento();
  }
  // --- Métodos para gestionar el Modal de Reseñas ---
  abrirModalParaCrear(): void {
    this.modoEdicion = false;
    this.resenaActual = { comentario: '', puntuacion: 0 };
    this.showReviewModal = true;
  }

  verificarSiUsuarioComento(): void {
    if (this.isUserLoggedIn && this.currentUser && this.testimonios.length > 0) {
      this.usuarioYaComento = this.testimonios.some(t => t.id_usuario === this.currentUser.id);
    } else {
      this.usuarioYaComento = false;
    }
  }
    editarResena(testimonio: Testimonio): void {
    this.modoEdicion = true;
    this.resenaActual = { ...testimonio };
    this.showReviewModal = true;
  }

  cerrarModal(): void {
    this.showReviewModal = false;
    this.hoverRating = 0;
  }

  // --- Métodos para Acciones de Datos ---
  guardarResena(): void {
    if (!this.resenaActual.comentario?.trim() || !this.resenaActual.puntuacion) {
      return;
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

  eliminarResena(testimonio: Testimonio): void {
    this.eliminarResenaEvent.emit(testimonio);
  }
  
  // --- 3. MÉTODO AÑADIDO PARA REPORTAR ---
  abrirModalReporte(testimonio: any): void {
    Swal.fire({
      title: 'Reportar Reseña',
      html: `
        <p style="text-align: left; margin-bottom: 1rem;">Estás a punto de reportar la reseña de <strong>${testimonio.usuario.first_name}</strong>. Por favor, selecciona un motivo.</p>
        <select id="motivo" class="swal2-select">
          <option value="spam">Es spam o publicidad</option>
          <option value="odio">Contiene lenguaje de odio o discriminación</option>
          <option value="falsa">La información es falsa o engañosa</option>
          <option value="inapropiado">Contenido inapropiado u ofensivo</option>
          <option value="otro">Otro motivo</option>
        </select>
        <textarea id="descripcion" class="swal2-textarea" placeholder="Describe el problema (opcional)..."></textarea>
      `,
      confirmButtonText: 'Enviar Reporte',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const motivo = (document.getElementById('motivo') as HTMLSelectElement).value;
        const descripcion = (document.getElementById('descripcion') as HTMLTextAreaElement).value;
        if (!motivo) {
          Swal.showValidationMessage('Debes seleccionar un motivo');
        }
        return { motivo, descripcion };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          reportable_id: testimonio.id,
          reportable_type: 'App\\Models\\Testimonio', 
          motivo: result.value.motivo,
          descripcion: result.value.descripcion,
          reportador_id: this.currentUser.id // Añadimos el ID del reportador
        };

        this.reporteService.crearReporte(payload).subscribe({
          next: () => {
            Swal.fire('¡Reporte Enviado!', 'Gracias por ayudarnos a mantener la comunidad segura.', 'success');
          },
          error: (err) => {
            Swal.fire('Error', err.error?.message || 'No se pudo enviar el reporte.', 'error');
          }
        });
      }
    });
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