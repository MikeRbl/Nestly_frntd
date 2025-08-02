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

import { SitioResenasComponent } from './sitio-resenas/sitio-resenas.component';
import { FaqComponent } from './faq/faq.component';
import { MisRentasComponent } from './mis-rentas/mis-rentas.component';
import { TerminosComponent } from './terminos/terminos.component';
import { PrivacidadComponent } from './privacidad/privacidad.component';
import { GestionPropiedadesComponent } from './gestion-propiedades/gestion-propiedades.component';
import { RoleGuard } from './guards/role.guard';

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
      {
        path: 'gestion-propiedades',
        component: GestionPropiedadesComponent,
        canActivateChild: [RoleGuard], // Aquí el cambio clave para controlar hijos
        children: [
          { path: '', redirectTo: 'mis-propiedades', pathMatch: 'full' }, // Redirige al default correcto
          { 
            path: 'mis-propiedades', 
            component: MisPropiedadesComponent,
            data: { roles: ['propietario', 'admin'] } // solo propietarios y admins
          },
          { 
            path: 'publicar', 
            component: PublicarComponent,
            data: { roles: ['propietario', 'admin'] } // solo propietarios y admins
          },
          { 
            path: 'editar/:id', 
            component: EditarPropiedadComponent,
            data: { roles: ['propietario', 'admin'] } // solo propietarios y admins
          },
          { 
            path: 'mis-rentas', 
            component: MisRentasComponent,
            data: { roles: ['propietario', 'inquilino', 'admin'] } // todos pueden ver sus rentas
          },
        ]
      },
      { path: 'propiedad/:id', component: AlquilarCasaComponent },
      { path: 'buscarCasa', component: BuscarComponent },
      { path: 'pagos/:id', component: PagosComponent },
      { path: 'favoritos', component: PropiedadesFavoritosComponent },
      { path: 'mis-rentas', component: MisRentasComponent },
      { path: 'terminos-y-condiciones', component: TerminosComponent },
      { path: 'politica-de-privacidad', component: PrivacidadComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  }
];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InicioRoutingModule { }