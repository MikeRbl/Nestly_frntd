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

import { HttpLavavelService } from './http.service';
import { PrimeraMayusculaPipe } from './inicio/pipes/primera-mayuscula.pipe';





@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegistroComponent,
  

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,

    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    
  ],
  providers: [HttpLavavelService],
  
  bootstrap: [AppComponent]
})
export class AppModule { }