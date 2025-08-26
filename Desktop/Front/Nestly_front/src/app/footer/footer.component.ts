import { Component } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  
  constructor() { }

  subscrito(): void {
    Swal.fire({
      title: "¡Gracias por suscribirte!",
      text: "Recibirás nuestras mejores ofertas directamente en tu correo.",
      icon: "success",
      confirmButtonText: "Aceptar",
      timer: 3000,
      timerProgressBar: true
    });
  }
}
