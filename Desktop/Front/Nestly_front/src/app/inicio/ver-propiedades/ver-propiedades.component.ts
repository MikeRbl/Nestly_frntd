import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import Swal from 'sweetalert2';
import { HttpLavavelService } from '../../http.service';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ver-propiedades',
  templateUrl: './ver-propiedades.component.html',
  styleUrls: ['./ver-propiedades.component.css']
})
export class VerPropiedadesComponent implements OnInit {
  // Array que SIEMPRE contiene todas las propiedades sin filtrar
  private todasLasPropiedades: any[] = [];
  
  // Array que se muestra en la vista y que sí se modifica con los filtros y la paginación
  propiedades: any[] = [];
  
  tiposDePropiedad: any[] = [];
  loading = false;
  error = '';
  menuAbiertoId: number | null = null;
  propiedadSeleccionada: any | null = null;
  
  // Objeto para mantener el estado de los filtros
  filtros = {
    titulo: '',
    tipoId: '', // Usaremos string vacío para "Todos"
    precioMin: null,
    precioMax: null
  };

  // Paginación
  totalItems = 0;
  pageSize = 6;
  pageIndex = 0;
  pageSizeOptions = [6, 9, 12];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    this.menuAbiertoId = null;
  }

  constructor(
    private httpService: HttpLavavelService, 
    private authService: AuthService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales(): void {
    this.loading = true;
    this.error = '';
    const userId = this.authService.obtenerUsuarioActualId()?.id;
    console.log('ID del usuario autenticado:', userId); // 👈
    if (!userId) {
      // Manejar error de usuario no encontrado
      this.loading = false;
      return;
    }

    // Usamos una ruta que nos traiga TODAS las propiedades del usuario
    const endpoint = `users/${userId}/propiedades?all=true`; 
    
    this.httpService.Service_Get(endpoint).subscribe({
      
      next: (res) => {
        // Guardamos la lista completa en nuestro array maestro
        this.todasLasPropiedades = res.data;
        this.aplicarFiltrosYPaginacion();
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error al cargar las propiedades.';
        console.error(err);
      }
    });

    // Cargamos los tipos de propiedad para el filtro
    this.cargarTiposDePropiedad();
  }

  cargarTiposDePropiedad(): void {
    this.httpService.getTiposDePropiedad().subscribe({
      next: (tipos) => { this.tiposDePropiedad = tipos; },
      error: (err) => { console.error('Error al cargar tipos', err); }
    });
  }

  aplicarFiltrosYPaginacion(): void {
    let propiedadesFiltradas = this.todasLasPropiedades;

    // 1. Aplicar filtro por título
    if (this.filtros.titulo) {
      propiedadesFiltradas = propiedadesFiltradas.filter(p => 
        p.titulo.toLowerCase().includes(this.filtros.titulo.toLowerCase())
      );
    }

    // 2. Aplicar filtro por tipo de propiedad (usando el ID)
    if (this.filtros.tipoId) {
      propiedadesFiltradas = propiedadesFiltradas.filter(p => 
        p.tipo_propiedad_id == this.filtros.tipoId
      );
    }

    // 3. Aplicar filtro por precio mínimo
    if (this.filtros.precioMin !== null) {
      propiedadesFiltradas = propiedadesFiltradas.filter(p => 
        p.precio >= this.filtros.precioMin!
      );
    }
    
    // 4. Aplicar filtro por precio máximo
    if (this.filtros.precioMax !== null) {
      propiedadesFiltradas = propiedadesFiltradas.filter(p => 
        p.precio <= this.filtros.precioMax!
      );
    }

    // Actualizamos el total de items para el paginador
    this.totalItems = propiedadesFiltradas.length;

    // 5. Aplicamos la paginación a los resultados ya filtrados
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.propiedades = propiedadesFiltradas.slice(startIndex, endIndex);
  }

  limpiarFiltros(): void {
    this.filtros = {
      titulo: '',
      tipoId: '',
      precioMin: null,
      precioMax: null
    };
    this.pageIndex = 0; // Regresar a la primera página
    this.aplicarFiltrosYPaginacion();
  }
  
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.aplicarFiltrosYPaginacion();
  }

  // ... (tus otros métodos como abrirModal, eliminarPropiedad, etc. se quedan igual)
  toggleMenu(event: MouseEvent, propiedadId: number): void {
    event.stopPropagation();
    this.menuAbiertoId = this.menuAbiertoId === propiedadId ? null : propiedadId;
  }
  
  abrirModal(propiedad: any): void {
    this.propiedadSeleccionada = propiedad; 
  }
  
  cerrarModal(): void {
    this.propiedadSeleccionada = null;
    document.body.style.overflow = 'auto';
  }
  
  eliminarPropiedad(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {

        this.httpService.Service_Delete('propiedades', id).subscribe({
          next: (res) => {
            console.log('Respuesta del endpoint:', res)
            Swal.fire('¡Eliminada!', 'Tu propiedad ha sido eliminada.', 'success');
            // Recargamos la lista completa desde cero
            this.cargarDatosIniciales();
            this.cerrarModal();
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
    this.router.navigate(['/principal/editar-propiedad', id]);
  }

  publicarNuevaPropiedad() {
    // Navegar a la página de creación o abrir un modal
    this.router.navigate(['/principal/publicarCasa']);
    
}
  getFullImageUrl(path: string): string {
    return `http://127.0.0.1:8000/storage/${path}`;
  }
}
