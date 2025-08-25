import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'; 
import { PageEvent } from '@angular/material/paginator';
import Swal from 'sweetalert2';

// --- Servicios ---
import { PropiedadesService } from '../../../app/services/propiedad.service';
import { AuthService } from '../../auth.service';
import { NotyfService } from '../../services/notyf.service';
import { Propiedad } from '../../interface/propiedades.interface';

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
  
  favoritoIds = new Set<number>();
  isUserLoggedIn = false;

  filtros = {
    titulo: '',
    direccion: '',
    tipoId: '',
    precioMin: 0,
    precioMax: null as number | null,
    habitaciones: 0,
    banos: 0,
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
    private route: ActivatedRoute,
    private authService: AuthService,
    private notyf: NotyfService
  ) {}

  ngOnInit(): void {
    this.isUserLoggedIn = this.authService.isLoggedIn();
    if (this.isUserLoggedIn) {
      this.cargarIdsFavoritos();
    }
    
    this.cargarPropiedades();
    this.cargarTiposDePropiedad();
  }

  cargarIdsFavoritos(): void {
    this.propiedadesService.getIdsFavoritos().subscribe({
      next: (response) => {
        this.favoritoIds = new Set(response.data);
      },
      error: (err) => console.error('Error al cargar IDs de favoritos:', err)
    });
  }

  toggleFavorito(propiedad: Propiedad, event: MouseEvent): void {
    event.stopPropagation(); 
    if (!this.isUserLoggedIn) {
      this.handleLoginRedirect();
      return;
    }

    const propiedadId = propiedad.id_propiedad;
    const esFavorito = this.favoritoIds.has(propiedadId);

    if (esFavorito) {
      this.propiedadesService.quitarFavorito(propiedadId).subscribe({
        next: () => {
          this.favoritoIds.delete(propiedadId);
          this.notyf.success('Eliminado de favoritos');
        },
        error: () => this.notyf.error('Error al quitar favorito.')
      });
    } else {
      this.propiedadesService.agregarFavorito(propiedadId).subscribe({
        next: () => {
          this.favoritoIds.add(propiedadId);
          this.notyf.success('Agregado a favoritos');
        },
        error: () => this.notyf.error('Error al agregar favorito.')
      });
    }
  }

  handleLoginRedirect(): void {
    Swal.fire({
      title: '¡Inicia sesión para guardar!',
      text: 'Necesitas una cuenta para añadir propiedades a tus favoritos.',
      icon: 'info',
      showDenyButton: true,
      confirmButtonText: 'Iniciar Sesión',
      denyButtonText: 'Crear Cuenta',
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/login']);
      } else if (result.isDenied) {
        this.router.navigate(['/register']);
      }
    });
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

    // --- ¡CAMBIO IMPLEMENTADO AQUÍ! ---
    // Antes de cualquier otro filtro, nos aseguramos de mostrar solo las propiedades disponibles.
    propiedadesFiltradas = propiedadesFiltradas.filter(p => p.estado_propiedad === 'Disponible');

    if (this.filtros.titulo) {
      propiedadesFiltradas = propiedadesFiltradas.filter(p => p.titulo.toLowerCase().includes(this.filtros.titulo.toLowerCase()));
    }
    
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
      direccion: '',
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