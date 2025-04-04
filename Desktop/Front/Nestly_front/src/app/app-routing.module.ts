import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'principal/dashboard', 
    pathMatch: 'full' 
  },
  { 
    path: 'login', 
    loadChildren: () => import('./autorizacion/login/login.component').then(m => m.LoginComponent)
  },
  { 
    path: 'registro', 
    loadChildren: () => import('./autorizacion/registro/registro.component').then(m => m.RegistroComponent)
  },
  {
    path: 'principal',
    loadChildren: () => import('./inicio/inicio.module').then(m => m.InicioModule),
  },
  { 
    path: '**', 
    redirectTo: 'principal/dashboard' 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}