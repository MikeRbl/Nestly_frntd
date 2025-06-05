import { Component } from "@angular/core";

@Component({
  selector: "app-configuracion",
  templateUrl: "./configuracion.component.html",
  styleUrls: ["./configuracion.component.scss"],
})
export class ConfiguracionComponent {
 darkMode = false;

  toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
    this.darkMode = !this.darkMode;
    document.documentElement.classList.toggle('dark', this.darkMode);
    localStorage.setItem('darkMode', this.darkMode.toString());
  }

  ngOnInit() {
    const savedMode = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    this.darkMode = savedMode ? savedMode === 'true' : prefersDark;
    document.documentElement.classList.toggle('dark', this.darkMode);
  }

  logout() {
    localStorage.removeItem('token'); 
    window.location.href = '/login'; 
  }
}