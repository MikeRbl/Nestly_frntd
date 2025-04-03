import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
 constructor(
private router: Router,
 ){

 }
 redirectToLogin() {
  this.router.navigate(['/login']); // Navega Al login
}
redirectToDashboard() {
  this.router.navigate(['/dashboard']); // Navega al dashbard
}
redirectToPerfil() {
  this.router.navigate(['/perfil']); // Navega al perfil
}

}
