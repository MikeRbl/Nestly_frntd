import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InicioRoutingModule } from './inicio-routing.module';
import { NavbarComponent } from './navbar/navbar.component';
import { FormsModule } from '@angular/forms'; // ← AÑADE AQUÍ


@NgModule({
  declarations: [
    NavbarComponent
  ],
  imports: [
    CommonModule,
    InicioRoutingModule,
    
    
  ]
})
export class InicioModule { }
