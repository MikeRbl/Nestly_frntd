import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { NotyfService } from '../../../services/notyf.service';
import { ReporteService } from '../../../services/reporte.service';

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

  abrirModalReporte() {
    this.mostrarModalReporte = true;
    this.motivoReporte = '';
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
