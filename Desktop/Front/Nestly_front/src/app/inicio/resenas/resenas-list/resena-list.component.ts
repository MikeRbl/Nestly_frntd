import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-resena-list',
  templateUrl: './resena-list.component.html',
  styleUrls: ['./resena-list.component.css']
})
export class ResenaListComponent {
  @Input() resenas: any[] = [];
  
  @Input() currentUserId: number | null = null;
  @Input() likedResenaIds = new Set<number>();
  @Output() eliminar = new EventEmitter<number>();
  @Output() votar = new EventEmitter<number>();
  @Output() editar = new EventEmitter<number>();

  // Estos métodos reciben el ID (number) desde el resena-item
  // y luego lo emiten hacia el componente padre (alquilar-casa)
  onEliminar(resenaId: number): void {
    this.eliminar.emit(resenaId);
  }

  onVotar(resenaId: number): void {
    this.votar.emit(resenaId);
  }

  onEditar(resenaId: number): void {
    this.editar.emit(resenaId);
  }
}
