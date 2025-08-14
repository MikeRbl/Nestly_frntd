import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';

import { AuthService } from '../../auth.service';
import { User } from '../../interface/usuario.interface';

@Component({
  selector: 'app-gestion-propiedades',
  templateUrl: './gestion-propiedades.component.html',
  styleUrls: ['./gestion-propiedades.component.css']
})
export class GestionPropiedadesComponent implements OnInit {
  opcionSeleccionada: string = 'publicar'; 
  userRole: string = '';
  user: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.user = this.authService.obtenerUsuarioActualId();
    this.userRole = this.user?.role || '';
  }

  seleccionarOpcion(opcion: string) {
    this.opcionSeleccionada = opcion;
  }
}
