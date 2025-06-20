import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InicioRoutingModule } from './inicio-routing.module';
import { NavbarComponent } from './navbar/navbar.component';

import { MatPaginatorModule } from '@angular/material/paginator';
import { ɵBrowserAnimationBuilder } from '@angular/animations';


@NgModule({
  declarations: [
    NavbarComponent
  ],
  imports: [
    CommonModule,
    InicioRoutingModule,
    MatPaginatorModule,
    
    
  ]
})
export class InicioModule { }