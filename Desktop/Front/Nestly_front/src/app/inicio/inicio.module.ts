import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Módulos necesarios
import { InicioRoutingModule } from './inicio-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FooterComponent } from '../footer/footer.component';
import { AlquilarCasaComponent } from './alquilar-casa/alquilar-casa.component';
import { BuscarComponent } from './buscar/buscar.component';
import { ConfiguracionComponent } from './configuracion/configuracion.component';
import { ComentariosUsuariosComponent } from './dashboard-componentes/comentarios-usuarios/comentarios-usuarios.component';
import { DashboardComponent } from './dashboard-componentes/dashboard/dashboard.component';
import { FaqComponent } from './dashboard-componentes/faq/faq.component';
import { PropiedadesDestacadasComponent } from './dashboard-componentes/propiedades-destacadas/propiedades-destacadas.component';
import { EditarPerfilComponent } from './editarPerfil/editarPerfil.component';
import { EditarPropiedadComponent } from './gestion-propiedades/editar-propiedad/editar-propiedad.component';
import { GestionPropiedadesComponent } from './gestion-propiedades/gestion-propiedades.component';
import { MisRentasComponent } from './gestion-propiedades/mis-rentas/mis-rentas.component';
import { PublicarComponent } from './gestion-propiedades/Publicar/publicar.component';
import { MisPropiedadesComponent } from './gestion-propiedades/ver-propiedades/mis-propiedades.component';
import { NavbarComponent } from './navbar/navbar.component';
import { PagosComponent } from './pagos/pagos.component';
import { PerfilComponent } from './perfil/perfil.component';
import { PrimeraMayusculaPipe } from './pipes/primera-mayuscula.pipe';
import { PrivacidadComponent } from './privacidad/privacidad.component';
import { PropiedadesFavoritosComponent } from './propiedades-favoritos/propiedades-favoritos.component';
import { QnSomosComponent } from './qn-somos/qn-somos.component';
import { ResenaFormComponent } from './resenas/resenas-form/resena-form.component';
import { ResenasItemComponent } from './resenas/resenas-item/resena-item.component';
import { ResenaListComponent } from './resenas/resenas-list/resena-list.component';
import { SitioResenasComponent } from './sitio-resenas/sitio-resenas.component';
import { TerminosComponent } from './terminos/terminos.component';


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
    MisPropiedadesComponent, 
    EditarPropiedadComponent,
    ResenaFormComponent, 
    ResenaListComponent, 
    ResenasItemComponent, 
    PrimeraMayusculaPipe,
    PagosComponent,
    PropiedadesFavoritosComponent,
    GestionPropiedadesComponent,
    MisRentasComponent,
    SitioResenasComponent,
    FaqComponent,
    SitioResenasComponent,
    PublicarComponent,
    FaqComponent, TerminosComponent, PrivacidadComponent, 
      PropiedadesDestacadasComponent,
       FooterComponent,
       ComentariosUsuariosComponent
  ],
  imports: [
    CommonModule,
    InicioRoutingModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    FormsModule
  ],
  exports: []
})
export class InicioModule { }
