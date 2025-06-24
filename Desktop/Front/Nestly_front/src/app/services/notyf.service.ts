    import { Injectable } from '@angular/core';
    import { Notyf } from 'notyf';

    @Injectable({
      providedIn: 'root'
    })
    export class NotyfService {
      // Creamos una única instancia de Notyf para toda la aplicación
      private notyf = new Notyf({
        duration: 4000,
  position: {
    x: 'right',
    y: 'top',
  },
  types: [
    {
      type: 'success',
      background: '#4caf50',
      icon: {
        className: 'material-icons',
        tagName: 'i',
        text: 'check_circle'
      }
    },
    {
      type: 'error',
      background: '#f44336',
      icon: {
        className: 'material-icons',
        tagName: 'i',
        text: 'error_outline'
      }
    },
    {
      type: 'warning',
      background: '#ff9800',
      icon: {
        className: 'material-icons',
        tagName: 'i',
        text: 'warning'
      }
    }
  ]
      });

      constructor() { }

     success(message: string) {
  this.notyf.open({
    type: 'success',
    message
  });
}

error(message: string) {
  this.notyf.open({
    type: 'error',
    message
  });
}

warning(message: string) {
  this.notyf.open({
    type: 'warning',
    message
  });
}

    }
    