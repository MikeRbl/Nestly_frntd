import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpLavavelService } from '../../http.service';
import { LocalstorageService } from '../../localstorage.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  showPassword: boolean = false;
  passwordFieldType: string = 'password';
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private httpService: HttpLavavelService,
    private router: Router,
    
    
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
    this.passwordFieldType = this.showPassword ? 'text' : 'password';
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      Swal.fire({
              icon: "error",
              title: "Upsi",
              text: "Completa todos los campos requeridos",
            });
      this.markFormAsTouched();
      return;
    }

    this.loading = true;
    Swal.fire({
      title: 'Iniciando sesión...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    this.errorMessage = '';

    this.httpService.publicPost('login', this.loginForm.value)
      .subscribe({
        
        next: (response: any) => {
          Swal.fire({
            icon: "success",
            title: "Iniciaste sesión correctamente",
            showConfirmButton: false,
            timer: 1500
          });
          if (response.access_token) {
            localStorage.setItem('accessToken', response.access_token);
            this.router.navigate(['/principal/dashboard']);
          }
          this.loading = false;
        },
        error: (error: any) => {
          Swal.fire({
                    icon: "error",
                    title: "Error en el inicio de sesión",
                    text: error.error?.message || 
                          error.error?.errors?.email?.[0] || 
                          'Ocurrio un error al iniciar sesion. Intenta de nuevo',
                  });
         
          this.loading = false;
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