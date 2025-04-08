import { Component } from "@angular/core";

@Component({
  selector: "app-configuracion",
  templateUrl: "./configuracion.component.html",
  styleUrls: ["./configuracion.component.scss"],
})
export class ConfiguracionComponent {
  constructor() {

  }
  logout() {
    localStorage.removeItem('token'); 
    window.location.href = '/login'; 
  }
}