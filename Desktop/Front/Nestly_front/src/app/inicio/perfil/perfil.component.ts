import { Component } from '@angular/core';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent {
  logout() {

    localStorage.removeItem('token'); 

    window.location.href = '/login'; 
  }
}
