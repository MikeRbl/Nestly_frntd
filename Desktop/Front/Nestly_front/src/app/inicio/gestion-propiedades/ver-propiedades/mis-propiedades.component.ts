import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import Swal from 'sweetalert2';

import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';
import { HttpLaravelService } from '../../../services/http.service';

@Component({
  selector: 'app-mis-propiedades',
  templateUrl: './mis-propiedades.component.html',
  styleUrls: ['./mis-propiedades.component.css']
})
export class MisPropiedadesComponent implements OnInit, OnDestroy {
  
  propiedades: any[] = [];
  tiposDePropiedad: any[] = [];
  loading = false;
  error = '';
  modoEdicion: boolean = false;
  menuAbiertoId: number | null = null;
  propiedadSeleccionada: any | null = null;
  
  // Se añade un tipado explícito para el objeto de filtros
  filtros: {
    titulo: string;
    tipoId: string;
    precioMin: number | null;
    precioMax: number | null;
  } = {
    titulo: '',
    tipoId: '',
    precioMin: null,
    precioMax: null
  };

  // Paginación
  totalItems = 0;
  pageSize = 3;
  pageIndex = 0;
  pageSizeOptions = [3, 6, 9];

  private destroy$ = new Subject<void>();
  private filterChange$ = new Subject<void>();

  constructor(
    private httpService: HttpLaravelService, 
    private authService: AuthService, 
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.url.subscribe(url => {
      this.modoEdicion = url.some(segment => segment.path === 'editar');
    });

    this.cargarPropiedades();
    this.cargarTiposDePropiedad();

    // Optimización: Usar debounceTime para no llamar a la API en cada cambio de filtro
    this.filterChange$.pipe(
      debounceTime(400), // Espera 400ms después del último cambio
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.pageIndex = 0; // Resetea a la primera página con cada nuevo filtro
      this.cargarPropiedades();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Este método es llamado por el HTML y activa el debouncer.
   */
  aplicarFiltrosYPaginacion(): void {
    this.filterChange$.next();
  }

  /**
   * Método principal que solicita las propiedades al backend.
   */
  cargarPropiedades(): void {
    this.loading = true;
    this.error = '';
    const userId = this.authService.obtenerUsuarioActualId()?.id;
    if (!userId) {
      this.error = 'No se pudo identificar al usuario.';
      this.loading = false;
      return;
    }

    const params = new URLSearchParams();
    params.append('page', (this.pageIndex + 1).toString());
    params.append('per_page', this.pageSize.toString());
    if (this.filtros.titulo) params.append('titulo', this.filtros.titulo);
    if (this.filtros.tipoId) params.append('tipo_id', this.filtros.tipoId);
    if (this.filtros.precioMin !== null) params.append('precio_min', this.filtros.precioMin.toString());
    if (this.filtros.precioMax !== null) params.append('precio_max', this.filtros.precioMax.toString());
    
    const endpoint = `users/${userId}/propiedades?${params.toString()}`;
    
    this.httpService.Service_Get(endpoint).subscribe({
      next: (res: any) => {
        // FIX: Se añade una comprobación para manejar respuestas paginadas y no paginadas.
        if (res && res.meta && res.data) {
          // Si la respuesta es paginada (tiene 'meta' y 'data')
          this.propiedades = res.data;
          this.totalItems = res.meta.total;
        } else {
          // Si es una respuesta simple (ej: un array o { data: [...] })
          this.propiedades = res.data || res; // Maneja ambos casos
          this.totalItems = this.propiedades.length;
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error al cargar las propiedades.';
        console.error(err);
      }
    });
  }

  cargarTiposDePropiedad(): void {
    this.httpService.getTiposDePropiedad().subscribe({
      next: (tipos) => { this.tiposDePropiedad = tipos; },
      error: (err) => { console.error('Error al cargar tipos', err); }
    });
  }

  limpiarFiltros(): void {
    this.filtros = {
      titulo: '',
      tipoId: '',
      precioMin: null,
      precioMax: null
    };
    this.pageIndex = 0;
    this.cargarPropiedades();
  }
  
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.cargarPropiedades();
  }

  toggleMenu(event: MouseEvent, propiedadId: number): void {
    event.stopPropagation();
    this.menuAbiertoId = this.menuAbiertoId === propiedadId ? null : propiedadId;
  }
  
  abrirModal(propiedad: any): void {
    this.propiedadSeleccionada = propiedad; 
  }
  
  cerrarModal(): void {
    this.propiedadSeleccionada = null;
  }
  
  eliminarPropiedad(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, ¡eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.httpService.Service_Delete('propiedades', id).subscribe({
          next: () => {
            Swal.fire('¡Eliminada!', 'Tu propiedad ha sido eliminada.', 'success');
            this.cargarPropiedades();
          },
          error: (err) => {
            Swal.fire('Error', 'No se pudo eliminar la propiedad.', 'error');
            console.error(err);
          }
        });
      }
    });
  }

  editarPropiedad(id: number): void {
    this.router.navigate(['/principal/gestion-propiedades/editar', id]);
  }
  
  getFullImageUrl(path: string): string {
    return `http://127.0.0.1:8000/storage/${path}`;
  }
}
