import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: "app-resena-item",
  templateUrl: "./resena-item.component.html",
  styleUrls: ["./resena-item.component.css"]
})

export class ResenasItemComponent{
  
  @Input() resena: any;

  
  @Input() currentUserId: number | null = null;

  /**
   * @Output() permite que este componente envíe "eventos" a su padre.
   * Usamos EventEmitter para notificar cuando se hace clic en un botón.
   */
  @Output() eliminar = new EventEmitter<number>();
  @Output() votar = new EventEmitter<number>();
  @Output() editar = new EventEmitter<number>(); // Añadimos un evento para editar

  // Esta función se llama cuando se hace clic en el botón de eliminar.
  onEliminarClick(): void {
    // Emite el ID de esta reseña hacia el componente padre.
    this.eliminar.emit(this.resena.id);
  }

  // Se llama al hacer clic en el botón de votar/like.
  onVotarClick(): void {
    // Emite el ID de esta reseña para que el padre gestione el voto.
    this.votar.emit(this.resena.id);
  }
  
  // Se llama al hacer clic en el botón de editar.
  onEditarClick(): void {
    this.editar.emit(this.resena.id);
  }
  getFullImageUrl(path?: string, defaultImg: string = 'assets/default-profile.png'): string {
    if (!path || path.trim() === '') return defaultImg;
    if (path.startsWith('http')) return path;
    return `http://127.0.0.1:8000/storage/${path}`;
  }
}