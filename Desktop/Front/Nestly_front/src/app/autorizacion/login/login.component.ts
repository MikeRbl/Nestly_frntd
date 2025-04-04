import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpLavavelService } from '../../http.service';
import { LocalstorageService } from '../../localstorage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  loading: boolean = false;
  loggedInUser: string | null = null;

  constructor(
    private fb: FormBuilder,
    private httpService: HttpLavavelService,
    private localStorage: LocalstorageService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormAsTouched();
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.loading = true;

    this.httpService.Service_Post('login', this.loginForm.value)
    .subscribe({
      next: (response: { 
        estatus: boolean, 
        access_token?: string, 
        user?: { email: string, name?: string } 
      }) => {
        this.loading = false;
        if (response.estatus && response.access_token) {
          this.localStorage.setItem('accessToken', response.access_token);
          this.loggedInUser = this.loginForm.value.email;
          this.successMessage = `¡Bienvenido ${this.loggedInUser}!`;
          console.log('Intentando navegar a /dashboard');
          this.router.navigate(['/navbar']);
          
          // Mostrar información en consola de varias formas:
          console.log('Usuario logueado:', this.loggedInUser); // Forma básica
          console.log('Datos completos de respuesta:', response); // Todos los datos de la respuesta
          
          // Si el backend devuelve más información del usuario
          if (response.user) {
            console.log('Información del usuario desde backend:', response.user);
            console.log('Email:', response.user.email);
            if (response.user.name) {
              console.log('Nombre:', response.user.name);
            }
          }
          
          this.loginForm.reset();
        }
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.errorMessage = error.error?.error?.message || 
                           error.error?.message || 
                           'Error al iniciar sesión';
        console.error('Detalles del error:', error);
      }
    });
  }

  private markFormAsTouched(): void {
    Object.values(this.loginForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}