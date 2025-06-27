import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Componentes que se usan en las rutas de este módulo
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
<<<<<<< HEAD
import { PagosComponent } from './pagos/pagos.component';
=======
import { PropiedadesFavoritosComponent } from './propiedades-favoritos/propiedades-favoritos.component';
>>>>>>> 3b121d01928088298782dbf73da1547b0d2f247c

const routes: Routes = [
  {
    path: '',
    component: NavbarComponent, // Navbar actúa como un contenedor para las demás vistas
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'perfil', component: PerfilComponent },
      { path: 'editarPerfil', component: EditarPerfilComponent },
      { path: 'configuracion', component: ConfiguracionComponent },
      { path: 'qnSomos', component: QnSomosComponent },
      { path: 'publicarCasa', component: PublicarComponent },
      { path: 'propiedad/:id', component: AlquilarCasaComponent },
      { path: 'verPropiedades', component: VerPropiedadesComponent },
      { path: 'editar-propiedad/:id', component: EditarPropiedadComponent },
      { path: 'buscarCasa', component: BuscarComponent },
<<<<<<< HEAD
      { path: 'pago/:id', component: PagosComponent},
=======
      { path: 'favoritos', component: PropiedadesFavoritosComponent },
      // Redirección por defecto dentro de la sección 'principal'
>>>>>>> 3b121d01928088298782dbf73da1547b0d2f247c
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  // RouterModule.forChild() se usa para módulos cargados de forma perezosa
  imports: [RouterModule.forChild(routes)],
  // Se exporta RouterModule para que los componentes de este módulo puedan usar directivas como [routerLink]
  exports: [RouterModule]
})
export class InicioRoutingModule { }