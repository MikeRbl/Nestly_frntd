import { Component, OnInit } from '@angular/core';
import { RoleRequestService } from '../../../services/roleRequest.service';
import { NotyfService } from '../../../services/notyf.service'; 
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../interface/usuario.interface';

@Component({
  selector: 'app-invitacion-propietario',
  templateUrl: './invitacion-propietario.component.html',
  styleUrls: ['./invitacion-propietario.component.css']
})
export class InvitacionPropietarioComponent implements OnInit {
  mostrar = false;
  isLoading = false;
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private roleService: RoleRequestService,
    private notyf: NotyfService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.evaluarVisibilidad();
    });
  }

  evaluarVisibilidad(): void {
    if (!this.currentUser || this.currentUser.role !== 'inquilino') {
      this.mostrar = false;
      return;
    }

    const posponerVisto = sessionStorage.getItem('posponerInvitacion');
    if (posponerVisto) {
        this.mostrar = false;
        return;
    }

    this.roleService.verificarEstadoSolicitud().subscribe(response => {
      if (response.status === 'ninguna') {
        this.mostrar = true;
      } else {
        this.mostrar = false;
      }
    });
  }

  enviarSolicitud(): void {
    this.isLoading = true;
    this.roleService.enviarSolicitud().subscribe({
      next: () => {
        this.notyf.success('¡Solicitud enviada! Un administrador la revisará pronto.');
        this.mostrar = false;
        this.isLoading = false;
      },
      error: (err) => {
        this.notyf.error(err.error?.message || 'Error al enviar la solicitud');
        if (err.status === 400 || err.status === 409) {
            this.mostrar = false;
        }
        this.isLoading = false;
      }
    });
  }

  masTarde(): void {
    sessionStorage.setItem('posponerInvitacion', 'true');
    this.mostrar = false;
  }
}
