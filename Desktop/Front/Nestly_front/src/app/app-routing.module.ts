import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './autorizacion/login/login.component';

const routes: Routes = [
  { 
    path: 'login', 
    component: LoginComponent 
  },
  { 
    path: '', 
    redirectTo: 'principal/dashboard', 
    pathMatch: 'full' 
  },
  {
    path: 'principal',
    loadChildren: () => import('./inicio/inicio.module')
      .then(m => m.InicioModule),
  },
  { 
    path: '**', 
    redirectTo: 'principal/dashboard' 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}