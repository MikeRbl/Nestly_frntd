import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { AdminGuard } from './guard/admin.guard';
import { DashboardAdminComponent } from './components/dashboard-admin/dashboard-admin.component';
import { GestionUsuariosComponent } from './components/gestion-usuarios/gestion-usuarios.component';
import { GestionPropiedadesAdminComponent } from './components/gestion-propiedades-admin/gestion-propiedades-admin.component';
import { CrearUsuarioAdminComponent } from './components/gestion-usuarios/crear-usuario-admin/crear-usuario-admin.component';
import { EditarUsuarioAdminComponent } from './components/gestion-usuarios/editar-usuario-admin/editar-usuario-admin.component';
import { VerReportesComponent } from './components/ver-reportes/ver-reportes.component';
import { ResenasReportadasComponent } from './components/ver-reportes/resenas-reportadas/resenas-reportadas.component';
import { UsuariosReportadosComponent } from './components/ver-reportes/usuarios-reportados/usuarios-reportados.component';
import { PropiedadesReportadasComponent } from './components/ver-reportes/propiedades-reportadas/propiedades-reportadas.component';


const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AdminGuard],
    children: [
      { path: '', redirectTo: 'dashboard-admin', pathMatch: 'full' },
      { path: 'dashboard-admin', component: DashboardAdminComponent },
      
      { 
        path: 'ver-reportes', 
        component: VerReportesComponent,
        children: [
          
          { path: '', redirectTo: 'resenas-reportes', pathMatch: 'full' }, 
          { path: 'resenas-reportes', component: ResenasReportadasComponent },
          { path: 'usuarios-reportes', component: UsuariosReportadosComponent },
          { path: 'propiedades-reportes', component: PropiedadesReportadasComponent },
        ]
      },
      
      { path: 'usuarios-admin', component: GestionUsuariosComponent },
      { path: 'usuarios-admin/crear', component: CrearUsuarioAdminComponent },
      { path: 'usuarios-admin/editar/:id', component: EditarUsuarioAdminComponent }, 
      { path: 'propiedades-admin', component: GestionPropiedadesAdminComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }