import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'; 
import { PropiedadesService } from '../../../app/services/propiedad.service';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-buscar',
  templateUrl: './buscar.component.html',
  styleUrls: ['./buscar.component.css']
})
export class BuscarComponent implements OnInit {
  propiedades: any[] = [];
  todasLasPropiedades: any[] = [];
  tiposDePropiedad: any[] = [];
  loading = false;
  error = '';
  precioMaximoDelSlider: number = 100000; 

  filtros = {
    titulo: '',
    direccion: '', // Filtro para la nueva barra superior
    tipoId: '',
    precioMin: 0,
    precioMax: null as number | null,
    habitaciones: 0, // Inicia en 0 para el stepper
    banos: 0,      // Inicia en 0 para el stepper
    puntuacionMin: null as number | null,
    mascotas: false,
    amueblado: false,
  };

  totalItems = 0;
  pageSize = 6;
  pageIndex = 0;
  pageSizeOptions = [6, 9, 12];

  constructor(
    private propiedadesService: PropiedadesService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.cargarPropiedades();
    this.cargarTiposDePropiedad();
  }

  cargarPropiedades(): void {
    this.loading = true;
    this.error = '';

    this.propiedadesService.getTodasPropiedades().subscribe({
      next: (res: any) => {
        if (res && res.data && Array.isArray(res.data.data)) {
          this.todasLasPropiedades = res.data.data;
          
          if (this.todasLasPropiedades.length > 0) {
            const maxPrice = Math.max(...this.todasLasPropiedades.map(p => p.precio));
            this.precioMaximoDelSlider = Math.ceil(maxPrice / 1000) * 1000; 
            
            if (this.filtros.precioMax === null) {
                this.filtros.precioMax = this.precioMaximoDelSlider;
            }
          }
        } else {
          this.todasLasPropiedades = [];
          this.error = 'Los datos recibidos del servidor no tienen el formato esperado.';
        }
        this.aplicarFiltrosYPaginacion();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar propiedades:', err);
        this.loading = false;
        this.error = 'Error al cargar las propiedades.';
        this.todasLasPropiedades = [];
        this.propiedades = [];
      }
    });
  }

  cargarTiposDePropiedad(): void {
    this.propiedadesService.getTiposDePropiedad().subscribe({
      next: (res: any) => {
        this.tiposDePropiedad = res.data || res || [];
      },
      error: (err) => {
        console.error('Error al cargar tipos de propiedad:', err);
      }
    });
  }

  aplicarFiltrosYPaginacion(): void {
    this.pageIndex = 0;
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    let propiedadesFiltradas = [...this.todasLasPropiedades];

    // Filtro base para mostrar solo propiedades disponibles
    propiedadesFiltradas = propiedadesFiltradas.filter(p => p.estado_propiedad === 'Disponible');

    // Filtros del usuario
    if (this.filtros.titulo) {
      propiedadesFiltradas = propiedadesFiltradas.filter(p => p.titulo.toLowerCase().includes(this.filtros.titulo.toLowerCase()));
    }
    
    // Nueva lógica de filtrado por dirección
    if (this.filtros.direccion) {
      const terminoBusqueda = this.filtros.direccion.toLowerCase();
      propiedadesFiltradas = propiedadesFiltradas.filter(p => 
        (p.direccion && p.direccion.toLowerCase().includes(terminoBusqueda)) ||
        (p.ciudad && p.ciudad.toLowerCase().includes(terminoBusqueda)) ||
        (p.colonia && p.colonia.toLowerCase().includes(terminoBusqueda))
      );
    }

    if (this.filtros.tipoId) {
      propiedadesFiltradas = propiedadesFiltradas.filter(p => p.tipo_propiedad_id == this.filtros.tipoId);
    }

    if (this.filtros.precioMin !== null && this.filtros.precioMin >= 0) {
      propiedadesFiltradas = propiedadesFiltradas.filter(p => p.precio >= this.filtros.precioMin!);
    }

    if (this.filtros.precioMax !== null && this.filtros.precioMax >= 0) {
      propiedadesFiltradas = propiedadesFiltradas.filter(p => p.precio <= this.filtros.precioMax!);
    }
    
    if (this.filtros.habitaciones && this.filtros.habitaciones > 0) {
      propiedadesFiltradas = propiedadesFiltradas.filter(p => p.habitaciones >= this.filtros.habitaciones!);
    }

    if (this.filtros.banos && this.filtros.banos > 0) {
      propiedadesFiltradas = propiedadesFiltradas.filter(p => p.banos >= this.filtros.banos!);
    }

    if(this.filtros.puntuacionMin !== null && this.filtros.puntuacionMin >= 0) {
      propiedadesFiltradas = propiedadesFiltradas.filter(p => p.resenas_avg_puntuacion && p.resenas_avg_puntuacion >= this.filtros.puntuacionMin!);
    }

    if (this.filtros.mascotas) {
      propiedadesFiltradas = propiedadesFiltradas.filter(p => p.acepta_mascotas == true);
    }

    if (this.filtros.amueblado) {
      propiedadesFiltradas = propiedadesFiltradas.filter(p => p.amueblado == true);
    }

    this.totalItems = propiedadesFiltradas.length;
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.propiedades = propiedadesFiltradas.slice(startIndex, endIndex);
  }

  limpiarFiltros(): void {
    this.filtros = {
      titulo: '',
      direccion: '', // Limpiar el nuevo filtro
      tipoId: '',
      precioMin: 0,
      precioMax: this.precioMaximoDelSlider,
      habitaciones: 0,
      banos: 0,
      puntuacionMin: null,
      mascotas: false,
      amueblado: false
    };
    this.pageIndex = 0;
    this.aplicarFiltros();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.aplicarFiltros();
  }

  setRatingFilter(rating: number): void {
    if (this.filtros.puntuacionMin === rating){
      this.filtros.puntuacionMin = null;
    } else {
      this.filtros.puntuacionMin = rating;
    }
    this.aplicarFiltrosYPaginacion();
  }
 
  handlePriceRangeChange(): void {
    if (this.filtros.precioMin! > this.filtros.precioMax!) {
      this.filtros.precioMax = this.filtros.precioMin;
    }
    this.aplicarFiltrosYPaginacion();
  }

  ajustarCantidad(filtro: 'habitaciones' | 'banos', cantidad: number): void {
    const valorActual = this.filtros[filtro] || 0;
    const nuevoValor = valorActual + cantidad;
    this.filtros[filtro] = Math.max(0, nuevoValor); 
    this.aplicarFiltrosYPaginacion();
  }
  
  verDetallePropiedad(propiedad: any): void {
    if (propiedad && propiedad.id_propiedad) {
      this.router.navigate(['../propiedad', propiedad.id_propiedad], { relativeTo: this.route });
    } else {
      console.error('No se puede navegar: la propiedad no tiene un id_propiedad válido.', propiedad);
    }
  }

  getFullImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `http://127.0.0.1:8000/storage/${path}`;
  }
}