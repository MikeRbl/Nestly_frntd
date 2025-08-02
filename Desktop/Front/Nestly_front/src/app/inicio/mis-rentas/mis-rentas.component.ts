import { Component } from '@angular/core';

@Component({
  selector: 'app-mis-rentas',
  templateUrl: './mis-rentas.component.html',
  styleUrl: './mis-rentas.component.css'
})
export class MisRentasComponent {
 isLoading: boolean = true;
  
  constructor() { }

  ngOnInit(): void {
    // Simula la carga de datos desde un servicio
    this.cargarRentas();
  }

  cargarRentas(): void {
    this.isLoading = true;

    // Simula una llamada a una API con un retraso de 2 segundos
    setTimeout(() => {
      // En un caso real, aquí recibirías los datos de tu API.
      // Por ahora, lo dejamos vacío para que se muestre el mensaje de "En Desarrollo".
      // Si quisieras mostrar las tarjetas de ejemplo, podrías llenar el array aquí:
      // this.rentas = [ /* ...datos de ejemplo... */ ];
      
      this.isLoading = false;
    }, 2000);
  }
}
