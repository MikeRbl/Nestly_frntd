import { DashboardComponent } from './../dashboard/dashboard.component';
import { Component } from '@angular/core';
import { HttpLavavelService } from '../../http.service';
import { Usuario } from '../../interface/usuario.interface';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent {
  users:Usuario[]=[];
  datos:any;
  total:number = 0;
  constructor(private Shttp: HttpLavavelService){
    this.Shttp.Service_Get('user').subscribe((data)=>{
      console.log(data);
      
    })
  }
  logout() {

    localStorage.removeItem('token'); 

    window.location.href = '/login'; 
  }

  ngOnInit(): void {
    this.obtenerData(); // Llama al método al inicializar el componente
  }

   obtenerData(){
    this.Shttp.Service_Get('user').subscribe((res:any)=>{
      console.log(res);
      if (res.data) {
        this.users = res.data;
        this.total = res.total;
        console.log('users',this.users);
        
      }
    })
  } 





}
