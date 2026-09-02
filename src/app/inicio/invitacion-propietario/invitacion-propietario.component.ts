import { Component, OnInit } from '@angular/core';
import { RoleRequestService } from '../../services/roleRequest.service';
import { NotyfService } from '../../services/notyf.service'; 
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-invitacion-propietario',
  templateUrl: './invitacion-propietario.component.html',
  styleUrls: ['./invitacion-propietario.component.css']
})
export class InvitacionPropietarioComponent implements OnInit {
  mostrar = false;
  isLoading = false;
  currentUser: any;

  constructor(
    private authService: AuthService,
    private roleService: RoleRequestService,
    private notyf: NotyfService
  ) {}

  ngOnInit() {
    // Nos suscribimos a los cambios del usuario (login/logout)
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.evaluarVisibilidad();
    });
  }

  evaluarVisibilidad(): void {
    // Si no hay un usuario logueado, nos aseguramos de que no se muestre nada.
    if (!this.currentUser || !this.currentUser.id) {
      this.mostrar = false;
      return;
    }

  
    const userSpecificKey = `roleRequestSent_${this.currentUser.id}`;
    const solicitudYaEnviada = localStorage.getItem(userSpecificKey);
    const posponerVisto = sessionStorage.getItem('posponerInvitacion');

    // La lógica para mostrar el componente
    if (this.currentUser.role === 'inquilino' && !solicitudYaEnviada && !posponerVisto) {
      this.mostrar = true;
    } else {
      this.mostrar = false;
    }
  }

  enviarSolicitud(): void {
    this.isLoading = true;
    this.roleService.enviarSolicitud().subscribe({
      next: () => {
        this.notyf.success('¡Solicitud enviada! Un administrador la revisará pronto.');
        
        if (this.currentUser) {
          localStorage.setItem(`roleRequestSent_${this.currentUser.id}`, 'true');
        }
        this.mostrar = false;
        this.isLoading = false;
      },
      error: (err) => {
        if (err.status === 400 || err.status === 409) {
          this.notyf.error('Ya tienes una solicitud pendiente.');
          if (this.currentUser) {
            localStorage.setItem(`roleRequestSent_${this.currentUser.id}`, 'true');
          }
          this.mostrar = false;
        } else {
          this.notyf.error(err.error?.message || 'Error al enviar la solicitud');
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
