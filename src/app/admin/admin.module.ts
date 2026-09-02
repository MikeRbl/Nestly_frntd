import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // <-- Necesitas importar esto

import { AdminRoutingModule } from './admin-routing.module';

// Importa todos los componentes que vas a usar en este módulo
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { DashboardAdminComponent } from './components/dashboard-admin/dashboard-admin.component';
import { ActividadRecienteComponent } from './components/actividad-reciente/actividad-reciente.component';
import { GestionUsuariosComponent } from './components/gestion-usuarios/gestion-usuarios.component';
import { SidebarAdminComponent } from './components/sidebar-admin/sidebar-admin.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CrearUsuarioAdminComponent } from './components/gestion-usuarios/crear-usuario-admin/crear-usuario-admin.component';
import { EditarUsuarioAdminComponent } from './components/gestion-usuarios/editar-usuario-admin/editar-usuario-admin.component';
import { VerReportesComponent } from './components/ver-reportes/ver-reportes.component';
import { AdminPaginadorComponent } from './components/admin-paginador/admin-paginador.component';
import { AdminFiltroBarComponent } from './components/ver-reportes/admin-filtro-bar/admin-filtro-bar.component';
import { GestionSolicitudesComponent } from './components/gestion-solicitudes/gestion-solicitudes.component';


@NgModule({
  declarations: [
    AdminLayoutComponent,
    DashboardAdminComponent,
    ActividadRecienteComponent,
    SidebarAdminComponent,
    GestionUsuariosComponent,
    CrearUsuarioAdminComponent,
    EditarUsuarioAdminComponent,
    VerReportesComponent,
    AdminPaginadorComponent,
    AdminFiltroBarComponent,
    GestionSolicitudesComponent 
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    RouterModule,
    MatPaginatorModule,
    FormsModule,
    ReactiveFormsModule 
  ],
  
})
export class AdminModule { }