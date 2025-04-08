import { Component } from '@angular/core';
import { HttpLavavelService } from '../../http.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent {
  constructor(private Shttp: HttpLavavelService){
    this.Shttp.Service_Get('user').subscribe((data)=>{
      console.log(data);
      
    })
  }
  logout() {

    localStorage.removeItem('token'); 

    window.location.href = '/login'; 
  }
}
