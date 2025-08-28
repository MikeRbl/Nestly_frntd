import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-terminos',
  templateUrl: './terminos.component.html',
  styleUrl: './terminos.component.css'
})
export class TerminosComponent {
  constructor(private location: Location) {}

// Crea el método que será llamado por el botón
  goBack(): void {
    this.location.back();
  }
}
