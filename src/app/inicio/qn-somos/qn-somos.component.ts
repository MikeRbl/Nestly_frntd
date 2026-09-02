import { Component } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-qn-somos',
  templateUrl: './qn-somos.component.html',
  styleUrl: './qn-somos.component.css'
})
export class QnSomosComponent {




   Subscrito(){
      Swal.fire({
        title: "Drag me!",
        icon: "success",
        draggable: true
      });
    }
}
