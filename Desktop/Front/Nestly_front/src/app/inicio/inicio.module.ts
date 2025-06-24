import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Módulos necesarios
import { InicioRoutingModule } from './inicio-routing.module';
// Componentes declarados en este módulo
import { NavbarComponent } from './navbar/navbar.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PerfilComponent } from './perfil/perfil.component';
import { QnSomosComponent } from './qn-somos/qn-somos.component';
import { EditarPerfilComponent } from './editarPerfil/editarPerfil.component';
import { ConfiguracionComponent } from './configuracion/configuracion.component';
import { PublicarComponent } from './Publicar/publicar.component';
import { AlquilarCasaComponent } from './alquilar-casa/alquilar-casa.component';
import { BuscarComponent } from './buscar/buscar.component';
import { VerPropiedadesComponent } from './ver-propiedades/ver-propiedades.component';
import { EditarPropiedadComponent } from './editar-propiedad/editar-propiedad.component';
import { ResenaFormComponent } from './resenas/resenas-form/resena-form.component';
import { ResenaListComponent } from './resenas/resenas-list/resena-list.component';
import { ResenasItemComponent } from './resenas/resenas-item/resena-item.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrimeraMayusculaPipe } from './pipes/primera-mayuscula.pipe';


@NgModule({
  declarations: [
   
    DashboardComponent,
    PerfilComponent,
    NavbarComponent,
    QnSomosComponent,
    EditarPerfilComponent,
    ConfiguracionComponent,
    PublicarComponent,
    AlquilarCasaComponent,
    BuscarComponent,
    VerPropiedadesComponent,
    EditarPropiedadComponent,
    ResenaFormComponent,
    ResenaListComponent,
    ResenasItemComponent,
    PrimeraMayusculaPipe
  ],
  imports: [
    CommonModule,
    InicioRoutingModule, 
    ReactiveFormsModule,
    MatPaginatorModule,
    FormsModule,
    
  ],
  exports:[
    
  ]
})
export class InicioModule { }