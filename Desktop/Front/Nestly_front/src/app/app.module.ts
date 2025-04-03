import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './autorizacion/login/login.component';
import { RegistroComponent } from './autorizacion/registro/registro.component';
import { DashboardComponent } from './inicio/dashboard/dashboard.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpLavavelService } from './http.service';
import { HttpClientModule } from '@angular/common/http';
import { PerfilComponent } from './inicio/perfil/perfil.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegistroComponent,
    DashboardComponent,
    PerfilComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [HttpLavavelService],
  bootstrap: [AppComponent]
})
export class AppModule { }
