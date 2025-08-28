import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { NotyfService } from '../../../services/notyf.service';
import { ReporteService } from '../../../services/reporte.service';
import Swal from 'sweetalert2';

@Component({
  selector: "app-resena-item",
  templateUrl: "./resena-item.component.html",
  styleUrls: ["./resena-item.component.css"]
})
export class ResenasItemComponent {
  mostrarModalReporte = false;
  motivoReporte = '';

  @Input() resena: any;
  @Input() currentUserId: number | null = null;
  @Input() likedResenaIds = new Set<number>();

  @Output() eliminar = new EventEmitter<number>();
  @Output() votar = new EventEmitter<number>();
  @Output() editar = new EventEmitter<number>();

  constructor(
  private reporteService: ReporteService,
  private notyfService: NotyfService
) {}

  onEliminarClick(): void {
    this.eliminar.emit(this.resena.id);
  }

  onVotarClick(): void {
    this.votar.emit(this.resena.id);
  }
  
  onEditarClick(): void {
    this.editar.emit(this.resena.id);
  }

  getFullImageUrl(path?: string, defaultImg: string = 'assets/default-profile.png'): string {
    if (!path || path.trim() === '') return defaultImg;
    if (path.startsWith('http')) return path;
    return `http://127.0.0.1:8000/storage/${path}`;
  }

  abrirModalReporte(): void {
  // Verifica si el usuario está logueado antes de continuar
  if (!this.currentUserId) {
    this.notyfService.error('Debes iniciar sesión para reportar una reseña.');
    return;
  }

  Swal.fire({
    title: 'Reportar esta reseña',
    html: `
      <select id="motivo-reporte" class="swal2-select" placeholder="Selecciona un motivo">
        <option value="" disabled selected>Selecciona un motivo</option>
        <option value="Spam o Publicidad">Spam o Publicidad</option>
        <option value="Lenguaje Ofensivo">Lenguaje Ofensivo o Acoso</option>
        <option value="Información Falsa">Información Falsa o Engañosa</option>
        <option value="No es relevante">No es relevante para la propiedad</option>
        <option value="Otro">Otro</option>
      </select>
      <textarea id="descripcion-reporte" class="swal2-textarea" placeholder="Describe el problema (opcional)"></textarea>
    `,
    showCancelButton: true,
    confirmButtonText: 'Enviar Reporte',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#ef4444', // Color rojo para la acción
    preConfirm: () => {
      const motivo = (document.getElementById('motivo-reporte') as HTMLSelectElement).value;
      if (!motivo) {
        Swal.showValidationMessage('Por favor, selecciona un motivo para el reporte.');
        return false;
      }
      const descripcion = (document.getElementById('descripcion-reporte') as HTMLTextAreaElement).value;
      return { motivo, descripcion };
    }
  }).then((result) => {
    if (result.isConfirmed) {
      const reporteData = {
        // El ID de la reseña que se está reportando
        reportable_id: this.resena.id, 
        // El tipo de modelo, debe coincidir con tu backend de Laravel
        reportable_type: 'App\\Models\\Resena', 
        motivo: result.value.motivo,
        descripcion: result.value.descripcion
      };

      this.reporteService.crearReporte(reporteData).subscribe({
        next: () => {
          this.notyfService.success('Reporte enviado. Gracias por tu ayuda.');
        },
        error: (err) => {
          console.error('Error al crear el reporte:', err);
          this.notyfService.error(err.error.message || 'No se pudo enviar tu reporte.');
        }
      });
    }
  });
}

  cerrarModalReporte() {
    this.mostrarModalReporte = false;
    this.motivoReporte = '';
  }

  enviarReporte() {
  if (!this.motivoReporte.trim()) return;

  this.reporteService.crearReporte({
    resena_id: this.resena.id,
    motivo: this.motivoReporte,
  }).subscribe({
    next: () => {
      this.notyfService.success('Reporte enviado, gracias por ayudarnos a mejorar');
      this.cerrarModalReporte();
    },
    error: () => {
      this.notyfService.error('Error al enviar reporte, intenta de nuevo');
    }
  });
}

}
