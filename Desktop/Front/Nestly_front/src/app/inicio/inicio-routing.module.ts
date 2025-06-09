import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PerfilComponent } from './perfil/perfil.component';
import { NavbarComponent } from './navbar/navbar.component';
import { QnSomosComponent } from './qn-somos/qn-somos.component';
import { EditarPerfilComponent } from './editarPerfil/editarPerfil.component';
import { ConfiguracionComponent } from './configuracion/configuracion.component';
import { PublicarComponent } from './Publicar/publicar.component';

import { AlquilarCasaComponent } from './alquilar-casa/alquilar-casa.component';
import { BuscarComponent } from './buscar/buscar.component';
import { VerPropiedadesComponent } from './ver-propiedades/ver-propiedades.component';
import { EditarPropiedadComponent } from './editar-propiedad/editar-propiedad.component';

const routes: Routes = [
  {
    path: '',
    component: NavbarComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'perfil', component: PerfilComponent },
      { path: 'editarPerfil', component: EditarPerfilComponent },
      { path: 'configuracion', component: ConfiguracionComponent },
      { path: 'qnSomos', component: QnSomosComponent },
      { path: 'publicarCasa', component: PublicarComponent },
      { path: 'alquilarCasa', component: AlquilarCasaComponent },
      { path: 'verPropiedades', component: VerPropiedadesComponent },
      { path: 'editar-propiedad/:id', component: EditarPropiedadComponent },
      { path: 'buscarCasa', component: BuscarComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
    
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InicioRoutingModule { }