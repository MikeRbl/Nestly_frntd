import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { HttpLavavelService } from '../../http.service';
import { AuthService } from '../../auth.service'; // <-- Asegúrate que esté importado

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
    private authService: AuthService,   // <--- Aquí lo inyectas
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

        // Aquí viene la magia con AuthService para guardar todo bien
        console.log('🐛 Usuario que vino del backend:', response.user);
        this.authService.login(response.user, response.access_token);

        // Verificamos lo que se guarda en localStorage
        const raw = localStorage.getItem('user');
        console.log('📦 Usuario guardado en localStorage:', raw);

        // Probamos obtener el ID usando AuthService
        const userId = this.authService.obtenerUsuarioActualId();
        console.log('🧠 ID obtenido desde AuthService:', userId);

        // Navegamos al dashboard o donde quieras
        this.router.navigate(['/principal/dashboard']);
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

  continueWithoutAccount(): void {
    // Borrar cualquier token si existe
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    this.router.navigate(['/principal/dashboard']);
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}
