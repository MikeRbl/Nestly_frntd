import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './autorizacion/login/login.component';
import { RegistroComponent } from './autorizacion/registro/registro.component';
import { DashboardComponent } from './inicio/dashboard/dashboard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpLavavelService } from './http.service';
import { HttpClientModule } from '@angular/common/http';
import { PerfilComponent } from './inicio/perfil/perfil.component';
import { QnSomosComponent } from './inicio/qn-somos/qn-somos.component';
import { EditarPerfilComponent } from './inicio/editarPerfil/editarPerfil.component';
import { ConfiguracionComponent } from './inicio/configuracion/configuracion.component';
import { PublicarComponent } from './inicio/Publicar/publicar.component';
import { AlquilarCasaComponent } from './inicio/alquilar-casa/alquilar-casa.component';
import { VerPropiedadesComponent } from './inicio/ver-propiedades/ver-propiedades.component';
import { EditarPropiedadComponent } from './inicio/editar-propiedad/editar-propiedad.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NoopAnimationsModule } from '@angular/platform-browser/animations'; 


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
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    HttpClientModule,
    FormsModule,
    NoopAnimationsModule 
  ],
  providers: [HttpLavavelService],
  bootstrap: [AppComponent]
})
export class AppModule { }
