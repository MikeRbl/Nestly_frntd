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
    AlquilarCasaComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [HttpLavavelService],
  bootstrap: [AppComponent]
})
export class AppModule { }
