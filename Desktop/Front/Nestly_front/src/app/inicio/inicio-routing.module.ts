import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Componentes usados (¡NO TOCAMOS LOS EXISTENTES!)
import { DashboardComponent } from './dashboard/dashboard.component';
import { PerfilComponent } from './perfil/perfil.component';
import { NavbarComponent } from './navbar/navbar.component';
import { QnSomosComponent } from './qn-somos/qn-somos.component';
import { EditarPerfilComponent } from './editarPerfil/editarPerfil.component';
import { ConfiguracionComponent } from './configuracion/configuracion.component';
import { PublicarComponent } from './Publicar/publicar.component';
import { AlquilarCasaComponent } from './alquilar-casa/alquilar-casa.component';
import { BuscarComponent } from './buscar/buscar.component';
import { EditarPropiedadComponent } from './editar-propiedad/editar-propiedad.component';
import { PagosComponent } from './pagos/pagos.component';
import { PropiedadesFavoritosComponent } from './propiedades-favoritos/propiedades-favoritos.component';
import { MisPropiedadesComponent } from './ver-propiedades/mis-propiedades.component';

// ¡NUEVAS IMPORTACIONES!
import { SitioResenasComponent } from './sitio-resenas/sitio-resenas.component';
import { FaqComponent } from './faq/faq.component';

const routes: Routes = [
  {
    path: '',
    component: NavbarComponent, // Este componente actúa como un layout para las rutas hijas
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'perfil', component: PerfilComponent },
      { path: 'editarPerfil', component: EditarPerfilComponent },
      { path: 'configuracion', component: ConfiguracionComponent },
      { path: 'qnSomos', component: QnSomosComponent },
      { path: 'publicarCasa', component: PublicarComponent },
      { path: 'propiedad/:id', component: AlquilarCasaComponent },
      { path: 'verPropiedades', component: MisPropiedadesComponent },
      { path: 'editar-propiedad/:id', component: EditarPropiedadComponent },
      { path: 'buscarCasa', component: BuscarComponent },
      { path: 'pagos/:id', component: PagosComponent },
      { path: 'favoritos', component: PropiedadesFavoritosComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: '', redirectTo: 'pagos/1', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InicioRoutingModule { }