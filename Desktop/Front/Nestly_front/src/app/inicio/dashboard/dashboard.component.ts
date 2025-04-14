import { Component } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  constructor(private router: Router) {}
  

  handleNavigation(route: string): void {
    this.router.navigate([route]);
  }


  Subscrito(){
    Swal.fire({
      title: "Drag me!",
      icon: "success",
      draggable: true
    });
  }

}
