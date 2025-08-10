import { Injectable } from '@angular/core';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css'; // Asegúrate de que los estilos estén importados

@Injectable({
  providedIn: 'root'
})
export class NotyfService {
  // Creamos una única instancia de Notyf para toda la aplicación
  private notyf = new Notyf({
    duration: 5000,
    position: {
      x: 'right',
      y: 'top',
    },
    types: [
      {
        type: 'success',
        backgroundColor: '#4caf50', // Verde para éxito
        icon: {
          className: 'material-icons',
          tagName: 'i',
          text: 'check_circle'
        }
      },
      {
        type: 'error',
        backgroundColor: '#f44336', // Rojo para error
        icon: {
          className: 'material-icons',
          tagName: 'i',
          text: 'error_outline'
        }
      },
      {
        type: 'warning',
        backgroundColor: '#ff9800', // Naranja para advertencia
        icon: {
          className: 'material-icons',
          tagName: 'i',
          text: 'warning'
        }
      }
    ]
  });

  constructor() { }

  /**
   * Muestra una notificación de éxito.
   * @param message El mensaje a mostrar.
   */
  success(message: string) {
    this.notyf.open({
      type: 'success',
      message
    });
  }

  /**
   * Muestra una notificación de error.
   * @param message El mensaje a mostrar.
   */
  error(message: string) {
    this.notyf.open({
      type: 'error',
      message
    });
  }

  /**
   * Muestra una notificación de advertencia.
   * @param message El mensaje a mostrar.
   */
  warning(message: string) {
    this.notyf.open({
      type: 'warning',
      message
    });
  }
}
