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
import { GestionPropiedadesAdminComponent } from './components/gestion-propiedades-admin/gestion-propiedades-admin.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CrearUsuarioAdminComponent } from './components/gestion-usuarios/crear-usuario-admin/crear-usuario-admin.component';
import { EditarUsuarioAdminComponent } from './components/gestion-usuarios/editar-usuario-admin/editar-usuario-admin.component';
import { VerReportesComponent } from './components/ver-reportes/ver-reportes.component';
import { ResenasReportadasComponent } from './components/ver-reportes/resenas-reportadas/resenas-reportadas.component';
import { UsuariosReportadosComponent } from './components/ver-reportes/usuarios-reportados/usuarios-reportados.component';
import { AdminPaginadorComponent } from './components/admin-paginador/admin-paginador.component';
import { AdminFiltroBarComponent } from './components/ver-reportes/admin-filtro-bar/admin-filtro-bar.component';
import { PropiedadesReportadasComponent } from './components/ver-reportes/propiedades-reportadas/propiedades-reportadas.component';


@NgModule({
  declarations: [
    // Aquí debes declarar TODOS los componentes del módulo
    AdminLayoutComponent,
    DashboardAdminComponent,
    ActividadRecienteComponent,
    SidebarAdminComponent,
    GestionUsuariosComponent,
    GestionPropiedadesAdminComponent,
    CrearUsuarioAdminComponent,
    EditarUsuarioAdminComponent,
    VerReportesComponent,
    ResenasReportadasComponent,
    UsuariosReportadosComponent,
    AdminPaginadorComponent,
    AdminFiltroBarComponent,
    PropiedadesReportadasComponent 
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