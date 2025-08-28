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
    selectAbierto: { [userId: number]: boolean } = {};
    roleSelectAbierto: { [userId: number]: boolean } = {};
    filtros = { search: '', role: '', status: '' };
    // Paginación controlada por el backend
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

    /**
     * Carga una página de usuarios del backend aplicando los filtros y la paginación actual.
     */
    loadUsers(): void {
      this.isLoading = true;
      const params = {
        page: this.pageIndex + 1, // La API usualmente espera páginas base 1
        per_page: this.pageSize,
        search: this.filtros.search.trim(),
        role: this.filtros.role,
        status: this.filtros.status 
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

    /**
     * Cuando se aplica un filtro, reseteamos a la primera página y volvemos a cargar los datos.
     */
    applyFilters(): void {
      this.pageIndex = 0;
      this.loadUsers();
    }

    /**
     * Cuando se cambia de página, actualizamos el índice y volvemos a cargar los datos.
     */
    onPageChange(newPageIndex: number): void {
      this.pageIndex = newPageIndex;
      this.loadUsers();
    }

    cambiarRolUsuario(user: User, event: Event): void {
      const select = event.target as HTMLSelectElement;
      const nuevoRol = select.value as 'admin' | 'propietario' | 'inquilino';
      const originalRol = user.role; // Guardamos el rol original

      Swal.fire({
        title: `¿Cambiar rol a "${nuevoRol}"?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, cambiar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.adminService.actualizarRolUsuario(user.id, nuevoRol).subscribe({
            next: () => {
              this.notyfService.success('Rol actualizado correctamente');
              // Simplemente actualizamos el rol en la vista actual para una respuesta instantánea.
              // La próxima vez que se carguen los datos, vendrá correcto del backend.
              user.role = nuevoRol; 
            },
            error: (err) => {
              this.notyfService.error('No se pudo actualizar el rol. Revisa la consola y la API.');
              console.error(err);
              select.value = originalRol; // Revertir si hay error
            }
          });
        } else {
          select.value = originalRol; // Revertir si se cancela
        }
      });
    }
  toggleRoleSelect(userId: number): void {
    this.roleSelectAbierto[userId] = !this.roleSelectAbierto[userId];
  }

  cerrarRoleSelect(userId: number): void {
    // Usamos un pequeño delay para que la UI no se sienta brusca
    setTimeout(() => {
      this.roleSelectAbierto[userId] = false;
    }, 150);
  }
    cambiarEstadoUsuario(user: User, event: Event): void {
      const select = event.target as HTMLSelectElement;
      const nuevoEstado = select.value as 'activo' | 'baneado' | 'suspendido';
      const originalStatus = user.status;

      // Si se elige 'suspendido', se abre un modal diferente
      if (nuevoEstado === 'suspendido') {
        this.abrirModalSuspension(user, originalStatus, select);
        return; // Detenemos la ejecución aquí
      }

      // Lógica para 'activo' y 'baneado'
      Swal.fire({
        title: `¿Cambiar estado a "${nuevoEstado}"?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, cambiar',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          // Pasamos 'null' como duración para indicar que es permanente
          this.adminService.cambiarEstadoUsuario(user.id, nuevoEstado, null).subscribe({
            next: () => {
              this.notyfService.success('Estado actualizado correctamente.');
              user.status = nuevoEstado;
            },
            error: (err) => {
              this.notyfService.error('No se pudo actualizar el estado.');
              select.value = originalStatus;
            }
          });
        } else {
          select.value = originalStatus;
        }
      });
    }

    abrirModalSuspension(user: User, originalStatus: string, selectElement: HTMLSelectElement): void {
      Swal.fire({
        title: `Suspender a ${user.first_name}`,
        html: `
          <p class="text-sm text-gray-600 mb-4">Selecciona la duración de la suspensión.</p>
          <input id="suspension-dias" type="number" min="1" value="7" class="swal2-input" placeholder="Días de suspensión">
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, suspender',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
          const dias = (document.getElementById('suspension-dias') as HTMLInputElement).value;
          if (!dias || parseInt(dias) <= 0) {
            Swal.showValidationMessage('Por favor, ingresa un número de días válido y mayor a cero.');
            return false;
          }
          return parseInt(dias);
        }
      }).then((result) => {
        if (result.isConfirmed) {
          const diasDeSuspension = result.value;
          this.adminService.cambiarEstadoUsuario(user.id, 'suspendido', diasDeSuspension).subscribe({
            next: (response) => {
              this.notyfService.success(`Usuario suspendido por ${diasDeSuspension} días.`);
              user.status = 'suspendido';
              // Opcional: Actualizar la fecha de fin de suspensión si el backend la devuelve
              user.suspension_ends_at = response.user.suspension_ends_at;
            },
            error: (err) => {
              this.notyfService.error('No se pudo suspender al usuario.');
              selectElement.value = originalStatus;
            }
          });
        } else {
          selectElement.value = originalStatus;
        }
      });
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
              // Volvemos a cargar los datos para que el usuario desaparecido se refleje.
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

    editarUsuario(userId: number): void {
      this.router.navigate(['/admin/usuarios-admin/editar', userId]);
    }

    toggleSelect(userId: number): void {
      this.selectAbierto[userId] = !this.selectAbierto[userId];
    }

    cerrarSelect(userId: number): void {
      setTimeout(() => { this.selectAbierto[userId] = false; }, 150);
    }
  }