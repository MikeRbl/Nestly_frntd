import { Location } from '@angular/common';
import { Component } from '@angular/core';
@Component({
  selector: 'app-privacidad',
  templateUrl: './privacidad.component.html',
  styleUrl: './privacidad.component.css'
})
export class PrivacidadComponent {
constructor(private location: Location) {}

  // Crea el método que será llamado por el botón
  goBack(): void {
    this.location.back();
  }
}
