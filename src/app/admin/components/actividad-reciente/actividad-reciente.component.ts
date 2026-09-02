import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-actividad-reciente',
  templateUrl: './actividad-reciente.component.html',
  styleUrl: './actividad-reciente.component.css'
})
export class ActividadRecienteComponent {
  @Input() activities: any[] = [];
   constructor() { }
}
