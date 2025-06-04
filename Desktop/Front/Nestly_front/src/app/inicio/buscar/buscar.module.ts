import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importaciones de componentes
import { BuscarComponent } from './buscar.component';
import { FiltroLateralComponent } from './filtro-lateral/filtro-lateral.component';
import { BusquedaFiltroComponent } from './busqueda-filtro/busqueda-filtro.component';
import { ListadoComponent } from './listado/listado.component';

// Importaciones de módulos de Angular Material (opcional, si usas)
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    BuscarComponent,
    FiltroLateralComponent,
    BusquedaFiltroComponent,
    ListadoComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // Angular Material (opcional)
    MatSliderModule,
    MatCheckboxModule
  ],
  exports: [
    BuscarComponent // Si necesitas exportar el componente principal
  ]
})
export class BuscarModule { }