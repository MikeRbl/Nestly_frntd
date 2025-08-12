import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { User } from '../../../interface/usuario.interface';
import { AdminService } from '../../../services/admin.service';
import { NotyfService } from '../../../services/notyf.service';

@Component({
  selector: 'app-gestion-usuarios',
  templateUrl: './gestion-usuarios.component.html',
  styleUrls: ['./gestion-usuarios.component.css']
})
export class GestionUsuariosComponent implements OnInit {

  isLoading = true;
  users: User[] = [];
  // Objeto para controlar el estado (abierto/cerrado) de cada select individualmente
  selectAbierto: { [userId: number]: boolean } = {};
  // Objeto para guardar el estado original antes de un cambio
  estadoSeleccionadoOriginal: { [userId: number]: string } = {};

  filtros = { search: '', role: '' };

  // Paginación
  pageIndex = 0;
  pageSize = 10;
  totalItems = 0;

  constructor(
    private adminService: AdminService,
    private notyfService: NotyfService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    const params = {
      page: this.pageIndex + 1,
      per_page: this.pageSize,
      search: this.filtros.search,
      role: this.filtros.role
    };

    this.adminService.getUsers(params).subscribe({
      next: (response: { data: User[], total: number }) => {
        this.users = response.data;
        this.totalItems = response.total;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.notyfService.error('Hubo un error al cargar los usuarios.');
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.pageIndex = 0;
    this.loadUsers();
  }

  onPageChange(newPageIndex: number): void {
    this.pageIndex = newPageIndex;
    this.loadUsers();
  }

  editarUsuario(userId: number): void {
    this.router.navigate(['/admin/usuarios-admin/editar', userId]);
  }

  eliminarUsuario(userId: number, userName: string): void {
    Swal.fire({
      title: `¿Estás seguro de eliminar a ${userName}?`,
      text: "Esta acción no se puede revertir.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, ¡eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.deleteUser(userId).subscribe({
          next: () => {
            this.notyfService.success('Usuario eliminado correctamente.');
            this.loadUsers();
          },
          error: (error: any) => {
            console.error('Error al eliminar el usuario', error);
            this.notyfService.error('No se pudo eliminar el usuario.');
          }
        });
      }
    });
  }

  cambiarEstadoUsuario(user: User, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const nuevoEstado = select.value as 'activo' | 'baneado';

    // Guarda el valor original si no está guardado aún
    if (!this.estadoSeleccionadoOriginal[user.id]) {
      this.estadoSeleccionadoOriginal[user.id] = user.status;
    }

    Swal.fire({
      title: `¿Quieres cambiar el estado de ${user.first_name} a "${nuevoEstado}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.cambiarEstadoUsuario(user.id, nuevoEstado).subscribe({
          next: () => {
            this.notyfService.success('Estado actualizado correctamente.');
            user.status = nuevoEstado;
            this.estadoSeleccionadoOriginal[user.id] = nuevoEstado;
             this.loadUsers();
          },
          error: (err) => {
            console.error('Error al cambiar estado:', err);
            this.notyfService.error('No se pudo actualizar el estado.');
            // Si hay error, revierte el cambio en el select
            select.value = this.estadoSeleccionadoOriginal[user.id];
          }
        });
      } else {
        // Si el usuario cancela, revierte el cambio en el select
        select.value = this.estadoSeleccionadoOriginal[user.id];
      }

      // Cierra la animación de la flecha en cualquier caso (confirmado o cancelado)
      this.cerrarSelect(user.id);
    });
  }

  /**
   * Alterna el estado de la flecha (abierto/cerrado) para activar/desactivar la animación.
   * Se llama con el evento (click).
   */
  toggleSelect(userId: number): void {
    this.selectAbierto[userId] = !this.selectAbierto[userId];
  }

  /**
   * Pone el estado de la flecha a 'cerrado' para revertir la animación.
   * Se llama con (blur) y después de la confirmación de cambio de estado.
   */
  cerrarSelect(userId: number): void {
    // Usamos un pequeño delay para que la UI no se sienta brusca
    setTimeout(() => {
      this.selectAbierto[userId] = false;
    }, 150);
  }
}
