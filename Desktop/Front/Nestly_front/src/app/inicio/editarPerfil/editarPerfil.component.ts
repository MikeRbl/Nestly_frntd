import { Component } from "@angular/core";

@Component({
    selector: "app-editar-perfil",
    templateUrl: "./editarPerfil.component.html",
    styleUrls: ["./editarPerfil.component.scss"],
})

export class EditarPerfilComponent {
    logout() {
        localStorage.removeItem('token'); 
        window.location.href = '/login'; 
      }
}
