import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginatorModule } from '@angular/material/paginator';
import { AppComponent } from './app.component';
import { LoginComponent } from './autorizacion/login/login.component';
import { RegistroComponent } from './autorizacion/registro/registro.component';
import { DashboardComponent } from './inicio/dashboard/dashboard.component';
import { PerfilComponent } from './inicio/perfil/perfil.component';
import { QnSomosComponent } from './inicio/qn-somos/qn-somos.component';
import { EditarPerfilComponent } from './inicio/editarPerfil/editarPerfil.component';
import { ConfiguracionComponent } from './inicio/configuracion/configuracion.component';
import { PublicarComponent } from './inicio/Publicar/publicar.component';
import { AlquilarCasaComponent } from './inicio/alquilar-casa/alquilar-casa.component';
import { VerPropiedadesComponent } from './inicio/ver-propiedades/ver-propiedades.component';
import { EditarPropiedadComponent } from './inicio/editar-propiedad/editar-propiedad.component';
import { BuscarComponent } from './inicio/buscar/buscar.component';

import { HttpLavavelService } from './http.service';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegistroComponent,
    DashboardComponent,
    PerfilComponent,
    EditarPerfilComponent,
    ConfiguracionComponent,
    QnSomosComponent,
    PublicarComponent,
    AlquilarCasaComponent,
    VerPropiedadesComponent,
    EditarPropiedadComponent,
    BuscarComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,

    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatPaginatorModule
  ],
  providers: [HttpLavavelService],
  bootstrap: [AppComponent]
})
export class AppModule { }