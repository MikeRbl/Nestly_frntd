import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './autorizacion/login/login.component';
import { RegistroComponent } from './autorizacion/registro/registro.component';
import { DashboardComponent } from './inicio/dashboard/dashboard.component';
import { NavbarComponent } from './inicio/navbar/navbar.component';
import { PerfilComponent } from './inicio/perfil/perfil.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent, },
  { path: 'dashboard', component: DashboardComponent, },
  { path: 'navbar', component: NavbarComponent, },
  { path: 'perfil', component: PerfilComponent, },
  {
    path: 'principal',
    loadChildren: () =>
      import('./inicio/inicio.module').then((m) => m.InicioModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
