import { Component, EventEmitter, Input, Output } from '@angular/core';

// Interfaz para la configuración de los filtros (ACTUALIZADA)
export interface FiltroConfig {
  showSearch?: boolean;
  showRoleFilter?: boolean;
  showStatusFilter?: boolean; // <-- Propiedad añadida
  showReasonFilter?: boolean; // <-- Propiedad añadida
}

@Component({
  selector: 'app-admin-filtro-bar',
  templateUrl: './admin-filtro-bar.component.html',
  styleUrls: ['./admin-filtro-bar.component.css']
})
export class AdminFiltroBarComponent {
  // Recibe la configuración para saber qué filtros mostrar
  @Input() config: FiltroConfig = { 
    showSearch: true, // Valor por defecto
  };
  
  // Emite los valores actuales de los filtros cuando cambian
  @Output() filterChange = new EventEmitter<any>();

  filtros = {
    search: '',
    role: '',
    estado: '',
    motivo: ''
  };

  constructor() { }

  /**
   * Notifica al componente padre cada vez que un filtro cambia.
   */
  onFilterChange(): void {
    this.filterChange.emit(this.filtros);
  }
}
