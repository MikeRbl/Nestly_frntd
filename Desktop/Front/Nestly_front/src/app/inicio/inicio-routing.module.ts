import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PerfilComponent } from './perfil/perfil.component';

const routes: Routes = [
  {
    path: '',
    component: NavbarComponent,
    children: [
      { 
        path: 'dashboard', 
        component: DashboardComponent 
      },
      { 
        path: 'perfil', 
        component: PerfilComponent 
      },
      { 
        path: '', 
        redirectTo: 'dashboard', 
        pathMatch: 'full' 
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InicioRoutingModule {}