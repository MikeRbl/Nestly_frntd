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
  // Propiedades existentes
  propiedades: any[] = [];
  loading = false;
  error = '';
  menuAbiertoId: number | null = null;
  propiedadSeleccionada: any | null = null;
  
 totalItems = 0;
  pageSize = 12;
  pageIndex = 0;
  pageSizeOptions = [3, 6, 9];
  
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
    document.body.style.overflow = 'auto';
  }

  cargarPropiedades(): void {
    this.loading = true;
    this.error = '';

    const userId = this.authService.obtenerUsuarioActualId();

    if (!userId) {
      this.error = 'No se pudo identificar al usuario. Por favor, inicie sesión de nuevo.';
      this.loading = false;
      return;
    }

    // Convertimos pageIndex (base 0) a currentPage (base 1) para Laravel
    const currentPage = this.pageIndex + 1;
    const endpoint = `users/${userId}/propiedades?page=${currentPage}&per_page=${this.pageSize}`;
    
    this.httpService.Service_Get(endpoint).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.propiedades = res.data;
          this.totalItems = res.total;
          // Aseguramos que pageSize coincida con lo que devuelve el backend
          this.pageSize = res.per_page;
          // Convertimos current_page (base 1) a pageIndex (base 0)
          this.pageIndex = res.current_page - 1;
        } else {
          this.propiedades = [];
          this.totalItems = 0;
          this.error = 'No se encontraron propiedades.';
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error al cargar las propiedades desde el servidor.';
        console.error(err);
      }
    });
  }

 onPageChange(event: PageEvent): void {
  this.pageSize = event.pageSize;
  this.pageIndex = event.pageIndex;
  this.cargarPropiedades();
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
            Swal.fire('¡Eliminada!', 'Tu propiedad ha sido eliminada.', 'success');
            // Si era el último ítem de la página y no estamos en la primera página
            if (this.propiedades.length === 1 && this.pageIndex > 0) {
              this.pageIndex--;
            }
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
    if (!id) return;
    this.cerrarModal();
    this.router.navigate(['/editar-propiedad', id]);
  }

  EditarPropiedad(id: number): void {
    this.router.navigate(['/principal/editar-propiedad', id]);
  }

  getFullImageUrl(path: string): string {
    return `http://127.0.0.1:8000/storage/${path}`;
  }
}