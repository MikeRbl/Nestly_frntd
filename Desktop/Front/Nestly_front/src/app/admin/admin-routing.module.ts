import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { AdminGuard } from './guard/admin.guard';
import { DashboardAdminComponent } from './components/dashboard-admin/dashboard-admin.component';
import { GestionUsuariosComponent } from './components/gestion-usuarios/gestion-usuarios.component';
import { CrearUsuarioAdminComponent } from './components/gestion-usuarios/crear-usuario-admin/crear-usuario-admin.component';
import { EditarUsuarioAdminComponent } from './components/gestion-usuarios/editar-usuario-admin/editar-usuario-admin.component';
import { VerReportesComponent } from './components/ver-reportes/ver-reportes.component';
import { GestionSolicitudesComponent } from './components/gestion-solicitudes/gestion-solicitudes.component';


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
      
      },
      
      { path: 'usuarios-admin', component: GestionUsuariosComponent },
      { path: 'usuarios-admin/crear', component: CrearUsuarioAdminComponent },
      { path: 'usuarios-admin/editar/:id', component: EditarUsuarioAdminComponent },
      { path: 'solicitudes', component: GestionSolicitudesComponent }, 
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }