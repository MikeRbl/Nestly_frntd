import { Component, Input, Output, EventEmitter } from '@angular/core';

// Define una interfaz para el evento de cambio de página
export interface PageChangeEvent {
  pageIndex: number;
  pageSize: number;
  length: number;
}

@Component({
  selector: 'app-admin-paginador',
  templateUrl: './admin-paginador.component.html',
  styleUrls: ['./admin-paginador.component.css']
})
export class AdminPaginadorComponent {
   @Input() length: number = 0;
  @Input() pageSize: number = 10;
  @Input() pageIndex: number = 0;

  @Output() pageChange = new EventEmitter<number>();

  getStartItem(): number {
    return this.length === 0 ? 0 : this.pageIndex * this.pageSize + 1;
  }

  getEndItem(): number {
    const end = (this.pageIndex + 1) * this.pageSize;
    return end > this.length ? this.length : end;
  }

  goToPreviousPage() {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.pageChange.emit(this.pageIndex);
    }
  }

  goToNextPage() {
    if (!this.isLastPage()) {
      this.pageIndex++;
      this.pageChange.emit(this.pageIndex);
    }
  }

  isLastPage(): boolean {
    return (this.pageIndex + 1) * this.pageSize >= this.length;
  }
   getTotalPages(): number {
    if (this.length === 0) {
      return 1;
    }
    return Math.ceil(this.length / this.pageSize);
  }
}
