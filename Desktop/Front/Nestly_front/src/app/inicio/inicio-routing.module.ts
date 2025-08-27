import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// --- Guards ---
import { RoleGuard } from './guards/role.guard';
import { AuthGuard } from './guards/auth.guard';

// --- Componentes ---
import { DashboardComponent } from './dashboard-componentes/dashboard/dashboard.component';
import { PerfilComponent } from './perfil/perfil.component';
import { NavbarComponent } from './navbar/navbar.component';
import { QnSomosComponent } from './qn-somos/qn-somos.component';
import { EditarPerfilComponent } from './editarPerfil/editarPerfil.component';
import { ConfiguracionComponent } from './configuracion/configuracion.component';
import { PublicarComponent } from './gestion-propiedades/Publicar/publicar.component';
import { AlquilarCasaComponent } from './alquilar-casa/alquilar-casa.component';
import { BuscarComponent } from './buscar/buscar.component';
import { EditarPropiedadComponent } from './gestion-propiedades/editar-propiedad/editar-propiedad.component';
import { PagosComponent } from './pagos/pagos.component';
import { PropiedadesFavoritosComponent } from './propiedades-favoritos/propiedades-favoritos.component';
import { MisPropiedadesComponent } from './gestion-propiedades/ver-propiedades/mis-propiedades.component';
import { SitioResenasComponent } from './sitio-resenas/sitio-resenas.component';
import { FaqComponent } from './dashboard-componentes/faq/faq.component';
import { MisRentasComponent } from './gestion-propiedades/mis-rentas/mis-rentas.component';
import { TerminosComponent } from '../footer/terminos/terminos.component';
import { PrivacidadComponent } from '../footer/privacidad/privacidad.component';
import { GestionPropiedadesComponent } from './gestion-propiedades/gestion-propiedades.component';

const routes: Routes = [
  {
    path: '',
    component: NavbarComponent,
    children: [
      // --- Rutas Públicas (accesibles para todos) ---
      { path: 'dashboard', component: DashboardComponent },
      { path: 'qnSomos', component: QnSomosComponent },
      { path: 'faq', component: FaqComponent },
      { path: 'buscarCasa', component: BuscarComponent },
      { path: 'propiedad/:id', component: AlquilarCasaComponent },
      { path: 'terminos-y-condiciones', component: TerminosComponent },
      { path: 'politica-de-privacidad', component: PrivacidadComponent },
      { path: 'resenas', component: SitioResenasComponent },
 
      // --- Rutas Privadas (requieren inicio de sesión) ---
      { path: 'perfil', component: PerfilComponent, canActivate: [AuthGuard] },
      { path: 'editarPerfil', component: EditarPerfilComponent, canActivate: [AuthGuard] },
      { path: 'configuracion', component: ConfiguracionComponent, canActivate: [AuthGuard] },
      { path: 'pagos/:id', component: PagosComponent, canActivate: [AuthGuard] },
      { path: 'favoritos', component: PropiedadesFavoritosComponent, canActivate: [AuthGuard] },
      
      // --- Rutas de Gestión (protegidas por rol) ---
      {
        path: 'gestion-propiedades',
        component: GestionPropiedadesComponent,
        canActivate: [AuthGuard], // Primero verifica si está logueado
        canActivateChild: [RoleGuard], // Luego verifica el rol para las rutas hijas
        children: [
          { path: '', redirectTo: 'mis-propiedades', pathMatch: 'full' },
          { 
            path: 'mis-propiedades', 
            component: MisPropiedadesComponent,
            data: { roles: ['propietario', 'admin'] }
          },
          { 
            path: 'publicar', 
            component: PublicarComponent,
            data: { roles: ['propietario', 'admin'] }
          },
          { 
            path: 'editar/:id', 
            component: EditarPropiedadComponent,
            data: { roles: ['propietario', 'admin'] }
          },
          {
          path: 'mis-rentas', 
            component: MisRentasComponent,
            data: { roles: ['propietario', 'inquilino'] }
          },
        ]
      },
      
      // Redirección por defecto dentro del layout principal
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InicioRoutingModule { }
