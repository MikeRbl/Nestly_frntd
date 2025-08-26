import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { HttpLavavelService } from '../../http.service';
import { AuthService } from '../../auth.service'; 
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
    private authService: AuthService,   
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

  this.httpService.publicPost('login', this.loginForm.value).subscribe({
    next: (response: any) => {
      Swal.close();
      Swal.fire({
        icon: "success",
        title: "Iniciaste sesión correctamente",
        showConfirmButton: false,
        timer: 1500
      });

      this.authService.login(response.user, response.access_token);

      if (response.user && response.user.role === 'admin') {
        this.router.navigate(['/admin/dashboard-admin']);
      } else {
        this.router.navigate(['/principal/dashboard']);
      }
      
      this.loading = false;
    },
    error: (error: any) => {
      this.loading = false;
      Swal.close();
      console.log('ERROR:', error);

      if (error.status === 403) {
        const errorMessage = error.error?.message || '';
        const suspensionEndDate = error.error?.suspension_ends_at;

        if (errorMessage.includes('suspendida') && suspensionEndDate) {
          const endDate = new Date(suspensionEndDate);
          const now = new Date();
          const diffTime = endDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          let messageText = `Tu cuenta está suspendida. Podrás volver a iniciar sesión en aproximadamente ${diffDays} día(s).`;
          if (diffDays <= 0) {
            messageText = "Tu suspensión ha terminado. Por favor, intenta iniciar sesión de nuevo."
          }
          
          Swal.fire({
            icon: 'warning',
            title: 'Cuenta Suspendida',
            text: messageText,
            confirmButtonText: 'Entendido'
          }).then(() => {
            this.authService.logout();
          });

        } else if (errorMessage.includes('baneada')) {
          Swal.fire({
            icon: 'error',
            title: 'Cuenta Baneada',
            text: 'Tu cuenta ha sido baneada permanentemente. Contacta al soporte para más información.',
            confirmButtonText: 'Entendido'
          }).then(() => {
            this.authService.logout();
          });
        }
        
      } else {
        Swal.fire({
          icon: "error",
          title: "Error en el inicio de sesión",
          text: error.error?.message || 'Credenciales incorrectas. Intenta de nuevo.',
        });
      }
    }
  });
}


  private markFormAsTouched(): void {
    Object.values(this.loginForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  continueWithoutAccount(): void {
    // Borrar cualquier token si existe
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    this.router.navigate(['/principal/dashboard']);
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}
